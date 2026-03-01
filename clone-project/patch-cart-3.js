const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// Find the previously injected script
const startIdx = html.indexOf(
  "<script>\n$(document).ready(function() {\n    function calculateTotal()",
);
if (startIdx > -1) {
  const endScript = html.substring(startIdx);

  // Create the updated script to match correct DOM nodes and text
  const updateScript = `
<script>
$(document).ready(function() {
    function getRemainingCount() {
        return $('.item_cart').length;
    }

    function calculateTotal() {
        var total = 0;
        $('.item_cart').each(function() {
            var checkbox = $(this).find('input[type="checkbox"]');
            if(checkbox.is(':checked') || $.trim($(this).find('input[type="checkbox"]').html()) == '') {
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
        // Update the big header at top
        $('.cart-heading').html('Tất cả ( <span class=\"count\">' + count + '</span> sản phẩm)');
        // Update the red badge
        $('.cart-number').text(count);
    }

    // Capture clicks on the trash icon wrapper anchor instead of nonexistent class
    $(document).on('click', 'a[onclick^="remove_cart"], .item_action_cart-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var item = $(this).closest('.item_cart');
        item.fadeOut(300, function() {
            $(this).remove();
            
            var remain = getRemainingCount();
            updateHeaders(remain);
            calculateTotal();
            
            if (remain === 0) {
                $('.cart-container, .wrapper .container').first().html('<div class="text-center p-5"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><a href="index.html" class="btn btn-primary">Tiếp tục mua sắm</a></div>');
            }
        });
    });

    window.remove_cart = function(el, id, typ) {};

    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateTotal();
    });

    // Initial setting based on exactly how many there are in the static HTML!
    var initialCount = getRemainingCount();
    updateHeaders(initialCount);
    calculateTotal();
});
</script>
</body>
`;
  // Replace the old injected bottom script
  html = html.replace(endScript, updateScript);

  fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
  console.log("Successfully patched cart title and calculation script.");
} else {
  console.log("Script block not found!");
}
