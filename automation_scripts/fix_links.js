/**
 * Post-processing script: Fix internal links trong HTML files
 * Chuyển /ten-trang → ten-trang.html để điều hướng offline
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const OUTPUT_DIR = path.join(__dirname, "clone-project");

// Map: path pattern → local HTML filename
const PAGE_MAP = {
  "/": "index.html",
  "": "index.html",
  "/mien-nam-trong-trai-tim-ho-chi-minh-b14870.html": "mien-nam-b14870.html",
  "/nguoi-ban-duong-du-lich-van-hoa-hoi-an-b14793.html":
    "nguoi-ban-hoi-an-b14793.html",
  "/tat-ca-danh-muc": "tat-ca-danh-muc.html",
  "/checkout/cart": "cart.html",
  "/tu-sach-bac-ho-c214": "tu-sach-bac-ho-c214.html",
  "/tu-sach-nhan-vat-c189": "tu-sach-nhan-vat-c189.html",
  "/tu-sach-ly-luan-chinh-tri-c191": "tu-sach-ly-luan-chinh-tri-c191.html",
  "/tu-sach-luat-c202": "tu-sach-luat-c202.html",
  "/sach-luat-tham-khao-c205": "sach-luat-tham-khao-c205.html",
  "/tu-sach-giao-trinh-va-tai-lieu-hoc-tap-c203":
    "tu-sach-giao-trinh-c203.html",
  "/tu-sach-ban-chi-dao-35-c199": "tu-sach-ban-chi-dao-35-c199.html",
  "/tu-sach-chi-bo-c193": "tu-sach-chi-bo-c193.html",
  "/tu-sach-giao-trinh-ly-luan-chinh-tri-danh-cho-bac-dai-hoc-c229":
    "tu-sach-gt-dai-hoc-c229.html",
  "/ebook/14793": "ebook-14793.html",
};

const HTML_FILES = fs
  .readdirSync(OUTPUT_DIR)
  .filter((f) => f.endsWith(".html") && !f.startsWith("_"))
  .map((f) => path.join(OUTPUT_DIR, f));

let totalLinksFixed = 0;

for (const filePath of HTML_FILES) {
  const content = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(content, { decodeEntities: false });

  let changed = false;

  $("a[href]").each((i, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    // Check if this is an internal link that matches our page map
    for (const [pattern, localFile] of Object.entries(PAGE_MAP)) {
      if (
        href === pattern ||
        href === `//sachquocgia.vn${pattern}` ||
        href === `https://sachquocgia.vn${pattern}`
      ) {
        $(el).attr("href", localFile);
        changed = true;
        totalLinksFixed++;
        break;
      }
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, $.html(), "utf8");
    console.log(`✓ Fixed links in: ${path.basename(filePath)}`);
  }
}

console.log(`\n✅ Total links fixed: ${totalLinksFixed}`);
console.log("Post-processing complete!");
