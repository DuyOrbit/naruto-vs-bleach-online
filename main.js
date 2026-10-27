// ==========================================
// BLEACH VS NARUTO - 60FPS HD REMOTE PLAY
// Đồng bộ 1 game duy nhất • 100% Khớp màn hình
// WebRTC Canvas 60FPS HD Stream + Audio Sync
// 3 Option phím: WASD | 4 Mũi tên | Tự map (Custom)
// Tự động chuyển đổi sang Native P1 & Native P2 của Flash BVN
// ==========================================

// 0. WEBAUDIO CAPTURE HOOK (Bắt âm thanh game từ Ruffle để stream cho Guest)
(function setupAudioCapture() {
    try {
        const OrigAudioNodeConnect = AudioNode.prototype.connect;
        AudioNode.prototype.connect = function(destination, ...args) {
            if (destination && this.context) {
                if (!this.context._captureDest) {
                    try {
                        this.context._captureDest = this.context.createMediaStreamDestination();
                        window._ruffleAudioStream = this.context._captureDest.stream;
                    } catch (e) {}
                }
                if (this.context._captureDest && destination === this.context.destination) {
                    try {
                        OrigAudioNodeConnect.call(this, this.context._captureDest);
                    } catch (e) {}
                }
            }
            return OrigAudioNodeConnect.call(this, destination, ...args);
        };
    } catch (e) {
        console.warn("WebAudio capture hook not available:", e);
    }
})();

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
// 1. ĐỊNH NGHĨA PHÍM GỐC CỦA FLASH BVN 2.6
// ==========================================
// Flash Game Bleach vs Naruto 2.6 cố định nhận:
// - P1 Native: WASD (Di chuyển) + J (Đánh/Chọn) + K (Nhảy/Hủy) + L (Lướt) + U (Chiêu phụ) + I (Ulti) + O (Trợ thủ)
// - P2 Native: 4 Mũi tên (Di chuyển) + Numpad 1 (Đánh) + Numpad 2 (Nhảy) + Numpad 3 (Lướt) + Numpad 4 (Chiêu phụ) + Numpad 5 (Ulti) + Numpad 6 (Trợ thủ)
const FLASH_NATIVE_KEYS = {
    p1: {
        UP:     { code: 'KeyW', key: 'w', keyCode: 87, label: 'Lên (Nhảy / Trèo)' },
        DOWN:   { code: 'KeyS', key: 's', keyCode: 83, label: 'Xuống (Ngồi / Đỡ)' },
        LEFT:   { code: 'KeyA', key: 'a', keyCode: 65, label: 'Trái (Tiến / Lùi)' },
        RIGHT:  { code: 'KeyD', key: 'd', keyCode: 68, label: 'Phải (Tiến / Lùi)' },
        ATTACK: { code: 'KeyJ', key: 'j', keyCode: 74, label: 'Đánh thường / Chọn (J)' },
        JUMP:   { code: 'KeyK', key: 'k', keyCode: 75, label: 'Nhảy / Hủy (K)' },
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
        ATTACK: { code: 'Numpad1', key: '1', keyCode: 97, label: 'Đánh / Chọn (Numpad 1)' },
        JUMP:   { code: 'Numpad2', key: '2', keyCode: 98, label: 'Nhảy / Hủy (Numpad 2)' },
        DASH:   { code: 'Numpad3', key: '3', keyCode: 99, label: 'Lướt / Né (Numpad 3)' },
        SUB:    { code: 'Numpad4', key: '4', keyCode: 100, label: 'Chiêu phụ (Numpad 4)' },
        ULTI:   { code: 'Numpad5', key: '5', keyCode: 101, label: 'Tuyệt kỹ Ulti (Numpad 5)' },
        ASSIST: { code: 'Numpad6', key: '6', keyCode: 102, label: 'Gọi hỗ trợ (Numpad 6)' }
    }
};

// ==========================================
// 2. CÁC OPTION ĐIỀU KHIỂN CHO NGƯỜI DÙNG
// ==========================================
const KEY_PRESETS = {
    // Option 1: Bộ phím 4 Mũi tên & Numpad (↑ ↓ ← → di chuyển + Numpad 1..6 ra đòn, hỗ trợ phím số 1..6)
    option_arrows: {
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
    },
    // Option 2: Bộ phím WASD (W A S D + J K L U I O)
    option_wasd: {
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
    // Option 3: Bộ phím Laptop (IJKL di chuyển + ZXCVBN ra đòn)
    option_laptop: {
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
};

// ==========================================
// 2B. CẤU HÌNH TAY CẦM (GAMEPAD)
// ==========================================
const GAMEPAD_BUTTON_NAMES = {
    0: 'A / ✕ (Nút 0)',
    1: 'B / ◯ (Nút 1)',
    2: 'X / ▢ (Nút 2)',
    3: 'Y / △ (Nút 3)',
    4: 'LB / L1 (Nút 4)',
    5: 'RB / R1 (Nút 5)',
    6: 'LT / L2 (Cò trái)',
    7: 'RT / R2 (Cò phải)',
    8: 'Back / Select (Nút 8)',
    9: 'Start / Menu (Nút 9)',
    10: 'L3 (Cần trái nhấn)',
    11: 'R3 (Cần phải nhấn)',
    12: 'D-Pad Lên ↑',
    13: 'D-Pad Xuống ↓',
    14: 'D-Pad Trái ←',
    15: 'D-Pad Phải →',
    16: 'Home / Logo'
};

const GAMEPAD_AXIS_NAMES = {
    'axis:0:-1': 'Cần trái ←',
    'axis:0:1': 'Cần trái →',
    'axis:1:-1': 'Cần trái ↑',
    'axis:1:1': 'Cần trái ↓',
    'axis:2:-1': 'Cần phải ←',
    'axis:2:1': 'Cần phải →',
    'axis:3:-1': 'Cần phải ↑',
    'axis:3:1': 'Cần phải ↓'
};

const GAMEPAD_ACTIONS = [
    { action: 'UP', label: 'Di chuyển: Lên (↑ / Nhảy trèo)' },
    { action: 'DOWN', label: 'Di chuyển: Xuống (↓ / Ngồi đỡ)' },
    { action: 'LEFT', label: 'Di chuyển: Trái (← / Lùi tiến)' },
    { action: 'RIGHT', label: 'Di chuyển: Phải (→ / Tiến lùi)' },
    { action: 'ATTACK', label: 'Đánh thường / Chọn Menu (J)' },
    { action: 'JUMP', label: 'Nhảy / Hủy Menu (K)' },
    { action: 'DASH', label: 'Lướt né đòn (L)' },
    { action: 'SUB', label: 'Chiêu phụ (U)' },
    { action: 'ULTI', label: 'Tuyệt kỹ Ulti (I)' },
    { action: 'ASSIST', label: 'Gọi hỗ trợ (O)' },
    { action: 'START', label: 'Nút Menu / Vào trận (Start / Enter)' }
];

const GAMEPAD_PRESETS = {
    standard: {
        name: 'Chuẩn Đối Kháng Arcade',
        buttons: {
            UP:     { type: 'button', index: 12, display: 'D-Pad ↑ / Cần trái ↑' },
            DOWN:   { type: 'button', index: 13, display: 'D-Pad ↓ / Cần trái ↓' },
            LEFT:   { type: 'button', index: 14, display: 'D-Pad ← / Cần trái ←' },
            RIGHT:  { type: 'button', index: 15, display: 'D-Pad → / Cần trái →' },
            ATTACK: { type: 'button', index: 0,  display: 'A / ✕ (Nút 0)' },
            JUMP:   { type: 'button', index: 1,  display: 'B / ◯ (Nút 1)' },
            DASH:   { type: 'button', index: 5,  display: 'RB / R1 (Nút 5)' },
            SUB:    { type: 'button', index: 2,  display: 'X / ▢ (Nút 2)' },
            ULTI:   { type: 'button', index: 3,  display: 'Y / △ (Nút 3)' },
            ASSIST: { type: 'button', index: 4,  display: 'LB / L1 (Nút 4)' },
            START:  { type: 'button', index: 9,  display: 'Start / Menu (Nút 9)' }
        }
    },
    ninja_storm: {
        name: 'Kiểu Ninja Storm',
        buttons: {
            UP:     { type: 'button', index: 12, display: 'D-Pad ↑ / Cần trái ↑' },
            DOWN:   { type: 'button', index: 13, display: 'D-Pad ↓ / Cần trái ↓' },
            LEFT:   { type: 'button', index: 14, display: 'D-Pad ← / Cần trái ←' },
            RIGHT:  { type: 'button', index: 15, display: 'D-Pad → / Cần trái →' },
            ATTACK: { type: 'button', index: 1,  display: 'B / ◯ (Nút 1)' },
            JUMP:   { type: 'button', index: 0,  display: 'A / ✕ (Nút 0)' },
            DASH:   { type: 'button', index: 5,  display: 'RB / R1 (Nút 5)' },
            SUB:    { type: 'button', index: 2,  display: 'X / ▢ (Nút 2)' },
            ULTI:   { type: 'button', index: 3,  display: 'Y / △ (Nút 3)' },
            ASSIST: { type: 'button', index: 4,  display: 'LB / L1 (Nút 4)' },
            START:  { type: 'button', index: 9,  display: 'Start / Menu (Nút 9)' }
        }
    },
    triggers: {
        name: 'Dùng Cò LT / RT',
        buttons: {
            UP:     { type: 'button', index: 12, display: 'D-Pad ↑ / Cần trái ↑' },
            DOWN:   { type: 'button', index: 13, display: 'D-Pad ↓ / Cần trái ↓' },
            LEFT:   { type: 'button', index: 14, display: 'D-Pad ← / Cần trái ←' },
            RIGHT:  { type: 'button', index: 15, display: 'D-Pad → / Cần trái →' },
            ATTACK: { type: 'button', index: 0,  display: 'A / ✕ (Nút 0)' },
            JUMP:   { type: 'button', index: 1,  display: 'B / ◯ (Nút 1)' },
            DASH:   { type: 'button', index: 7,  display: 'RT / R2 (Cò phải)' },
            SUB:    { type: 'button', index: 2,  display: 'X / ▢ (Nút 2)' },
            ULTI:   { type: 'button', index: 3,  display: 'Y / △ (Nút 3)' },
            ASSIST: { type: 'button', index: 6,  display: 'LT / L2 (Cò trái)' },
            START:  { type: 'button', index: 9,  display: 'Start / Menu (Nút 9)' }
        }
    }
};

let userGamepadConfig = loadGamepadConfig();

function loadGamepadConfig() {
    const saved = localStorage.getItem('bvn_user_gamepad_v1');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Lỗi parse saved gamepad config:", e);
        }
    }
    return {
        target: 'auto', // 'auto' | 'p1' | 'p2' | 'dual'
        preset: 'standard',
        buttons: JSON.parse(JSON.stringify(GAMEPAD_PRESETS.standard.buttons))
    };
}

function saveGamepadConfig(cfg) {
    userGamepadConfig = cfg;
    localStorage.setItem('bvn_user_gamepad_v1', JSON.stringify(cfg));
}

// Quản lý cấu hình phím
let userKeyBindings = loadKeyBindings();

function loadKeyBindings() {
    const saved = localStorage.getItem('bvn_user_keybindings_v4');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Lỗi parse saved bindings:", e);
        }
    }
    // Mặc định chuẩn xác: P1 dùng WASD, P2 dùng 4 Mũi tên + Numpad 1..6 (với số 1..6 là fallback)
    return {
        p1Preset: 'option_wasd',
        p2Preset: 'option_arrows',
        p1: JSON.parse(JSON.stringify(KEY_PRESETS.option_wasd)),
        p2: JSON.parse(JSON.stringify(KEY_PRESETS.option_arrows))
    };
}

function saveKeyBindings(bindings) {
    userKeyBindings = bindings;
    localStorage.setItem('bvn_user_keybindings_v4', JSON.stringify(bindings));
    renderGuides();
    syncHudKeyLabels();
}

// Cập nhật đèn báo phím trên màn hình (Real-time Input HUD)
function updateInputHud(role, action, isActive) {
    const keyEl = document.getElementById(`hud_${role}_${action}`);
    if (keyEl) {
        if (isActive) {
            keyEl.classList.add('active');
        } else {
            keyEl.classList.remove('active');
        }
    }
}

// Đồng bộ nhãn phím hiển thị trên HUD
function syncHudKeyLabels() {
    ['p1', 'p2'].forEach(group => {
        const bindings = userKeyBindings[group];
        if (bindings) {
            for (const [action, conf] of Object.entries(bindings)) {
                const el = document.getElementById(`hud_${group}_${action}`);
                if (el && conf.display) {
                    el.innerText = conf.display.split(' ')[0];
                }
            }
        }
    });
}

// ==========================================
// 3. APPLICATION STATE & DOM REFERENCES
// ==========================================
let socket = null;
let peerConnection = null;
let myRole = 'solo'; // 'solo' | 'host' | 'guest'
let currentNetcodeMode = 'stream'; // Khóa cố định Remote Play: 1 game duy nhất, 100% không lệch trận
let rufflePlayer = null;
let ruffleCanvas = null;
let pingInterval = null;

// DOM Elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const pingBadge = document.getElementById('pingBadge');
const pingVal = document.getElementById('pingVal');
const roleBadge = document.getElementById('roleBadge');
const netcodeBadge = document.getElementById('netcodeBadge');

const flashWrapper = document.getElementById('flashPlayerWrapper');
const remoteVideo = document.getElementById('remoteVideo');
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
const btnShareScreen = document.getElementById('btnShareScreen');
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

// Gamepad Elements
const btnGamepadStatus = document.getElementById('btnGamepadStatus');
const gamepadStatusText = document.getElementById('gamepadStatusText');
const keyboardPresetSelector = document.getElementById('keyboardPresetSelector');
const gamepadInfoCard = document.getElementById('gamepadInfoCard');
const gpDeviceTitle = document.getElementById('gpDeviceTitle');
const gpDeviceDesc = document.getElementById('gpDeviceDesc');
const btnTestVibration = document.getElementById('btnTestVibration');
const gpTesterBadges = document.getElementById('gpTesterBadges');
const gamepadTargetSelect = document.getElementById('gamepadTargetSelect');
const gamepadPresetSelect = document.getElementById('gamepadPresetSelect');
const bindingListGamepad = document.getElementById('bindingListGamepad');

// Guide Grids
const guideGridP1 = document.getElementById('guideGridP1');
const guideGridP2 = document.getElementById('guideGridP2');

// ==========================================
// 4. KHỞI TẠO VÀ ĐIỀU KHIỂN RUFFLE FLASH ENGINE
// ==========================================
function focusGame() {
    if (rufflePlayer) {
        rufflePlayer.focus();
        if (rufflePlayer.shadowRoot) {
            const container = rufflePlayer.shadowRoot.getElementById('container') || rufflePlayer.shadowRoot.querySelector('#container');
            if (container) {
                container.focus();
                container.dispatchEvent(new Event('focusin', { bubbles: true }));
                container.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
            }
            const inner = rufflePlayer.shadowRoot.querySelector('canvas');
            if (inner) inner.focus();
        }
    }
    if (ruffleCanvas) {
        ruffleCanvas.focus();
    }
}

function pauseLocalRuffle() {
    try {
        if (rufflePlayer && typeof rufflePlayer.pause === 'function') {
            rufflePlayer.pause();
        }
    } catch (e) {
        console.warn("Không thể pause local ruffle:", e);
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
        container.innerHTML = "";
        container.style.display = 'block';
        if (remoteVideo) remoteVideo.classList.add('hidden');

        rufflePlayer = ruffle.createPlayer();
        container.appendChild(rufflePlayer);

        rufflePlayer.style.width = "100%";
        rufflePlayer.style.height = "100%";

        rufflePlayer.config = {
            letterbox: "on",
            forceScale: true,
            quality: "high",
            autoplay: "on",
            unmuteOverlay: "hidden",
            splashScreen: false,
            backgroundExecutionMode: "mainThread"
        };

        loadingOverlay.classList.remove('hidden');
        loadingMsg.innerText = "Đang nạp Bleach vs Naruto (Host Engine)...";
        if (loadingSubMsg) loadingSubMsg.innerText = "Khởi động engine WebAssembly 60FPS sắc nét 100%";
        if (btnSkipIntro) btnSkipIntro.classList.remove('hidden');

        const hideIntroOverlay = () => {
            loadingOverlay.classList.add('hidden');
            focusGame();
        };

        if (btnSkipIntro) btnSkipIntro.onclick = hideIntroOverlay;
        loadingOverlay.onclick = hideIntroOverlay;

        rufflePlayer.load({
            url: "game.swf",
            autoplay: "on"
        }).then(() => {
            console.log("Game Flash đã nạp thành công trên Host!");
            findRuffleCanvas(rufflePlayer);
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
    if (!player) return;
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

const gameContainer = document.getElementById('gameContainer');
if (gameContainer) {
    gameContainer.addEventListener('click', () => {
        focusGame();
    });
}

// Bắn sự kiện phím vào Ruffle Flash Player trên Host
function dispatchFlashKeyEvent(type, flashKeyInfo) {
    if (!flashKeyInfo) return;

    focusGame();

    const isNumpad = flashKeyInfo.code && flashKeyInfo.code.startsWith('Numpad');
    const locationVal = isNumpad ? 3 : 0;

    const eventInit = {
        key: flashKeyInfo.key,
        code: flashKeyInfo.code,
        keyCode: flashKeyInfo.keyCode,
        which: flashKeyInfo.keyCode,
        location: locationVal,
        bubbles: true,
        cancelable: true,
        composed: true
    };

    let ev;
    try {
        ev = new KeyboardEvent(type, eventInit);
        Object.defineProperty(ev, 'keyCode', { value: flashKeyInfo.keyCode, writable: false });
        Object.defineProperty(ev, 'which', { value: flashKeyInfo.keyCode, writable: false });
        Object.defineProperty(ev, 'location', { value: locationVal, writable: false });
    } catch (e) {
        ev = new KeyboardEvent(type, eventInit);
    }

    if (rufflePlayer && rufflePlayer.shadowRoot) {
        const shadowContainer = rufflePlayer.shadowRoot.getElementById('container') || rufflePlayer.shadowRoot.querySelector('#container');
        if (shadowContainer) {
            shadowContainer.dispatchEvent(ev);
        }
        const shadowCanvas = rufflePlayer.shadowRoot.querySelector('canvas');
        if (shadowCanvas && shadowCanvas !== ruffleCanvas) {
            shadowCanvas.dispatchEvent(ev);
        }
    }
    if (ruffleCanvas) {
        ruffleCanvas.dispatchEvent(ev);
    }
    if (rufflePlayer) {
        rufflePlayer.dispatchEvent(ev);
    }
    window.dispatchEvent(ev);
    document.dispatchEvent(ev);
}

// ==========================================
// 5. WEBRTC 60FPS HD CANVAS STREAMING ENGINE
// ==========================================

// Tăng bitrate SDP lên 20 Mbps cho chất lượng 1080p 60fps nét căng
function boostSdpBitrate(sdp, maxKbps = 20000) {
    let lines = sdp.split('\r\n');
    let mVideoIndex = lines.findIndex(l => l.startsWith('m=video'));
    if (mVideoIndex !== -1) {
        lines.splice(mVideoIndex + 1, 0, `b=AS:${maxKbps}`, `b=TIAS:${maxKbps * 1000}`);
    }
    return lines.join('\r\n');
}

// HOST: Bắt hình từ Canvas và truyền qua WebRTC cho Guest
async function setupHostWebRtc() {
    console.log("Khởi động WebRTC Host Stream...");
    if (peerConnection) {
        try { peerConnection.close(); } catch (e) {}
        peerConnection = null;
    }

    peerConnection = new RTCPeerConnection(PEER_CONFIG.config);
    pendingIceCandidates = [];

    // Kênh dữ liệu P2P trực tiếp cho phím bấm (không vòng qua server WebSocket)
    setupInputChannel(peerConnection.createDataChannel('bvn-input', { ordered: true }));
    let videoSender = null;

    // Chờ canvas sẵn sàng
    if (!ruffleCanvas) {
        findRuffleCanvas(rufflePlayer);
    }
    let retry = 0;
    while (!ruffleCanvas && retry < 25) {
        await new Promise(r => setTimeout(r, 200));
        findRuffleCanvas(rufflePlayer);
        retry++;
    }

    if (ruffleCanvas && ruffleCanvas.captureStream) {
        try {
            const canvasStream = ruffleCanvas.captureStream(60);
            const videoTrack = canvasStream.getVideoTracks()[0];
            if (videoTrack) {
                if ('contentHint' in videoTrack) {
                    // 'detail': Tối ưu giữ nét tối đa cho chữ và đường viền nhân vật 2D, không bị nén mờ
                    videoTrack.contentHint = 'detail';
                }
            }

            const outgoingStream = new MediaStream();
            if (videoTrack) outgoingStream.addTrack(videoTrack);

            // Thêm Audio Track nếu có
            if (window._ruffleAudioStream) {
                const audioTracks = window._ruffleAudioStream.getAudioTracks();
                if (audioTracks.length > 0) {
                    outgoingStream.addTrack(audioTracks[0]);
                }
            }

            outgoingStream.getTracks().forEach(track => {
                const sender = peerConnection.addTrack(track, outgoingStream);
                if (track.kind === 'video') videoSender = sender;
                console.log(`Host: Đã thêm ${track.kind} Track 60FPS vào WebRTC.`);
            });
        } catch (e) {
            console.error("Lỗi captureStream từ ruffleCanvas:", e);
        }
    } else {
        console.warn("ruffleCanvas không hỗ trợ captureStream!");
    }

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendNetworkMessage({
                type: 'webrtc_candidate',
                candidate: event.candidate
            });
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log("Host PeerConnection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
            showSyncNotification("🟢 Đã truyền hình ảnh 60FPS HD Siêu Nét và Âm thanh cho Khách!");
        }
    };

    // Tạo Offer
    try {
        const offer = await peerConnection.createOffer();
        const boostedSdp = boostSdpBitrate(offer.sdp, 20000);
        await peerConnection.setLocalDescription({ type: 'offer', sdp: boostedSdp });
        sendNetworkMessage({
            type: 'webrtc_offer',
            sdp: boostedSdp
        });
        if (videoSender) await tuneVideoSenderForLowLatency(videoSender);
    } catch (e) {
        console.error("Host: Lỗi tạo WebRTC offer:", e);
    }
}

// Cấu hình bộ mã hóa video: GIỮ NGUYÊN 100% ĐỘ PHÂN GIẢI NATIVE (không bao giờ downscale),
// luôn giữ 60 FPS và Bitrate 20Mbps cho hình ảnh nét căng
async function tuneVideoSenderForLowLatency(sender) {
    try {
        const params = sender.getParameters();
        if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
        // Không hạ độ phân giải (scale = 1.0)
        params.encodings[0].scaleResolutionDownBy = 1.0;
        params.encodings[0].maxFramerate = 60;
        params.encodings[0].maxBitrate = 20000000; // 20 Mbps cho đồ họa 1080p sắc nét 100%
        params.encodings[0].priority = 'high';
        params.encodings[0].networkPriority = 'high';
        params.degradationPreference = 'maintain-resolution'; // Giữ nguyên độ sắc nét
        await sender.setParameters(params);
        console.log(`Host: Encoder 60FPS HD: giữ nguyên 100% resolution, 20Mbps bitrate`);
    } catch (e) {
        console.warn("Không thể tinh chỉnh encoder:", e);
    }
}

// ==========================================
// KÊNH P2P TRỰC TIẾP CHO PHÍM BẤM (WebRTC DataChannel)
// ==========================================
let inputChannel = null;

function setupInputChannel(channel) {
    inputChannel = channel;
    channel.onopen = () => {
        console.log("DataChannel P2P đã mở: phím bấm đi trực tiếp giữa 2 máy.");
    };
    channel.onclose = () => {
        if (inputChannel === channel) inputChannel = null;
    };
    channel.onmessage = (ev) => {
        try {
            handleNetworkMessage(JSON.parse(ev.data));
        } catch (e) {
            console.error("Lỗi parse DataChannel msg:", e);
        }
    };
}

// Gửi tin nhắn cần độ trễ thấp (phím, ping): ưu tiên DataChannel P2P, dự phòng WebSocket
function sendFastMessage(data) {
    if (inputChannel && inputChannel.readyState === 'open') {
        inputChannel.send(JSON.stringify(data));
        return true;
    }
    return sendNetworkMessage(data);
}

// Tạm dừng / chạy lại Flash cục bộ (Khách ở Remote Play không cần chạy game riêng)
function setLocalRufflePaused(paused) {
    if (!rufflePlayer) return;
    try {
        const api = typeof rufflePlayer.ruffle === 'function' ? rufflePlayer.ruffle(1) : rufflePlayer;
        if (paused) {
            if (typeof api.suspend === 'function') api.suspend();
            else if (typeof api.pause === 'function') api.pause();
        } else if (typeof api.resume === 'function') {
            api.resume();
        } else if (typeof api.play === 'function') {
            api.play();
        }
        if ('volume' in api) api.volume = paused ? 0 : 1;
    } catch (e) {
        console.warn("Không thể pause/resume Ruffle:", e);
    }
}

// GUEST: Nhận luồng hình ảnh & âm thanh từ Host
function setupGuestWebRtc() {
    console.log("Khởi động WebRTC Guest Receiver...");
    if (peerConnection) {
        try { peerConnection.close(); } catch (e) {}
        peerConnection = null;
    }

    // Ẩn và TẠM DỪNG player Flash local của Guest để dành CPU/GPU cho giải mã video (giảm trễ)
    const rPlayer = document.getElementById('rufflePlayer');
    if (rPlayer) rPlayer.style.display = 'none';
    pauseLocalRuffle();

    if (remoteVideo) {
        remoteVideo.classList.remove('hidden');
    }
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }

    const guestStream = new MediaStream();
    if (remoteVideo) {
        remoteVideo.srcObject = guestStream;
        remoteVideo.muted = true; // Muted ban đầu để trình duyệt phát hình 100% ngay lập tức
    }

    // Tự động bật âm thanh khi người dùng click hoặc nhấn phím
    const enableAudio = () => {
        if (remoteVideo) remoteVideo.muted = false;
        window.removeEventListener('click', enableAudio);
        window.removeEventListener('keydown', enableAudio);
    };
    window.addEventListener('click', enableAudio);
    window.addEventListener('keydown', enableAudio);

    if (remoteVideo) {
        remoteVideo.setAttribute('tabindex', '0');
        remoteVideo.addEventListener('click', () => remoteVideo.focus());
    }

    peerConnection = new RTCPeerConnection(PEER_CONFIG.config);

    // Nhận kênh P2P phím bấm do Host tạo
    peerConnection.ondatachannel = (event) => {
        setupInputChannel(event.channel);
    };

    peerConnection.ontrack = (event) => {
        console.log("Guest: Nhận media track:", event.track.kind);
        if (event.track) {
            guestStream.addTrack(event.track);
        }
        // Giảm jitter buffer xuống 0 để loại bỏ độ trễ truyền hình ảnh
        try {
            peerConnection.getReceivers().forEach(receiver => {
                if ('playoutDelayHint' in receiver) receiver.playoutDelayHint = 0;
                if ('jitterBufferDelayHint' in receiver) receiver.jitterBufferDelayHint = 0;
                if ('jitterBufferTarget' in receiver) receiver.jitterBufferTarget = 0;
            });
        } catch (e) {}

        if (remoteVideo && remoteVideo.paused) {
            remoteVideo.play().catch(err => {
                console.warn("Video play cần cử chỉ tương tác người dùng:", err);
            });
        }
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            sendNetworkMessage({
                type: 'webrtc_candidate',
                candidate: event.candidate
            });
        }
    };

    peerConnection.onconnectionstatechange = () => {
        console.log("Guest PeerConnection state:", peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
            showSyncNotification("🟢 Đã đồng bộ màn hình trận đấu trực tiếp từ Chủ phòng (60FPS HD)!");
        }
    };
}

async function handleWebRtcOffer(sdp) {
    // Mỗi offer từ Host là một phiên mới (Host tạo lại PeerConnection khi khởi động lại game)
    // => Guest cũng tạo PeerConnection mới để không bị kẹt phiên cũ
    setupGuestWebRtc();
    pendingIceCandidates = [];
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
        await flushPendingIceCandidates();
        const answer = await peerConnection.createAnswer();
        const boostedSdp = boostSdpBitrate(answer.sdp, 20000);
        await peerConnection.setLocalDescription({ type: 'answer', sdp: boostedSdp });
        sendNetworkMessage({
            type: 'webrtc_answer',
            sdp: boostedSdp
        });
    } catch (e) {
        console.error("Guest: Lỗi xử lý WebRTC offer:", e);
    }
}

async function handleWebRtcAnswer(sdp) {
    if (!peerConnection) return;
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
        await flushPendingIceCandidates();
    } catch (e) {
        console.error("Host: Lỗi xử lý WebRTC answer:", e);
    }
}

// ICE candidate đến trước khi có remoteDescription sẽ được xếp hàng, tránh mất kết nối
let pendingIceCandidates = [];

async function flushPendingIceCandidates() {
    const queued = pendingIceCandidates;
    pendingIceCandidates = [];
    for (const c of queued) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(c));
        } catch (e) {
            console.warn("Lỗi addIceCandidate (queued):", e);
        }
    }
}

async function handleWebRtcCandidate(candidate) {
    if (!peerConnection) return;
    if (!peerConnection.remoteDescription) {
        pendingIceCandidates.push(candidate);
        return;
    }
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
        console.warn("Lỗi addIceCandidate:", e);
    }
}

// ==========================================
// 6. XỬ LÝ PHÍM & TỰ ĐỘNG CHUYỂN NÚT (KEY TRANSLATION)
// ==========================================

// Tìm action tương ứng với mã phím người dùng ấn
function findActionByCode(bindingGroup, code) {
    if (!bindingGroup) return null;
    for (const [action, config] of Object.entries(bindingGroup)) {
        if (config.code === code) return action;
        // Hỗ trợ cả phím số hàng trên Digit1..6 lẫn Numpad1..6 cho tiện lợi
        if (config.code.startsWith('Digit') && code === config.code.replace('Digit', 'Numpad')) return action;
        if (config.code.startsWith('Numpad') && code === config.code.replace('Numpad', 'Digit')) return action;
    }
    return null;
}

window.addEventListener('keydown', (e) => handleUserKeyEvent(e, 'keydown'), true);
window.addEventListener('keyup', (e) => handleUserKeyEvent(e, 'keyup'), true);

function handleUserKeyEvent(e, eventType) {
    // Chỉ xử lý phím thật, tránh đệ quy từ synthetic event
    if (!e.isTrusted) return;

    // Không can thiệp nếu đang mở modal cài phím hoặc đang nhập liệu
    if (activeRecordingButton || (keyModal && !keyModal.classList.contains('hidden'))) return;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    const code = e.code;
    const isKeyDown = (eventType === 'keydown');

    // Khách bấm phím bất kỳ => bật tiếng stream (trình duyệt yêu cầu tương tác người dùng)
    if (myRole === 'guest' && remoteVideo && remoteVideo.muted && remoteVideo.srcObject) {
        remoteVideo.muted = false;
    }

    // Chặn cuộn màn hình trình duyệt với phím mũi tên & Space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
    }

    // Chặn phím thật đi tiếp vào Flash: Flash chỉ nhận phím đã được code chuyển đổi.
    const swallow = () => {
        e.preventDefault();
        e.stopImmediatePropagation();
    };

    // Phím Enter hoặc Space hỗ trợ chọn nhanh trên mọi Menu
    if (code === 'Enter' || code === 'Space') {
        swallow();
        if (e.repeat) return;
        const rawKey = (code === 'Enter') 
            ? { code: 'Enter', key: 'Enter', keyCode: 13, which: 13 }
            : { code: 'Space', key: ' ', keyCode: 32, which: 32 };

        if (myRole === 'guest') {
            updateInputHud('p2', 'ATTACK', isKeyDown);
            sendFastMessage({
                type: 'game_input',
                role: 'p2',
                action: 'ATTACK',
                eventType: eventType
            });
            sendFastMessage({
                type: 'raw_flash_key',
                keyInfo: rawKey,
                eventType: eventType
            });
        } else {
            updateInputHud('p1', 'ATTACK', isKeyDown);
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1.ATTACK);
            dispatchFlashKeyEvent(eventType, rawKey);
            sendFastMessage({
                type: 'hud_key',
                role: 'p1',
                action: 'ATTACK',
                isActive: isKeyDown
            });
        }
        return;
    }

    // 1. TRƯỜNG HỢP HOST:
    if (myRole === 'host') {
        // Phím P1 (WASD + JKLUIO)
        const actionP1 = findActionByCode(userKeyBindings.p1, code);
        if (actionP1) {
            swallow();
            if (e.repeat) return;
            updateInputHud('p1', actionP1, isKeyDown);
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1[actionP1]);
            sendFastMessage({
                type: 'hud_key',
                role: 'p1',
                action: actionP1,
                isActive: isKeyDown
            });
            return;
        }

        // Cho phép Host bấm 4 Mũi tên + Numpad điều khiển P2 trực tiếp trên máy Host
        const actionP2 = findActionByCode(userKeyBindings.p2, code);
        if (actionP2) {
            swallow();
            if (e.repeat) return;
            updateInputHud('p2', actionP2, isKeyDown);
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p2[actionP2]);
            return;
        }
    }
    // 2. TRƯỜNG HỢP GUEST (P2):
    else if (myRole === 'guest') {
        const action = findActionByCode(userKeyBindings.p2, code);
        if (action) {
            swallow();
            if (e.repeat) return;
            updateInputHud('p2', action, isKeyDown);
            sendFastMessage({
                type: 'game_input',
                role: 'p2',
                action: action,
                eventType: eventType
            });
            return;
        }
    }
    // 3. TRƯỜNG HỢP CHƠI ĐƠN (SOLO):
    else {
        const actionP1 = findActionByCode(userKeyBindings.p1, code);
        if (actionP1) {
            swallow();
            if (e.repeat) return;
            updateInputHud('p1', actionP1, isKeyDown);
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1[actionP1]);
            return;
        }
        const actionP2 = findActionByCode(userKeyBindings.p2, code);
        if (actionP2) {
            swallow();
            if (e.repeat) return;
            updateInputHud('p2', actionP2, isKeyDown);
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p2[actionP2]);
            return;
        }
    }
}

// ==========================================
// 7. GIAO THỨC MẠNG & XỬ LÝ ĐỒNG BỘ
// ==========================================
function sendNetworkMessage(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        return true;
    }
    return false;
}

function handleNetworkMessage(data) {
    if (!data) return;

    // 1. Host tạo phòng thành công
    if (data.type === 'room_created') {
        myRole = 'host';
        btnCreateRoom.classList.add('hidden');
        hostRoomInfo.classList.remove('hidden');
        hostRoomCode.value = data.roomId;
        updateRoleDisplay('host');
        updateStatus('waiting', `Đang mở phòng [${data.roomId}] • Chờ bạn bè tham gia...`);
        return;
    }

    // 2. Guest vào phòng thành công
    if (data.type === 'room_joined') {
        myRole = 'guest';
        updateRoleDisplay('guest');
        updateStatus('waiting', `Đã vào phòng [${data.roomId}] • Đang bắt tay kết nối...`);
        guestConnectionMsg.innerHTML = `<span>Đang kết nối với Chủ phòng...</span>`;
        return;
    }

    // 3. Hai bên kết nối thành công!
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

        if (myRole === 'host') {
            updateStatus('connected', `🟢 BẠN LÀ P1 (HOST): Đang phát trực tiếp 60FPS HD cho Khách!`);
            showSyncNotification("🎮 Đã kết nối với Khách! Host bấm S (xuống) chọn 'Vs Human' ➔ bấm Enter để cùng chọn tướng đấu 2 người!");
            setTimeout(setupHostWebRtc, 500);
        } else {
            updateStatus('connected', `🟢 BẠN LÀ P2 (KHÁCH): Đang xem trực tiếp 60FPS HD từ Host!`);
            showSyncNotification("🟢 Đã kết nối với Chủ phòng (60FPS HD)! Bạn đang điều khiển P2. Sẵn sàng!");
            setupGuestWebRtc();
        }
        return;
    }

    // 4. WebRTC Signaling (Offer, Answer, Candidate cho Remote Play)
    if (data.type === 'webrtc_offer') {
        handleWebRtcOffer(data.sdp);
        return;
    }
    if (data.type === 'webrtc_answer') {
        handleWebRtcAnswer(data.sdp);
        return;
    }
    if (data.type === 'webrtc_candidate') {
        handleWebRtcCandidate(data.candidate);
        return;
    }

    // 5. Host nhận phím bấm từ Guest trong chế độ Remote Play
    if (data.type === 'game_input') {
        // Cập nhật đèn báo phím P2 trên HUD của cả 2 máy
        updateInputHud('p2', data.action === 'MENU_CONFIRM' ? 'ATTACK' : data.action, data.eventType === 'keydown');

        if (myRole === 'host') {
            const nativeKey = FLASH_NATIVE_KEYS.p2[data.action];
            if (nativeKey) {
                dispatchFlashKeyEvent(data.eventType, nativeKey);
            }
        }
        return;
    }

    if (data.type === 'raw_flash_key' && myRole === 'host') {
        if (data.keyInfo) {
            dispatchFlashKeyEvent(data.eventType, data.keyInfo);
        }
        return;
    }

    // 6. Đồng bộ trạng thái đèn phím (HUD) giữa 2 máy
    if (data.type === 'hud_key') {
        updateInputHud(data.role, data.action, data.isActive);
        return;
    }

    // 8. Yêu cầu khởi động lại ván đấu đồng bộ
    if (data.type === 'sync_restart') {
        triggerSynchronizedRestart();
        return;
    }

    // 7. Đo Ping
    if (data.type === 'ping') {
        sendFastMessage({ type: 'pong', time: data.time });
        return;
    }
    if (data.type === 'pong') {
        const latency = Date.now() - data.time;
        pingVal.innerText = latency;
        return;
    }

    // 8. Đối thủ ngắt kết nối
    if (data.type === 'peer_disconnected') {
        updateStatus('waiting', 'Đối thủ đã ngắt kết nối.');
        pingBadge.classList.add('hidden');
        if (pingInterval) clearInterval(pingInterval);
        alert("Đối thủ đã rời khỏi phòng.");
        location.reload();
        return;
    }

    // 9. Lỗi
    if (data.type === 'error') {
        alert(data.message || 'Lỗi kết nối phòng');
        btnJoinRoom.disabled = false;
        btnJoinRoom.innerText = "Vào phòng";
        return;
    }
}

// ==========================================
// 8. TẠO PHÒNG & THAM GIA PHÒNG
// ==========================================
btnCreateRoom.addEventListener('click', () => {
    btnCreateRoom.disabled = true;
    btnCreateRoom.innerText = "Đang tạo phòng...";
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const roomId = `bvn-${randomCode}`;
    connectWebSocketAndSend({ type: 'create_room', roomId });
});

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

    // Ngừng chạy Flash trên máy Khách để không tốn CPU/bộ nhớ
    pauseLocalRuffle();
    const rPlayer = document.getElementById('rufflePlayer');
    if (rPlayer) rPlayer.style.display = 'none';

    // Giải phóng tiêu điểm (blur) khỏi ô nhập liệu để bàn phím không bị kẹt trong ô input!
    if (inputRoomCode) inputRoomCode.blur();
    if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
    }
    window.focus();

    connectWebSocketAndSend({ type: 'join_room', roomId });
}

function connectWebSocketAndSend(initialMsg) {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${wsProtocol}${window.location.host}`;

    try {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            socket.send(JSON.stringify(initialMsg));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleNetworkMessage(data);
            } catch (e) {
                console.error("Lỗi parse WS msg:", e);
            }
        };

        socket.onerror = (err) => {
            console.error("WebSocket error:", err);
            alert("Không thể kết nối đến máy chủ WebSocket. Vui lòng thử lại!");
            btnCreateRoom.disabled = false;
            btnCreateRoom.innerText = "➕ Tạo phòng mới";
            btnJoinRoom.disabled = false;
            btnJoinRoom.innerText = "Vào phòng";
        };
    } catch (e) {
        console.error("Lỗi tạo WebSocket:", e);
    }
}

function startPingMeasurement() {
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
        sendFastMessage({ type: 'ping', time: Date.now() });
    }, 1000);
}

// Nút Đồng bộ lại / Khởi động lại
btnSyncRestart.addEventListener('click', () => {
    if (confirm("Khởi động lại game để đồng bộ ván mới từ Frame 0 trên cả 2 máy?")) {
        sendNetworkMessage({ type: 'sync_restart' });
        triggerSynchronizedRestart();
    }
});

function triggerSynchronizedRestart() {
    let count = 3;
    showSyncNotification(`🔄 Đồng bộ lại ván đấu từ Frame 0: ${count}...`, 3500);
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            showSyncNotification(`🔄 Đồng bộ lại ván đấu từ Frame 0: ${count}...`, 1500);
        } else {
            clearInterval(interval);
            showSyncNotification("⚔️ BẮT ĐẦU VÁN MỚI! SẴN SÀNG CHIẾN ĐẤU!", 2500);
            if (currentNetcodeMode === 'stream' && myRole === 'guest') {
                // Remote Play: Khách không chạy game riêng, chờ Host gửi luồng hình mới
                return;
            }
            initRuffleGame();
            if (currentNetcodeMode === 'stream' && myRole === 'host') {
                setTimeout(setupHostWebRtc, 1000);
            }
        }
    }, 1000);
}

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
        if (netcodeBadge) netcodeBadge.innerText = '⚡ 60FPS HD Remote Play (Host Engine)';
        if (btnShareScreen) btnShareScreen.classList.remove('hidden');
    } else if (role === 'guest') {
        roleBadge.className = 'role-badge role-guest';
        roleBadge.innerText = '🔵 BẠN LÀ P2 (KHÁCH)';
        if (netcodeBadge) netcodeBadge.innerText = '⚡ 60FPS HD Remote Play (Màn hình đồng bộ)';
        if (btnShareScreen) btnShareScreen.classList.add('hidden');
    } else {
        roleBadge.className = 'role-badge role-solo';
        roleBadge.innerText = '🎮 Chế độ: Chơi đơn';
        if (btnShareScreen) btnShareScreen.classList.add('hidden');
    }
}

// Nút chia sẻ trực tiếp Tab 1080p 60FPS siêu nét cho Khách bằng phần cứng
if (btnShareScreen) {
    btnShareScreen.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'browser',
                    frameRate: { ideal: 60, max: 60 },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: true
            });
            const newVideoTrack = stream.getVideoTracks()[0];
            if (newVideoTrack && peerConnection) {
                const senders = peerConnection.getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) {
                    await videoSender.replaceTrack(newVideoTrack);
                    tuneVideoSenderForLowLatency(videoSender);
                    btnShareScreen.innerText = "✓ Đang phát Tab 1080p 60FPS";
                    btnShareScreen.style.background = "#00ff88";
                    btnShareScreen.style.color = "#000";
                    showSyncNotification("🟢 Đã kích hoạt truyền hình ảnh Tab 1080p 60FPS siêu nét cho Khách!");
                    newVideoTrack.onended = () => {
                        btnShareScreen.innerText = "📺 Bật Tab 1080p 60FPS";
                        btnShareScreen.style.background = "";
                        btnShareScreen.style.color = "";
                    };
                }
            }
        } catch (e) {
            console.warn("Screen share cancelled or failed:", e);
        }
    });
}

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
// 9. MODAL CÀI ĐẶT PHÍM (3 OPTIONS & CUSTOM MAP)
// ==========================================
let editingKeyGroup = 'p1'; // 'p1' | 'p2' | 'gamepad'
let activeRecordingButton = null;
let activeRecordingGamepadButton = null;
let tempBindings = JSON.parse(JSON.stringify(userKeyBindings));
let tempGamepadConfig = JSON.parse(JSON.stringify(userGamepadConfig));

btnOpenKeyModal.addEventListener('click', () => {
    tempBindings = JSON.parse(JSON.stringify(userKeyBindings));
    tempGamepadConfig = JSON.parse(JSON.stringify(userGamepadConfig));

    // Mặc định chọn tab phù hợp với vai trò hiện tại
    if (myRole === 'guest') {
        switchModalTab('tabP2');
    } else {
        switchModalTab('tabP1');
    }

    keyModal.classList.remove('hidden');
});

if (btnGamepadStatus) {
    btnGamepadStatus.addEventListener('click', () => {
        tempBindings = JSON.parse(JSON.stringify(userKeyBindings));
        tempGamepadConfig = JSON.parse(JSON.stringify(userGamepadConfig));
        switchModalTab('tabGamepad');
        keyModal.classList.remove('hidden');
    });
}

btnCloseKeyModal.addEventListener('click', () => {
    cancelActiveRecording();
    cancelActiveGamepadRecording();
    keyModal.classList.add('hidden');
});

function switchModalTab(tabId) {
    cancelActiveRecording();
    cancelActiveGamepadRecording();

    tabButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    tabContents.forEach(c => {
        c.classList.toggle('active', c.id === tabId);
    });

    if (tabId === 'tabGamepad') {
        editingKeyGroup = 'gamepad';
        if (keyboardPresetSelector) keyboardPresetSelector.style.display = 'none';
        if (gamepadTargetSelect) gamepadTargetSelect.value = tempGamepadConfig.target || 'auto';
        if (gamepadPresetSelect) gamepadPresetSelect.value = tempGamepadConfig.preset || 'standard';
        renderGamepadBindings();
    } else {
        if (keyboardPresetSelector) keyboardPresetSelector.style.display = 'flex';
        editingKeyGroup = tabId === 'tabP1' ? 'p1' : 'p2';
        if (presetSelect) presetSelect.value = tempBindings[editingKeyGroup + 'Preset'] || 'option_custom';
        renderModalBindings();
    }
}

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchModalTab(targetTab);
    });
});

// Thay đổi Preset trong dropdown bàn phím
presetSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    if (selected === 'option_laptop') {
        tempBindings[editingKeyGroup] = JSON.parse(JSON.stringify(KEY_PRESETS.option_laptop));
        tempBindings[editingKeyGroup + 'Preset'] = 'option_laptop';
        renderModalBindings();
    } else if (selected === 'option_wasd') {
        tempBindings[editingKeyGroup] = JSON.parse(JSON.stringify(KEY_PRESETS.option_wasd));
        tempBindings[editingKeyGroup + 'Preset'] = 'option_wasd';
        renderModalBindings();
    } else if (selected === 'option_arrows') {
        tempBindings[editingKeyGroup] = JSON.parse(JSON.stringify(KEY_PRESETS.option_arrows));
        tempBindings[editingKeyGroup + 'Preset'] = 'option_arrows';
        renderModalBindings();
    } else {
        tempBindings[editingKeyGroup + 'Preset'] = 'option_custom';
    }
});

if (gamepadTargetSelect) {
    gamepadTargetSelect.addEventListener('change', (e) => {
        tempGamepadConfig.target = e.target.value;
    });
}

if (gamepadPresetSelect) {
    gamepadPresetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val !== 'custom' && GAMEPAD_PRESETS[val]) {
            tempGamepadConfig.preset = val;
            tempGamepadConfig.buttons = JSON.parse(JSON.stringify(GAMEPAD_PRESETS[val].buttons));
            renderGamepadBindings();
        } else {
            tempGamepadConfig.preset = 'custom';
        }
    });
}

if (btnTestVibration) {
    btnTestVibration.addEventListener('click', () => {
        vibrateGamepad(250, 0.7, 0.7);
    });
}

function renderModalBindings() {
    renderBindingGroupList('p1', bindingListP1);
    renderBindingGroupList('p2', bindingListP2);
}

function renderBindingGroupList(group, container) {
    container.innerHTML = '';
    const nativeGroup = FLASH_NATIVE_KEYS[group];
    const currentGroup = tempBindings[group];

    for (const [action, nativeInfo] of Object.entries(nativeGroup)) {
        const boundKey = currentGroup[action] || { code: nativeInfo.code, display: nativeInfo.label };

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
    cancelActiveGamepadRecording();

    activeRecordingButton = btn;
    btn.classList.add('recording');
    btn.innerText = 'Nhấn phím bất kỳ...';

    const onKeyRecord = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const code = e.code;
        const display = formatKeyDisplay(e);

        tempBindings[group][action] = {
            code: code,
            display: display
        };
        tempBindings[group + 'Preset'] = 'option_custom';
        presetSelect.value = 'option_custom';

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

function renderGamepadBindings() {
    if (!bindingListGamepad) return;
    bindingListGamepad.innerHTML = '';
    const currentButtons = tempGamepadConfig.buttons || {};

    GAMEPAD_ACTIONS.forEach(({ action, label }) => {
        const boundInfo = currentButtons[action] || { display: 'Chưa gán' };

        const row = document.createElement('div');
        row.className = 'binding-row';

        const labelEl = document.createElement('span');
        labelEl.className = 'binding-label';
        labelEl.innerText = label;

        const btn = document.createElement('button');
        btn.className = 'bind-key-btn';
        btn.innerText = boundInfo.display;
        btn.dataset.action = action;

        btn.addEventListener('click', () => {
            startRecordingGamepadKey(btn, action);
        });

        row.appendChild(labelEl);
        row.appendChild(btn);
        bindingListGamepad.appendChild(row);
    });
}

function startRecordingGamepadKey(btn, action) {
    cancelActiveRecording();
    cancelActiveGamepadRecording();

    activeRecordingGamepadButton = { btn, action };
    btn.classList.add('recording');
    btn.innerText = 'Bấm nút trên tay cầm...';
}

function cancelActiveGamepadRecording() {
    if (activeRecordingGamepadButton) {
        const { btn, action } = activeRecordingGamepadButton;
        btn.innerText = tempGamepadConfig.buttons[action]?.display || 'Chưa gán';
        btn.classList.remove('recording');
        activeRecordingGamepadButton = null;
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
    return e.key ? e.key.toUpperCase() : e.code;
}

btnSaveKeys.addEventListener('click', () => {
    saveKeyBindings(tempBindings);
    saveGamepadConfig(tempGamepadConfig);
    keyModal.classList.add('hidden');
    showSyncNotification("✓ Đã lưu cài đặt bàn phím & tay cầm thành công!");
});

btnResetDefaultKeys.addEventListener('click', () => {
    if (editingKeyGroup === 'gamepad') {
        if (confirm("Khôi phục cấu hình tay cầm về mặc định Chuẩn Đối Kháng Arcade?")) {
            tempGamepadConfig = {
                target: 'auto',
                preset: 'standard',
                buttons: JSON.parse(JSON.stringify(GAMEPAD_PRESETS.standard.buttons))
            };
            if (gamepadTargetSelect) gamepadTargetSelect.value = 'auto';
            if (gamepadPresetSelect) gamepadPresetSelect.value = 'standard';
            renderGamepadBindings();
        }
    } else {
        if (confirm("Khôi phục về mặc định chuẩn: P1 dùng WASD, P2 dùng 4 Mũi tên + Numpad 1..6?")) {
            tempBindings = {
                p1Preset: 'option_wasd',
                p2Preset: 'option_arrows',
                p1: JSON.parse(JSON.stringify(KEY_PRESETS.option_wasd)),
                p2: JSON.parse(JSON.stringify(KEY_PRESETS.option_arrows))
            };
            if (presetSelect) presetSelect.value = tempBindings[editingKeyGroup + 'Preset'];
            renderModalBindings();
        }
    }
});

// Escape key hủy gán phím hoặc tay cầm
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (activeRecordingButton) cancelActiveRecording();
        if (activeRecordingGamepadButton) cancelActiveGamepadRecording();
    }
});

// ==========================================
// 9B. ENGINE TAY CẦM (GAMEPAD POLLING & DISPATCH)
// ==========================================
let lastGamepadActionStates = { p1: {}, p2: {} };

function isButtonPressed(gp, bind) {
    if (!gp || !bind) return false;
    if (bind.type === 'button') {
        const btn = gp.buttons[bind.index];
        if (!btn) return false;
        return typeof btn === 'object' ? (btn.pressed || btn.value > 0.5) : btn > 0.5;
    }
    if (bind.type === 'axis') {
        const val = gp.axes[bind.axisIndex];
        if (val === undefined) return false;
        return bind.direction < 0 ? val < -0.5 : val > 0.5;
    }
    return false;
}

function vibrateGamepad(duration = 150, weak = 0.5, strong = 0.5) {
    try {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const gp of gamepads) {
            if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
                gp.vibrationActuator.playEffect('dual-rumble', {
                    startDelay: 0,
                    duration: duration,
                    weakMagnitude: weak,
                    strongMagnitude: strong
                }).catch(() => {});
            }
        }
    } catch (e) {}
}

function dispatchActionFromGamepad(targetRole, action, isDown) {
    const eventType = isDown ? 'keydown' : 'keyup';

    // 1. Phím START (Enter / Menu chọn / Bắt đầu trận)
    if (action === 'START') {
        const rawKey = { code: 'Enter', key: 'Enter', keyCode: 13, which: 13 };
        if (targetRole === 'p2' && myRole === 'guest') {
            updateInputHud('p2', 'ATTACK', isDown);
            sendFastMessage({
                type: 'game_input',
                role: 'p2',
                action: 'ATTACK',
                eventType: eventType
            });
            sendFastMessage({
                type: 'raw_flash_key',
                keyInfo: rawKey,
                eventType: eventType
            });
        } else {
            updateInputHud(targetRole, 'ATTACK', isDown);
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS[targetRole].ATTACK);
            dispatchFlashKeyEvent(eventType, rawKey);
            if (myRole === 'host') {
                sendFastMessage({
                    type: 'hud_key',
                    role: targetRole,
                    action: 'ATTACK',
                    isActive: isDown
                });
            }
        }
        return;
    }

    // 2. Các hành động thông thường (UP, DOWN, LEFT, RIGHT, ATTACK, JUMP, DASH, SUB, ULTI, ASSIST)
    if (targetRole === 'p1') {
        updateInputHud('p1', action, isDown);
        dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1[action]);
        if (myRole === 'host') {
            sendFastMessage({
                type: 'hud_key',
                role: 'p1',
                action: action,
                isActive: isDown
            });
        }
    } else if (targetRole === 'p2') {
        updateInputHud('p2', action, isDown);
        if (myRole === 'guest') {
            sendFastMessage({
                type: 'game_input',
                role: 'p2',
                action: action,
                eventType: eventType
            });
        } else {
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p2[action]);
        }
    }
}

function updateGamepadToolbarStatus(activeGamepads) {
    if (!btnGamepadStatus || !gamepadStatusText) return;
    if (activeGamepads.length > 0) {
        btnGamepadStatus.classList.add('connected');
        const first = activeGamepads[0];
        let name = first.id || 'Gamepad';
        if (name.length > 18) name = name.substring(0, 16) + '...';
        gamepadStatusText.textContent = `Tay cầm: ${name}`;
    } else {
        btnGamepadStatus.classList.remove('connected');
        gamepadStatusText.textContent = 'Tay cầm: Chưa cắm';
    }
}

function updateGamepadModalUI(activeGamepads) {
    if (!gamepadInfoCard || !gpDeviceTitle || !gpDeviceDesc) return;

    if (activeGamepads.length > 0) {
        gamepadInfoCard.classList.add('connected');
        const gp = activeGamepads[0];
        let cleanId = gp.id || 'Gamepad';
        gpDeviceTitle.textContent = `✅ Đã kết nối: ${cleanId}`;
        gpDeviceDesc.textContent = `Số nút: ${gp.buttons.length} • Cần analog: ${gp.axes.length} trục • Cổng: #${gp.index}`;
        if (btnTestVibration) {
            btnTestVibration.classList.toggle('hidden', !gp.vibrationActuator);
        }

        // Live Button Tester
        if (gpTesterBadges) {
            const activeBadges = [];
            gp.buttons.forEach((btn, idx) => {
                if (btn && (btn.pressed || btn.value > 0.5)) {
                    const name = GAMEPAD_BUTTON_NAMES[idx] || `Nút ${idx}`;
                    activeBadges.push(`<span class="gp-tester-badge">${name}</span>`);
                }
            });
            gp.axes.forEach((val, idx) => {
                if (val < -0.5) {
                    const name = GAMEPAD_AXIS_NAMES[`axis:${idx}:-1`] || `Axis ${idx} -`;
                    activeBadges.push(`<span class="gp-tester-badge">${name}</span>`);
                } else if (val > 0.5) {
                    const name = GAMEPAD_AXIS_NAMES[`axis:${idx}:1`] || `Axis ${idx} +`;
                    activeBadges.push(`<span class="gp-tester-badge">${name}</span>`);
                }
            });

            if (activeBadges.length > 0) {
                gpTesterBadges.innerHTML = activeBadges.join('');
            } else {
                gpTesterBadges.innerHTML = `<span class="gp-empty-hint">Chưa có nút nào đang nhấn...</span>`;
            }
        }
    } else {
        gamepadInfoCard.classList.remove('connected');
        gpDeviceTitle.textContent = 'Chưa phát hiện tay cầm nào';
        gpDeviceDesc.textContent = 'Hãy cắm tay cầm (Xbox, PS4/PS5, Logitech, Dobe, Bluetooth...) và bấm phím bất kỳ trên tay cầm để kích hoạt nhận diện.';
        if (btnTestVibration) btnTestVibration.classList.add('hidden');
        if (gpTesterBadges) {
            gpTesterBadges.innerHTML = `<span class="gp-empty-hint">Vui lòng cắm tay cầm vào máy tính...</span>`;
        }
    }
}

function checkGamepadRecordingInput(activeGamepads) {
    if (!activeRecordingGamepadButton || activeGamepads.length === 0) return;
    const gp = activeGamepads[0];
    const { btn, action } = activeRecordingGamepadButton;

    // Quét kiểm tra nút bấm
    for (let i = 0; i < gp.buttons.length; i++) {
        const b = gp.buttons[i];
        if (b && (b.pressed || b.value > 0.6)) {
            const displayName = GAMEPAD_BUTTON_NAMES[i] || `Nút ${i}`;
            tempGamepadConfig.buttons[action] = {
                type: 'button',
                index: i,
                display: displayName
            };
            tempGamepadConfig.preset = 'custom';
            if (gamepadPresetSelect) gamepadPresetSelect.value = 'custom';
            btn.innerText = displayName;
            btn.classList.remove('recording');
            activeRecordingGamepadButton = null;
            vibrateGamepad(80, 0.4, 0.4);
            return;
        }
    }

    // Quét kiểm tra cần gạt analog
    for (let i = 0; i < gp.axes.length; i++) {
        const val = gp.axes[i];
        if (Math.abs(val) > 0.65) {
            const dir = val < 0 ? -1 : 1;
            const axisKey = `axis:${i}:${dir}`;
            const displayName = GAMEPAD_AXIS_NAMES[axisKey] || `Cần trục ${i} ${dir > 0 ? '+' : '-'}`;
            tempGamepadConfig.buttons[action] = {
                type: 'axis',
                axisIndex: i,
                direction: dir,
                display: displayName
            };
            tempGamepadConfig.preset = 'custom';
            if (gamepadPresetSelect) gamepadPresetSelect.value = 'custom';
            btn.innerText = displayName;
            btn.classList.remove('recording');
            activeRecordingGamepadButton = null;
            vibrateGamepad(80, 0.4, 0.4);
            return;
        }
    }
}

function processGamepadControls(activeGamepads) {
    if (activeGamepads.length === 0) return;

    const targetMode = userGamepadConfig.target || 'auto';

    activeGamepads.forEach((gp, idx) => {
        let assignedRole = null;
        if (targetMode === 'p1') {
            assignedRole = (idx === 0) ? 'p1' : null;
        } else if (targetMode === 'p2') {
            assignedRole = (idx === 0) ? 'p2' : null;
        } else if (targetMode === 'dual') {
            assignedRole = (idx === 0) ? 'p1' : (idx === 1 ? 'p2' : null);
        } else {
            // 'auto': Nếu là Guest thì P2, nếu là Host/Solo thì tay 1 = P1, tay 2 = P2 (nếu có 2 tay)
            if (myRole === 'guest') {
                assignedRole = (idx === 0) ? 'p2' : null;
            } else {
                assignedRole = (idx === 0) ? 'p1' : (idx === 1 ? 'p2' : null);
            }
        }

        if (!assignedRole) return;

        const mapping = userGamepadConfig.buttons;
        if (!mapping) return;

        const currentStates = {};

        // Di chuyển: Hỗ trợ cả D-pad lẫn Cần gạt Analog Trái (Deadzone 0.45)
        currentStates.UP = isButtonPressed(gp, mapping.UP) || (gp.axes[1] !== undefined && gp.axes[1] < -0.45);
        currentStates.DOWN = isButtonPressed(gp, mapping.DOWN) || (gp.axes[1] !== undefined && gp.axes[1] > 0.45);
        currentStates.LEFT = isButtonPressed(gp, mapping.LEFT) || (gp.axes[0] !== undefined && gp.axes[0] < -0.45);
        currentStates.RIGHT = isButtonPressed(gp, mapping.RIGHT) || (gp.axes[0] !== undefined && gp.axes[0] > 0.45);

        // Các chiêu thức & Menu Start
        ['ATTACK', 'JUMP', 'DASH', 'SUB', 'ULTI', 'ASSIST', 'START'].forEach(act => {
            currentStates[act] = isButtonPressed(gp, mapping[act]);
        });

        // Edge detection & dispatch event
        const lastStates = lastGamepadActionStates[assignedRole] || {};
        for (const [action, isDown] of Object.entries(currentStates)) {
            const wasDown = !!lastStates[action];
            if (isDown !== wasDown) {
                dispatchActionFromGamepad(assignedRole, action, isDown);
                lastStates[action] = isDown;
            }
        }
        lastGamepadActionStates[assignedRole] = lastStates;
    });
}

function pollGamepadsLoop() {
    if (navigator.getGamepads) {
        const rawGamepads = navigator.getGamepads();
        const activeGamepads = [];
        for (let i = 0; i < rawGamepads.length; i++) {
            if (rawGamepads[i]) {
                activeGamepads.push(rawGamepads[i]);
            }
        }

        // Cập nhật nhãn Toolbar
        updateGamepadToolbarStatus(activeGamepads);

        const isModalOpen = keyModal && !keyModal.classList.contains('hidden');
        const isGamepadTab = isModalOpen && editingKeyGroup === 'gamepad';

        if (isGamepadTab) {
            updateGamepadModalUI(activeGamepads);
            if (activeRecordingGamepadButton) {
                checkGamepadRecordingInput(activeGamepads);
            }
        }

        // Xử lý nút điều khiển khi không đang bấm gán nút
        if (!activeRecordingGamepadButton) {
            processGamepadControls(activeGamepads);
        }
    }

    requestAnimationFrame(pollGamepadsLoop);
}

// Bắt sự kiện cắm / ngắt tay cầm
window.addEventListener('gamepadconnected', (e) => {
    showSyncNotification(`🎮 Đã kết nối tay cầm: ${e.gamepad.id || 'Gamepad'}!`);
    vibrateGamepad(120, 0.4, 0.4);
});

window.addEventListener('gamepaddisconnected', (e) => {
    showSyncNotification(`🔌 Đã ngắt kết nối tay cầm: ${e.gamepad.id || 'Gamepad'}`);
    ['p1', 'p2'].forEach(role => {
        const lastStates = lastGamepadActionStates[role] || {};
        for (const [action, wasDown] of Object.entries(lastStates)) {
            if (wasDown) {
                dispatchActionFromGamepad(role, action, false);
            }
        }
        lastGamepadActionStates[role] = {};
    });
});

// Render danh sách phím hướng dẫn bên dưới giao diện
function renderGuides() {
    renderGuideList(userKeyBindings.p1, FLASH_NATIVE_KEYS.p1, guideGridP1);
    renderGuideList(userKeyBindings.p2, FLASH_NATIVE_KEYS.p2, guideGridP2);
}

function renderGuideList(userGroup, nativeGroup, container) {
    container.innerHTML = '';

    const moveDiv = document.createElement('div');
    moveDiv.innerHTML = `
        <kbd>${userGroup.UP.display}</kbd>
        <kbd>${userGroup.LEFT.display}</kbd>
        <kbd>${userGroup.DOWN.display}</kbd>
        <kbd>${userGroup.RIGHT.display}</kbd>
        <span>Di chuyển</span>
    `;
    container.appendChild(moveDiv);

    const combatActions = ['ATTACK', 'JUMP', 'DASH', 'SUB', 'ULTI', 'ASSIST'];
    combatActions.forEach(act => {
        const div = document.createElement('div');
        div.innerHTML = `<kbd>${userGroup[act].display}</kbd><span>${nativeGroup[act].label}</span>`;
        container.appendChild(div);
    });

    const gpTip = document.createElement('div');
    gpTip.style.cssText = 'color: #ffaa00; font-size: 0.82rem; margin-top: 4px;';
    gpTip.innerHTML = `<span>🎮 <em>Tay cầm: D-Pad / Analog di chuyển • A: Đánh (J) • B: Nhảy (K) • RB: Lướt (L) • X: Phụ (U) • Y: Ulti (I) • LB: Trợ thủ (O) • Start: Menu</em></span>`;
    container.appendChild(gpTip);
}

// ==========================================
// 10. PHÍM ẢO NHANH (VIRTUAL CONTROLS BAR)
// ==========================================
function setupVirtualControls() {
    const vbtns = document.querySelectorAll('.vbtn[data-key]');
    vbtns.forEach(btn => {
        const keyAction = btn.getAttribute('data-key');

        const press = (e) => {
            e.preventDefault();
            btn.classList.add('vbtn-active');
            if (myRole === 'guest') {
                if (currentNetcodeMode === 'esport') {
                    dispatchFlashKeyEvent('keydown', FLASH_NATIVE_KEYS.p2[keyAction]);
                    sendFastMessage({
                        type: 'sync_input',
                        role: 'p2',
                        action: keyAction,
                        eventType: 'keydown'
                    });
                } else {
                    sendFastMessage({
                        type: 'game_input',
                        role: 'p2',
                        action: keyAction,
                        eventType: 'keydown'
                    });
                }
            } else {
                dispatchFlashKeyEvent('keydown', FLASH_NATIVE_KEYS.p1[keyAction]);
                if (currentNetcodeMode === 'esport' && myRole === 'host') {
                    sendFastMessage({
                        type: 'sync_input',
                        role: 'p1',
                        action: keyAction,
                        eventType: 'keydown'
                    });
                }
            }
        };

        const release = (e) => {
            e.preventDefault();
            btn.classList.remove('vbtn-active');
            if (myRole === 'guest') {
                if (currentNetcodeMode === 'esport') {
                    dispatchFlashKeyEvent('keyup', FLASH_NATIVE_KEYS.p2[keyAction]);
                    sendFastMessage({
                        type: 'sync_input',
                        role: 'p2',
                        action: keyAction,
                        eventType: 'keyup'
                    });
                } else {
                    sendFastMessage({
                        type: 'game_input',
                        role: 'p2',
                        action: keyAction,
                        eventType: 'keyup'
                    });
                }
            } else {
                dispatchFlashKeyEvent('keyup', FLASH_NATIVE_KEYS.p1[keyAction]);
                if (currentNetcodeMode === 'esport' && myRole === 'host') {
                    sendFastMessage({
                        type: 'sync_input',
                        role: 'p1',
                        action: keyAction,
                        eventType: 'keyup'
                    });
                }
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
// 11. KHỞI ĐỘNG
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    renderGuides();
    syncHudKeyLabels();
    setupVirtualControls();
    initRuffleGame();
    pollGamepadsLoop(); // Bắt đầu vòng lặp đọc dữ liệu tay cầm 60FPS

    // Hỗ trợ tự kết nối khi mở qua link mời (?room=bvn-xxxx)
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) {
        inputRoomCode.value = roomParam;
        setTimeout(() => {
            joinRoomAsGuest(roomParam);
        }, 800);
    }
});
