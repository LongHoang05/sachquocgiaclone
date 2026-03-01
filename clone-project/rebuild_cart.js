const fs = require("fs");
let cartHtml = fs.readFileSync("cart.html", "utf8");
let indexHtml = fs.readFileSync("index.html", "utf8");

// 1. Sync the exact header from index.html to cart.html
const indexMenuStart = indexHtml.indexOf('<div class=\"menu_component\">');
const indexMenuEnd = indexHtml.indexOf('<div class=\"section_header-mobile\">');
const indexMenuHtml = indexHtml.substring(indexMenuStart, indexMenuEnd);

const cartMenuStart = cartHtml.indexOf('<div class=\"menu_component\">');
const cartMenuEnd = cartHtml.indexOf('<div class=\"section_header-mobile\">');

cartHtml =
  cartHtml.substring(0, cartMenuStart) +
  indexMenuHtml +
  cartHtml.substring(cartMenuEnd);

// 2. Build the exact cart item table mock
const cartItemsBlock = `
<form id="frmCart">
    <div class="cart-table cart-bg-white mb-2">
        <div class="cart-heading d-flex align-items-center justify-content-between p-3 border_bottom">
            <div class="d-flex align-items-center">
                <h3 class="h3-20 text-uppercase mb-0 bold text-black">Tất cả</h3>
                <span class="body-13 quantity-order-text color-8C8C8C ml-1">(2 sản phẩm)</span>
            </div>
        </div>
        <div class="cart-body cart-list-content">
            <div class="cart-item d-flex p-3 border_bottom" data-id="1">
                <div class="cart-item-info d-flex flex-grow-1">
                    <label class="checkbox-container mt-2 mr-3">
                        <input type="checkbox" name="ckcart" class="ckcart" value="1" checked>
                        <span class="checkmark"></span>
                    </label>
                    <div class="item-image mr-3" style="width: 100px;">
                        <img src="assets/images/image-20240313100409299.jpg" class="w-100">
                    </div>
                    <div class="item-details d-flex flex-column justify-content-center">
                        <h4 class="h4-16 bold text-black mb-1">Quyết tâm ngăn chặn và đẩy lùi tham nhũng</h4>
                        <p class="body-14 color-8C8C8C mb-1">Tác giả: Nguyễn Phú Trọng</p>
                        <p class="h6-14 bold color-AA8B47">24.800₫</p>
                    </div>
                </div>
                <div class="cart-item-action d-flex align-items-center">
                    <button type="button" class="btn btn-delete-static js-delete-item-cart p-2" style="background: none; border: none; outline: none; box-shadow: none;">
                        <i class="far fa-trash-alt fa-lg text-danger"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item d-flex p-3 border_bottom" data-id="2">
                <div class="cart-item-info d-flex flex-grow-1">
                    <label class="checkbox-container mt-2 mr-3">
                        <input type="checkbox" name="ckcart" class="ckcart" value="2" checked>
                        <span class="checkmark"></span>
                    </label>
                    <div class="item-image mr-3" style="width: 100px;">
                        <img src="assets/images/image-20251030162137031_4.jpg" class="w-100">
                    </div>
                    <div class="item-details d-flex flex-column justify-content-center">
                        <h4 class="h4-16 bold text-black mb-1">Hồ Chủ tịch - Hình ảnh của dân tộc</h4>
                        <p class="body-14 color-8C8C8C mb-1">Tác giả: Phạm Văn Đồng</p>
                        <p class="h6-14 bold color-AA8B47">20.150₫</p>
                    </div>
                </div>
                <div class="cart-item-action d-flex align-items-center">
                    <button type="button" class="btn btn-delete-static js-delete-item-cart p-2" style="background: none; border: none; outline: none; box-shadow: none;">
                        <i class="far fa-trash-alt fa-lg text-danger"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</form>
<style>
.cart-item-info .item-details { max-width: 60%; }
.cart-item-action { margin-left: auto; padding-right: 15px; }
.btn-delete-static { cursor: pointer; }
.btn-delete-static i { color: #dc3545; }
</style>
`;

// 3. Replace the empty cart banner
const emptyStart = cartHtml.indexOf('<div class="cart-none-book-dk');
let nextSection = cartHtml.indexOf('<div class="section', emptyStart);
if (nextSection === -1) {
  nextSection = cartHtml.indexOf("</div></div></div>", emptyStart); // fallback
}
cartHtml =
  cartHtml.substring(0, emptyStart) +
  cartItemsBlock +
  cartHtml.substring(nextSection);

// 4. Inject the Vanilla JS Fixer exactly where checkout.init was
const fixScript = `
<script>
document.addEventListener('DOMContentLoaded', () => { setTimeout(() => {
    document.querySelectorAll('.js-delete-item-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            this.closest('.cart-item').remove();
            
            const count = document.querySelectorAll('.cart-item').length;
            const headingCount = document.querySelector('.quantity-order-text');
            if(headingCount) headingCount.innerHTML = '(' + count + ' sản phẩm)';
            
            document.querySelectorAll('.cart-number, .header-icon.cart .button_notification').forEach(el => {
                el.innerHTML = count;
            });
            
            if(count === 0) {
                const table = document.querySelector('.cart-table');
                if(table) table.innerHTML = '<div class="p-4 text-center"><h3 class="h3-20">Giỏ hàng củ bạn đang trống!</h3><a href="index.html" class="btn btn-primary mt-3">Tiếp tục mua hàng</a></div>';
            }
            alert('Đã xóa sản phẩm khỏi giỏ hàng thành công!');
        });
    });
    
    // Auto-update count on load
    const count = document.querySelectorAll('.cart-item').length;
    document.querySelectorAll('.cart-number, .header-icon.cart .button_notification').forEach(el => {
        el.innerHTML = count;
    });
}, 500);});
</script>
`;

// Neutralize original checkout.init because it breaks local mockup
cartHtml = cartHtml.replace(
  "$(document).ready(function(){checkout.init();checkout.voucher();})",
  fixScript,
);

fs.writeFileSync("d:/CloneWeb/Clone/clone-project/cart.html", cartHtml);
console.log("Cart successfully restored and modified.");
