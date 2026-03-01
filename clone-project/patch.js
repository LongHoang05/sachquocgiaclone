const fs = require("fs");

// Patch 1: cart.html ticket icon
let cartHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/cart.html",
  "utf8",
);
cartHtml = cartHtml.replace(
  '<input src="assets/icons/ticket-discount.svg" type="image"/>',
  '<img src="assets/icons/ticket-discount.svg" alt="Ticket" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; pointer-events: none; z-index: 10;">',
);
fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", cartHtml);
console.log("Patched cart.html ticket icon");

// Patch 2: payment-vip-29.html exclusivity
let payHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/payment-vip-29.html",
  "utf8",
);
const oldScript = `$('.card-active-check').click(function () {
                  var that = $(this);
                  var isCheck = that.attr('data-input');
                  if (isCheck == 'false') {
                    that.addClass("checked");
                    that.attr('data-input','true');
                  } else {
                    that.removeClass("checked");
                    that.attr('data-input', 'false');
                  }
                })`;

const newScript = `$('.card-active-check').click(function () {
                  var that = $(this);
                  $('.card-active-check').removeClass("checked").attr('data-input', 'false');
                  that.addClass("checked").attr('data-input','true');
                })`;

// Sometimes it's minified in the HTML, so let's do a more robust regex if the exact string isn't found
if (payHtml.includes("if (isCheck == 'false') {")) {
  payHtml = payHtml.replace(oldScript, newScript);
} else {
  // Regex fallback
  payHtml = payHtml.replace(
    /\$\('\.card-active-check'\)\.click\(function \(\) \{[\s\S]*?\}\)/,
    newScript,
  );
}

fs.writeFileSync(
  "d:/CloneWeb/Clone/clone-project/payment-vip-29.html",
  payHtml,
);
console.log("Patched payment-vip.html exclusivity");
