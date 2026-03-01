const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// 1. Fix duplicated hotline. The original index.html has only one <div class="hotline_info">.
// Let's just remove ALL <a ... hotline ...> blocks and insert exactly ONE at the right place.
const headerRightStart = html.indexOf(
  '<div class="header_right d-flex align-items-center">',
);
if (headerRightStart > -1) {
  // delete old ones heuristically (up to 3 hotlines maybe)
  html = html.replace(/<a[^>]*hotline[^>]*>[\s\S]*?<\/a>/gi, "");

  // Now insert the correct one right after header_right
  const insertPoint =
    headerRightStart +
    '<div class="header_right d-flex align-items-center">'.length;

  const newHotline = `<a href="tel:0367006412" class="d-inline-flex align-items-center header_hotline blue">
                    <div class="hotline_icon">
                        <i class="fal fa-phone-plus fa-xl"></i>
                    </div>
                    <div class="hotline_info">
                        <p>Hotline</p>
                        <a href="tel:0367006412">0367006412</a>
                    </div>
                </a>`;

  html =
    html.substring(0, insertPoint) + newHotline + html.substring(insertPoint);
}

// 2. Fix the aggressive remove_cart overriding by checkout.js
// We must nuke the onclick attribute entirely from the HTML so checkout.js can't find it.
html = html.replace(
  /onclick="remove_cart\([^)]*\)"/g,
  'class="item_action_cart-btn override-delete"',
);

// Modify the script logic
const scriptStart = html.indexOf(
  "<script>\n$(document).ready(function() {\n    function getRemainingCount()",
);
if (scriptStart > -1) {
  const endScript = html.substring(scriptStart);
  const updateScript = `
<script>
// We need to override window.remove_cart just in case it's called elsewhere
window.remove_cart = function(el, id, typ) { console.log('blocked external remove_cart'); return false; };

$(document).ready(function() {
    function getRemainingCount() {
        return $('.item_cart').length;
    }

    function calculateTotal() {
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
        var formatted = total.toLocaleString('vi-VN') + '₫';
        $('.money-total').text(formatted);
    }

    function updateHeaders(count) {
        $('.cart-heading').html('Giỏ hàng ( <span class=\"count\">' + count + '</span> sản phẩm)');
        $('.cart-number').text(count);
    }

    // Use our new class to bind
    $(document).on('click', '.override-delete', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var item = $(this).closest('.item_cart');
        item.fadeOut(300, function() {
            $(this).remove();
            
            var remain = getRemainingCount();
            updateHeaders(remain);
            calculateTotal();
            
            if (remain === 0) {
                $('.cart-container').html('<div class="text-center p-5"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><a href="index.html" class="btn btn-primary">Tiếp tục mua sắm</a></div>');
            }
        });
        return false;
    });

    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateTotal();
    });

    var initialCount = getRemainingCount();
    updateHeaders(initialCount);
    calculateTotal();
    
    // Fix the "Tất cả" text explicitly if it exists anywhere else
    $('.cart-heading:contains("Tất cả")').html('Giỏ hàng ( <span class=\"count\">' + initialCount + '</span> sản phẩm)');
});
</script>
</body>
`;
  html = html.replace(endScript, updateScript);
}

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log(
  "Successfully applied aggressive patch for hotline and jQuery delete logic.",
);
