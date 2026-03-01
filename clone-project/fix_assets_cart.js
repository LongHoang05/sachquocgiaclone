const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// The HTML uses single quotes or double quotes, so replace the exact string
html = html.split('"/content/assets/').join('"assets/');
html = html.split("'/content/assets/").join("'assets/");

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log("Done fixing assets");
