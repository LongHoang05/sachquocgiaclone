const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const projectDir = path.join(__dirname, "clone-project");
const assetsDir = path.join(projectDir, "assets");

// 1. Recursive file hunter
function getFiles(dir, extensions, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, extensions, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

const htmlFiles = getFiles(projectDir, [".html"]);
const cssFiles = getFiles(assetsDir, [".css"]);
const allPhysicalAssets = getFiles(assetsDir, [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".svg",
  ".webp",
  ".js",
  ".css",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".ico",
]);

const usedAssets = new Set();

function markAsUsed(rawPath, currentFileDir) {
  if (
    !rawPath ||
    rawPath.startsWith("http") ||
    rawPath.startsWith("//") ||
    rawPath.startsWith("data:")
  )
    return;

  // Remove query params and hashes
  let cleanPath = rawPath.split("?")[0].split("#")[0];
  if (!cleanPath) return;

  let absolutePath;
  if (path.isAbsolute(cleanPath)) {
    // Assume absolute paths in HTML are relative to projectDir
    absolutePath = path.join(projectDir, cleanPath);
  } else {
    absolutePath = path.resolve(currentFileDir, cleanPath);
  }

  if (absolutePath.startsWith(assetsDir)) {
    usedAssets.add(absolutePath);
  }
}

// --- Step 1: Scan HTML for used assets ---
htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const $ = cheerio.load(content);
  const dir = path.dirname(file);

  $("img[src]").each((i, el) => markAsUsed($(el).attr("src"), dir));
  $("link[href]").each((i, el) => markAsUsed($(el).attr("href"), dir));
  $("script[src]").each((i, el) => markAsUsed($(el).attr("src"), dir));
  $("source[src]").each((i, el) => markAsUsed($(el).attr("src"), dir));
  $("video[src]").each((i, el) => markAsUsed($(el).attr("src"), dir));

  // Background inline styles
  $("[style]").each((i, el) => {
    const style = $(el).attr("style");
    const urls = style.match(/url\(['"]?([^'"]+)['"]?\)/g);
    if (urls) {
      urls.forEach((u) => {
        const match = u.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (match) markAsUsed(match[1], dir);
      });
    }
  });
});

// --- Step 2: Scan CSS for used assets (fonts, images) ---
cssFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const dir = path.dirname(file);
  const urls = content.match(/url\(['"]?([^'"]+)['"]?\)/g);
  if (urls) {
    urls.forEach((u) => {
      const match = u.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match) markAsUsed(match[1], dir);
    });
  }
});

// --- Step 3: Compare and Delete ---
let deletedCount = 0;
let savedBytes = 0;

console.log("\n=======================================================");
console.log("🧹 TIẾN HÀNH DỌN DẸP TÀI NGUYÊN DƯ THỪA (ORPHAN ASSETS)");
console.log("=======================================================");

allPhysicalAssets.forEach((filePath) => {
  if (!usedAssets.has(filePath)) {
    try {
      const stats = fs.statSync(filePath);
      savedBytes += stats.size;
      fs.unlinkSync(filePath);
      deletedCount++;
      // console.log(`[DELETED] ${path.relative(projectDir, filePath)}`);
    } catch (e) {
      console.error(`[ERROR] Không thể xóa ${filePath}: ${e.message}`);
    }
  }
});

// --- Step 4: Report ---
const totalUsed = usedAssets.size;
const totalPhysical = allPhysicalAssets.length;
const mbSaved = (savedBytes / (1024 * 1024)).toFixed(2);

console.log(`[+] Tổng số file tài nguyên hiện có: ${totalPhysical}`);
console.log(`[+] Tổng số file thực sự được nhắm tới: ${totalUsed}`);
console.log(`[!] ĐÃ XÓA: ${deletedCount} file rác.`);
console.log(`[★] TIẾT KIỆM ĐƯỢC: ${mbSaved} MB.`);
console.log("=======================================================\n");
