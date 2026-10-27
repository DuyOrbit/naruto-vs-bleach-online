const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function main() {
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
    }

    console.log("Launching browser via playwright-core...");
    const browser = await chromium.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1280, height: 850 },
        deviceScaleFactor: 1
    });

    const page = await context.newPage();
    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Đợi game Ruffle tải xong (loading overlay ẩn đi)
    console.log("Waiting for game to load...");
    try {
        await page.waitForSelector('#loadingOverlay.hidden', { timeout: 12000 });
        await page.waitForTimeout(2000);
    } catch (e) {
        console.log("Timeout waiting for loadingOverlay hidden, proceeding...");
    }

    // 1. Chụp màn hình trang chủ / Game play
    console.log("1. Taking main screen / gameplay screenshot...");
    await page.screenshot({ path: path.join(screenshotDir, '01_main_interface.png'), fullPage: false });

    // 2. Mở modal cài đặt điều khiển và chuyển sang tab Gamepad
    console.log("2. Opening Gamepad Settings tab...");
    await page.click('#btnOpenKeyModal');
    await page.waitForTimeout(500);
    await page.click('.tab-btn[data-tab="tabGamepad"]');
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(screenshotDir, '02_gamepad_settings.png') });

    // 3. Chuyển sang tab Bàn phím P1 / P2
    console.log("3. Opening Keyboard Settings tab...");
    await page.click('.tab-btn[data-tab="tabP1"]');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '03_keyboard_settings.png') });

    // Đóng modal
    await page.click('#btnCloseKeyModal');
    await page.waitForTimeout(500);

    // 4. Cuộn xuống khu vực Lobby & Controls Guide
    console.log("4. Taking Lobby & Controls Guide screenshot...");
    const lobbyEl = await page.$('.lobby-panel');
    if (lobbyEl) {
        await lobbyEl.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(screenshotDir, '04_lobby_and_guide.png') });
    }

    console.log("All screenshots captured successfully in:", screenshotDir);
    await browser.close();
}

main().catch(err => {
    console.error("Error capturing screenshots:", err);
    process.exit(1);
});
