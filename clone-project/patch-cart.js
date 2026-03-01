const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// 1. Fix hotline icon
const oldHotline = /<a[^>]*hotline[^>]*>[\s\S]*?<\/a>/i;
const newHotline = `<a href="tel:0367006412" class="d-inline-flex align-items-center header_hotline blue">
                    <div class="hotline_icon">
                        <i class="fal fa-phone-plus fa-xl"></i>
                    </div>
                    <div class="hotline_info">
                        <p>Hotline</p>
                        <a href="tel:02466635678">0367006412</a>
                    </div>
                </a>`;
html = html.replace(oldHotline, newHotline);

// 2. Fix links (liên kết không đúng)
// Replace root / with index.html for local linking
html = html.replace(/href="\/"/g, 'href="index.html"');
html = html.replace(/href='\/'/g, 'href="index.html"');
// Replace specific checkout cart links
html = html.replace(/href="\/checkout\/cart"/g, 'href="cart.html"');
// Fix any remaining absolute paths starting with / if needed, but primarily the home links are the issues.
// Let's specifically fix breadcrumb home
html = html.replace(
  /<a[^>]*href="\/">Trang chủ<\/a>/gi,
  '<a href="index.html">Trang chủ</a>',
);
html = html.replace(
  /<a href="\/".*?>\s*<img.*?avatar\/image-.*?\.svg".*?>\s*<\/a>/gi,
  '<a href="index.html"><img src="assets/images/image-2024073118021621.svg"></a>',
);

// 3. Add Cart Item Deletion and Quantitative logic
const appendScript = `
<script>
$(document).ready(function() {
    function calculateTotal() {
        var total = 0;
        $('.item_cart').each(function() {
            var checkbox = $(this).find('input[type="checkbox"]');
            if(checkbox.is(':checked') || checkbox.length === 0) {
               // Find the price string
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
        // Need to update the class displaying total
        $('.money-total').text(formatted);
    }

    // Attach to the custom delete button or default trash icon
    $('.item_action_cart-btn').on('click', function(e) {
        e.preventDefault();
        var item = $(this).closest('.item_cart');
        item.fadeOut(300, function() {
            $(this).remove();
            
            // Count remaining
            var remain = $('.item_cart').length;
            $('.cart-heading').text('Giỏ hàng (' + remain + ' sản phẩm)');
            $('.cart-number').text(remain);
            
            calculateTotal();
            
            if (remain === 0) {
                $('.cart_page_content').html('<div class="text-center p-5"><h4 class="mb-3">Giỏ hàng của bạn đang trống</h4><a href="index.html" class="btn btn-primary">Tiếp tục mua sắm</a></div>');
            }
        });
    });

    // Bind checkbox recalculation
    $('.custom-control-input').on('change', function() {
        calculateTotal();
    });

    // Initial count
    var count = $('.item_cart').length;
    $('.cart-heading').text('Giỏ hàng (' + count + ' sản phẩm)');
    $('.cart-number').text(count);
});
</script>
</body>
`;

html = html.replace("</body>", appendScript);

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log("Cart HTML explicitly patched for icons, links, and cart math.");
