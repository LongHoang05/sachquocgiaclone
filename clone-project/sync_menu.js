const fs = require("fs");

let indexHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/index.html",
  "utf8",
);
let cartHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/cart.html",
  "utf8",
);

const startIndexKey = '<div class="menu_component">';
let indexStart = indexHtml.indexOf(startIndexKey);
let indexEnd = indexHtml.indexOf(
  '<div class="section section-dt book-hot-home mb-3">',
);

const startCartKey = '<div class="menu_component">';
let cartStart = cartHtml.indexOf(startCartKey);
let cartEnd = cartHtml.indexOf("<!-- offline -->"); // usually before brcrumb
if (cartEnd === -1) cartEnd = cartHtml.indexOf('<div class="brcrumb">');

if (indexStart > -1 && indexEnd > -1 && cartStart > -1 && cartEnd > -1) {
  let newHeader = indexHtml.substring(indexStart, indexEnd);

  // On the cart page, we shouldn't show it as "cart=0", but let my JS update it anyway.
  let newCartHtml =
    cartHtml.substring(0, cartStart) + newHeader + cartHtml.substring(cartEnd);

  fs.writeFileSync(
    "d:/CloneWeb/Clone/clone-project/cart.html",
    newCartHtml,
    "utf8",
  );
  console.log(
    "Successfully synced the header UI from index.html to cart.html without touching the JS.",
  );
} else {
  console.log("Failed to find boundaries:", {
    indexStart,
    indexEnd,
    cartStart,
    cartEnd,
  });
}
