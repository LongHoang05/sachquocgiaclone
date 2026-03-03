const fs = require("fs");
const path = require("path");
const files = [
  "d:/CloneWeb/Clone/clone-project/cart.html",
  "d:/CloneWeb/Clone/clone-project/payment-vip-29.html",
];
const dir = "d:/CloneWeb/Clone/clone-project/";
let missing = [];

files.forEach((file) => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");

  // Find all <img src="...">
  const imgRegex = /<img[^>]*src=[\"']([^\"']*)[\"'][^>]*>/gi;
  let m;
  while ((m = imgRegex.exec(content)) !== null) {
    checkAndRecord(m[1], file);
  }

  // Find all background-image: url(...)
  const bgRegex = /background-image:\s*url\([\"']?([^\"'\)]*)[\"']?\)/gi;
  let b;
  while ((b = bgRegex.exec(content)) !== null) {
    checkAndRecord(b[1], file);
  }
});

function checkAndRecord(urlStr, sourceFile) {
  if (urlStr.startsWith("data:") || urlStr.startsWith("http")) return;

  // Sometimes URLs have query parameters like .svg?v=1
  const cleanUrl = urlStr.split("?")[0];

  const fullPath = path.join(dir, cleanUrl);
  if (!fs.existsSync(fullPath)) {
    missing.push({ url: urlStr, cleanUrl: cleanUrl, file: sourceFile });
  }
}

// remove duplicates base on cleanUrl
const uniqueMissing = Array.from(new Set(missing.map((m) => m.cleanUrl))).map(
  (url) => missing.find((m) => m.cleanUrl === url),
);

console.log("Missing images:");
console.log(JSON.stringify(uniqueMissing, null, 2));
