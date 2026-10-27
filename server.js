const http = require('http');
const express = require('express');
const path = require('path');
const compression = require('compression');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

// 1. Bật nén phản hồi (Gzip / Brotli) cho HTML, CSS, JS, JSON
app.use(compression({
    level: 6,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
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

// 3. Endpoint Health Check siêu nhẹ (cho UptimeRobot hoặc kiểm tra trạng thái mà không tải 77MB web)
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: Math.round(process.uptime()),
        rooms: rooms.size,
        activeWsClients: wss.clients.size,
        memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    });
});

// Rooms storage: roomId -> { host: ws, guest: ws, lastActive: number }
const rooms = new Map();

// 4. WebSocket Heartbeat & Quản lý kết nối để chống rò rỉ RAM (Anti-Memory Leak)
function heartbeat() {
    this.isAlive = true;
}

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    let currentRoom = null;
    let currentRole = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'create_room') {
                const roomId = data.roomId;
                rooms.set(roomId, { host: ws, guest: null, lastActive: Date.now() });
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
                // Relay các gói tin (game_input, sync_restart, ping, pong, webrtc_offer, webrtc_answer, webrtc_candidate)
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
                    target.send(JSON.stringify({ type: 'peer_disconnected' }));
                }
                if (currentRole === 'host') {
                    rooms.delete(currentRoom);
                } else if (room.guest === ws) {
                    room.guest = null;
                }
            }
        }
    });

    ws.on('error', (err) => {
        console.warn('WS Client error:', err.message);
    });
});

// Định kỳ 30 giây dọn dẹp các kết nối WebSocket bị treo (zombie) và phòng chết để giải phóng RAM
const cleanupInterval = setInterval(() => {
    // 1. Kiểm tra liveness của client
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });

    // 2. Dọn các phòng không còn ai hoạt động
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
        const hostAlive = room.host && room.host.readyState === 1; // 1 = OPEN
        const guestAlive = room.guest && room.guest.readyState === 1;
        if (!hostAlive && !guestAlive) {
            rooms.delete(roomId);
        } else if (now - (room.lastActive || 0) > 2 * 60 * 60 * 1000) {
            // Xóa phòng treo quá 2 tiếng
            rooms.delete(roomId);
        }
    }
}, 30000);

wss.on('close', () => {
    clearInterval(cleanupInterval);
});

// 5. Phục vụ các file tĩnh với Header Cache cực mạnh (Tránh quá tải băng thông & RAM)
app.use(express.static(path.join(__dirname, '.'), {
    dotfiles: 'ignore',
    index: ['index.html'],
    maxAge: '30d',
    setHeaders: (res, filePath) => {
        // Tệp HTML: Không cache dài để người dùng luôn nhận bản cập nhật mới nhất
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

// Điều hướng tất cả request còn lại về index.html
app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Xử lý lỗi an toàn
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

server.listen(PORT, () => {
    console.log(`Server Bleach vs Naruto Online (HTTP + WebSocket) đang chạy trên cổng: ${PORT}`);
});

