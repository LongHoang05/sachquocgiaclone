const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const projectDir = path.join(__dirname, "clone-project");

// Helpers for scanning HTML files recursively
function getHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== "assets") {
        getHtmlFiles(filePath, fileList);
      }
    } else if (filePath.endsWith(".html")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(projectDir);

function reportFix(pageName, problem, solution) {
  console.log(`\nTên trang: ${pageName}`);
  console.log(`Vấn đề phát hiện: ${problem}`);
  console.log(`Giải pháp & Code sửa:\n${solution}`);
}

htmlFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const relFile = path.relative(projectDir, file).replace(/\\/g, "/");
  let needsSave = false;

  // Load with cheerio
  const $ = cheerio.load(content, { decodeEntities: false });

  let issues = [];
  let codes = [];

  // 4. Khắc phục lỗi Console (Zero Console Errors)
  // Remove GA, GTM, Facebook Pixel scripts
  const trackingScripts = [];
  $("script").each((i, el) => {
    const src = $(el).attr("src") || "";
    const html = $(el).html() || "";
    if (
      src.includes("googletagmanager") ||
      src.includes("google-analytics") ||
      src.includes("G-") ||
      src.includes("fbq") ||
      html.includes("dataLayer") ||
      html.includes("gtag") ||
      html.includes("fbq")
    ) {
      trackingScripts.push(el);
    }
  });

  if (trackingScripts.length > 0) {
    issues.push(
      "Tìm thấy mã theo dõi (Google Analytics / Google Tag Manager) gây lỗi Console/CORS.",
    );
    let removedCodes = [];
    $(trackingScripts).each((i, el) => {
      removedCodes.push($.html(el));
      $(el).remove();
    });
    codes.push(
      `Đã xóa bỏ các thẻ <script> gọi API theo dõi:\n${removedCodes.join("\n")}`,
    );
    needsSave = true;
  }

  const noscripts = [];
  $("noscript").each((i, el) => {
    const html = $(el).html() || "";
    if (html.includes("googletagmanager")) {
      noscripts.push(el);
    }
  });

  if (noscripts.length > 0) {
    issues.push(
      "Tìm thấy mã theo dõi (Google Tag Manager) trong thẻ <noscript>.",
    );
    let removedCodes = [];
    $(noscripts).each((i, el) => {
      removedCodes.push($.html(el));
      $(el).remove();
    });
    codes.push(
      `Đã xóa bỏ các thẻ <noscript> gọi API theo dõi:\n${removedCodes.join("\n")}`,
    );
    needsSave = true;
  }

  // Checking for viewport meta tag
  if ($('meta[name="viewport"]').length === 0) {
    issues.push(
      "Thiếu thẻ meta viewport gây vỡ layout (Responsive) trên Mobile.",
    );
    $("head").prepend(
      '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">',
    );
    codes.push(
      `Đã bổ sung thẻ meta vào <head>:\n<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">`,
    );
    needsSave = true;
  }

  if (needsSave) {
    reportFix(relFile, issues.join("\n"), codes.join("\n\n"));
    fs.writeFileSync(file, $.html(), "utf8");
  }
});

console.log("\n=================================");
console.log("HOÀN THÀNH KIẾM TRA & VÁ LỖI CƠ BẢN CHO TẤT CẢ CÁC TRANG");
console.log("=================================");
