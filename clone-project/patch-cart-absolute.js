const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// Strip all custom js (except jquery/bootstrap/owl)
html = html.replace(
  /<script[^>]*src="[^"]*(site|main|checkout)\.js[^>]*><\/script>/gi,
  "<!-- js removed -->",
);

// Re-write the internal script correctly for total isolation
const scriptStart = html.indexOf("<script>\n// Prevent any external");
if (scriptStart > -1) {
  const endScript = html.substring(scriptStart);

  const updateScript = `
<script>
window.remove_cart = function() { return false; };

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

    // Attach to the actual button explicitly, since we modified it last patch to 'btn-delete-static'
    $(document).on('click', '.btn-delete-static', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var item = $(this).closest('.item_cart');
        item.fadeOut(300, function() {
            $(this).remove(); // Remove item from DOM immediately
            
            // Recalculate synchronously
            var remain = $('.item_cart').length;
            updateHeaders(remain);
            calculateTotal();
            
            if (remain === 0) {
                $('.cart-container, .wrapper > .container').html('<div class="text-center p-5 mt-5 bg-white rounded shadow-sm"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><p class="text-muted mb-4">Hãy quay lại trang chủ để chọn thêm những cuốn sách hay.</p><a href="index.html" class="btn btn-primary px-4 py-2">Tiếp tục mua sắm</a></div>');
            }
        });
    });

    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateTotal();
    });

    var initialCount = getRemainingCount();
    updateHeaders(initialCount);
    calculateTotal();
});
</script>
</body>`;

  html = html.replace(endScript, updateScript);
}

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log("Main JS decoupled successfully.");
