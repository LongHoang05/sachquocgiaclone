const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// Replace the previous custom cart script with a more precise one
const startIdx = html.indexOf(
  "<script>\n$(document).ready(function() {\n    function calculateTotal()",
);
if (startIdx > -1) {
  const endScript = html.substring(startIdx);

  // Create the updated script
  const updateScript = `
<script>
$(document).ready(function() {
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

    // Capture clicks on the trash icon wrapper anchor instead of nonexistent class
    $(document).on('click', 'a[onclick^="remove_cart"]', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var item = $(this).closest('.item_cart');
        item.fadeOut(300, function() {
            $(this).remove();
            
            var remain = $('.item_cart').length;
            $('.cart-heading').text('Giỏ hàng (' + remain + ' sản phẩm)');
            $('.cart-number').text(remain);
            
            calculateTotal();
            
            if (remain === 0) {
                $('.cart-container, .wrapper .container').first().html('<div class="text-center p-5"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><a href="index.html" class="btn btn-primary">Tiếp tục mua sắm</a></div>');
            }
        });
    });

    // Also override the inline remove_cart broadly just in case it fires before the event handler
    window.remove_cart = function(el, id, typ) {
        // the generic handler above usually catches it first with preventDefault/stopPropagation
    };

    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateTotal();
    });

    var count = $('.item_cart').length;
    if(count > 0) {
        $('.cart-heading').text('Giỏ hàng (' + count + ' sản phẩm)');
        $('.cart-number').text(count);
    }
});
</script>
</body>
`;
  // Replace the old injected bottom script
  html = html.replace(endScript, updateScript);

  // Oh, one important thing: remove the inline onclicks so they don't throw errors
  html = html.replace(
    /onclick="remove_cart[^"]*"/g,
    'class="item_action_cart-btn"',
  );

  fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
  console.log(
    "Successfully repatched the cart HTML to handle deletions correctly.",
  );
} else {
  console.log("Could not find the previous script block.");
}
