const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// Ultimate Vanilla JS patch. No jQuery required.
// We write this right before </body>
const scriptStart = html.indexOf("<script>\nwindow.remove_cart");
if (scriptStart > -1) {
  const endScript = html.substring(scriptStart);

  const plainJsScript = `
<script>
window.remove_cart = function() { return false; };

document.addEventListener("DOMContentLoaded", function() {
    function calculateCartRaw() {
        var cartItems = document.querySelectorAll('.cart-item');
        var count = cartItems.length;
        
        // Update counts
        var cartNumbers = document.querySelectorAll('.cart-number');
        for (let i = 0; i < cartNumbers.length; i++) {
            cartNumbers[i].innerText = count;
        }
        
        // Update Total
        var total = 0;
        for (let i = 0; i < cartItems.length; i++) {
            var item = cartItems[i];
            var checkbox = item.querySelector('input[type="checkbox"]');
            if (!checkbox || checkbox.checked) {
                var priceSpan = item.querySelector('.total-price-show');
                if (priceSpan) {
                    var text = priceSpan.innerText.replace(/\\./g, '').replace('₫', '').trim();
                    var num = parseInt(text);
                    if (!isNaN(num)) total += num;
                }
            }
        }
        
        var moneyGroups = document.querySelectorAll('.header-icon.cart .cart-price, .total-all, .money-total');
        for (let i = 0; i < moneyGroups.length; i++) {
            moneyGroups[i].innerText = total.toLocaleString('vi-VN') + '₫';
        }
        
        // Handle Empty state
        if (count === 0) {
            var conts = document.querySelectorAll('.cart-container, .wrapper > .container');
            for(let i=0; i<conts.length; i++) {
                conts[i].innerHTML = '<div style="text-align:center; padding: 50px;"><h4 style="margin-bottom:20px;">Giỏ hàng của bạn đang trống</h4><a href="index.html" style="background:#007bff; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Tiếp tục mua sắm</a></div>';
            }
        }
    }
    
    // Bind click events manually
    document.body.addEventListener('click', function(e) {
        var btn = e.target.closest('.btn-delete-static');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            var row = btn.closest('.cart-item');
            if (row) {
                row.style.transition = "opacity 0.3s";
                row.style.opacity = "0";
                setTimeout(function() {
                    if(row.parentNode) row.parentNode.removeChild(row);
                    calculateCartRaw();
                }, 300);
            }
            return false;
        }
    }, true); // use capturing phase to guarantee override
    
    // Bind change events manually
    document.body.addEventListener('change', function(e) {
        if (e.target.matches('input[type="checkbox"]')) {
            calculateCartRaw();
        }
    });

    calculateCartRaw();
    setTimeout(calculateCartRaw, 300);
});
</script>
</body>`;

  html = html.replace(endScript, plainJsScript);
}

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log("Injected pure vanilla JS logic.");
