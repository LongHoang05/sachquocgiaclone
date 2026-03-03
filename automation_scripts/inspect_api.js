/**
 * API Inspector v2 - Fix ERR_ABORTED bằng cách mở trang gốc trước,
 * rồi điều hướng sang trang authenticated
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "clone_website.js"), "utf8");
const m = src.match(/const SESSION_COOKIE\s*=[\s\S]*?"([^"]+)"\s*;/);
const SESSION_COOKIE = m ? m[1] : "";
if (!SESSION_COOKIE) {
  console.error("No cookie!");
  process.exit(1);
}
console.log("Cookie length:", SESSION_COOKIE.length);

function parseCookies(str) {
  return str
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const i = c.indexOf("=");
      return {
        name: c.substring(0, i).trim(),
        value: c.substring(i + 1).trim(),
        domain: ".sachquocgia.vn",
        path: "/",
        secure: true,
        sameSite: "Lax",
      };
    });
}

const PAGES_TO_INSPECT = [
  "/tai-khoan",
  "/tai-khoan/thong-tin",
  "/tai-khoan/lich-su-mua-hang",
  "/dang-nhap",
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    extraHTTPHeaders: { "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8" },
  });

  await ctx.addCookies(parseCookies(SESSION_COOKIE));

  const apiFindings = {};
  const responseCache = {};

  // Đăng ký response interceptor toàn cục
  ctx.on("response", async (resp) => {
    const u = resp.url();
    const ct = resp.headers()["content-type"] || "";
    if (ct.includes("json") && resp.status() === 200) {
      try {
        const body = await resp.text();
        responseCache[u] = { status: resp.status(), contentType: ct, body };
        console.log(`  💾 [JSON] ${u.replace("https://sachquocgia.vn", "")}`);
      } catch {}
    }
  });

  const page = await ctx.newPage();

  // Bước 1: Mở trang chủ trước để set cookies đúng context
  console.log("\nBước 1: Mở trang chủ...");
  try {
    await page.goto("https://sachquocgia.vn/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(2000);
    const title = await page.title();
    console.log("  Trang chủ:", title);
  } catch (e) {
    console.error("  Lỗi trang chủ:", e.message);
  }

  // Bước 2: Duyệt từng trang authenticated bằng cách click/navigate
  for (const pagePath of PAGES_TO_INSPECT) {
    console.log(`\n=== ${pagePath} ===`);
    const captured = [];

    page.on("request", (req) => {
      const u = req.url();
      if (
        u.includes("sachquocgia.vn") &&
        (req.resourceType() === "xhr" || req.resourceType() === "fetch")
      ) {
        captured.push({
          method: req.method(),
          url: u,
          type: req.resourceType(),
        });
      }
    });

    try {
      // Navigate bằng eval thay vì goto để tránh ERR_ABORTED
      await page.evaluate((url) => {
        window.location.href = url;
      }, "https://sachquocgia.vn" + pagePath);
      await page.waitForURL("**" + pagePath + "**", { timeout: 15000 });
      await page.waitForTimeout(5000);

      console.log("  Current URL:", page.url());
      console.log(`  API calls (${captured.length}):`);
      for (const c of captured) {
        console.log(
          `    [${c.method}] ${c.url.replace("https://sachquocgia.vn", "")}`,
        );
      }

      apiFindings[pagePath] = captured;
    } catch (e) {
      console.log("  Timeout/Error:", e.message.substring(0, 100));
      // Try direct goto as fallback
      try {
        await page.goto("https://sachquocgia.vn" + pagePath, {
          waitUntil: "commit",
          timeout: 15000,
        });
        await page.waitForTimeout(5000);
        console.log("  Fallback URL:", page.url());
      } catch (e2) {
        console.log("  Fallback also failed:", e2.message.substring(0, 80));
      }
    }
  }

  await browser.close();

  // Lưu kết quả
  fs.writeFileSync(
    "api_inspection.json",
    JSON.stringify(
      { apiFindings, cachedURLs: Object.keys(responseCache) },
      null,
      2,
    ),
  );

  // Lưu response cache
  const cacheDir = path.join(__dirname, "api_cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

  for (const [url, resp] of Object.entries(responseCache)) {
    const safeName =
      url
        .replace(/https?:\/\/sachquocgia\.vn/, "")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .slice(0, 150) + ".json";
    fs.writeFileSync(
      path.join(cacheDir, safeName),
      JSON.stringify({ url, ...resp }, null, 2),
    );
  }

  console.log(
    "\n✅ Done! Cached",
    Object.keys(responseCache).length,
    "API responses",
  );
  console.log("📁 Cache saved in api_cache/");
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
