const http = require('http');
const express = require('express');
const compression = require('compression');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();

// 1. Kích hoạt nén Gzip / Deflate: giảm 60 - 75% băng thông cho JS, CSS, JSON, HTML
// BỎ QUA file .swf vì game.swf vốn đã được nén zlib sẵn.
// Tránh quá tải 100% CPU và tràn RAM khi nhiều người cùng tải.
app.use(compression({
    threshold: 1024,
    level: 6,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        if (req.path && req.path.endsWith('.swf')) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// 2. Bật CORS để hỗ trợ nếu Frontend được host tách biệt trên Cloudflare Pages / Vercel
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

// Rooms storage: roomId -> { host: ws, guest: ws, lastActive: number, createdAt: number }
const rooms = new Map();

// 3. Healthcheck endpoints (hỗ trợ cả Render, UptimeRobot lẫn Fly.io)
function getHealthData() {
    return {
        status: 'ok',
        uptime: Math.round(process.uptime()),
        rooms: rooms.size,
        activeWsClients: wss.clients.size,
        memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    };
}
app.get('/health', (req, res) => res.json(getHealthData()));
app.get('/healthz', (req, res) => res.json(getHealthData()));

// 4. WebSocket Heartbeat: Giữ kết nối qua Proxy (chống timeout 60s) & dọn socket chết
const HEARTBEAT_INTERVAL = 30000; // 30s
const cleanupInterval = setInterval(() => {
    // A. Kiểm tra liveness của client
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        try {
            ws.ping();
        } catch (e) {
            ws.terminate();
        }
    });

    // B. Dọn dẹp các phòng mồ côi hoặc treo quá 2 tiếng để chống rò rỉ bộ nhớ (Memory Leak)
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
        const isHostAlive = room.host && room.host.readyState === 1; // 1 = OPEN
        const isGuestAlive = room.guest && room.guest.readyState === 1;
        if (!isHostAlive && !isGuestAlive) {
            rooms.delete(roomId);
        } else if (now - (room.lastActive || room.createdAt || 0) > 2 * 60 * 60 * 1000) {
            rooms.delete(roomId);
        }
    }
}, HEARTBEAT_INTERVAL);

wss.on('connection', (ws) => {
    ws.isAlive = true;
    let currentRoom = null;
    let currentRole = null;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('error', (err) => {
        console.warn('Lỗi socket client:', err.message);
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'create_room') {
                const roomId = data.roomId;
                rooms.set(roomId, { host: ws, guest: null, lastActive: Date.now(), createdAt: Date.now() });
                currentRoom = roomId;
                currentRole = 'host';
                ws.send(JSON.stringify({ type: 'room_created', roomId }));
            }
            else if (data.type === 'join_room') {
                const roomId = data.roomId;
                const room = rooms.get(roomId);
                if (!room) {
                    ws.send(JSON.stringify({ type: 'error', message: `Phòng [${roomId}] không tồn tại!` }));
                    return;
                }
                if (room.guest && room.guest.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Phòng này đã có đủ 2 người chơi!' }));
                    return;
                }
                room.guest = ws;
                room.lastActive = Date.now();
                currentRoom = roomId;
                currentRole = 'guest';

                ws.send(JSON.stringify({ type: 'room_joined', roomId }));

                // Báo cho cả 2 bên biết đã kết nối thành công
                if (room.host && room.host.readyState === ws.OPEN) {
                    room.host.send(JSON.stringify({ type: 'peer_connected', role: 'host' }));
                    ws.send(JSON.stringify({ type: 'peer_connected', role: 'guest' }));
                }
            }
            else {
                // Relay các gói tin (game_input, sync_restart, ping, pong, v.v.) sang đối thủ
                if (currentRoom) {
                    const room = rooms.get(currentRoom);
                    if (room) {
                        room.lastActive = Date.now();
                        const target = currentRole === 'host' ? room.guest : room.host;
                        if (target && target.readyState === ws.OPEN) {
                            target.send(message.toString());
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Lỗi xử lý ws message:', e);
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            const room = rooms.get(currentRoom);
            if (room) {
                const target = currentRole === 'host' ? room.guest : room.host;
                if (target && target.readyState === ws.OPEN) {
                    try {
                        target.send(JSON.stringify({ type: 'peer_disconnected' }));
                    } catch (e) {}
                }
                if (currentRole === 'host') {
                    rooms.delete(currentRoom);
                } else if (room.guest === ws) {
                    room.guest = null;
                    if (!room.host || room.host.readyState !== ws.OPEN) {
                        rooms.delete(currentRoom);
                    }
                }
            }
        }
    });
});

// 5. Phục vụ file tĩnh với Cache-Control 30 ngày (SWF, WASM, JS, CSS, ảnh)
app.use(express.static(path.join(__dirname, '.'), {
    dotfiles: 'ignore',
    index: ['index.html'],
    maxAge: '30d',
    setHeaders: (res, filePath) => {
        // Tệp HTML: Cập nhật nhanh để người dùng luôn nhận bản mới nhất
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
        }
        // File game nặng (Flash SWF, WASM Ruffle, Audio MP3, Hình ảnh): Cache 30 ngày (immutable)
        else if (filePath.match(/\.(swf|wasm|mp3|wav|ogg|png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        }
        // File logic JS & CSS: Cache 1 ngày
        else if (filePath.match(/\.(js|css)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
}));

// Điều hướng tất cả request về index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Xử lý lỗi an toàn
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

// 6. Bảo vệ tiến trình không bao giờ crash bất ngờ
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

// 7. Graceful shutdown khi Render hoặc Fly.io deploy bản mới
function gracefulShutdown(signal) {
    console.log(`[Server] Nhận tín hiệu ${signal}. Đang đóng các kết nối an toàn...`);
    clearInterval(cleanupInterval);
    wss.clients.forEach((ws) => {
        try {
            ws.close(1001, 'Máy chủ đang cập nhật khởi động lại');
        } catch (e) {}
    });
    server.close(() => {
        console.log('[Server] Máy chủ đã tắt hoàn tất.');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Bleach vs Naruto Online (HTTP + WebSocket) đang chạy trên cổng: ${PORT}`);
});
