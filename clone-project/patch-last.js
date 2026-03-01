const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// The ultimate ultimate fix. We don't try to find my old injected string.
// Let's strip out my old injected scripts completely first.
html = html.replace(/<script>\s*window\.remove_cart[\s\S]*?<\/script>/im, "");

// Now we inject exactly before </body>
const script = `
<script>
window.remove_cart = function() { return false; }; // block global

document.addEventListener("DOMContentLoaded", function() {
    function calculateCartRaw() {
        var cartItems = document.querySelectorAll('.cart-item');
        var count = cartItems.length;
        
        // Update counts
        var cartNumbers = document.querySelectorAll('.cart-number');
        for (let i = 0; i < cartNumbers.length; i++) {
            cartNumbers[i].innerText = count;
        }
        
        // Find the 'Giỏ hàng (0sản phẩm)' text and fix it
        var headings = document.querySelectorAll('.cart-heading h4.heading, .HeadingCard');
        for (let i = 0; i < headings.length; i++) {
            if (headings[i].innerHTML.includes('sản phẩm')) {
               headings[i].innerHTML = 'Giỏ hàng ( <span class="cart-number" style="color:red; font-weight:bold;">' + count + '</span> sản phẩm )';
            }
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
            var conts = document.querySelectorAll('.cart-wrapper'); // replace the table inside
            for(let i=0; i<conts.length; i++) {
                conts[i].innerHTML = '<div style="text-align:center; padding: 50px;"><h4 style="margin-bottom:20px;">Giỏ hàng của bạn đang trống</h4><a href="index.html" style="background:#007bff; color:white; padding:10px 20px; border-radius:5px; text-decoration:none;">Tiếp tục mua sắm</a></div>';
            }
        }
    }
    
    // Bind click events manually
    document.body.addEventListener('click', function(e) {
        var btn = e.target.closest('a:has(.fa-trash-alt), .btn-delete-static'); // very permissive delete target
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
    }, true); 
    
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
`;

html = html.replace("</body>", script + "\n</body>");
fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", html);
console.log("Forcefully injected script before </body>");
