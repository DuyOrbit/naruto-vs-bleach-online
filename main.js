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
// 2. CÁC OPTION ĐIỀU KHIỂN CHO NGƯỜI DÙNG (3 OPTIONS)
// ==========================================
const KEY_PRESETS = {
    // Option 1: Bộ phím WASD
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
    // Option 2: Bộ phím 4 Mũi tên (Hỗ trợ cả phím số hàng trên 1..6 và Numpad 1..6)
    option_arrows: {
        UP:     { code: 'ArrowUp', display: '↑' },
        DOWN:   { code: 'ArrowDown', display: '↓' },
        LEFT:   { code: 'ArrowLeft', display: '←' },
        RIGHT:  { code: 'ArrowRight', display: '→' },
        ATTACK: { code: 'Digit1', display: '1 / Num 1' },
        JUMP:   { code: 'Digit2', display: '2 / Num 2' },
        DASH:   { code: 'Digit3', display: '3 / Num 3' },
        SUB:    { code: 'Digit4', display: '4 / Num 4' },
        ULTI:   { code: 'Digit5', display: '5 / Num 5' },
        ASSIST: { code: 'Digit6', display: '6 / Num 6' }
    }
};

// Quản lý cấu hình phím
let userKeyBindings = loadKeyBindings();

function loadKeyBindings() {
    const saved = localStorage.getItem('bvn_user_keybindings_v2');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Lỗi parse saved bindings:", e);
        }
    }
    // Mặc định ban đầu: P1 dùng Option WASD, P2 dùng Option 4 Mũi tên
    return {
        p1Preset: 'option_wasd',
        p2Preset: 'option_arrows',
        p1: JSON.parse(JSON.stringify(KEY_PRESETS.option_wasd)),
        p2: JSON.parse(JSON.stringify(KEY_PRESETS.option_arrows))
    };
}

function saveKeyBindings(bindings) {
    userKeyBindings = bindings;
    localStorage.setItem('bvn_user_keybindings_v2', JSON.stringify(bindings));
    renderGuides();
}

// ==========================================
// 3. APPLICATION STATE & DOM REFERENCES
// ==========================================
let socket = null;
let peerConnection = null;
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
            splashScreen: false
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

    if (ruffleCanvas) {
        ruffleCanvas.dispatchEvent(new KeyboardEvent(type, eventInit));
    }
    if (rufflePlayer && rufflePlayer.shadowRoot) {
        const shadowContainer = rufflePlayer.shadowRoot.querySelector('#container');
        if (shadowContainer) {
            shadowContainer.dispatchEvent(new KeyboardEvent(type, eventInit));
        }
    }
    if (rufflePlayer) {
        rufflePlayer.dispatchEvent(new KeyboardEvent(type, eventInit));
    }
    window.dispatchEvent(new KeyboardEvent(type, eventInit));
}

// ==========================================
// 5. WEBRTC 60FPS HD CANVAS STREAMING ENGINE
// ==========================================

// Tăng bitrate SDP lên 15 Mbps cho chất lượng 1080p 60fps không mờ
function boostSdpBitrate(sdp, maxKbps = 15000) {
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
                    videoTrack.contentHint = 'detail'; // Giữ nét từng pixel và text
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
                peerConnection.addTrack(track, outgoingStream);
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
            showSyncNotification("🟢 Đã truyền hình ảnh 60FPS HD và Âm thanh cho Khách!");
        }
    };

    // Tạo Offer
    try {
        const offer = await peerConnection.createOffer();
        const boostedSdp = boostSdpBitrate(offer.sdp, 15000);
        await peerConnection.setLocalDescription({ type: 'offer', sdp: boostedSdp });
        sendNetworkMessage({
            type: 'webrtc_offer',
            sdp: boostedSdp
        });
    } catch (e) {
        console.error("Host: Lỗi tạo WebRTC offer:", e);
    }
}

// GUEST: Nhận luồng hình ảnh & âm thanh từ Host
function setupGuestWebRtc() {
    console.log("Khởi động WebRTC Guest Receiver...");
    if (peerConnection) {
        try { peerConnection.close(); } catch (e) {}
        peerConnection = null;
    }

    // Ẩn player Flash local của Guest để tiết kiệm 100% tài nguyên CPU
    const rPlayer = document.getElementById('rufflePlayer');
    if (rPlayer) rPlayer.style.display = 'none';

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
    if (!peerConnection) {
        setupGuestWebRtc();
    }
    try {
        await peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
        const answer = await peerConnection.createAnswer();
        const boostedSdp = boostSdpBitrate(answer.sdp, 15000);
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
    } catch (e) {
        console.error("Host: Lỗi xử lý WebRTC answer:", e);
    }
}

async function handleWebRtcCandidate(candidate) {
    if (!peerConnection) return;
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
    if (bindingGroup) {
        for (const [action, config] of Object.entries(bindingGroup)) {
            if (config.code === code) return action;
            // Hỗ trợ cả phím số hàng trên Digit1..6 lẫn Numpad1..6 cho tiện lợi
            if (config.code.startsWith('Digit') && code === config.code.replace('Digit', 'Numpad')) return action;
            if (config.code.startsWith('Numpad') && code === config.code.replace('Numpad', 'Digit')) return action;
        }
    }
    // SMART FALLBACK: Hỗ trợ tự động nhận cả WASD lẫn 4 Mũi tên
    const DEFAULT_FALLBACK_MAP = {
        KeyW: 'UP', ArrowUp: 'UP',
        KeyS: 'DOWN', ArrowDown: 'DOWN',
        KeyA: 'LEFT', ArrowLeft: 'LEFT',
        KeyD: 'RIGHT', ArrowRight: 'RIGHT',
        KeyJ: 'ATTACK', Digit1: 'ATTACK', Numpad1: 'ATTACK',
        KeyK: 'JUMP', Digit2: 'JUMP', Numpad2: 'JUMP',
        KeyL: 'DASH', Digit3: 'DASH', Numpad3: 'DASH',
        KeyU: 'SUB', Digit4: 'SUB', Numpad4: 'SUB',
        KeyI: 'ULTI', Digit5: 'ULTI', Numpad5: 'ULTI',
        KeyO: 'ASSIST', Digit6: 'ASSIST', Numpad6: 'ASSIST'
    };
    if (DEFAULT_FALLBACK_MAP[code]) {
        return DEFAULT_FALLBACK_MAP[code];
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

    // Chặn cuộn màn hình trình duyệt với phím mũi tên & Space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
    }

    // Phím Enter hoặc Space hỗ trợ xác nhận/chọn menu nhanh
    if (code === 'Enter' || code === 'Space') {
        if (myRole === 'guest') {
            sendNetworkMessage({
                type: 'game_input',
                role: 'p2',
                action: 'MENU_CONFIRM',
                eventType: eventType
            });
        } else {
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1.ATTACK);
        }
        return;
    }

    // 1. TRƯỜNG HỢP HOST (P1):
    // Dù Host dùng Option 1 (WASD), Option 2 (Mũi tên), hay Option 3 (Custom),
    // code tự động chuyển thành bộ phím Native P1 (WASD + JKLU IO) và bắn vào Flash!
    if (myRole === 'host') {
        const action = findActionByCode(userKeyBindings.p1, code);
        if (action) {
            e.preventDefault();
            const nativeKey = FLASH_NATIVE_KEYS.p1[action];
            dispatchFlashKeyEvent(eventType, nativeKey);
        }
    }
    // 2. TRƯỜNG HỢP GUEST (P2):
    // Dù Guest dùng Option 1 (WASD), Option 2 (Mũi tên), hay Option 3 (Custom),
    // Guest gửi action sang Host -> Host nhận và tự động chuyển thành bộ phím Native P2 (4 Mũi tên + Numpad 1..6)
    else if (myRole === 'guest') {
        const action = findActionByCode(userKeyBindings.p2, code);
        if (action) {
            e.preventDefault();
            sendNetworkMessage({
                type: 'game_input',
                role: 'p2',
                action: action,
                eventType: eventType
            });
        }
    }
    // 3. TRƯỜNG HỢP CHƠI ĐƠN OFFLINE (SOLO):
    // Cả 2 người chơi trên cùng 1 máy tính
    else {
        const actionP1 = findActionByCode(userKeyBindings.p1, code);
        if (actionP1) {
            e.preventDefault();
            dispatchFlashKeyEvent(eventType, FLASH_NATIVE_KEYS.p1[actionP1]);
            return;
        }
        const actionP2 = findActionByCode(userKeyBindings.p2, code);
        if (actionP2) {
            e.preventDefault();
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
            updateStatus('connected', `🟢 BẠN LÀ P1 (HOST): Đang phát trực tiếp 60FPS cho Khách!`);
            showSyncNotification("🎮 Bạn là Host: Dùng W/S và J chọn 'Team VS' (1P vs 2P) để cùng đấu!");
            // Thiết lập luồng WebRTC truyền màn hình sang Guest
            setTimeout(setupHostWebRtc, 500);
        } else {
            updateStatus('connected', `🟢 BẠN LÀ P2 (KHÁCH): Đang xem trực tiếp màn hình trận đấu của Host!`);
            showSyncNotification("⏳ Đang đồng bộ màn hình từ Host... Bạn đã sẵn sàng điều khiển P2!");
            setupGuestWebRtc();
        }
        return;
    }

    // 4. WebRTC Signaling (Offer, Answer, Candidate)
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

    // 5. Host nhận phím bấm từ Guest (P2)
    if (data.type === 'game_input') {
        if (myRole === 'host') {
            if (data.action === 'MENU_CONFIRM') {
                dispatchFlashKeyEvent(data.eventType, FLASH_NATIVE_KEYS.p1.ATTACK);
                return;
            }
            // TỰ ĐỘNG CHUYỂN ACTION THÀNH NATIVE P2 CỦA FLASH BVN
            const nativeKey = FLASH_NATIVE_KEYS.p2[data.action];
            if (nativeKey) {
                dispatchFlashKeyEvent(data.eventType, nativeKey);
            }
        }
        return;
    }

    // 6. Yêu cầu khởi động lại game
    if (data.type === 'sync_restart') {
        showSyncNotification("🔄 Trận đấu đang được khởi động lại...");
        if (myRole === 'host' || myRole === 'solo') {
            initRuffleGame();
            setTimeout(setupHostWebRtc, 1000);
        }
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
        sendNetworkMessage({ type: 'ping', time: Date.now() });
    }, 1000);
}

// Nút Đồng bộ lại / Khởi động lại
btnSyncRestart.addEventListener('click', () => {
    if (confirm("Khởi động lại game để đồng bộ lại trận đấu từ đầu?")) {
        sendNetworkMessage({ type: 'sync_restart' });
        if (myRole === 'host' || myRole === 'solo') {
            initRuffleGame();
            setTimeout(setupHostWebRtc, 1000);
        }
        showSyncNotification("🔄 Đang khởi động lại trận đấu...");
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
        if (netcodeBadge) netcodeBadge.innerText = '⚡ 60FPS HD Remote Play (Host Engine)';
    } else if (role === 'guest') {
        roleBadge.className = 'role-badge role-guest';
        roleBadge.innerText = '🔵 BẠN LÀ P2 (KHÁCH)';
        if (netcodeBadge) netcodeBadge.innerText = '⚡ 60FPS HD Remote Play (Màn hình đồng bộ)';
    } else {
        roleBadge.className = 'role-badge role-solo';
        roleBadge.innerText = '🎮 Chế độ: Chơi đơn';
    }
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
let editingKeyGroup = 'p1'; // 'p1' | 'p2'
let activeRecordingButton = null;
let tempBindings = JSON.parse(JSON.stringify(userKeyBindings));

btnOpenKeyModal.addEventListener('click', () => {
    tempBindings = JSON.parse(JSON.stringify(userKeyBindings));

    // Mặc định chọn tab phù hợp với vai trò hiện tại
    if (myRole === 'guest') {
        switchModalTab('tabP2');
    } else {
        switchModalTab('tabP1');
    }

    keyModal.classList.remove('hidden');
});

btnCloseKeyModal.addEventListener('click', () => {
    cancelActiveRecording();
    keyModal.classList.add('hidden');
});

function switchModalTab(tabId) {
    tabButtons.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });
    tabContents.forEach(c => {
        c.classList.toggle('active', c.id === tabId);
    });
    editingKeyGroup = tabId === 'tabP1' ? 'p1' : 'p2';
    presetSelect.value = tempBindings[editingKeyGroup + 'Preset'] || 'option_custom';
    renderModalBindings();
}

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchModalTab(targetTab);
    });
});

// Thay đổi Preset trong dropdown (Option 1, Option 2, Option 3)
presetSelect.addEventListener('change', (e) => {
    const selected = e.target.value;
    if (selected === 'option_wasd') {
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
    keyModal.classList.add('hidden');
    showSyncNotification("✓ Đã lưu cài đặt bàn phím thành công!");
});

btnResetDefaultKeys.addEventListener('click', () => {
    if (confirm("Khôi phục về mặc định: P1 dùng WASD, P2 dùng 4 Mũi tên?")) {
        tempBindings = {
            p1Preset: 'option_wasd',
            p2Preset: 'option_arrows',
            p1: JSON.parse(JSON.stringify(KEY_PRESETS.option_wasd)),
            p2: JSON.parse(JSON.stringify(KEY_PRESETS.option_arrows))
        };
        presetSelect.value = tempBindings[editingKeyGroup + 'Preset'];
        renderModalBindings();
    }
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
                sendNetworkMessage({
                    type: 'game_input',
                    role: 'p2',
                    action: keyAction,
                    eventType: 'keydown'
                });
            } else {
                dispatchFlashKeyEvent('keydown', FLASH_NATIVE_KEYS.p1[keyAction]);
            }
        };

        const release = (e) => {
            e.preventDefault();
            btn.classList.remove('vbtn-active');
            if (myRole === 'guest') {
                sendNetworkMessage({
                    type: 'game_input',
                    role: 'p2',
                    action: keyAction,
                    eventType: 'keyup'
                });
            } else {
                dispatchFlashKeyEvent('keyup', FLASH_NATIVE_KEYS.p1[keyAction]);
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
    setupVirtualControls();
    initRuffleGame();

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
