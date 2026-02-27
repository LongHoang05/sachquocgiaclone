/**
 * Dùng Playwright để tự đăng nhập lấy cookie mới
 * HOẶC: Kết nối vào Chrome đang chạy của user qua CDP
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

// Đọc partial cookie từ ảnh chụp màn hình
// (phần còn lại sẽ được lấy từ Set-Cookie response headers)

async function main() {
  console.log("Đang kết nối vào Chrome qua CDP...");

  // Chrome thường chạy với remote debugging nếu được khởi động đúng
  // Thử kết nối vào Chrome user đang chạy
  let browser;
  try {
    browser = await chromium.connectOverCDP("http://localhost:9222");
    console.log("✅ Kết nối Chrome thành công!");
  } catch (e) {
    console.log("Không thể kết nối CDP (Chrome chưa bật debug mode)");
    console.log("Chuyển sang tạo browser mới và đọc cookie từ response...");

    // Fallback: dùng Playwright mở trang và đọc cookies từ response
    browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  }

  const contexts = browser.contexts();
  let page;

  if (contexts.length > 0) {
    // Lấy từ Chrome user đang chạy
    const pages = contexts[0].pages();
    page = pages[0] || (await contexts[0].newPage());
    console.log("Current URL:", page.url());

    // Lấy tất cả cookies
    const cookies = await contexts[0].cookies(["https://sachquocgia.vn"]);
    console.log("\nCookies từ Chrome của bạn:");
    for (const c of cookies) {
      console.log(`  ${c.name}: ${c.value.substring(0, 50)}...`);
    }

    // Build SESSION_COOKIE
    const needed = ["auth", ".AspNetCore.Antiforgery.PAnxZgrQbk8", "visitorId"];
    const parts = cookies
      .filter((c) => needed.includes(c.name))
      .map((c) => `${c.name}=${c.value}`);

    if (parts.length > 0) {
      const cookieStr = parts.join("; ");
      updateCloneWebsite(cookieStr);
    } else {
      console.log("Không tìm thấy cookies sachquocgia.vn trong Chrome");
    }
  } else {
    console.log("Không có browser context nào");
  }

  await browser.close();
}

function updateCloneWebsite(cookieStr) {
  const cloneFile = path.join(__dirname, "clone_website.js");
  let src = fs.readFileSync(cloneFile, "utf8");

  // Thay thế SESSION_COOKIE (multiline)
  const regex = /const SESSION_COOKIE\s*=[\s\S]{0,20}?"[^"]*"[^;]*;/;
  const replacement = `const SESSION_COOKIE = "${cookieStr}"; // Auto-extracted ${new Date().toLocaleString("vi-VN")}`;

  if (regex.test(src)) {
    fs.writeFileSync(cloneFile, src.replace(regex, replacement), "utf8");
    console.log("\n✅ clone_website.js đã được cập nhật!");
    console.log("Cookie preview:", cookieStr.substring(0, 80) + "...");

    // Decode JWT
    try {
      const authPart = cookieStr
        .split(";")
        .find((p) => p.trim().startsWith("auth="));
      if (authPart) {
        const jwt = authPart.split("=").slice(1).join("=").trim();
        const payload = JSON.parse(
          Buffer.from(jwt.split(".")[1], "base64").toString(),
        );
        const exp = new Date(payload.exp * 1000);
        console.log(`JWT hết hạn: ${exp.toLocaleString("vi-VN")}`);
        const remaining = Math.round(
          (payload.exp * 1000 - Date.now()) / 3600000,
        );
        console.log(`Còn: ${remaining} giờ`);
      }
    } catch {}
  } else {
    console.error("Không thể update clone_website.js!");
    console.log("Cookie mới:", cookieStr);
  }
}

main().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});
