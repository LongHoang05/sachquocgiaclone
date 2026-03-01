const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// We are going to strictly overwrite the script block again with exact class matches
const scriptStart = html.indexOf("<script>\nwindow.remove_cart = function()");
if (scriptStart > -1) {
  const endScript = html.substring(scriptStart);

  // The classes are actually:
  // .cart-item for the row
  // .cart-number for the number spans
  // .money-total or .total-price-show

  const newScript = `
<script>
window.remove_cart = function() { return false; };
$(document).ready(function() {
    
    function calculateCart() {
        var count = $('.cart-item').length;
        
        // Update both the basket icon badge and the table 'Tất cả' header
        $('.cart-number').text(count);
        
        var total = 0;
        $('.cart-item').each(function() {
            var checkbox = $(this).find('input[type="checkbox"]');
            if(checkbox.is(':checked') || checkbox.length === 0) {
               var priceSpan = $(this).find('.total-price-show');
               if(priceSpan.length) {
                   var priceText = priceSpan.text().replace(/\\./g, '').replace('₫', '').trim();
                   if(!isNaN(parseInt(priceText))) {
                       total += parseInt(priceText);
                   }
               }
            }
        });
        
        var totals = $('.header-icon.cart .cart-price, .total-all');
        if (totals.length > 0) {
           totals.text(total.toLocaleString('vi-VN') + '₫');
        }
        
        // If there is another explicit money-total span 
        $('.money-total').text(total.toLocaleString('vi-VN') + '₫');
        
        if (count === 0) {
            $('.cart-container, .wrapper > .container').html('<div class="text-center p-5 mt-5 bg-white rounded shadow-sm"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><p class="text-muted mb-4">Hãy quay lại trang chủ để chọn thêm những cuốn sách hay.</p><a href="index.html" class="btn btn-primary px-4 py-2">Tiếp tục mua sắm</a></div>');
        }
    }

    // Attach click listener directly to the trash anchor icon
    $(document).on('click', '.btn-delete-static', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        var row = $(this).closest('.cart-item');
        row.fadeOut(300, function() {
            $(this).remove();
            calculateCart();
        });
        return false;
    });
    
    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateCart();
    });

    calculateCart(); // initial calculation
});
</script>
</body>`;

  html = html.replace(endScript, newScript);
}

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log(
  "Class names corrected to .cart-item and .total-price-show for accurate JS looping.",
);
