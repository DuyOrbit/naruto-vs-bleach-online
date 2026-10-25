// ==========================================
// BLEACH VS NARUTO - P2P WEBRTC ONLINE
// ==========================================

const PEER_CONFIG = {
    config: {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    }
};

// State
let peer = null;
let activeConnection = null;
let isHost = false;
let ruffleCanvas = null;
let pingInterval = null;

// DOM Elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const pingBadge = document.getElementById('pingBadge');
const pingVal = document.getElementById('pingVal');

const flashWrapper = document.getElementById('flashPlayerWrapper');
const guestWrapper = document.getElementById('guestStreamWrapper');
const remoteVideo = document.getElementById('remoteVideo');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingMsg = document.getElementById('loadingMsg');

const btnCreateRoom = document.getElementById('btnCreateRoom');
const hostRoomInfo = document.getElementById('hostRoomInfo');
const hostRoomCode = document.getElementById('hostRoomCode');
const btnCopyCode = document.getElementById('btnCopyCode');
const btnCopyLink = document.getElementById('btnCopyLink');

const inputRoomCode = document.getElementById('inputRoomCode');
const btnJoinRoom = document.getElementById('btnJoinRoom');
const guestConnectionMsg = document.getElementById('guestConnectionMsg');

// ==========================================
// 1. KHỞI TẠO GAME FLASH (RUFFLE)
// ==========================================
async function initRuffleGame() {
    try {
        const ruffle = window.RufflePlayer ? window.RufflePlayer.newest() : null;
        if (!ruffle) {
            loadingMsg.innerText = "Không thể tải Ruffle Flash Emulator. Vui lòng kiểm tra kết nối mạng!";
            return;
        }

        const container = document.getElementById('rufflePlayer');
        const player = ruffle.createPlayer();
        container.appendChild(player);

        player.style.width = "100%";
        player.style.height = "100%";

        // Cấu hình tối ưu cho game đối kháng
        player.config = {
            letterbox: "on",
            forceScale: true,
            quality: "high",
            wmode: "direct"
        };

        // File game mặc định trong cùng thư mục: game.swf
        player.load({
            url: "game.swf"
        }).then(() => {
            console.log("Game Flash đã tải thành công!");
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                findRuffleCanvas(player);
            }, 800);
        }).catch((err) => {
            console.warn("Chưa tìm thấy game.swf local, thử tải từ CDN hoặc đợi người dùng upload:", err);
            loadingMsg.innerHTML = `Chưa có file <strong>game.swf</strong> trong thư mục.<br>Hãy tải file SWF của Bleach vs Naruto và đặt tên là <strong>game.swf</strong>.`;
        });
    } catch (e) {
        console.error("Lỗi khởi tạo Ruffle:", e);
    }
}

// Bắt lấy thẻ <canvas> thật được Ruffle render trong Shadow DOM
function findRuffleCanvas(player) {
    if (player.shadowRoot) {
        ruffleCanvas = player.shadowRoot.querySelector('canvas');
    }
    if (!ruffleCanvas) {
        ruffleCanvas = player.querySelector('canvas');
    }
    if (!ruffleCanvas) {
        // Thử tìm lại sau 500ms nếu canvas chưa kịp tạo
        setTimeout(() => findRuffleCanvas(player), 500);
    } else {
        console.log("Đã tìm thấy Canvas của game:", ruffleCanvas);
    }
}

// ==========================================
// 2. TẠO PHÒNG (HOST - P1)
// ==========================================
btnCreateRoom.addEventListener('click', () => {
    btnCreateRoom.disabled = true;
    btnCreateRoom.innerText = "Đang tạo phòng...";

    // Sinh mã ngẫu nhiên: bvn-xxxx (4 ký tự số)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const roomId = `bvn-${randomCode}`;

    peer = new Peer(roomId, PEER_CONFIG);

    peer.on('open', (id) => {
        isHost = true;
        btnCreateRoom.classList.add('hidden');
        hostRoomInfo.classList.remove('hidden');
        hostRoomCode.value = id;

        updateStatus('waiting', `Đang mở phòng [${id}] - Chờ P2 kết nối...`);
    });

    // Lắng nghe khi có Khách (P2) kết nối DataChannel
    peer.on('connection', (conn) => {
        activeConnection = conn;
        setupHostConnection(conn);
    });

    peer.on('error', (err) => {
        console.error("PeerJS Host Error:", err);
        alert("Lỗi kết nối phòng: " + err.type + ". Vui lòng thử tạo lại!");
        btnCreateRoom.disabled = false;
        btnCreateRoom.innerText = "➕ Tạo phòng mới";
    });
});

function setupHostConnection(conn) {
    conn.on('open', () => {
        updateStatus('connected', `🟢 Đã kết nối với Bạn bè! Bạn là P1 (Host)`);
        pingBadge.classList.remove('hidden');

        // Khởi động đo ping
        startPingMeasurement(conn);

        // Bắt đầu Stream Canvas sang Khách
        streamGameToGuest(conn.peer);
    });

    // Nhận phím bấm từ Khách (P2) và inject vào game
    conn.on('data', (data) => {
        if (data.type === 'ping') {
            conn.send({ type: 'pong', time: data.time });
            return;
        }

        if (data.type === 'keydown' || data.type === 'keyup') {
            injectKeyToGame(data);
        }
    });

    conn.on('close', () => {
        updateStatus('waiting', `Bạn bè đã rời phòng. Đang chờ kết nối lại...`);
        pingBadge.classList.add('hidden');
        if (pingInterval) clearInterval(pingInterval);
    });
}

// Stream Canvas + Audio từ Host sang Khách
function streamGameToGuest(guestPeerId) {
    if (!ruffleCanvas) {
        console.warn("Canvas chưa sẵn sàng, đang thử lại...");
        setTimeout(() => streamGameToGuest(guestPeerId), 500);
        return;
    }

    try {
        // Bắt hình ảnh 60 FPS từ Canvas
        const stream = ruffleCanvas.captureStream(60);

        // Bắt âm thanh từ Web Audio (nếu trình duyệt hỗ trợ)
        // Gọi WebRTC Media Stream sang Khách
        const call = peer.call(guestPeerId, stream);
        console.log("Đang truyền luồng video game sang P2:", guestPeerId);
    } catch (err) {
        console.error("Lỗi khi capture canvas stream:", err);
    }
}

// Giả lập phím bấm của P2 trên máy Host
function injectKeyToGame(keyData) {
    const event = new KeyboardEvent(keyData.type, {
        key: keyData.key,
        code: keyData.code,
        keyCode: keyData.keyCode,
        which: keyData.keyCode,
        bubbles: true,
        cancelable: true
    });

    // Dispatch vào Canvas và document để Ruffle bắt được
    if (ruffleCanvas) {
        ruffleCanvas.dispatchEvent(event);
    }
    document.dispatchEvent(event);
    window.dispatchEvent(event);
}

// ==========================================
// 3. THAM GIA PHÒNG (KHÁCH - GUEST / P2)
// ==========================================
btnJoinRoom.addEventListener('click', () => {
    const code = inputRoomCode.value.trim().toLowerCase();
    if (!code) {
        alert("Vui lòng nhập mã phòng!");
        return;
    }
    joinRoomAsGuest(code);
});

function joinRoomAsGuest(roomId) {
    btnJoinRoom.disabled = true;
    btnJoinRoom.innerText = "Đang kết nối...";
    guestConnectionMsg.classList.remove('hidden');
    guestConnectionMsg.innerText = `Đang tìm phòng [${roomId}]...`;

    // Tạo peer ngẫu nhiên cho khách
    peer = new Peer(PEER_CONFIG);

    peer.on('open', (guestId) => {
        console.log("Khách đã tạo Peer:", guestId);
        const conn = peer.connect(roomId, { reliable: false }); // Không chờ ACK để độ trễ thấp nhất
        activeConnection = conn;

        conn.on('open', () => {
            isHost = false;
            updateStatus('connected', `🟢 Đã vào phòng thành công! Bạn là P2 (Khách)`);
            guestConnectionMsg.innerHTML = `<span style="color: #00ff88;">✓ Đã kết nối với Host! Hãy bấm vào màn hình để bắt đầu chơi.</span>`;
            pingBadge.classList.remove('hidden');

            // Chuyển sang màn hình Stream Video
            flashWrapper.classList.add('hidden');
            guestWrapper.classList.remove('hidden');

            // Bắt đầu lắng nghe phím từ máy khách gửi đi
            setupGuestKeyboard(conn);
        });

        conn.on('data', (data) => {
            if (data.type === 'pong') {
                const latency = Date.now() - data.time;
                pingVal.innerText = latency;
            }
        });

        conn.on('close', () => {
            alert("Phòng đã đóng hoặc mất kết nối với Host.");
            location.reload();
        });
    });

    // Nhận video stream từ Host
    peer.on('call', (call) => {
        call.answer(); // Khách nhận cuộc gọi
        call.on('stream', (remoteStream) => {
            console.log("Đã nhận luồng video từ Host!");
            remoteVideo.srcObject = remoteStream;
            remoteVideo.play().catch(e => {
                console.log("Trình duyệt yêu cầu click để phát audio:", e);
                guestConnectionMsg.innerHTML += `<br><button class="btn btn-sm" onclick="remoteVideo.play()">Bấm để bật tiếng</button>`;
            });
        });
    });

    peer.on('error', (err) => {
        console.error("PeerJS Guest Error:", err);
        guestConnectionMsg.innerHTML = `<span style="color: #ff3366;">Không tìm thấy phòng [${roomId}]. Hãy kiểm tra lại mã!</span>`;
        btnJoinRoom.disabled = false;
        btnJoinRoom.innerText = "Vào phòng";
    });
}

// Bắt phím của Khách và gửi qua Host
function setupGuestKeyboard(conn) {
    // Map phím tiện lợi: Nếu không có Numpad, số hàng phím trên 1,2,3,4,5,6 vẫn gửi sang mã Numpad của Flash
    const numpadMap = {
        'Digit1': { key: '1', code: 'Numpad1', keyCode: 97 },
        'Digit2': { key: '2', code: 'Numpad2', keyCode: 98 },
        'Digit3': { key: '3', code: 'Numpad3', keyCode: 99 },
        'Digit4': { key: '4', code: 'Numpad4', keyCode: 100 },
        'Digit5': { key: '5', code: 'Numpad5', keyCode: 101 },
        'Digit6': { key: '6', code: 'Numpad6', keyCode: 102 }
    };

    const handleKey = (e) => {
        // Chặn phím mũi tên làm cuộn trang web
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }

        let keyPayload = {
            type: e.type,
            key: e.key,
            code: e.code,
            keyCode: e.keyCode
        };

        // Nếu người dùng bấm phím số thường 1-6, tự chuyển thành Numpad 1-6 cho game BVN hiểu
        if (numpadMap[e.code]) {
            keyPayload = {
                type: e.type,
                key: numpadMap[e.code].key,
                code: numpadMap[e.code].code,
                keyCode: numpadMap[e.code].keyCode
            };
        }

        if (conn && conn.open) {
            conn.send(keyPayload);
        }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
}

// Đo Ping giữa 2 máy
function startPingMeasurement(conn) {
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
        if (conn && conn.open) {
            conn.send({ type: 'ping', time: Date.now() });
        }
    }, 1000);

    conn.on('data', (data) => {
        if (data.type === 'pong') {
            const latency = Date.now() - data.time;
            pingVal.innerText = latency;
        }
    });
}

// ==========================================
// 4. TIỆN ÍCH COPY & URL PARAMS
// ==========================================
btnCopyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(hostRoomCode.value);
    btnCopyCode.innerText = "Đã Copy!";
    setTimeout(() => { btnCopyCode.innerText = "Copy Mã"; }, 2000);
});

btnCopyLink.addEventListener('click', () => {
    const inviteLink = `${window.location.origin}${window.location.pathname}?room=${hostRoomCode.value}`;
    navigator.clipboard.writeText(inviteLink);
    btnCopyLink.innerText = "✓ Đã Copy Link Mời Vào Bộ Nhớ Đệm!";
    setTimeout(() => { btnCopyLink.innerText = "🔗 Copy Link Mời Bạn Bè"; }, 2000);
});

function updateStatus(state, msg) {
    statusDot.className = `status-indicator ${state}`;
    statusText.innerText = msg;
}

// Tự động vào phòng nếu người dùng bấm vào Link mời có kèm ?room=xxxx
window.addEventListener('DOMContentLoaded', () => {
    initRuffleGame();

    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        inputRoomCode.value = roomParam;
        setTimeout(() => {
            joinRoomAsGuest(roomParam);
        }, 600);
    }
});
