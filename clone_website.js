/**
 * Clone Website - sachquocgia.vn
 * v2.0 — Hỗ trợ Session/Cookie để clone các trang yêu cầu đăng nhập
 *
 * HƯỚNG DẪN SỬ DỤNG COOKIE:
 *   1. Mở trình duyệt, đăng nhập vào sachquocgia.vn
 *   2. Mở DevTools → Tab Application → Cookies → sachquocgia.vn
 *   3. Copy giá trị tất cả cookies vào biến SESSION_COOKIE bên dưới
 *      Ví dụ: "PHPSESSID=abc123; auth_token=xyz456; user_id=789"
 */

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

// ─── SESSION CONFIGURATION ─────────────────────────────────────────────────
const SESSION_COOKIE =
  "_ga=GA1.1.2103779469.1770007540; comment=%7B%22BookId%22%3A%22e696e9ff-d52d-4f70-8842-ee915b8d862a%22%2C%22Url%22%3Anull%2C%22Messenger%22%3A%22jbh%22%7D; auth=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjoiMzNmZTNiNTVkMDAzNGFjZThhMDkwYTNjYjFjNTUxMjkiLCJpcCI6IjQyLjExNi4xNDguMTQ2IiwidGltZSI6IjI2MDIyNzE0NTgzMiIsIm5iZiI6MTc3MjE3OTExMiwiZXhwIjoxNzcyNzgzOTEyLCJpYXQiOjE3NzIxNzkxMTJ9.FjzeKL0UvzhgAtDZXIcuRcOgqjARy80h2o8oiWez_xA; cart=1; _ga_Q7P1WCDED9=GS2.1.s1772174891$o12$g1$t1772181105$j60$l0$h0";

// Headers mặc định giả lập trình duyệt Chrome thật
const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "sec-ch-ua":
    '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  ...(SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {}),
};

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BASE_URL = "https://sachquocgia.vn";
const LOGIN_PATHS = [
  "/dang-nhap",
  "/customer/login",
  "/account/login",
  "/login",
];
const OUTPUT_DIR = path.join(__dirname, "clone-project");
const ASSETS_DIR = path.join(OUTPUT_DIR, "assets");

// ─── DANH SÁCH TRANG CẦN CLONE ─────────────────────────────────────────────
// Format: [url, outputFilename, requiresAuth]
//   requiresAuth = true → cần SESSION_COOKIE hợp lệ để tải
const PAGES = [
  // ── NHÓM 1: Trang Public ─────────────────────────────────────────────
  ["https://sachquocgia.vn/", "index.html", false],
  [
    "https://sachquocgia.vn/mien-nam-trong-trai-tim-ho-chi-minh-b14870.html",
    "mien-nam-b14870.html",
    false,
  ],
  [
    "https://sachquocgia.vn/nguoi-ban-duong-du-lich-van-hoa-hoi-an-b14793.html",
    "nguoi-ban-hoi-an-b14793.html",
    false,
  ],
  ["https://sachquocgia.vn/tat-ca-danh-muc", "tat-ca-danh-muc.html", false],
  ["https://sachquocgia.vn/checkout/cart", "cart.html", false],
  [
    "https://sachquocgia.vn/tu-sach-bac-ho-c214",
    "tu-sach-bac-ho-c214.html",
    false,
  ],
  [
    "https://sachquocgia.vn/tu-sach-nhan-vat-c189",
    "tu-sach-nhan-vat-c189.html",
    false,
  ],
  [
    "https://sachquocgia.vn/tu-sach-ly-luan-chinh-tri-c191",
    "tu-sach-ly-luan-chinh-tri-c191.html",
    false,
  ],
  ["https://sachquocgia.vn/tu-sach-luat-c202", "tu-sach-luat-c202.html", false],
  [
    "https://sachquocgia.vn/sach-luat-tham-khao-c205",
    "sach-luat-tham-khao-c205.html",
    false,
  ],
  [
    "https://sachquocgia.vn/tu-sach-giao-trinh-va-tai-lieu-hoc-tap-c203",
    "tu-sach-giao-trinh-c203.html",
    false,
  ],
  [
    "https://sachquocgia.vn/tu-sach-ban-chi-dao-35-c199",
    "tu-sach-ban-chi-dao-35-c199.html",
    false,
  ],
  [
    "https://sachquocgia.vn/tu-sach-chi-bo-c193",
    "tu-sach-chi-bo-c193.html",
    false,
  ],
  [
    "https://sachquocgia.vn/tu-sach-giao-trinh-ly-luan-chinh-tri-danh-cho-bac-dai-hoc-c229",
    "tu-sach-gt-dai-hoc-c229.html",
    false,
  ],
  ["https://sachquocgia.vn/ebook/14793", "ebook-14793.html", false],

  // ── NHÓM 2: Trang yêu cầu đăng nhập (cần SESSION_COOKIE) ──────────
  ["https://sachquocgia.vn/tai-khoan", "tai-khoan.html", true],
  [
    "https://sachquocgia.vn/tai-khoan/sach-cua-ban",
    "tai-khoan-sach-cua-ban.html",
    true,
  ],
  [
    "https://sachquocgia.vn/tai-khoan/sach-dang-doc",
    "tai-khoan-sach-dang-doc.html",
    true,
  ],
  [
    "https://sachquocgia.vn/tai-khoan/thong-tin",
    "tai-khoan-thong-tin.html",
    true,
  ],
  [
    "https://sachquocgia.vn/tai-khoan/lich-su-mua-hang",
    "tai-khoan-lich-su-mua-hang.html",
    true,
  ],

  // ── NHÓM 3: Checkout flow (cần có sản phẩm trong giỏ + đăng nhập) ──
  [
    "https://sachquocgia.vn/checkout/information",
    "checkout-information.html",
    true,
  ],
  ["https://sachquocgia.vn/checkout/shipping", "checkout-shipping.html", true],
  ["https://sachquocgia.vn/checkout/payment", "checkout-payment.html", true],
  ["https://sachquocgia.vn/checkout/review", "checkout-review.html", true],

  // ── NHÓM 4: Trang SPA — đăng nhập / đăng ký ─────────────────────────
  ["https://sachquocgia.vn/dang-nhap", "dang-nhap.html", false],
  ["https://sachquocgia.vn/dang-ky", "dang-ky.html", false],

  // ── NHÓM 5: Trang Authenticated — Quản lý tài khoản (Hidden Routes) ─
  ["https://sachquocgia.vn/customer/login", "customer/login.html", false],
  ["https://sachquocgia.vn/customer/Signup", "customer/signup.html", false],
  ["https://sachquocgia.vn/my-account", "customer/my-account.html", true],
  [
    "https://sachquocgia.vn/customer/purchased-book",
    "customer/purchased-book.html",
    true,
  ],
  [
    "https://sachquocgia.vn/customer/reading-books",
    "customer/reading-books.html",
    true,
  ],
  ["https://sachquocgia.vn/customer/document", "customer/document.html", true],
  [
    "https://sachquocgia.vn/customer/change-password",
    "customer/change-password.html",
    true,
  ],
  [
    "https://sachquocgia.vn/customer/purchase-history",
    "customer/purchase-history.html",
    true,
  ],
  [
    "https://sachquocgia.vn/customer/transaction-history",
    "customer/transaction-history.html",
    true,
  ],
];

// ─── HELPERS ───────────────────────────────────────────────────────────────
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function sanitizeFilename(str) {
  return str
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/__+/g, "_")
    .substring(0, 200);
}

function getAssetSubdir(urlStr) {
  const lower = urlStr.toLowerCase();
  if (/\.(woff2?|ttf|otf|eot)(\?.*)?$/.test(lower)) return "fonts";
  if (/\.css(\?.*)?$/.test(lower)) return "css";
  if (/\.js(\?.*)?$/.test(lower)) return "js";
  if (/\.(png|jpg|jpeg|gif|svg|ico|webp|avif)(\?.*)?$/.test(lower))
    return "images";
  if (lower.includes("fonts.googleapis") || lower.includes("fonts.gstatic"))
    return "fonts";
  return "misc";
}

/**
 * Kiểm tra xem response cuối (sau redirect) có phải trang đăng nhập không
 */
function isRedirectedToLogin(finalUrl) {
  try {
    const parsed = new URL(finalUrl);
    return LOGIN_PATHS.some(
      (lp) => parsed.pathname === lp || parsed.pathname.startsWith(lp),
    );
  } catch {
    return false;
  }
}

// Map từ absolute URL → local relative path
const downloadedMap = new Map();

async function downloadAsset(assetUrl) {
  if (downloadedMap.has(assetUrl)) return downloadedMap.get(assetUrl);

  let parsedUrl;
  try {
    parsedUrl = new URL(assetUrl);
  } catch {
    return null;
  }

  const subdir = getAssetSubdir(assetUrl);
  const rawFilename =
    decodeURIComponent(parsedUrl.pathname.split("/").pop() || "index") +
    (parsedUrl.search ? parsedUrl.search.replace(/[?&=]/g, "_") : "");
  const filename = sanitizeFilename(rawFilename) || `asset_${Date.now()}`;
  const targetDir = path.join(ASSETS_DIR, subdir);
  ensureDir(targetDir);

  let targetPath = path.join(targetDir, filename);
  let counter = 1;
  while (fs.existsSync(targetPath) && !downloadedMap.has(assetUrl)) {
    const ext = path.extname(filename);
    const base = filename.slice(0, filename.length - ext.length);
    targetPath = path.join(targetDir, `${base}_${counter}${ext}`);
    counter++;
    if (counter > 100) break;
  }

  // localRelPath luôn từ gốc clone-project/
  const localRelPath = `assets/${subdir}/${path.basename(targetPath)}`;

  try {
    const response = await axios.get(assetUrl, {
      responseType: "arraybuffer",
      headers: { ...DEFAULT_HEADERS, Referer: BASE_URL },
      timeout: 30000,
      maxRedirects: 5,
    });

    fs.writeFileSync(targetPath, response.data);
    downloadedMap.set(assetUrl, localRelPath);
    console.log(`  ✓ [${subdir}] ${path.basename(targetPath)}`);
    return localRelPath;
  } catch (err) {
    console.warn(`  ✗ Failed: ${assetUrl.substring(0, 80)} — ${err.message}`);
    downloadedMap.set(assetUrl, null);
    return null;
  }
}

async function processCssContent(cssContent, cssAbsoluteUrl) {
  const cssBase = cssAbsoluteUrl.substring(
    0,
    cssAbsoluteUrl.lastIndexOf("/") + 1,
  );
  const urlPattern = /url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g;
  const urls = [];
  let match;
  while ((match = urlPattern.exec(cssContent)) !== null) urls.push(match[1]);

  const importPattern =
    /@import\s+(?:url\(\s*['"]?([^'"\)]+)['"]?\s*\)|['"]([^'"]+)['"])/g;
  while ((match = importPattern.exec(cssContent)) !== null) {
    const importUrl = match[1] || match[2];
    if (importUrl) urls.push(importUrl);
  }

  const replacements = new Map();
  for (const rawUrl of [...new Set(urls)]) {
    if (rawUrl.startsWith("data:") || rawUrl.startsWith("#")) continue;
    let absoluteUrl;
    try {
      absoluteUrl = new URL(rawUrl, cssBase).href;
    } catch {
      continue;
    }
    const localPath = await downloadAsset(absoluteUrl);
    if (localPath) replacements.set(rawUrl, localPath);
  }

  let result = cssContent;
  for (const [orig, local] of replacements) {
    const escaped = orig.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "g"), `../../${local}`);
  }
  return result;
}

function resolveUrl(href, pageUrl) {
  if (
    !href ||
    href.startsWith("data:") ||
    href.startsWith("javascript:") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  )
    return null;
  try {
    return new URL(href, pageUrl).href;
  } catch {
    return null;
  }
}

async function downloadAndProcessCss(cssUrl) {
  if (downloadedMap.has(cssUrl)) return downloadedMap.get(cssUrl);

  const parsedUrl = new URL(cssUrl);
  const rawFilename =
    decodeURIComponent(parsedUrl.pathname.split("/").pop() || "style") +
    (parsedUrl.search ? parsedUrl.search.replace(/[?&=]/g, "_") : "");
  const filename = sanitizeFilename(rawFilename) || `style_${Date.now()}.css`;
  const targetDir = path.join(ASSETS_DIR, "css");
  ensureDir(targetDir);

  let targetPath = path.join(targetDir, filename);
  let counter = 1;
  while (fs.existsSync(targetPath)) {
    const ext = path.extname(filename);
    const base = filename.slice(0, filename.length - ext.length);
    targetPath = path.join(targetDir, `${base}_${counter}${ext}`);
    counter++;
    if (counter > 100) break;
  }

  const localRelPath = `assets/css/${path.basename(targetPath)}`;

  try {
    const response = await axios.get(cssUrl, {
      responseType: "text",
      headers: { ...DEFAULT_HEADERS, Referer: BASE_URL },
      timeout: 30000,
      maxRedirects: 5,
    });

    let cssContent = await processCssContent(response.data, cssUrl);
    fs.writeFileSync(targetPath, cssContent, "utf8");
    downloadedMap.set(cssUrl, localRelPath);
    console.log(`  ✓ [css] ${path.basename(targetPath)}`);
    return localRelPath;
  } catch (err) {
    console.warn(`  ✗ CSS Failed: ${cssUrl.substring(0, 80)} — ${err.message}`);
    downloadedMap.set(cssUrl, null);
    return null;
  }
}

/**
 * Clone một trang HTML đơn lẻ
 * Hỗ trợ subfolder (ví dụ: customer/my-account.html)
 * Tự tính relative paths cho assets dựa vào depth của outputFilename
 */
async function clonePage(pageUrl, outputFilename, requiresAuth = false) {
  console.log(`\n━━━ Cloning: ${pageUrl}`);
  console.log(
    `    → ${outputFilename}${requiresAuth ? " [🔐 Authenticated]" : ""}`,
  );

  // Cảnh báo nếu trang cần auth mà chưa có cookie
  if (requiresAuth && !SESSION_COOKIE.trim()) {
    console.warn("  ⚠️  Trang này cần đăng nhập. SESSION_COOKIE đang trống!");
    console.warn("     Hãy điền SESSION_COOKIE ở đầu file và chạy lại.");
    console.warn("     Bỏ qua trang này...");
    return;
  }

  // ── Tính depth prefix cho subfolder ──────────────────────────────────────
  // Nếu outputFilename = "customer/my-account.html" → depth = 1 → prefix = "../"
  // Nếu outputFilename = "index.html" → depth = 0 → prefix = ""
  const outputDir = path.dirname(outputFilename); // "customer" hoặc "."
  const depth = outputDir === "." ? 0 : outputDir.split("/").length;
  const assetPrefix = "../".repeat(depth); // "" cho root, "../" cho customer/
  if (depth > 0) {
    console.log(
      `  📁 Subfolder depth: ${depth} → asset prefix: "${assetPrefix}"`,
    );
  }

  let html;
  let finalUrl = pageUrl;

  try {
    const resp = await axios.get(pageUrl, {
      headers: DEFAULT_HEADERS,
      timeout: 45000,
      maxRedirects: 5,
      // Lưu lại URL cuối cùng sau redirect để kiểm tra
      beforeRedirect: (options, { headers }) => {
        if (headers.location)
          finalUrl = new URL(headers.location, pageUrl).href;
      },
    });
    html = resp.data;
    // Kiểm tra redirect về trang đăng nhập
    if (isRedirectedToLogin(finalUrl)) {
      console.warn("  ⚠️  CẢNH BÁO: Bị chuyển hướng về trang đăng nhập!");
      console.warn("     Cookie có thể đã hết hạn hoặc không hợp lệ!");
      console.warn(
        "     Hãy đăng nhập lại trên trình duyệt và cập nhật SESSION_COOKIE.",
      );
      // Vẫn tiếp tục để lưu trang đăng nhập (có ích cho mockup)
    }
  } catch (err) {
    // Kiểm tra nếu error do redirect về đăng nhập
    if (err.response && isRedirectedToLogin(err.response.config?.url || "")) {
      console.warn("  ⚠️  CẢNH BÁO: Bị chuyển hướng về trang đăng nhập!");
      console.warn("     Cookie có thể đã hết hạn hoặc không hợp lệ!");
    } else {
      console.error(`  ✗ Failed to fetch page: ${err.message}`);
    }
    return;
  }

  const $ = cheerio.load(html, { decodeEntities: false });

  // Helper: thêm prefix cho asset path khi file nằm trong subfolder
  function prefixAssetPath(localPath) {
    if (!localPath || depth === 0) return localPath;
    // localPath dạng "assets/css/style.css" → "../assets/css/style.css"
    return assetPrefix + localPath;
  }

  // ── CSS <link> tags ───────────────────────────────────────────────────────
  const cssLinks = [];
  $('link[rel="stylesheet"]').each((i, el) => {
    const href = $(el).attr("href");
    if (href) cssLinks.push({ el, href });
  });

  for (const { el, href } of cssLinks) {
    const absUrl = resolveUrl(href, pageUrl);
    if (!absUrl) continue;
    const localPath = await downloadAndProcessCss(absUrl);
    if (localPath) $(el).attr("href", prefixAssetPath(localPath));
  }

  // ── <style> blocks ────────────────────────────────────────────────────────
  const styleEls = [];
  $("style").each((i, el) => styleEls.push(el));
  for (const el of styleEls) {
    const content = $(el).html();
    if (content) {
      let processed = await processCssContent(content, pageUrl);
      // Thêm prefix cho url() trong inline <style> nếu subfolder
      if (depth > 0) {
        processed = processed.replace(
          /url\(["']?(assets\/)/g,
          `url(${assetPrefix}$1`,
        );
      }
      $(el).html(processed);
    }
  }

  // ── JS <script> tags ──────────────────────────────────────────────────────
  const scriptEls = [];
  $("script[src]").each((i, el) =>
    scriptEls.push({ el, src: $(el).attr("src") }),
  );

  for (const { el, src } of scriptEls) {
    const absUrl = resolveUrl(src, pageUrl);
    if (!absUrl) continue;
    const localPath = await downloadAsset(absUrl);
    if (localPath) $(el).attr("src", prefixAssetPath(localPath));
  }

  // ── Images <img> ──────────────────────────────────────────────────────────
  const imgEls = [];
  $("img").each((i, el) => imgEls.push(el));

  for (const el of imgEls) {
    const src = $(el).attr("src");
    if (src) {
      const absUrl = resolveUrl(src, pageUrl);
      if (absUrl) {
        const localPath = await downloadAsset(absUrl);
        if (localPath) $(el).attr("src", prefixAssetPath(localPath));
      }
    }
    const dataSrc = $(el).attr("data-src");
    if (dataSrc) {
      const absUrl = resolveUrl(dataSrc, pageUrl);
      if (absUrl) {
        const localPath = await downloadAsset(absUrl);
        if (localPath) $(el).attr("data-src", prefixAssetPath(localPath));
      }
    }
  }

  // ── Inline style background-image ────────────────────────────────────────
  const inlineStyledEls = [];
  $("[style]").each((i, el) => inlineStyledEls.push(el));
  for (const el of inlineStyledEls) {
    let style = $(el).attr("style");
    if (style && style.includes("url(")) {
      style = await processCssContent(style, pageUrl);
      style = style.replace(/\.\.\/\.\.\//g, "");
      // Thêm prefix cho subfolder
      if (depth > 0) {
        style = style.replace(/url\(["']?(assets\/)/g, `url(${assetPrefix}$1`);
      }
      $(el).attr("style", style);
    }
  }

  // ── Favicon ───────────────────────────────────────────────────────────────
  const faviconEls = [];
  $('link[rel*="icon"]').each((i, el) =>
    faviconEls.push({ el, href: $(el).attr("href") }),
  );
  for (const { el, href } of faviconEls) {
    if (!href) continue;
    const absUrl = resolveUrl(href, pageUrl);
    if (!absUrl) continue;
    const localPath = await downloadAsset(absUrl);
    if (localPath) $(el).attr("href", prefixAssetPath(localPath));
  }

  // ── Xoá preload links (không cần offline) ─────────────────────────────
  $('link[rel="preload"]').remove();

  // ── Internal navigation links → local HTML files ──────────────────────
  // Xây dựng map từ pathname → local file
  const PAGE_MAP = {};
  for (const [url, file] of PAGES) {
    const parsed = new URL(url);
    PAGE_MAP[parsed.pathname] = file;
    PAGE_MAP[url] = file;
  }

  $("a[href]").each((i, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    // Thử match href với tất cả patterns
    let targetFile = null;
    for (const [pattern, localFile] of Object.entries(PAGE_MAP)) {
      if (
        href === pattern ||
        href === `//sachquocgia.vn${pattern}` ||
        href === `https://sachquocgia.vn${pattern}`
      ) {
        targetFile = localFile;
        break;
      }
    }

    if (targetFile) {
      // Tính relative path từ file hiện tại đến file đích
      // Ví dụ: từ "customer/my-account.html" → "customer/purchased-book.html" = "purchased-book.html"
      //         từ "customer/my-account.html" → "index.html" = "../index.html"
      //         từ "index.html" → "customer/my-account.html" = "customer/my-account.html"
      const relPath = path
        .relative(path.dirname(outputFilename), targetFile)
        .replace(/\\/g, "/");
      $(el).attr("href", relPath);
    }
  });

  // ── Lưu file HTML ────────────────────────────────────────────────────────
  const outputPath = path.join(OUTPUT_DIR, outputFilename);
  // Tạo subfolder nếu cần (ví dụ: customer/)
  ensureDir(path.dirname(outputPath));
  fs.writeFileSync(outputPath, $.html(), "utf8");
  console.log(`  ✓ Saved → ${outputFilename}`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   Clone Website: sachquocgia.vn  v2.0               ║");
  console.log("║   Session/Cookie Support                             ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  if (SESSION_COOKIE.trim()) {
    console.log(
      "🔐 SESSION_COOKIE: ĐÃ CẤU HÌNH — Sẽ truy cập được các trang đăng nhập",
    );
  } else {
    console.log("⚠️  SESSION_COOKIE: CHƯA CẤU HÌNH — Chỉ clone trang Public");
    console.log(
      "   Để clone các trang đăng nhập, điền SESSION_COOKIE ở đầu file.\n",
    );
  }

  // Tạo thư mục
  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(ASSETS_DIR, "css"));
  ensureDir(path.join(ASSETS_DIR, "js"));
  ensureDir(path.join(ASSETS_DIR, "images"));
  ensureDir(path.join(ASSETS_DIR, "fonts"));
  ensureDir(path.join(ASSETS_DIR, "misc"));
  ensureDir(path.join(OUTPUT_DIR, "customer")); // Subfolder cho authenticated pages

  console.log(`\n📁 Output: ${OUTPUT_DIR}\n`);

  const publicPages = PAGES.filter(([, , auth]) => !auth);
  const authPages = PAGES.filter(([, , auth]) => auth);

  // Clone trang public trước
  console.log(`\n═══ NHÓM 1: Trang Public (${publicPages.length} trang) ═══`);
  for (const [url, filename, auth] of publicPages) {
    await clonePage(url, filename, auth);
  }

  // Clone trang yêu cầu đăng nhập
  console.log(
    `\n═══ NHÓM 2: Trang Authenticated (${authPages.length} trang) ═══`,
  );
  for (const [url, filename, auth] of authPages) {
    await clonePage(url, filename, auth);
  }

  // Rename versioned CSS/JS filenames → clean extensions
  console.log("\n═══ Dọn dẹp tên file CSS/JS ═══");
  cleanVersionedFilenames();

  // Thống kê cuối
  const successCount = [...downloadedMap.values()].filter(
    (v) => v !== null,
  ).length;
  const failCount = [...downloadedMap.values()].filter(
    (v) => v === null,
  ).length;

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   ✅ Clone hoàn tất!                                ║");
  console.log("╚══════════════════════════════════════════════════════╝");
  console.log(`\n📁 Output directory : ${OUTPUT_DIR}`);
  console.log(`📄 Total pages      : ${PAGES.length}`);
  console.log(`🎨 Assets tải thành công: ${successCount}`);
  console.log(`✗  Assets thất bại  : ${failCount}`);

  if (!SESSION_COOKIE.trim()) {
    console.log("\n💡 MẸO: Để clone trang đăng nhập, hãy:");
    console.log("   1. Đăng nhập vào sachquocgia.vn trên Chrome/Edge");
    console.log("   2. Mở DevTools (F12) → Application → Cookies");
    console.log("   3. Copy tất cả cookies vào biến SESSION_COOKIE ở đầu file");
    console.log("   4. Chạy lại: node clone_website.js");
  }

  // Lưu asset map
  const assetMapObj = {};
  for (const [url, local] of downloadedMap) assetMapObj[url] = local;
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "_asset_map.json"),
    JSON.stringify(assetMapObj, null, 2),
    "utf8",
  );
  console.log("\n🗺️  Asset map → _asset_map.json");
  console.log("\n👉 Mở file index.html trong trình duyệt để xem kết quả!");
}

/**
 * Rename tên file versioned về tên sạch
 * Ví dụ: main.min.css_v_VDc6... → main.min.css
 */
function cleanVersionedFilenames() {
  function cleanName(filename) {
    for (const ext of [".css", ".js", ".woff2", ".woff", ".ttf"]) {
      const idx = filename.indexOf(ext);
      if (idx !== -1) return filename.substring(0, idx + ext.length);
    }
    return filename;
  }

  for (const subdir of ["css", "js"]) {
    const dir = path.join(ASSETS_DIR, subdir);
    if (!fs.existsSync(dir)) continue;
    const seen = new Set(fs.readdirSync(dir));

    for (const file of [...seen]) {
      const cleaned = cleanName(file);
      if (cleaned !== file) {
        let finalName = cleaned;
        let i = 1;
        while (seen.has(finalName) && finalName !== file) {
          const e = path.extname(cleaned);
          finalName = `${cleaned.slice(0, -e.length)}_${i}${e}`;
          i++;
        }
        if (finalName !== file) {
          try {
            fs.renameSync(path.join(dir, file), path.join(dir, finalName));
            seen.delete(file);
            seen.add(finalName);
            console.log(`  Renamed: ${file} → ${finalName}`);

            // Cập nhật downloadedMap
            for (const [url, lp] of downloadedMap) {
              if (lp === `assets/${subdir}/${file}`) {
                downloadedMap.set(url, `assets/${subdir}/${finalName}`);
              }
            }

            // Cập nhật references trong HTML
            const htmlFiles = fs
              .readdirSync(OUTPUT_DIR)
              .filter((f) => f.endsWith(".html"))
              .map((f) => path.join(OUTPUT_DIR, f));
            for (const hf of htmlFiles) {
              let c = fs.readFileSync(hf, "utf8");
              if (c.includes(`assets/${subdir}/${file}`)) {
                c = c
                  .split(`assets/${subdir}/${file}`)
                  .join(`assets/${subdir}/${finalName}`);
                fs.writeFileSync(hf, c, "utf8");
              }
            }
          } catch {}
        }
      }
    }
  }
}

main().catch(console.error);
