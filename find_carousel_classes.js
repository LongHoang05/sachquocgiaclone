const fs = require("fs");
const cheerio = require("cheerio");
const html = fs.readFileSync("clone-project/index.html", "utf8");
const $ = cheerio.load(html);

// Find elements with owl in class
const owlEls = [];
$("[class]").each((i, el) => {
  const cls = $(el).attr("class");
  if (cls && cls.includes("owl")) {
    owlEls.push(el.tagName + "." + cls.substring(0, 100));
  }
});
// Unique
const unique = [...new Set(owlEls)];
fs.writeFileSync(
  "carousel_result.txt",
  "OWL CLASSES:\n" + unique.join("\n") + "\n\nSECTIONS WITH >4 ITEMS:\n",
  "utf8",
);

// Find sections with many items (carousel candidates)
$(".section-dt, section, .section, .home-slider, .collection-slider").each(
  (i, el) => {
    const items = $(el).find(".item, .owl-item");
    if (items.length > 2) {
      const cls = $(el).attr("class") || "";
      const heading = $(el)
        .find("h2, h3")
        .first()
        .text()
        .trim()
        .substring(0, 80);
      fs.appendFileSync(
        "carousel_result.txt",
        `${el.tagName}.${cls.substring(0, 80)} | ${items.length} items | "${heading}"\n`,
      );
    }
  },
);

console.log("Done! Check carousel_result.txt");
