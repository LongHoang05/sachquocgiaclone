const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const projectDir = path.join(__dirname, "clone-project");
const DOMAIN = "sachquocgia.vn";

// 1. Helper function to find all HTML files
function getHtmlFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Ignore assets folder to speed up traversal if it doesn't contain HTML files
      if (file !== "assets") {
        getHtmlFiles(filePath, fileList);
      }
    } else if (filePath.toLowerCase().endsWith(".html")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const htmlFiles = getHtmlFiles(projectDir);

// 2. Build File Map
const fileMap = {};
htmlFiles.forEach((file) => {
  // Relative path from clone-project root, using forward slashes
  const relToRoot = path.relative(projectDir, file).replace(/\\/g, "/");
  const virtualPath = "/" + relToRoot; // e.g. /customer/my-account.html

  // Map full path
  fileMap[virtualPath] = file;

  // Map without .html extension (e.g. /customer/my-account)
  if (virtualPath.endsWith(".html")) {
    fileMap[virtualPath.replace(/\.html$/, "")] = file;
  }

  // Special handling for index.html mapping to root
  if (virtualPath.endsWith("/index.html")) {
    fileMap[virtualPath.replace("/index.html", "/")] = file;
    if (virtualPath === "/index.html") {
      fileMap["/"] = file;
      fileMap[""] = file;
    }
  }
});

// Reporting state
let totalPatched = 0;
const missingLinks = new Set();

// Helper to normalize the URL
function normalizeUrl(href, currentFile) {
  if (!href) return null;
  let urlObj;
  let processedHref = href;
  const lowerHref = href.toLowerCase();

  // Ignore anchors, JS, emails, tel
  if (
    lowerHref.startsWith("javascript:") ||
    lowerHref.startsWith("mailto:") ||
    lowerHref.startsWith("tel:") ||
    lowerHref.startsWith("#")
  ) {
    return null;
  }

  try {
    if (
      lowerHref.startsWith("http://") ||
      lowerHref.startsWith("https://") ||
      lowerHref.startsWith("//")
    ) {
      const protocolHref = lowerHref.startsWith("//") ? "https:" + href : href;
      urlObj = new URL(protocolHref);
      if (
        !urlObj.hostname.includes(DOMAIN) &&
        !urlObj.hostname.includes("localhost")
      ) {
        return null; // Ignore external domains
      }
      // Retain path, string and hash
      processedHref =
        urlObj.pathname + windowOrBrowserContextSearchIfNeeded(urlObj);
      function windowOrBrowserContextSearchIfNeeded(u) {
        return u.search + u.hash;
      } // Helper
    }
  } catch (e) {}

  let pathOnly = processedHref.split("?")[0].split("#")[0];
  if (!pathOnly) return null; // If it's just a query param or hash, usually internal to the page itself

  let virtualPath = "";
  if (pathOnly.startsWith("/")) {
    virtualPath = pathOnly;
  } else {
    // Calculate virtual path relative to the current file's directory
    const currentRelDir = path.dirname(
      "/" + path.relative(projectDir, currentFile).replace(/\\/g, "/"),
    );
    virtualPath = path.posix.join(currentRelDir, pathOnly);
  }

  // Ensure it doesn't end with a trailing slash if it's more than just "/"
  if (virtualPath.length > 1 && virtualPath.endsWith("/")) {
    virtualPath = virtualPath.slice(0, -1);
  }

  return { processedHref, virtualPath };
}

// 3. Scan and Patch Links
htmlFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  const $ = cheerio.load(content, { decodeEntities: false });
  let isModified = false;

  $("a").each((i, el) => {
    const $a = $(el);
    const originalHref = $a.attr("href");

    const parsedContext = normalizeUrl(originalHref, file);
    if (!parsedContext) return; // Skip ignored/external links

    let targetFilePath = fileMap[parsedContext.virtualPath];

    // Improve matching by ID for Bookcases and Books (e.g. -c189 or -b12442)
    if (!targetFilePath) {
      const matchId = parsedContext.virtualPath.match(/-([cb]\d+)(?:\.html)?$/);
      if (matchId) {
        const idExt = matchId[1];
        const matchedKey = Object.keys(fileMap).find(
          (k) => k.endsWith(`-${idExt}`) || k.endsWith(`-${idExt}.html`),
        );
        if (matchedKey) {
          targetFilePath = fileMap[matchedKey];
        }
      }
    }

    if (targetFilePath) {
      // [A] File exists locally! Calculate the relative path from current folder to target folder.
      let relTarget = path
        .relative(path.dirname(file), targetFilePath)
        .replace(/\\/g, "/");
      if (relTarget === "") {
        relTarget = path.basename(targetFilePath);
      }

      // Re-attach query parameters and hashes from the original href
      const qsHashIndex = parsedContext.processedHref.indexOf("?");
      const hashIndex = parsedContext.processedHref.indexOf("#");
      let qsHash = "";

      if (qsHashIndex !== -1 || hashIndex !== -1) {
        const startIndex = qsHashIndex !== -1 ? qsHashIndex : hashIndex;
        qsHash = parsedContext.processedHref.substring(startIndex);
      }

      const localHref = relTarget + qsHash;

      if (originalHref !== localHref) {
        $a.attr("href", localHref);
        isModified = true;
        totalPatched++;
      }
    } else {
      // [B] File NOT found locally (Missing Page)
      missingLinks.add(parsedContext.virtualPath);
      let absHref = originalHref;

      // Make it an absolute link pointing to the live website
      if (originalHref.startsWith("//")) {
        absHref = "https:" + originalHref;
      } else if (originalHref.startsWith("/")) {
        absHref = "https://" + DOMAIN + originalHref;
      } else if (!originalHref.startsWith("http")) {
        const currentRelDir = path.dirname(
          "/" + path.relative(projectDir, file).replace(/\\/g, "/"),
        );
        absHref =
          "https://" + DOMAIN + path.posix.join(currentRelDir, originalHref);
      }

      // Patch the DOM element if needed
      let needsUpdate = false;
      if ($a.attr("href") !== absHref) {
        $a.attr("href", absHref);
        needsUpdate = true;
      }
      if ($a.attr("target") === "_blank") {
        $a.removeAttr("target");
        needsUpdate = true;
      }
      if (needsUpdate) {
        isModified = true;
      }
    }
  });

  if (isModified) {
    fs.writeFileSync(file, $.html(), "utf8");
  }
});

// 4. Report
console.log("\n=======================================================");
console.log("📊 BÁO CÁO ÁNH XẠ LIÊN KẾT (LINK MAPPER LOCAL-LIVE)");
console.log("=======================================================");
console.log(
  `[+] Đã ánh xạ (MAPPED): ${totalPatched} liên kết nội bộ thành công sang đường dẫn Local tương đối.`,
);
console.log(
  `[-] Trang vắng mặt (MISSING): ${missingLinks.size} liên kết nội bộ đã được cấu hình trỏ về Live.\n`,
);

if (missingLinks.size > 0) {
  console.log("--- DANH SÁCH TOP LIÊN KẾT NHIỀU NGƯỜI QUAN TÂM BỊ THIẾU ---");
  const arrMissing = Array.from(missingLinks).sort();

  // Prioritize links like menus or root categories
  const topMissing = arrMissing
    .filter((m) => m.split("/").length <= 2 || m.includes("c"))
    .slice(0, 30);
  topMissing.forEach((link) => {
    console.log(` ➜ https://${DOMAIN}${link}`);
  });

  if (missingLinks.size > topMissing.length) {
    console.log(
      `... và ${missingLinks.size - topMissing.length} liên kết khác.`,
    );
  }
}
console.log("=======================================================\n");
