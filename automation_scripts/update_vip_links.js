const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const projectDir = path.join(__dirname, "clone-project");
const paymentFile = "payment-vip-29.html";

// Helper to recursively get all HTML files
function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== "assets" && file !== "node_modules") {
        getAllHtmlFiles(fullPath, fileList);
      }
    } else if (fullPath.endsWith(".html")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const htmlFiles = getAllHtmlFiles(projectDir);
let filesModified = 0;
let linksModified = 0;

htmlFiles.forEach((file) => {
  try {
    const htmlContent = fs.readFileSync(file, "utf8");
    const $ = cheerio.load(htmlContent);
    let modified = false;

    $("a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      // Find links with text "nâng cấp tài khoản" (case-insensitive) or href containing payment-vip
      if (
        text.toLowerCase().includes("nâng cấp tài khoản") ||
        (href && href.includes("payment-vip"))
      ) {
        // Calculate relative path
        const fileDir = path.dirname(file);
        const targetPath = path.join(projectDir, paymentFile);
        let relativePath = path.relative(fileDir, targetPath);

        // Normalize slashes for web
        relativePath = relativePath.replace(/\\/g, "/");

        $(el).attr("href", relativePath);
        modified = true;
        linksModified++;
      }
    });

    if (modified) {
      fs.writeFileSync(file, $.html(), "utf8");
      filesModified++;
    }
  } catch (err) {
    console.error(`Error processing file ${file}:`, err);
  }
});

console.log(
  `Successfully updated ${linksModified} 'Nâng cấp tài khoản' links across ${filesModified} files.`,
);
