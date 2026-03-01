const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// The ultimate fix:
// 1. We will forcibly rewrite the HTML of the delete buttons to be completely pure and untrackable by main.js
// 2. We will nuke `main.js` and `checkout.js` from cart.html completely because they depend on Server API cookies which we don't have.
// Let's strip checkout.js and main.js from this specific page. They are making CORS requests and resetting our counts!
html = html.replace(
  /<script[^>]*src="[^"]*main\.js"[^>]*><\/script>/i,
  "<!-- main.js removed for offline static cart -->",
);
html = html.replace(
  /<script[^>]*src="[^"]*checkout\.js"[^>]*><\/script>/i,
  "<!-- checkout.js removed for offline static cart -->",
);

// Let's rewrite the scriptblock to be totally isolated.
const scriptStart = html.indexOf(
  "<script>\n// We need to override window.remove_cart",
);
if (scriptStart > -1) {
  const endScript = html.substring(scriptStart);

  const updateScript = `
<script>
// Prevent any external remove_cart triggers
window.remove_cart = function() { return false; };

$(document).ready(function() {
    // 1. Force the HTML to be clean so no external script binds to it
    $('.item_cart a:has(.fa-trash-alt)').each(function() {
        $(this).attr('onclick', null);
        $(this).attr('class', 'btn-delete-static btn btn-sm btn-outline-danger border-0');
        $(this).attr('href', 'javascript:void(0)');
    });

    // 2. Fix the nested Hotline issue found by the subagent
    // The subagent found: <a href="tel:0367006412" ...> <a href="tel:...">
    // Let's just strip inner anchor tags from the hotline_info programmatically
    $('.hotline_info a').each(function() {
        var text = $(this).text();
        $(this).replaceWith('<span>' + text + '</span>');
    });

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
        // Force rewrite the DOM directly
        $('.cart-heading').html('Giỏ hàng ( <span class=\"count\">' + count + '</span> sản phẩm)');
        $('.cart-number').text(count);
    }

    // 3. Bind our bulletproof delete event
    $(document).on('click', '.btn-delete-static', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        var item = $(this).closest('.item_cart');
        item.fadeOut(300, function() {
            $(this).remove();
            
            var remain = getRemainingCount();
            updateHeaders(remain);
            calculateTotal();
            
            if (remain === 0) {
                // Wipe the cart wrapper and show empty state
                $('.cart-container, .wrapper > .container').html('<div class="text-center p-5 mt-5 bg-white rounded shadow-sm"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><p class="text-muted mb-4">Hãy quay lại trang chủ để chọn thêm những cuốn sách hay.</p><a href="index.html" class="btn btn-primary px-4 py-2">Tiếp tục mua sắm</a></div>');
            }
        });
        return false;
    });

    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateTotal();
    });

    // Run counting twice with a slight delay to override any straggling scripts
    var initialCount = getRemainingCount();
    updateHeaders(initialCount);
    calculateTotal();
    
    setTimeout(function() {
        updateHeaders(getRemainingCount());
        calculateTotal();
    }, 500);
});
</script>
</body>`;

  html = html.replace(endScript, updateScript);
}

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log(
  "Removed main.js and checkout.js to prevent interference. Bound raw jQuery cart logic.",
);
