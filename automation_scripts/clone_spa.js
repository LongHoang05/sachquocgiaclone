/**
 * SPA Snapshot v4 — sachquocgia.vn
 * Chromium headless + stealth, đúng routes thật, xóa script tags
 */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const BASE_URL = "https://sachquocgia.vn";
const DOMAIN = "sachquocgia.vn";
const OUTPUT_DIR = path.join(__dirname, "clone-project");
const ASSETS_DIR = path.join(OUTPUT_DIR, "assets");

const srcFile = fs.readFileSync(
  path.join(__dirname, "clone_website.js"),
  "utf8",
);
const cMatch = srcFile.match(/const SESSION_COOKIE\s*=[\s\S]*?"([^"]+)"\s*;/);
const SESSION_COOKIE = cMatch ? cMatch[1].trim() : "";

const PAGES = [
  { path: "/customer/login", file: "dang-nhap.html", wait: 8000 },
  { path: "/customer/Signup", file: "dang-ky.html", wait: 8000 },
  { path: "/checkout/cart", file: "cart.html", wait: 8000 },
  { path: "/tai-khoan", file: "tai-khoan.html", wait: 10000 },
  {
    path: "/tai-khoan/sach-cua-ban",
    file: "tai-khoan-sach-cua-ban.html",
    wait: 10000,
  },
  {
    path: "/tai-khoan/sach-dang-doc",
    file: "tai-khoan-sach-dang-doc.html",
    wait: 10000,
  },
  {
    path: "/tai-khoan/thong-tin",
    file: "tai-khoan-thong-tin.html",
    wait: 10000,
  },
  {
    path: "/tai-khoan/lich-su-mua-hang",
    file: "tai-khoan-lich-su-mua-hang.html",
    wait: 12000,
  },
  {
    path: "/checkout/information",
    file: "checkout-information.html",
    wait: 10000,
  },
  { path: "/checkout/shipping", file: "checkout-shipping.html", wait: 10000 },
  { path: "/checkout/payment", file: "checkout-payment.html", wait: 10000 },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function parseCookies(s) {
  if (!s) return [];
  return s
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const i = c.indexOf("=");
      return i < 1
        ? null
        : {
            name: c.substring(0, i).trim(),
            value: c.substring(i + 1).trim(),
            domain: ".sachquocgia.vn",
            path: "/",
            secure: true,
            sameSite: "Lax",
          };
    })
    .filter(Boolean);
}

async function downloadFile(url, lp) {
  return new Promise((r) => {
    const p = url.startsWith("https") ? https : http;
    try {
      const req = p.get(
        url,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 Chrome/122",
            Cookie: SESSION_COOKIE,
            Referer: BASE_URL,
          },
          timeout: 15000,
        },
        (res) => {
          if ([301, 302, 307, 308].includes(res.statusCode)) {
            downloadFile(res.headers.location, lp).then(r);
            return;
          }
          if (res.statusCode !== 200) {
            r(false);
            return;
          }
          const ch = [];
          res.on("data", (c) => ch.push(c));
          res.on("end", () => {
            fs.writeFileSync(lp, Buffer.concat(ch));
            r(true);
          });
          res.on("error", () => r(false));
        },
      );
      req.on("error", () => r(false));
      req.on("timeout", () => {
        req.destroy();
        r(false);
      });
    } catch {
      r(false);
    }
  });
}

function subdir(u) {
  const l = u.toLowerCase().split("?")[0];
  if (/\.(woff2?|ttf|otf|eot)$/.test(l)) return "fonts";
  if (/\.css$/.test(l)) return "css";
  if (/\.js$/.test(l)) return "js";
  if (/\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/.test(l)) return "images";
  return "misc";
}

const amap = new Map();
async function dlAsset(absUrl) {
  if (amap.has(absUrl)) return amap.get(absUrl);
  let p;
  try {
    p = new URL(absUrl);
  } catch {
    return null;
  }
  const sd = subdir(absUrl);
  let fn = decodeURIComponent(p.pathname.split("/").pop() || "a");
  for (const e of [
    ".css",
    ".js",
    ".woff2",
    ".woff",
    ".ttf",
    ".png",
    ".jpg",
    ".svg",
    ".gif",
    ".ico",
    ".webp",
  ]) {
    const i = fn.indexOf(e);
    if (i !== -1) {
      fn = fn.substring(0, i + e.length);
      break;
    }
  }
  fn =
    fn
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/__+/g, "_")
      .slice(0, 180) || `a_${Date.now()}`;
  const td = path.join(ASSETS_DIR, sd);
  ensureDir(td);
  const tp = path.join(td, fn);
  if (fs.existsSync(tp)) {
    const r = `assets/${sd}/${fn}`;
    amap.set(absUrl, r);
    return r;
  }
  const ok = await downloadFile(absUrl, tp);
  const r = ok ? `assets/${sd}/${fn}` : null;
  amap.set(absUrl, r);
  if (ok) process.stdout.write(`  ↓ [${sd}] ${fn}\n`);
  return r;
}

async function snap(page, cfg) {
  const url = `${BASE_URL}${cfg.path}`;
  console.log(`\n━━━ ${url}\n    → ${cfg.file}`);
  try {
    await page.goto(url, { timeout: 60000, waitUntil: "domcontentloaded" });
    await page.waitForTimeout(cfg.wait);
    try {
      await page.waitForLoadState("networkidle", { timeout: 8000 });
    } catch {}
    const t = await page.title();
    const cu = page.url();
    console.log(`  📄 "${t}"`);
    console.log(`  📍 ${cu}`);
    if (t.includes("404") || t.includes("Không tìm thấy"))
      console.warn("  ⚠️  404!");
    if (cu.includes("/customer/login") && !cfg.path.includes("/customer/login"))
      console.warn("  ⚠️  → login redirect");

    const assets = await page.evaluate((d) => {
      const u = new Set(),
        add = (s) => {
          if (!s || s.startsWith("data:") || s.startsWith("blob:")) return;
          try {
            const x = new URL(s);
            if (x.hostname.includes(d) || x.hostname.includes("fonts.g"))
              u.add(x.href);
          } catch {}
        };
      document.querySelectorAll("link[href]").forEach((e) => add(e.href));
      document.querySelectorAll("script[src]").forEach((e) => add(e.src));
      document.querySelectorAll("img[src]").forEach((e) => add(e.src));
      document
        .querySelectorAll("img[data-src]")
        .forEach((e) => add(e.dataset.src));
      return [...u];
    }, DOMAIN);
    console.log(`  📦 ${assets.length} assets`);

    let html = await page.content();
    let c = 0;
    for (const u of assets) {
      const l = await dlAsset(u);
      if (l) {
        html = html.split(u).join(l);
        html = html.split(u.replace(/^https?:/, "")).join(l);
        c++;
      }
    }
    console.log(`  ✓ ${c} localized`);

    // Xóa tất cả script tags để ngăn SPA runtime
    html = html.replace(
      /<script\b[^>]*>[\s\S]*?<\/script>/gi,
      "<!-- offline -->",
    );

    fs.writeFileSync(path.join(OUTPUT_DIR, cfg.file), html, "utf8");
    const kb = Math.round(
      fs.statSync(path.join(OUTPUT_DIR, cfg.file)).size / 1024,
    );
    console.log(`  ✓ ${cfg.file} (${kb} KB)`);
    return true;
  } catch (e) {
    console.error(`  ✗ ${e.message}`);
    return false;
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║   SPA Snapshot v4 — Chromium Stealth + Real Routes  ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
  ensureDir(OUTPUT_DIR);
  for (const d of ["css", "js", "images", "fonts", "misc"])
    ensureDir(path.join(ASSETS_DIR, d));

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
  });
  console.log("✅ Chromium launched");

  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "vi-VN",
  });

  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    if (navigator.userAgentData) {
      Object.defineProperty(navigator, "userAgentData", {
        get: () => ({
          brands: [
            { brand: "Google Chrome", version: "122" },
            { brand: "Chromium", version: "122" },
          ],
          mobile: false,
          platform: "Windows",
        }),
      });
    }
  });

  if (SESSION_COOKIE) {
    await ctx.addCookies(parseCookies(SESSION_COOKIE));
    console.log("🍪 Cookies injected");
  }

  const page = await ctx.newPage();
  const results = [];
  for (const cfg of PAGES) {
    results.push({ ...cfg, ok: await snap(page, cfg) });
  }
  await browser.close();

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   ✅ Hoàn tất!                                      ║");
  console.log("╚══════════════════════════════════════════════════════╝\n");
  for (const r of results) {
    const p = path.join(OUTPUT_DIR, r.file);
    const kb = fs.existsSync(p) ? Math.round(fs.statSync(p).size / 1024) : 0;
    console.log(
      `  ${r.ok ? "✓" : "✗"} ${r.file.padEnd(42)} ${kb ? kb + " KB" : "FAIL"}`,
    );
  }
  console.log(`\n  Assets: ${[...amap.values()].filter(Boolean).length}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
