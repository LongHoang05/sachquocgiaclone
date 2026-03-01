const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// 1. Fix the hotline nested <a> tag.
// We injected: <div class="hotline_info"><p>Hotline</p><a href="tel:02466635678">0367006412</a></div>
// inside an <a> tag! That is illegal HTML and browsers split it.
// Let's replace the whole header_hotline block spanning lines with a proper <div> wrapper instead of <a> wrapper.
html = html.replace(
  /<a href="tel:0367006412" class="d-inline-flex align-items-center header_hotline blue">[\s\S]*?<\/a>/i,
  `<div class="d-inline-flex align-items-center header_hotline blue">
    <div class="hotline_icon">
        <i class="fal fa-phone-plus fa-xl"></i>
    </div>
    <div class="hotline_info">
        <p>Hotline</p>
        <a href="tel:0367006412">0367006412</a>
    </div>
</div>`,
);

// Also wipe the empty hotline_info we saw below it in the DOM log
html = html.replace(/<div class="hotline_info">\s*<\/div>/g, "");

// Prevent checkout.js
html = html.replace(
  /<script[^>]*src="[^"]*checkout\.js"[^>]*><\/script>/i,
  "<!-- checkout.js removed -->",
);
html = html.replace(
  /<script[^>]*src="[^"]*main\.js"[^>]*><\/script>/i,
  "<!-- main.js removed -->",
);

// 2. Final Vanilla+jQuery script to handle the cart logic with extreme prejudice.
const scriptStart = html.indexOf("<script>\nwindow.remove_cart");
if (scriptStart > -1) {
  const endScript = html.substring(scriptStart);

  const newScript = `
<script>
window.remove_cart = function() { return false; };
$(document).ready(function() {
    // Nuke inline handlers on the trash buttons globally
    $('.btn-delete-static, .item_action_cart-btn').removeAttr('onclick');
    
    function calculateCart() {
        var count = $('.item_cart').length;
        
        // Update headers directly
        $('.cart-heading').html('Giỏ hàng ( <span class="count">' + count + '</span> sản phẩm)');
        $('.cart-number').text(count);
        
        var total = 0;
        $('.item_cart').each(function() {
            var checkbox = $(this).find('input[type="checkbox"]');
            if(checkbox.is(':checked') || checkbox.length === 0) {
               var priceSpan = $(this).find('.info-price strong');
               if(priceSpan.length) {
                   var priceText = priceSpan.text().replace(/\\./g, '').replace('₫', '').trim();
                   if(!isNaN(parseInt(priceText))) {
                       total += parseInt(priceText);
                   }
               }
            }
        });
        $('.money-total').text(total.toLocaleString('vi-VN') + '₫');
        
        if (count === 0) {
            $('.cart-container, .wrapper > .container').html('<div class="text-center p-5 mt-5 bg-white rounded shadow-sm"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><p class="text-muted mb-4">Hãy quay lại trang chủ để chọn thêm những cuốn sách hay.</p><a href="index.html" class="btn btn-primary px-4 py-2">Tiếp tục mua sắm</a></div>');
        }
    }

    // Attach click listener
    $(document).on('click', '.btn-delete-static', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        var row = $(this).closest('.item_cart');
        row.fadeOut(300, function() {
            $(this).remove();
            calculateCart();
        });
        return false; // prevent bubling
    });
    
    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateCart();
    });

    // Run calculation loops aggressively to override external scripts that might run async
    calculateCart();
    setTimeout(calculateCart, 200);
    setTimeout(calculateCart, 1000);
});
</script>
</body>`;

  html = html.replace(endScript, newScript);
}

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log(
  "Fixed illegal nested <a> tags for Hotline and implemented absolute cart calculator logic.",
);
