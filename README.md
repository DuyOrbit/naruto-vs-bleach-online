# Bleach vs Naruto 2.6 - WebRTC Online P2P (Input Sync Edition)

Trang web chơi game đối kháng **Bleach vs Naruto 2.6** trực tiếp trên trình duyệt, hỗ trợ chơi Online 2 người qua mạng **WebRTC Peer-to-Peer** với cơ chế **Đồng bộ phím thời gian thực (P2P Input Sync)**.

---

## 🚀 Tính năng nổi bật

- **Local Engine 1080p Siêu Nét:** Game chạy trực tiếp trên cả 2 máy bằng giả lập **Ruffle Flash (WebAssembly)**, hình ảnh sắc nét 100%, không bị nén mờ video hay giật hình do băng thông.
- **Tiết kiệm băng thông & Ping cực thấp:** Hai máy chỉ trao đổi tín hiệu phím bấm (chỉ vài byte mỗi giây), độ trễ cực thấp ngay cả khi mạng yếu.
- **Cài đặt phím tự do (Dành riêng cho Laptop):**
  - Không cần bàn phím số Numpad!
  - Cung cấp sẵn preset **Phím Chữ Laptop (IJKL di chuyển + ZXCVBN ra đòn)** cực kỳ thoải mái và dễ bấm combo.
  - Hỗ trợ đổi phím tùy biến 100% theo ý thích cá nhân.
- **Nút Đồng bộ & Bắt đầu lại (Sync Restart):** Khởi động lại game trên cả 2 máy cùng lúc chỉ với 1 click để trận đấu luôn đồng bộ.
- **Tạo phòng & Vào phòng 1 chạm:** Tự động sinh mã phòng và link mời trực tiếp (`?room=bvn-xxxx`).
- **Hỗ trợ đo Ping thời gian thực:** Hiển thị độ trễ mạng tính bằng `ms`.

---

## 🎮 Bảng điều khiển mặc định

### Người chơi 1 (P1 / Host)
- **Di chuyển:** `W`, `A`, `S`, `D`
- **Đánh thường:** `J` • **Nhảy:** `K` • **Lướt / Né:** `L`
- **Chiêu phụ:** `U` • **Tuyệt kỹ (Ulti):** `I` • **Gọi trợ thủ:** `O`

### Người chơi 2 (P2 / Khách - Preset Laptop khuyên dùng)
- **Di chuyển:** `I`, `J`, `K`, `L` (Không cần dùng phím mũi tên nhỏ của laptop)
- **Đánh thường:** `Z` • **Nhảy:** `X` • **Lướt / Né:** `C`
- **Chiêu phụ:** `V` • **Tuyệt kỹ (Ulti):** `B` • **Gọi trợ thủ:** `N`
*(Bạn có thể bấm nút **"⚙️ Cài đặt phím"** trên web để đổi sang bất kỳ phím nào khác tùy thích).*

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
