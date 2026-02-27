const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const projectDir = path.join(__dirname, "clone-project");

// The 2 target files
const targetFiles = [
  path.join(projectDir, "mien-nam-b14870.html"),
  path.join(projectDir, "nguoi-ban-hoi-an-b14793.html"),
];

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

htmlFiles.forEach((file) => {
  try {
    const htmlContent = fs.readFileSync(file, "utf8");
    const $ = cheerio.load(htmlContent);
    let modified = false;

    $(".content_item a").each((i, el) => {
      // Pick a random target file
      const randomTarget =
        targetFiles[Math.floor(Math.random() * targetFiles.length)];

      // Calculate relative path from current file's directory to the target file
      const fileDir = path.dirname(file);
      let relativePath = path
        .relative(fileDir, randomTarget)
        .replace(/\\/g, "/");

      $(el).attr("href", relativePath);
      $(el).removeAttr("target"); // remove target blank if exist

      modified = true;
      totalLinksModified++;
    });

    if (modified) {
      fs.writeFileSync(file, $.html(), "utf8");
    }
  } catch (err) {
    console.error(`Error processing file ${file}:`, err);
  }
});

console.log(
  `Successfully randomized ${totalLinksModified} links inside .content_item elements across ${htmlFiles.length} files.`,
);
