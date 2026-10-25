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
async function initRuffleGame() {
    try {
        const ruffle = window.RufflePlayer ? window.RufflePlayer.newest() : null;
        if (!ruffle) {
            loadingMsg.innerText = "Không thể tải Ruffle Flash Emulator. Vui lòng kiểm tra kết nối mạng!";
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
        loadingMsg.innerText = "Đang tải Bleach vs Naruto (Local Engine)...";

        rufflePlayer.load({
            url: "game.swf",
            autoplay: "on"
        }).then(() => {
            console.log("Game Flash đã tải thành công trên máy này!");
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                findRuffleCanvas(rufflePlayer);
            }, 600);
        }).catch((err) => {
            console.warn("Lỗi tải game.swf:", err);
            loadingMsg.innerHTML = `Chưa tìm thấy file <strong>game.swf</strong>.<br>Vui lòng đặt file game vào cùng thư mục.`;
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
        setTimeout(() => findRuffleCanvas(player), 500);
    } else {
        console.log("Đã tìm thấy Canvas của game:", ruffleCanvas);
        ruffleCanvas.setAttribute('tabindex', '0');
        ruffleCanvas.focus();
    }
}

// Click vào container để focus vào game và kích hoạt AudioContext nếu bị chặn
const gameContainer = document.getElementById('gameContainer');
if (gameContainer) {
    gameContainer.addEventListener('click', () => {
        if (ruffleCanvas) {
            ruffleCanvas.focus();
        }
        if (rufflePlayer) {
            rufflePlayer.focus();
        }
    });
}

// Bắn sự kiện phím vào Ruffle Flash Player
function dispatchFlashKeyEvent(type, flashKeyInfo) {
    const event = new KeyboardEvent(type, {
        key: flashKeyInfo.key,
        code: flashKeyInfo.code,
        keyCode: flashKeyInfo.keyCode,
        which: flashKeyInfo.keyCode,
        bubbles: true,
        cancelable: true
    });

    if (ruffleCanvas) {
        ruffleCanvas.dispatchEvent(event);
    }
    if (rufflePlayer) {
        rufflePlayer.dispatchEvent(event);
    }
    document.dispatchEvent(event);
    window.dispatchEvent(event);
}

// ==========================================
// 2. INPUT ENGINE & MẠNG P2P
// ==========================================

// Lắng nghe bàn phím từ người dùng
window.addEventListener('keydown', (e) => handleUserKeyEvent(e, 'keydown'));
window.addEventListener('keyup', (e) => handleUserKeyEvent(e, 'keyup'));

function handleUserKeyEvent(e, eventType) {
    // Nếu đang trong modal cài đặt phím thì không kích hoạt phím game
    if (activeRecordingButton || !keyModal.classList.contains('hidden')) {
        return;
    }

    // Chặn cuộn trang web với các phím mũi tên và Space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
    }

    const code = e.code;

    // 1. Nếu đang là HOST (P1)
    if (myRole === 'host') {
        const action = findActionByCode(userKeyBindings.p1, code);
        if (action) {
            // Dispatch phím P1 vào game nội bộ
            const nativeKey = FLASH_NATIVE_KEYS.p1[action];
            dispatchFlashKeyEvent(eventType, nativeKey);

            // Gửi sang P2 để game trên máy P2 cũng nhận phím P1
            if (activeConnection && activeConnection.open) {
                activeConnection.send({
                    type: 'game_input',
                    role: 'p1',
                    action: action,
                    eventType: eventType
                });
            }
        }
    }
    // 2. Nếu đang là KHÁCH (P2)
    else if (myRole === 'guest') {
        const action = findActionByCode(userKeyBindings.p2, code);
        if (action) {
            // Dịch action sang mã phím P2 chuẩn mà game BVN hiểu
            const nativeKey = FLASH_NATIVE_KEYS.p2[action];
            dispatchFlashKeyEvent(eventType, nativeKey);

            // Gửi sang Host (P1)
            if (activeConnection && activeConnection.open) {
                activeConnection.send({
                    type: 'game_input',
                    role: 'p2',
                    action: action,
                    eventType: eventType
                });
            }
        }
    }
    // 3. Nếu đang chơi Solo (Chơi đơn offline)
    else {
        // Hỗ trợ cả 2 bên nếu chơi 2 người trên cùng 1 máy
        const actionP1 = findActionByCode(userKeyBindings.p1, code);
        if (actionP1) {
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1[actionP1]);
        }
        const actionP2 = findActionByCode(userKeyBindings.p2, code);
        if (actionP2) {
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p2[actionP2]);
        }
    }
}

function findActionByCode(bindingGroup, code) {
    for (const [action, config] of Object.entries(bindingGroup)) {
        if (config.code === code) return action;
    }
    return null;
}

// Xử lý gói tin nhận được từ máy đối thủ qua WebRTC DataChannel
function handleReceivedNetworkData(data) {
    if (!data) return;

    // Nhận sự kiện phím
    if (data.type === 'game_input') {
        const targetGroup = data.role === 'p1' ? FLASH_NATIVE_KEYS.p1 : FLASH_NATIVE_KEYS.p2;
        const nativeKey = targetGroup[data.action];
        if (nativeKey) {
            dispatchFlashKeyEvent(data.eventType, nativeKey);
        }
        return;
    }

    // Nhận yêu cầu khởi động lại / đồng bộ trận đấu
    if (data.type === 'sync_restart') {
        console.log("Đối thủ vừa bấm khởi động lại game!");
        initRuffleGame();
        return;
    }

    // Xử lý đo Ping
    if (data.type === 'ping') {
        if (activeConnection && activeConnection.open) {
            activeConnection.send({ type: 'pong', time: data.time });
        }
        return;
    }

    if (data.type === 'pong') {
        const latency = Date.now() - data.time;
        pingVal.innerText = latency;
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

    peer = new Peer(roomId, PEER_CONFIG);

    peer.on('open', (id) => {
        myRole = 'host';
        btnCreateRoom.classList.add('hidden');
        hostRoomInfo.classList.remove('hidden');
        hostRoomCode.value = id;

        updateRoleDisplay('host');
        updateStatus('waiting', `Đang mở phòng [${id}] • Chờ bạn bè tham gia...`);
    });

    peer.on('connection', (conn) => {
        activeConnection = conn;
        setupConnectionEvents(conn);
    });

    peer.on('error', (err) => {
        console.error("PeerJS Host Error:", err);
        alert("Lỗi kết nối phòng: " + err.type + ". Vui lòng thử tạo lại!");
        btnCreateRoom.disabled = false;
        btnCreateRoom.innerText = "➕ Tạo phòng mới";
    });
});

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

    peer = new Peer(PEER_CONFIG);

    peer.on('open', (guestId) => {
        const conn = peer.connect(roomId, { reliable: true });
        activeConnection = conn;

        conn.on('open', () => {
            myRole = 'guest';
            updateRoleDisplay('guest');
            updateStatus('connected', `🟢 Đã vào phòng thành công! Bạn là Người chơi 2 (P2)`);
            guestConnectionMsg.innerHTML = `<span style="color: #00ff88;">✓ Đã kết nối với Chủ phòng! Hãy click vào màn hình game để bắt đầu.</span>`;
            pingBadge.classList.remove('hidden');

            setupConnectionEvents(conn);
        });

        conn.on('error', (err) => {
            console.error("Connection Error:", err);
        });
    });

    peer.on('error', (err) => {
        console.error("PeerJS Guest Error:", err);
        guestConnectionMsg.innerHTML = `<span style="color: #ff3366;">Không tìm thấy phòng [${roomId}]. Hãy kiểm tra lại mã!</span>`;
        btnJoinRoom.disabled = false;
        btnJoinRoom.innerText = "Vào phòng";
    });
}

function setupConnectionEvents(conn) {
    pingBadge.classList.remove('hidden');
    startPingMeasurement(conn);

    if (myRole === 'host') {
        updateStatus('connected', `🟢 Bạn bè đã vào phòng! Bạn là Người chơi 1 (P1)`);
    }

    conn.on('data', (data) => {
        handleReceivedNetworkData(data);
    });

    conn.on('close', () => {
        updateStatus('waiting', `Đối thủ đã ngắt kết nối.`);
        pingBadge.classList.add('hidden');
        if (pingInterval) clearInterval(pingInterval);
        alert("Đối thủ đã rời phòng.");
        location.reload();
    });
}

function startPingMeasurement(conn) {
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
        if (conn && conn.open) {
            conn.send({ type: 'ping', time: Date.now() });
        }
    }, 1000);
}

// Nút Đồng bộ lại / Khởi động lại trận đấu
btnSyncRestart.addEventListener('click', () => {
    if (confirm("Khởi động lại game trên cả hai máy để đồng bộ lại từ đầu?")) {
        if (activeConnection && activeConnection.open) {
            activeConnection.send({ type: 'sync_restart' });
        }
        initRuffleGame();
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
// 6. KHỞI CHẠY LẦN ĐẦU
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    renderGuides();
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
