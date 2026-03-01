const fs = require("fs");

let cartHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/cart.html",
  "utf8",
);
let indexHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/index.html",
  "utf8",
);

const indexMenuStart = indexHtml.indexOf('<div class="menu_component">');
const indexMenuEnd = indexHtml.indexOf('<div class="section_header-mobile">');
const indexMenuHtml = indexHtml.substring(indexMenuStart, indexMenuEnd);

const cartMenuStart = cartHtml.indexOf('<div class="menu_component">');
const cartMenuEnd = cartHtml.indexOf('<div class="section_header-mobile">');

if (cartMenuStart > -1 && cartMenuEnd > -1) {
  cartHtml =
    cartHtml.substring(0, cartMenuStart) +
    indexMenuHtml +
    cartHtml.substring(cartMenuEnd);
}

cartHtml = cartHtml.replace(
  "</head>",
  '<link rel="stylesheet" href="assets/css/custom-checkout-mock.css">\n</head>',
);
cartHtml = cartHtml.replace(
  "</body>",
  '<script src="assets/js/custom-checkout-mock.js"></script>\n</body>',
);
cartHtml = cartHtml.replace(
  "$(document).ready(function(){checkout.init();checkout.voucher();})",
  "$(document).ready(function(){checkout.voucher();})",
);

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", cartHtml);
console.log("Done!");
