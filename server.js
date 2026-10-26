const http = require('http');
const express = require('express');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

// Rooms storage: roomId -> { host: ws, guest: ws }
const rooms = new Map();

wss.on('connection', (ws) => {
    let currentRoom = null;
    let currentRole = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === 'create_room') {
                const roomId = data.roomId;
                rooms.set(roomId, { host: ws, guest: null });
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
});

// Phục vụ các file tĩnh (HTML, CSS, JS, SWF, Ruffle)
app.use(express.static(path.join(__dirname, '.'), {
    dotfiles: 'ignore',
    index: ['index.html']
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

server.listen(PORT, () => {
    console.log(`Server Bleach vs Naruto Online (HTTP + WebSocket) đang chạy trên cổng: ${PORT}`);
});

