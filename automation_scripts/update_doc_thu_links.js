const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const projectDir = path.join(__dirname, "clone-project");
const newHref = "https://sachdientu.nxbhanoi.com.vn/ebook-free/12661/0/1";

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
let totalLinksModified = 0;
let filesModified = 0;

htmlFiles.forEach((file) => {
  try {
    const htmlContent = fs.readFileSync(file, "utf8");
    const $ = cheerio.load(htmlContent);
    let modified = false;

    // Find all anchor tags
    $("a").each((i, el) => {
      const text = $(el).text().trim();
      // Check if the text is exactly or contains "Đọc thử"
      if (text.includes("Đọc thử")) {
        $(el).attr("href", newHref);
        // We probably shouldn't add target="_blank" unless they asked,
        // they said "tất cả nút đọc thử đều link đến trang này cho tôi"
        // Let's add target="_blank" just in case since it's an external link,
        // Wait, earlier they said "tôi muốn tất cả đều mở cùng trang đó chứ không phải new tab nhé",
        // so NO target="_blank". Let's remove it if it exists.
        $(el).removeAttr("target");
        modified = true;
        totalLinksModified++;
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
  `Successfully updated ${totalLinksModified} 'Đọc thử' links across ${filesModified} files.`,
);
