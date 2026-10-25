const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Phục vụ các file tĩnh (HTML, CSS, JS, SWF)
app.use(express.static(path.join(__dirname, '.')));

// Điều hướng tất cả request về index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server Bleach vs Naruto Online dang chay tren cong: ${PORT}`);
});
