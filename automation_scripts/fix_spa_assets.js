/**
 * Fix Asset Paths trong HTML cloned files
 * Thay thế /content/assets/xxx → assets/xxx (relative path)
 * và download các assets chưa có từ live site
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const OUTPUT_DIR = path.join(__dirname, "clone-project");
const ASSETS_DIR = path.join(OUTPUT_DIR, "assets");
const BASE_URL = "https://sachquocgia.vn";

// Đọc SESSION_COOKIE
const srcFile = fs.readFileSync(
  path.join(__dirname, "clone_website.js"),
  "utf8",
);
const cMatch = srcFile.match(/const SESSION_COOKIE\s*=[\s\S]*?"([^"]+)"\s*;/);
const SESSION_COOKIE = cMatch ? cMatch[1].trim() : "";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Download missing asset
function downloadAsset(remoteUrl, localPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(localPath)) {
      resolve(true);
      return;
    }
    ensureDir(path.dirname(localPath));
    const req = https.get(
      remoteUrl,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 Chrome/122",
          Cookie: SESSION_COOKIE,
        },
        timeout: 15000,
      },
      (res) => {
        if ([301, 302, 307].includes(res.statusCode) && res.headers.location) {
          downloadAsset(res.headers.location, localPath).then(resolve);
          return;
        }
        if (res.statusCode !== 200) {
          resolve(false);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          fs.writeFileSync(localPath, Buffer.concat(chunks));
          resolve(true);
        });
        res.on("error", () => resolve(false));
      },
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function getSubdir(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if ([".css"].includes(ext)) return "css";
  if ([".js"].includes(ext)) return "js";
  if (
    [
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".svg",
      ".ico",
      ".webp",
      ".avif",
    ].includes(ext)
  )
    return "images";
  if ([".woff", ".woff2", ".ttf", ".otf", ".eot"].includes(ext)) return "fonts";
  return "misc";
}

async function main() {
  console.log("🔧 Fixing asset paths in cloned HTML files...\n");

  // Tìm tất cả HTML files
  const htmlFiles = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".html"));
  console.log(`📄 ${htmlFiles.length} HTML files found\n`);

  const allAssets = new Set();
  let totalFixed = 0;

  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(OUTPUT_DIR, htmlFile);
    let html = fs.readFileSync(htmlPath, "utf8");
    let fixes = 0;

    // Pattern 1: /content/assets/xxx → assets/xxx
    const contentAssetsRegex = /["'](\/content\/assets\/[^"'?]+(?:\?[^"']*)?)/g;
    let match;
    const replacements = new Map();

    while ((match = contentAssetsRegex.exec(html)) !== null) {
      const fullMatch = match[1]; // /content/assets/css/bootstrap.min.css?v=xxx
      const cleanPath = fullMatch.split("?")[0]; // /content/assets/css/bootstrap.min.css
      const relativePath = cleanPath.replace("/content/", ""); // assets/css/bootstrap.min.css

      if (!replacements.has(fullMatch)) {
        replacements.set(fullMatch, relativePath);
        allAssets.add(cleanPath);
      }
    }

    // Pattern 2: /favicon.png → assets/images/favicon.png
    if (html.includes('"/favicon.png"') || html.includes("'/favicon.png'")) {
      replacements.set("/favicon.png", "assets/images/favicon.png");
      allAssets.add("/favicon.png");
    }

    // Apply replacements
    for (const [from, to] of replacements) {
      const count = html.split(from).length - 1;
      html = html.split(from).join(to);
      fixes += count;
    }

    if (fixes > 0) {
      fs.writeFileSync(htmlPath, html, "utf8");
      console.log(`  ✓ ${htmlFile}: ${fixes} paths fixed`);
      totalFixed += fixes;
    } else {
      console.log(`  - ${htmlFile}: no fixes needed`);
    }
  }

  console.log(
    `\n📦 Total: ${totalFixed} path fixes across ${htmlFiles.length} files`,
  );
  console.log(`📥 ${allAssets.size} unique assets to check/download\n`);

  // Download missing assets
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const assetPath of allAssets) {
    const localRelative = assetPath.replace("/content/", ""); // assets/css/bootstrap.min.css
    const localFull = path.join(OUTPUT_DIR, localRelative);
    const remoteUrl = BASE_URL + assetPath;

    if (fs.existsSync(localFull)) {
      skipped++;
      continue;
    }

    // Determine subdir and ensure it exists
    ensureDir(path.dirname(localFull));

    const ok = await downloadAsset(remoteUrl, localFull);
    if (ok) {
      downloaded++;
      const kb = Math.round(fs.statSync(localFull).size / 1024);
      console.log(`  ↓ ${localRelative} (${kb} KB)`);
    } else {
      failed++;
      console.log(`  ✗ ${localRelative} — FAILED`);
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Already existed: ${skipped}`);
  console.log(`  Failed: ${failed}`);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
