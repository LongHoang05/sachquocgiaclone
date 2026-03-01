const fs = require("fs");
let cartHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/cart.html",
  "utf8",
);
cartHtml = cartHtml.replace(
  /<input[^>]*ticket-discount\.svg[^>]*>/,
  '<i class="fa-solid fa-ticket-alt" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); z-index: 10; color: #AA8B47;"></i>',
);
cartHtml = cartHtml.replace(
  /<img[^>]*ticket-discount\.svg[^>]*>/,
  '<i class="fa-solid fa-ticket-alt" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); z-index: 10; color: #AA8B47;"></i>',
);
fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", cartHtml);
console.log("Fixed cart ticket icon.");

let payHtml = fs.readFileSync(
  "d:/CloneWeb/Clone/clone-project/payment-vip-29.html",
  "utf8",
);
const forceExclusivityScript = `
<script>
$(document).ready(function() {
    // Override click behavior to force exclusivity
    $('.wrapper').on('click', '.card-active-check', function(e) {
        $('.card-active-check').removeClass('checked').attr('data-input', 'false');
        $(this).addClass('checked').attr('data-input', 'true');
        $('.card-active-check').find('input[type="radio"]').prop('checked', false);
        $(this).find('input[type="radio"]').prop('checked', true);
    });
});
</script>
</body>`;
payHtml = payHtml.replace("</body>", forceExclusivityScript);
fs.writeFileSync(
  "d:/CloneWeb/Clone/clone-project/payment-vip-29.html",
  payHtml,
);
console.log("Fixed payment exclusivity logic.");
