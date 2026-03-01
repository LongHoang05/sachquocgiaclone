const fs = require("fs");

let indexHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/index.html",
  "utf8",
);
let cartHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/cart.html",
  "utf8",
);

// Find header in index.html
let headerStart = indexHtml.indexOf("<header");
let headerEnd = indexHtml.indexOf("</header>") + "</header>".length;
let indexHeader = indexHtml.substring(headerStart, headerEnd);

// Find header in cart.html
let cartHeaderStart = cartHtml.indexOf("<header");
let cartHeaderEnd = cartHtml.indexOf("</header>") + "</header>".length;

if (headerStart > -1 && cartHeaderStart > -1) {
  // Replace the header in cart.html with the one from index.html
  let newCartHtml =
    cartHtml.substring(0, cartHeaderStart) +
    indexHeader +
    cartHtml.substring(cartHeaderEnd);

  // However, on the cart page, the cart icon link in the header should probably just point to cart.html, or remain as is.
  // In index.html, it's <a href="cart.html" class="header-icon cart">
  // So it's fine.

  fs.writeFileSync(
    "d:/CloneWeb/Clone/clone-project/cart.html",
    newCartHtml,
    "utf8",
  );
  console.log("Header from index.html successfully copied to cart.html");
} else {
  console.log("Could not find header tags in one or both files.");
}
