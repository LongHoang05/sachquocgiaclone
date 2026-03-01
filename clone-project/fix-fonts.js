const fs = require("fs");
const cssPath =
  "d:/CloneWeb/Clone/clone-project/assets/fontawesome/css/all.min.css";
let css = fs.readFileSync(cssPath, "utf8");
const fontFaces = `
@font-face { font-family: 'Font Awesome 6 Pro'; font-style: normal; font-weight: 900; font-display: block; src: url('../webfonts/fa-solid-900.woff2') format('woff2'), url('../webfonts/fa-solid-900.ttf') format('truetype'); }
@font-face { font-family: 'Font Awesome 6 Pro'; font-style: normal; font-weight: 400; font-display: block; src: url('../webfonts/fa-regular-400.woff2') format('woff2'), url('../webfonts/fa-regular-400.ttf') format('truetype'); }
@font-face { font-family: 'Font Awesome 6 Brands'; font-style: normal; font-weight: 400; font-display: block; src: url('../webfonts/fa-brands-400.woff2') format('woff2'), url('../webfonts/fa-brands-400.ttf') format('truetype'); }
`;
if (!css.includes("@font-face")) {
  fs.writeFileSync(cssPath, fontFaces + css);
  console.log("Injected @font-face rules");
} else {
  console.log("Rules already exist");
}
