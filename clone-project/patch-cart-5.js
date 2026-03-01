const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// Fix Hotline 2: Just find the second one and aggressively remove it.
const hotlineMatches = html.match(/<a[^>]*hotline[^>]*>[\s\S]*?<\/a>/gi);
if (hotlineMatches && hotlineMatches.length > 1) {
  // Keep the first one, replace following ones with empty string
  for (let i = 1; i < hotlineMatches.length; i++) {
    html = html.replace(hotlineMatches[i], "");
  }
}

// Ensure the remove button no longer clicks out to server
// checkout.js listens to click on a.remove_cart (or specific class).
// We'll strip the class from the trash button entirely and just use a unique ID or custom class that checkout.js knows nothing about.
html = html.replace(
  /class="item_action_cart-btn override-delete"/g,
  'class="local-delete-btn" style="cursor:pointer;"',
);
// If there are any stray onclick string
html = html.replace(/onclick="[^"]*"/g, "");

const scriptStart = html.indexOf("<script>\n// We need to override");
if (scriptStart > -1) {
  const endScript = html.substring(scriptStart);
  const updateScript = `
<script>
$(document).ready(function() {
    // Force unbind any existing cart delete listeners on the document body
    $(document).off('click', '.item_action_cart-btn');
    $(document).off('click', '.remove_cart');

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
        // Find the title element explicitly
        var heading = $('.cart-heading');
        if (heading.length) {
            heading.html('Giỏ hàng ( <span class=\"count\">' + count + '</span> sản phẩm)');
        }
        $('.cart-number').text(count);
    }

    // Direct binding to the customized trash button class
    $(document).on('click', '.local-delete-btn', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
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
        return false;
    });

    $('.custom-control-input, input[type="checkbox"]').on('change', function() {
        calculateTotal();
    });

    var initialCount = getRemainingCount();
    updateHeaders(initialCount);
    calculateTotal();
});
</script>
</body>
`;
  html = html.replace(endScript, updateScript);
}

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log(
  "Final patch for jQuery event listeners and duplicate UI blocks applied.",
);
