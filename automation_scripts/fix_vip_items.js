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
    const $ = cheerio.load(htmlContent, { decodeEntities: false });
    let modified = false;

    // Find h3 elements that say "Nâng cấp tài khoản"
    $("h3").each((i, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text === "nâng cấp tài khoản") {
        // Find the closest parent that wraps the entire section
        const section = $(el).closest(".book_content");
        if (section.length > 0) {
          // Find all anchor tags within this section
          section.find("a").each((j, aEl) => {
            const aText = $(aEl).text().trim().toLowerCase();
            // Ignore links that might be "Xem toàn bộ" or similar
            if (!aText.includes("xem toàn bộ")) {
              const fileDir = path.dirname(file);
              const targetPath = path.join(projectDir, paymentFile);
              let relativePath = path.relative(fileDir, targetPath);
              relativePath = relativePath.replace(/\\/g, "/");

              $(aEl).attr("href", relativePath);
              $(aEl).removeAttr("target");
              modified = true;
              linksModified++;
            }
          });
        }
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
  `Successfully updated ${linksModified} item links across ${filesModified} files.`,
);
