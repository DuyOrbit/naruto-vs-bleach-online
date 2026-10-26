// ==========================================
// BLEACH VS NARUTO - P2P WEBRTC INPUT SYNC
// Native 1080p Local Engine • Zero Video Lag
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

// ==========================================
// ĐỊNH NGHĨA PHÍM GỐC CỦA GAME FLASH BVN
// ==========================================
const FLASH_NATIVE_KEYS = {
    p1: {
        UP:     { code: 'KeyW', key: 'w', keyCode: 87, label: 'Lên (Nhảy / Trèo)' },
        DOWN:   { code: 'KeyS', key: 's', keyCode: 83, label: 'Xuống (Ngồi / Đỡ)' },
        LEFT:   { code: 'KeyA', key: 'a', keyCode: 65, label: 'Trái (Tiến / Lùi)' },
        RIGHT:  { code: 'KeyD', key: 'd', keyCode: 68, label: 'Phải (Tiến / Lùi)' },
        ATTACK: { code: 'KeyJ', key: 'j', keyCode: 74, label: 'Đánh thường (J)' },
        JUMP:   { code: 'KeyK', key: 'k', keyCode: 75, label: 'Nhảy (K)' },
        DASH:   { code: 'KeyL', key: 'l', keyCode: 76, label: 'Lướt / Né (L)' },
        SUB:    { code: 'KeyU', key: 'u', keyCode: 85, label: 'Chiêu phụ (U)' },
        ULTI:   { code: 'KeyI', key: 'i', keyCode: 73, label: 'Tuyệt kỹ Ulti (I)' },
        ASSIST: { code: 'KeyO', key: 'o', keyCode: 79, label: 'Gọi hỗ trợ (O)' }
    },
    p2: {
        UP:     { code: 'ArrowUp', key: 'ArrowUp', keyCode: 38, label: 'Lên (Mũi tên lên)' },
        DOWN:   { code: 'ArrowDown', key: 'ArrowDown', keyCode: 40, label: 'Xuống (Mũi tên xuống)' },
        LEFT:   { code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37, label: 'Trái (Mũi tên trái)' },
        RIGHT:  { code: 'ArrowRight', key: 'ArrowRight', keyCode: 39, label: 'Phải (Mũi tên phải)' },
        ATTACK: { code: 'Numpad1', key: '1', keyCode: 97, label: 'Đánh thường (Numpad 1)' },
        JUMP:   { code: 'Numpad2', key: '2', keyCode: 98, label: 'Nhảy (Numpad 2)' },
        DASH:   { code: 'Numpad3', key: '3', keyCode: 99, label: 'Lướt / Né (Numpad 3)' },
        SUB:    { code: 'Numpad4', key: '4', keyCode: 100, label: 'Chiêu phụ (Numpad 4)' },
        ULTI:   { code: 'Numpad5', key: '5', keyCode: 101, label: 'Tuyệt kỹ Ulti (Numpad 5)' },
        ASSIST: { code: 'Numpad6', key: '6', keyCode: 102, label: 'Gọi hỗ trợ (Numpad 6)' }
    }
};

// ==========================================
// CÁC PRESET BÀN PHÍM TÙY CHỌN CHO NGƯỜI DÙNG
// ==========================================
const KEY_PRESETS = {
    // Preset dành riêng cho Laptop: Dùng phím chữ IJKL để di chuyển, ZXCVBN ra đòn
    preset_laptop_letter: {
        p2: {
            UP:     { code: 'KeyI', display: 'I' },
            DOWN:   { code: 'KeyK', display: 'K' },
            LEFT:   { code: 'KeyJ', display: 'J' },
            RIGHT:  { code: 'KeyL', display: 'L' },
            ATTACK: { code: 'KeyZ', display: 'Z' },
            JUMP:   { code: 'KeyX', display: 'X' },
            DASH:   { code: 'KeyC', display: 'C' },
            SUB:    { code: 'KeyV', display: 'V' },
            ULTI:   { code: 'KeyB', display: 'B' },
            ASSIST: { code: 'KeyN', display: 'N' }
        }
    },
    // Preset Laptop dùng hàng số: Mũi tên + 1,2,3,4,5,6
    preset_laptop_num: {
        p2: {
            UP:     { code: 'ArrowUp', display: '↑' },
            DOWN:   { code: 'ArrowDown', display: '↓' },
            LEFT:   { code: 'ArrowLeft', display: '←' },
            RIGHT:  { code: 'ArrowRight', display: '→' },
            ATTACK: { code: 'Digit1', display: 'Số 1' },
            JUMP:   { code: 'Digit2', display: 'Số 2' },
            DASH:   { code: 'Digit3', display: 'Số 3' },
            SUB:    { code: 'Digit4', display: 'Số 4' },
            ULTI:   { code: 'Digit5', display: 'Số 5' },
            ASSIST: { code: 'Digit6', display: 'Số 6' }
        }
    },
    // Preset PC mặc định (Có bàn phím số Numpad bên phải)
    preset_default_pc: {
        p2: {
            UP:     { code: 'ArrowUp', display: '↑' },
            DOWN:   { code: 'ArrowDown', display: '↓' },
            LEFT:   { code: 'ArrowLeft', display: '←' },
            RIGHT:  { code: 'ArrowRight', display: '→' },
            ATTACK: { code: 'Numpad1', display: 'Num 1' },
            JUMP:   { code: 'Numpad2', display: 'Num 2' },
            DASH:   { code: 'Numpad3', display: 'Num 3' },
            SUB:    { code: 'Numpad4', display: 'Num 4' },
            ULTI:   { code: 'Numpad5', display: 'Num 5' },
            ASSIST: { code: 'Numpad6', display: 'Num 6' }
        }
    }
};

// Cấu hình phím hiện tại của người dùng (khởi tạo từ Preset laptop_letter để tiện nhất)
let userKeyBindings = loadKeyBindings();

function loadKeyBindings() {
    const saved = localStorage.getItem('bvn_user_keybindings');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Lỗi parse saved bindings:", e);
        }
    }

    // Mặc định: P1 dùng WASD + JKLU IO, P2 dùng Preset Laptop Phím Chữ (siêu tiện)
    return {
        presetName: 'preset_laptop_letter',
        p1: {
            UP:     { code: 'KeyW', display: 'W' },
            DOWN:   { code: 'KeyS', display: 'S' },
            LEFT:   { code: 'KeyA', display: 'A' },
            RIGHT:  { code: 'KeyD', display: 'D' },
            ATTACK: { code: 'KeyJ', display: 'J' },
            JUMP:   { code: 'KeyK', display: 'K' },
            DASH:   { code: 'KeyL', display: 'L' },
            SUB:    { code: 'KeyU', display: 'U' },
            ULTI:   { code: 'KeyI', display: 'I' },
            ASSIST: { code: 'KeyO', display: 'O' }
        },
        p2: { ...KEY_PRESETS.preset_laptop_letter.p2 }
    };
}

function saveKeyBindings(bindings) {
    userKeyBindings = bindings;
    localStorage.setItem('bvn_user_keybindings', JSON.stringify(bindings));
    renderGuides();
}

// ==========================================
// APPLICATION STATE
// ==========================================
let peer = null;
let activeConnection = null;
let socket = null;
let myRole = 'solo'; // 'solo' | 'host' | 'guest'
let rufflePlayer = null;
let ruffleCanvas = null;
let pingInterval = null;

// DOM Elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const pingBadge = document.getElementById('pingBadge');
const pingVal = document.getElementById('pingVal');
const roleBadge = document.getElementById('roleBadge');

const flashWrapper = document.getElementById('flashPlayerWrapper');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingMsg = document.getElementById('loadingMsg');
const loadingSubMsg = document.getElementById('loadingSubMsg');
const btnSkipIntro = document.getElementById('btnSkipIntro');

const btnCreateRoom = document.getElementById('btnCreateRoom');
const hostRoomInfo = document.getElementById('hostRoomInfo');
const hostRoomCode = document.getElementById('hostRoomCode');
const btnCopyCode = document.getElementById('btnCopyCode');
const btnCopyLink = document.getElementById('btnCopyLink');

const inputRoomCode = document.getElementById('inputRoomCode');
const btnJoinRoom = document.getElementById('btnJoinRoom');
const guestConnectionMsg = document.getElementById('guestConnectionMsg');

const btnSyncRestart = document.getElementById('btnSyncRestart');
const btnFullscreen = document.getElementById('btnFullscreen');
const btnOpenKeyModal = document.getElementById('btnOpenKeyModal');

// Modal Elements
const keyModal = document.getElementById('keyModal');
const btnCloseKeyModal = document.getElementById('btnCloseKeyModal');
const presetSelect = document.getElementById('presetSelect');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const bindingListP1 = document.getElementById('bindingListP1');
const bindingListP2 = document.getElementById('bindingListP2');
const btnSaveKeys = document.getElementById('btnSaveKeys');
const btnResetDefaultKeys = document.getElementById('btnResetDefaultKeys');

// Guides
const guideGridP1 = document.getElementById('guideGridP1');
const guideGridP2 = document.getElementById('guideGridP2');

// ==========================================
// 1. KHỞI TẠO VÀ NẠP GAME FLASH (RUFFLE)
// ==========================================
function focusGame() {
    if (rufflePlayer) {
        rufflePlayer.focus();
        if (rufflePlayer.shadowRoot) {
            const inner = rufflePlayer.shadowRoot.querySelector('#container') || rufflePlayer.shadowRoot.querySelector('canvas');
            if (inner) inner.focus();
        }
    }
    if (ruffleCanvas) {
        ruffleCanvas.focus();
    }
}

async function initRuffleGame() {
    try {
        const ruffle = window.RufflePlayer ? window.RufflePlayer.newest() : null;
        if (!ruffle) {
            loadingMsg.innerText = "Không thể tải Ruffle Flash Emulator. Vui lòng kiểm tra file thư viện!";
            return;
        }

        const container = document.getElementById('rufflePlayer');
        container.innerHTML = ""; // Clear nếu reload
        rufflePlayer = ruffle.createPlayer();
        container.appendChild(rufflePlayer);

        rufflePlayer.style.width = "100%";
        rufflePlayer.style.height = "100%";

        rufflePlayer.config = {
            letterbox: "on",
            forceScale: true,
            quality: "high",
            autoplay: "on",
            unmuteOverlay: "visible",
            splashScreen: false
        };

        loadingOverlay.classList.remove('hidden');
        loadingMsg.innerText = "Đang nạp Bleach vs Naruto (Local Engine)...";
        if (loadingSubMsg) loadingSubMsg.innerText = "Khởi động engine WebAssembly sắc nét 100%";
        if (btnSkipIntro) btnSkipIntro.classList.remove('hidden');

        const hideIntroOverlay = () => {
            loadingOverlay.classList.add('hidden');
            focusGame();
        };

        if (btnSkipIntro) {
            btnSkipIntro.onclick = hideIntroOverlay;
        }
        loadingOverlay.onclick = hideIntroOverlay;

        rufflePlayer.load({
            url: "game.swf",
            autoplay: "on"
        }).then(() => {
            console.log("Game Flash đã tải thành công trên máy này!");
            findRuffleCanvas(rufflePlayer);

            // Tự động ẩn overlay sau 1.5s
            setTimeout(hideIntroOverlay, 1500);
        }).catch((err) => {
            console.warn("Lỗi tải game.swf:", err);
            loadingMsg.innerHTML = `Chưa tìm thấy file <strong>game.swf</strong>.<br>Vui lòng kiểm tra file game trong thư mục.`;
        });
    } catch (e) {
        console.error("Lỗi khởi tạo Ruffle:", e);
    }
}

function findRuffleCanvas(player) {
    if (player.shadowRoot) {
        ruffleCanvas = player.shadowRoot.querySelector('canvas');
    }
    if (!ruffleCanvas) {
        ruffleCanvas = player.querySelector('canvas');
    }
    if (!ruffleCanvas) {
        setTimeout(() => findRuffleCanvas(player), 300);
    } else {
        console.log("Đã tìm thấy Canvas của game:", ruffleCanvas);
        ruffleCanvas.setAttribute('tabindex', '0');
        ruffleCanvas.focus();
    }
}

// Click vào container để focus vào game và kích hoạt âm thanh
const gameContainer = document.getElementById('gameContainer');
if (gameContainer) {
    gameContainer.addEventListener('click', () => {
        focusGame();
    });
}

// Bắn sự kiện phím vào Ruffle Flash Player (hỗ trợ Shadow DOM và Bubbling)
function dispatchFlashKeyEvent(type, flashKeyInfo) {
    if (!flashKeyInfo) return;

    const eventInit = {
        key: flashKeyInfo.key,
        code: flashKeyInfo.code,
        keyCode: flashKeyInfo.keyCode,
        which: flashKeyInfo.keyCode,
        bubbles: true,
        cancelable: true,
        composed: true
    };

    focusGame();

    // 1. Dispatch vào canvas
    if (ruffleCanvas) {
        ruffleCanvas.dispatchEvent(new KeyboardEvent(type, eventInit));
    }

    // 2. Dispatch vào container trong Shadow Root
    if (rufflePlayer && rufflePlayer.shadowRoot) {
        const shadowContainer = rufflePlayer.shadowRoot.querySelector('#container');
        if (shadowContainer) {
            shadowContainer.dispatchEvent(new KeyboardEvent(type, eventInit));
        }
    }

    // 3. Dispatch vào rufflePlayer element
    if (rufflePlayer) {
        rufflePlayer.dispatchEvent(new KeyboardEvent(type, eventInit));
    }

    // 4. Dispatch lên window (synthetic event sẽ bị handleUserKeyEvent bỏ qua vì !e.isTrusted)
    window.dispatchEvent(new KeyboardEvent(type, eventInit));
}

// ==========================================
// 2. INPUT ENGINE & MẠNG P2P
// ==========================================

// Lắng nghe bàn phím từ người dùng
window.addEventListener('keydown', (e) => handleUserKeyEvent(e, 'keydown'), true);
window.addEventListener('keyup', (e) => handleUserKeyEvent(e, 'keyup'), true);

function handleUserKeyEvent(e, eventType) {
    // Chỉ xử lý phím thật từ người dùng, bỏ qua synthetic event tránh đệ quy
    if (!e.isTrusted) return;
    
    // Nếu đang trong modal cài đặt phím thì không kích hoạt phím game
    if (activeRecordingButton || (keyModal && !keyModal.classList.contains('hidden'))) {
        return;
    }

    // Không can thiệp nếu đang nhập text trong ô input
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
    }

    const code = e.code;

    // Hỗ trợ Enter và Space như phím Xác nhận/Chọn Menu (J) trong Bleach vs Naruto
    if (code === 'Enter' || code === 'Space') {
        if (eventType === 'keydown') e.preventDefault();
        dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1.ATTACK);
        if (myRole === 'host') {
            sendNetworkMessage({
                type: 'game_input',
                role: 'p1',
                action: 'ATTACK',
                eventType: eventType
            });
        }
        return;
    }

    // Chặn cuộn trang web với các phím mũi tên
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        e.preventDefault();
    }

    // 1. Nếu đang là HOST (P1)
    if (myRole === 'host') {
        const action = findActionByCode(userKeyBindings.p1, code);
        if (action) {
            const nativeKey = FLASH_NATIVE_KEYS.p1[action];
            // Nếu người dùng đổi sang phím khác phím gốc, cần chặn và dispatch phím gốc
            if (code !== nativeKey.code) {
                e.preventDefault();
                dispatchFlashKeyEvent(eventType, nativeKey);
            }

            // Gửi sang P2
            sendNetworkMessage({
                type: 'game_input',
                role: 'p1',
                action: action,
                eventType: eventType
            });
        }
    }
    // 2. Nếu đang là KHÁCH (P2)
    else if (myRole === 'guest') {
        const action = findActionByCode(userKeyBindings.p2, code);
        if (action) {
            e.preventDefault();
            const nativeKey = FLASH_NATIVE_KEYS.p2[action];
            dispatchFlashKeyEvent(eventType, nativeKey);

            // Gửi sang Host (P1)
            sendNetworkMessage({
                type: 'game_input',
                role: 'p2',
                action: action,
                eventType: eventType
            });
        }
    }
    // 3. Nếu đang chơi Solo (Chơi đơn offline)
    else {
        const actionP1 = findActionByCode(userKeyBindings.p1, code);
        const actionP2 = findActionByCode(userKeyBindings.p2, code);

        // Với P1: Nếu dùng phím chuẩn (W, A, S, D, J, K, L, U, I, O), để trình duyệt tự chuyển vào Flash
        // Nếu dùng phím custom thì mới chặn và dispatch
        if (actionP1) {
            const nativeKeyP1 = FLASH_NATIVE_KEYS.p1[actionP1];
            if (code !== nativeKeyP1.code) {
                e.preventDefault();
                dispatchFlashKeyEvent(eventType, nativeKeyP1);
            }
        }

        // Với P2: Preset Laptop (IJKL + ZXCVBN) cần dịch sang Numpad của Flash
        if (actionP2) {
            const nativeKeyP2 = FLASH_NATIVE_KEYS.p2[actionP2];
            if (code !== nativeKeyP2.code) {
                e.preventDefault();
                dispatchFlashKeyEvent(eventType, nativeKeyP2);
            }
        }
    }
}

function findActionByCode(bindingGroup, code) {
    if (!bindingGroup) return null;
    for (const [action, config] of Object.entries(bindingGroup)) {
        if (config.code === code) return action;
    }
    return null;
}

// ==========================================
// THÔNG BÁO NỔI TRÊN MÀN HÌNH GAME (SYNC NOTIFICATION)
// ==========================================
function showSyncNotification(msg, duration = 4000) {
    let notifyBox = document.getElementById('syncNotifyBox');
    if (!notifyBox) {
        notifyBox = document.createElement('div');
        notifyBox.id = 'syncNotifyBox';
        notifyBox.className = 'sync-notify-box';
        const wrapper = document.getElementById('flashPlayerWrapper') || document.body;
        wrapper.appendChild(notifyBox);
    }
    notifyBox.innerHTML = `<span>${msg}</span>`;
    notifyBox.classList.remove('hidden');
    clearTimeout(notifyBox._timer);
    notifyBox._timer = setTimeout(() => {
        notifyBox.classList.add('hidden');
    }, duration);
}

// Gửi tin nhắn qua mạng (Ưu tiên WebSocket máy chủ, fallback sang WebRTC)
function sendNetworkMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        return true;
    }
    if (activeConnection && activeConnection.open) {
        activeConnection.send(data);
        return true;
    }
    return false;
}

// Xử lý gói tin nhận được từ đối thủ
function handleNetworkMessage(data) {
    if (!data) return;

    // 1. Phản hồi tạo phòng thành công
    if (data.type === 'room_created') {
        myRole = 'host';
        btnCreateRoom.classList.add('hidden');
        hostRoomInfo.classList.remove('hidden');
        hostRoomCode.value = data.roomId;
        updateRoleDisplay('host');
        updateStatus('waiting', `Đang mở phòng [${data.roomId}] • Chờ bạn bè tham gia...`);
        return;
    }

    // 2. Phản hồi vào phòng
    if (data.type === 'room_joined') {
        myRole = 'guest';
        updateRoleDisplay('guest');
        updateStatus('waiting', `Đã vào phòng [${data.roomId}] • Đang bắt tay kết nối...`);
        guestConnectionMsg.innerHTML = `<span>Đang kết nối với Chủ phòng...</span>`;
        return;
    }

    // 3. Hai bên đã kết nối với nhau!
    if (data.type === 'peer_connected') {
        if (data.role) {
            myRole = data.role;
            updateRoleDisplay(myRole);
        }

        const hostWaiting = document.querySelector('.host-waiting-msg');
        if (hostWaiting) hostWaiting.classList.add('hidden');

        guestConnectionMsg.innerHTML = `<span style="color: #00ff88;">✓ ĐÃ KẾT NỐI VỚI CHỦ PHÒNG THÀNH CÔNG!</span>`;
        pingBadge.classList.remove('hidden');
        startPingMeasurement();

        updateStatus('connected', `🟢 2 BÊN ĐÃ KẾT NỐI! ĐANG ĐỒNG BỘ TRẬN ĐẤU...`);

        // TỰ ĐỘNG ĐỒNG BỘ GAME TRÊN CẢ 2 MÁY:
        // Khởi động lại game trên cả 2 máy về màn hình 0 để 100% khớp nhau từ Frame đầu tiên!
        showSyncNotification("⚡ Đã kết nối đối thủ! Tự động khởi động lại game để đồng bộ cả 2 máy...");
        setTimeout(() => {
            initRuffleGame();
            if (myRole === 'host') {
                updateStatus('connected', `🟢 BẠN LÀ P1 (HOST): Dùng W/S và J chọn "Team VS" (1P vs 2P) để đấu!`);
                showSyncNotification("🎮 P1 (Bạn): Dùng W/S để chọn menu, bấm J để vào '1P vs 2P'!");
            } else {
                updateStatus('connected', `🟢 BẠN LÀ P2 (KHÁCH): Chờ Host chọn chế độ 1P vs 2P rồi chọn tướng!`);
                showSyncNotification("⏳ Đang đợi Host (P1) vào chế độ 1P vs 2P...");
            }
        }, 1200);
        return;
    }

    // 4. Đối thủ ngắt kết nối
    if (data.type === 'peer_disconnected') {
        updateStatus('waiting', 'Đối thủ đã ngắt kết nối.');
        pingBadge.classList.add('hidden');
        if (pingInterval) clearInterval(pingInterval);
        alert("Đối thủ đã rời khỏi phòng.");
        location.reload();
        return;
    }

    // 5. Nhận sự kiện phím từ đối thủ
    if (data.type === 'game_input') {
        const targetGroup = data.role === 'p1' ? FLASH_NATIVE_KEYS.p1 : FLASH_NATIVE_KEYS.p2;
        const nativeKey = targetGroup[data.action];
        if (nativeKey) {
            dispatchFlashKeyEvent(data.eventType, nativeKey);
        }
        return;
    }

    // 6. Nhận yêu cầu khởi động lại / đồng bộ trận đấu
    if (data.type === 'sync_restart') {
        showSyncNotification("🔄 Đối thủ vừa bấm đồng bộ lại trận đấu!");
        initRuffleGame();
        return;
    }

    // 7. Đo Ping
    if (data.type === 'ping') {
        sendNetworkMessage({ type: 'pong', time: data.time });
        return;
    }

    if (data.type === 'pong') {
        const latency = Date.now() - data.time;
        pingVal.innerText = latency;
        return;
    }

    // 8. Báo lỗi
    if (data.type === 'error') {
        alert(data.message || 'Lỗi kết nối');
        btnJoinRoom.disabled = false;
        btnJoinRoom.innerText = "Vào phòng";
        return;
    }
}

// ==========================================
// 3. TẠO PHÒNG (BẠN LÀ P1 - HOST)
// ==========================================
btnCreateRoom.addEventListener('click', () => {
    btnCreateRoom.disabled = true;
    btnCreateRoom.innerText = "Đang tạo phòng...";

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const roomId = `bvn-${randomCode}`;

    createRoom(roomId);
});

function createRoom(roomId) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${wsProtocol}${window.location.host}`;

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'create_room', roomId: roomId }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleNetworkMessage(data);
            } catch (e) {
                console.error("Lỗi parse ws message:", e);
            }
        };

        socket.onerror = (e) => {
            console.warn("WebSocket lỗi, chuyển sang PeerJS:", e);
            createRoomViaPeerJS(roomId);
        };
    } catch (e) {
        createRoomViaPeerJS(roomId);
    }
}

function createRoomViaPeerJS(roomId) {
    peer = new Peer(roomId, PEER_CONFIG);
    peer.on('open', (id) => {
        handleNetworkMessage({ type: 'room_created', roomId: id });
    });
    peer.on('connection', (conn) => {
        activeConnection = conn;
        conn.on('open', () => {
            handleNetworkMessage({ type: 'peer_connected', role: 'host' });
        });
        conn.on('data', (data) => {
            handleNetworkMessage(data);
        });
        conn.on('close', () => {
            handleNetworkMessage({ type: 'peer_disconnected' });
        });
    });
    peer.on('error', (err) => {
        console.error("PeerJS Host Error:", err);
        alert("Lỗi kết nối phòng: " + err.type + ". Vui lòng thử tạo lại!");
        btnCreateRoom.disabled = false;
        btnCreateRoom.innerText = "➕ Tạo phòng mới";
    });
}

// ==========================================
// 4. VÀO PHÒNG (BẠN LÀ P2 - GUEST)
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

    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${wsProtocol}${window.location.host}`;

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            socket.send(JSON.stringify({ type: 'join_room', roomId: roomId }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleNetworkMessage(data);
            } catch (e) {
                console.error("Lỗi parse guest ws message:", e);
            }
        };

        socket.onerror = (e) => {
            console.warn("WebSocket lỗi, chuyển sang PeerJS fallback:", e);
            joinRoomViaPeerJS(roomId);
        };
    } catch (e) {
        joinRoomViaPeerJS(roomId);
    }
}

function joinRoomViaPeerJS(roomId) {
    peer = new Peer(PEER_CONFIG);
    peer.on('open', (guestId) => {
        const conn = peer.connect(roomId);
        activeConnection = conn;
        conn.on('open', () => {
            handleNetworkMessage({ type: 'peer_connected', role: 'guest' });
        });
        conn.on('data', (data) => {
            handleNetworkMessage(data);
        });
        conn.on('close', () => {
            handleNetworkMessage({ type: 'peer_disconnected' });
        });
    });
    peer.on('error', (err) => {
        console.error("PeerJS Guest Error:", err);
        guestConnectionMsg.innerHTML = `<span style="color: #ff3366;">Không tìm thấy phòng [${roomId}]. Hãy kiểm tra lại mã!</span>`;
        btnJoinRoom.disabled = false;
        btnJoinRoom.innerText = "Vào phòng";
    });
}

function startPingMeasurement() {
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
        sendNetworkMessage({ type: 'ping', time: Date.now() });
    }, 1000);
}

// Nút Đồng bộ lại / Khởi động lại trận đấu
btnSyncRestart.addEventListener('click', () => {
    if (confirm("Khởi động lại game trên cả hai máy để đồng bộ lại từ đầu?")) {
        sendNetworkMessage({ type: 'sync_restart' });
        initRuffleGame();
        showSyncNotification("🔄 Đang đồng bộ lại game từ đầu...");
    }
});

// Toàn màn hình
btnFullscreen.addEventListener('click', () => {
    const container = document.getElementById('gameContainer');
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            alert(`Lỗi toàn màn hình: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});

function updateStatus(state, msg) {
    statusDot.className = `status-indicator ${state}`;
    statusText.innerText = msg;
}

function updateRoleDisplay(role) {
    if (role === 'host') {
        roleBadge.className = 'role-badge role-host';
        roleBadge.innerText = '🔴 BẠN LÀ P1 (HOST)';
    } else if (role === 'guest') {
        roleBadge.className = 'role-badge role-guest';
        roleBadge.innerText = '🔵 BẠN LÀ P2 (KHÁCH)';
    } else {
        roleBadge.className = 'role-badge role-solo';
        roleBadge.innerText = '🎮 Chế độ: Chơi đơn';
    }
}

// Copy Code & Link
btnCopyCode.addEventListener('click', () => {
    navigator.clipboard.writeText(hostRoomCode.value);
    btnCopyCode.innerText = "Đã Copy!";
    setTimeout(() => { btnCopyCode.innerText = "Copy Mã"; }, 2000);
});

btnCopyLink.addEventListener('click', () => {
    const inviteLink = `${window.location.origin}${window.location.pathname}?room=${hostRoomCode.value}`;
    navigator.clipboard.writeText(inviteLink);
    btnCopyLink.innerText = "✓ Đã Copy Link!";
    setTimeout(() => { btnCopyLink.innerText = "🔗 Copy Link Mời Bạn Bè"; }, 2000);
});

// ==========================================
// 5. MODAL CÀI ĐẶT PHÍM (CUSTOM KEYBINDINGS)
// ==========================================
let editingKeyGroup = 'p2'; // 'p1' | 'p2'
let activeRecordingButton = null;
let tempBindings = JSON.parse(JSON.stringify(userKeyBindings));

btnOpenKeyModal.addEventListener('click', () => {
    tempBindings = JSON.parse(JSON.stringify(userKeyBindings));
    presetSelect.value = tempBindings.presetName || 'custom';
    renderModalBindings();
    keyModal.classList.remove('hidden');
});

btnCloseKeyModal.addEventListener('click', () => {
    cancelActiveRecording();
    keyModal.classList.add('hidden');
});

// Switch Tabs
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');
        editingKeyGroup = targetTab === 'tabP1' ? 'p1' : 'p2';
    });
});

// Xử lý đổi Preset nhanh
presetSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    if (KEY_PRESETS[selected]) {
        tempBindings.p2 = { ...KEY_PRESETS[selected].p2 };
        tempBindings.presetName = selected;
        renderModalBindings();
    }
});

function renderModalBindings() {
    renderBindingGroupList('p1', bindingListP1);
    renderBindingGroupList('p2', bindingListP2);
}

function renderBindingGroupList(group, container) {
    container.innerHTML = '';
    const nativeGroup = FLASH_NATIVE_KEYS[group];
    const currentGroup = tempBindings[group];

    for (const [action, nativeInfo] of Object.entries(nativeGroup)) {
        const boundKey = currentGroup[action] || { code: nativeInfo.code, display: nativeInfo.key.toUpperCase() };

        const row = document.createElement('div');
        row.className = 'binding-row';

        const label = document.createElement('span');
        label.className = 'binding-label';
        label.innerText = nativeInfo.label;

        const btn = document.createElement('button');
        btn.className = 'bind-key-btn';
        btn.innerText = boundKey.display;
        btn.dataset.group = group;
        btn.dataset.action = action;

        btn.addEventListener('click', () => {
            startRecordingKey(btn, group, action);
        });

        row.appendChild(label);
        row.appendChild(btn);
        container.appendChild(row);
    }
}

function startRecordingKey(btn, group, action) {
    cancelActiveRecording();

    activeRecordingButton = btn;
    btn.classList.add('recording');
    btn.innerText = 'Nhấn phím...';

    const onKeyRecord = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const code = e.code;
        const display = formatKeyDisplay(e);

        tempBindings[group][action] = {
            code: code,
            display: display
        };
        tempBindings.presetName = 'custom';
        presetSelect.value = 'custom';

        btn.innerText = display;
        btn.classList.remove('recording');
        activeRecordingButton = null;

        window.removeEventListener('keydown', onKeyRecord, true);
    };

    window.addEventListener('keydown', onKeyRecord, true);
}

function cancelActiveRecording() {
    if (activeRecordingButton) {
        const group = activeRecordingButton.dataset.group;
        const action = activeRecordingButton.dataset.action;
        activeRecordingButton.innerText = tempBindings[group][action]?.display || '?';
        activeRecordingButton.classList.remove('recording');
        activeRecordingButton = null;
    }
}

function formatKeyDisplay(e) {
    if (e.code.startsWith('Key')) return e.code.replace('Key', '');
    if (e.code.startsWith('Digit')) return 'Số ' + e.code.replace('Digit', '');
    if (e.code.startsWith('Numpad')) return 'Num ' + e.code.replace('Numpad', '');
    if (e.code === 'ArrowUp') return '↑';
    if (e.code === 'ArrowDown') return '↓';
    if (e.code === 'ArrowLeft') return '←';
    if (e.code === 'ArrowRight') return '→';
    if (e.code === 'Space') return 'Space';
    return e.key.toUpperCase();
}

btnSaveKeys.addEventListener('click', () => {
    saveKeyBindings(tempBindings);
    keyModal.classList.add('hidden');
    alert("Đã lưu cài đặt bàn phím thành công!");
});

btnResetDefaultKeys.addEventListener('click', () => {
    if (confirm("Khôi phục bàn phím về cấu hình chuẩn cho Laptop?")) {
        tempBindings = {
            presetName: 'preset_laptop_letter',
            p1: {
                UP:     { code: 'KeyW', display: 'W' },
                DOWN:   { code: 'KeyS', display: 'S' },
                LEFT:   { code: 'KeyA', display: 'A' },
                RIGHT:  { code: 'KeyD', display: 'D' },
                ATTACK: { code: 'KeyJ', display: 'J' },
                JUMP:   { code: 'KeyK', display: 'K' },
                DASH:   { code: 'KeyL', display: 'L' },
                SUB:    { code: 'KeyU', display: 'U' },
                ULTI:   { code: 'KeyI', display: 'I' },
                ASSIST: { code: 'KeyO', display: 'O' }
            },
            p2: { ...KEY_PRESETS.preset_laptop_letter.p2 }
        };
        presetSelect.value = 'preset_laptop_letter';
        renderModalBindings();
    }
});

// Render danh sách phím hướng dẫn bên dưới giao diện chính
function renderGuides() {
    renderGuideList(userKeyBindings.p1, FLASH_NATIVE_KEYS.p1, guideGridP1);
    renderGuideList(userKeyBindings.p2, FLASH_NATIVE_KEYS.p2, guideGridP2);
}

function renderGuideList(userGroup, nativeGroup, container) {
    container.innerHTML = '';

    // Di chuyển
    const moveDiv = document.createElement('div');
    moveDiv.innerHTML = `
        <kbd>${userGroup.UP.display}</kbd>
        <kbd>${userGroup.LEFT.display}</kbd>
        <kbd>${userGroup.DOWN.display}</kbd>
        <kbd>${userGroup.RIGHT.display}</kbd>
        <span>Di chuyển</span>
    `;
    container.appendChild(moveDiv);

    // Các chiêu thức
    const combatActions = ['ATTACK', 'JUMP', 'DASH', 'SUB', 'ULTI', 'ASSIST'];
    combatActions.forEach(act => {
        const div = document.createElement('div');
        div.innerHTML = `<kbd>${userGroup[act].display}</kbd><span>${nativeGroup[act].label}</span>`;
        container.appendChild(div);
    });
}

// ==========================================
// 6. PHÍM ẢO NHANH TRÊN MÀN HÌNH (VIRTUAL CONTROLS)
// ==========================================
function setupVirtualControls() {
    const vbtns = document.querySelectorAll('.vbtn[data-key]');
    vbtns.forEach(btn => {
        const keyAction = btn.getAttribute('data-key');
        const flashKey = FLASH_NATIVE_KEYS.p1[keyAction];
        if (!flashKey) return;

        const press = (e) => {
            e.preventDefault();
            btn.classList.add('vbtn-active');
            dispatchFlashKeyEvent('keydown', flashKey);
            if (myRole === 'host') {
                sendNetworkMessage({
                    type: 'game_input',
                    role: 'p1',
                    action: keyAction,
                    eventType: 'keydown'
                });
            } else if (myRole === 'guest') {
                sendNetworkMessage({
                    type: 'game_input',
                    role: 'p2',
                    action: keyAction,
                    eventType: 'keydown'
                });
            }
        };

        const release = (e) => {
            e.preventDefault();
            btn.classList.remove('vbtn-active');
            dispatchFlashKeyEvent('keyup', flashKey);
            if (myRole === 'host') {
                sendNetworkMessage({
                    type: 'game_input',
                    role: 'p1',
                    action: keyAction,
                    eventType: 'keyup'
                });
            } else if (myRole === 'guest') {
                sendNetworkMessage({
                    type: 'game_input',
                    role: 'p2',
                    action: keyAction,
                    eventType: 'keyup'
                });
            }
        };

        btn.addEventListener('mousedown', press);
        btn.addEventListener('mouseup', release);
        btn.addEventListener('mouseleave', release);
        btn.addEventListener('touchstart', press, { passive: false });
        btn.addEventListener('touchend', release, { passive: false });
    });
}

// ==========================================
// 7. KHỞI CHẠY LẦN ĐẦU
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    renderGuides();
    setupVirtualControls();
    initRuffleGame();

    // Hỗ trợ tự động kết nối nếu có param URL ?room=bvn-xxxx
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        inputRoomCode.value = roomParam;
        setTimeout(() => {
            joinRoomAsGuest(roomParam);
        }, 800);
    }
});
