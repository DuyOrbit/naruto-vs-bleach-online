# Bleach vs Naruto 2.6 - WebRTC Online P2P

Trang web chơi game đối kháng **Bleach vs Naruto 2.6** trực tiếp trên trình duyệt, hỗ trợ chơi Online 2 người qua mạng **WebRTC Peer-to-Peer** (không cần cài thêm phần mềm, độ trễ cực thấp).

---

## 🚀 Tính năng nổi bật

- **Chơi ngay không cần cài đặt:** Game chạy trực tiếp trên trình duyệt bằng giả lập **Ruffle Flash (WebAssembly)**.
- **Tạo phòng & Vào phòng dễ dàng:**
  - P1 nhấn **"Tạo phòng mới"** $\rightarrow$ Hệ thống cấp mã phòng (ví dụ: `bvn-8821`) và Link mời.
  - P2 chỉ cần nhập mã hoặc click vào Link mời là tự động kết nối vào trận.
- **P2P Canvas Stream (Zero Desync):** Game chạy trực tiếp trên máy Host và stream video 60 FPS sang máy Khách, triệt tiêu hoàn toàn lỗi lệch đồng bộ (desync).
- **Hỗ trợ đo Ping thời gian thực:** Hiển thị độ trễ mạng tính bằng `ms`.
- **Hỗ trợ Laptop không có bàn phím số:** Người chơi 2 có thể dùng cụm phím số thường `1, 2, 3, 4, 5, 6` trên hàng số, hệ thống tự động dịch sang mã `Numpad` của game.

---

## 🎮 Bảng điều khiển

### Người chơi 1 (Host / P1)
- **Di chuyển:** `W`, `A`, `S`, `D`
- **Đánh thường:** `J`
- **Nhảy:** `K`
- **Lướt / Né:** `L`
- **Chiêu phụ:** `U`
- **Tuyệt kỹ (Ulti):** `I`
- **Gọi trợ thủ:** `O`

### Người chơi 2 (Khách / Guest / P2)
- **Di chuyển:** `↑`, `←`, `↓`, `→` (Phím mũi tên)
- **Đánh thường:** `1` (Numpad hoặc Số 1)
- **Nhảy:** `2` (Numpad hoặc Số 2)
- **Lướt / Né:** `3` (Numpad hoặc Số 3)
- **Chiêu phụ:** `4` (Numpad hoặc Số 4)
- **Tuyệt kỹ (Ulti):** `5` (Numpad hoặc Số 5)
- **Gọi trợ thủ:** `6` (Numpad hoặc Số 6)

---

## 🛠 Hướng dẫn đẩy lên GitHub và Host trên Render

### Bước 1: Khởi tạo Git và đẩy lên GitHub

Mở PowerShell tại thư mục này và chạy các lệnh:

```bash
git init
git add .
git commit -m "Khoi tao Bleach vs Naruto Online WebRTC"
git branch -M main
git remote add origin https://github.com/<tai-khoan-github-cua-ban>/<ten-repo>.git
git push -u origin main
```

*(Thay `<tai-khoan-github-cua-ban>` và `<ten-repo>` bằng repository GitHub bạn vừa tạo).*

---

### Bước 2: Deploy lên Render (Miễn phí 100%, không bị Sleep)

1. Đăng nhập vào [Render.com](https://render.com/).
2. Nhấn **New +** $\rightarrow$ Chọn **Static Site**.
3. Chọn Repository GitHub bạn vừa push ở Bước 1.
4. Điền các thông tin:
   - **Name:** Đặt tên web của bạn (ví dụ: `bleach-vs-naruto-online`).
   - **Branch:** `main`
   - **Build Command:** Để trống (vì là web tĩnh).
   - **Publish Directory:** `.` (hoặc `./`).
5. Nhấn **Create Static Site**.
6. Render sẽ cung cấp cho bạn một đường link có dạng: `https://bleach-vs-naruto-online.onrender.com`.

---

## 🌐 Cách chơi cùng bạn bè

1. Bạn vào link Render của bạn.
2. Nhấn nút **"Tạo phòng mới"** $\rightarrow$ Bấm nút **"🔗 Copy Link Mời Bạn Bè"**.
3. Gửi link đó cho bạn bè qua Messenger/Zalo/Discord.
4. Bạn bè click vào link $\rightarrow$ Web tự động kết nối, bạn bè sẽ trở thành P2 và có thể so tài cùng bạn ngay lập tức!
