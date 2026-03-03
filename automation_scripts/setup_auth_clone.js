const fs = require("fs");
const path = require("path");

let content = fs.readFileSync("clone_spa.js", "utf8");

const pagesRegex = /const PAGES = \[[\s\S]*?\];/;
const newPages = `const PAGES = [
  { path: "/checkout/cart", file: "cart.html", wait: 8000 },
  { path: "/checkout/payment-vip/29", file: "payment-vip-29.html", wait: 8000 }
];`;

content = content.replace(pagesRegex, newPages);

fs.writeFileSync("clone_auth_pages_temp.js", content);
console.log("Created clone_auth_pages_temp.js");
