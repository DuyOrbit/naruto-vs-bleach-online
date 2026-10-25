const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Phục vụ các file tĩnh (HTML, CSS, JS, SWF)
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

app.listen(PORT, () => {
    console.log(`Server Bleach vs Naruto Online đang chạy trên cổng: ${PORT}`);
});
