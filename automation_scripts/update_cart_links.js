const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const directoryPath = path.join(__dirname, "clone-project");

function getAllHtmlFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== "assets" && file !== "node_modules") {
        arrayOfFiles = getAllHtmlFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith(".html")) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const htmlFiles = getAllHtmlFiles(directoryPath);

htmlFiles.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  const $ = cheerio.load(content, { decodeEntities: false });
  let modified = false;

  const targetUrl = "/checkout/cart";
  const fallbackUrl = "https://sachquocgia.vn/checkout/cart";

  $("a").each((i, el) => {
    let href = $(el).attr("href");
    if (href === targetUrl || href === fallbackUrl) {
      // Calculate relative path to cart.html
      const fileDir = path.dirname(file);
      const cartHtmlPath = path.join(directoryPath, "cart.html");
      let relativePath = path
        .relative(fileDir, cartHtmlPath)
        .replace(/\\/g, "/");

      $(el).attr("href", relativePath);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, $.html(), "utf8");
    console.log(`Updated cart links in: ${file}`);
  }
});

console.log("Finished updating cart links.");
