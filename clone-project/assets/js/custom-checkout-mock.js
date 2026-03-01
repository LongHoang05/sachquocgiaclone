document.addEventListener("DOMContentLoaded", () => {
  // To ensure the local offline mockup doesn't try to contact the live backend,
  // we simply strip the inline onclick handlers that call 'checkout.remove_cart'
  // and replace them with a local visual UI update.

  setTimeout(() => {
    const removeBtns = document.querySelectorAll('a[onclick*="remove_cart"]');

    removeBtns.forEach((btn) => {
      // Completely neutralize the live server action
      btn.removeAttribute("onclick");

      // Re-bind to our local JS fake interaction
      btn.addEventListener("click", function (e) {
        e.preventDefault();

        // Find the parent cart item based on the live HTML structure
        const cartItem = this.closest(".cart-item");
        if (cartItem) {
          cartItem.remove();

          // Update item counts
          const count = document.querySelectorAll(".cart-item").length;
          const headingCount = document.querySelector(".cart-number");
          if (headingCount) headingCount.innerHTML = count;

          // Update header icons (desktop and mobile)
          document
            .querySelectorAll(".header-icon.cart .button_notification")
            .forEach((el) => {
              el.innerHTML = count;
            });

          // Update the total summary pricing based on the '.total-cost-value' hidden inputs
          let total = 0;
          document
            .querySelectorAll(".cart-item .total-cost-value")
            .forEach((input) => {
              total += parseInt(input.value) || 0;
            });
          const formatted = total
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          document
            .querySelectorAll(".js-cart-cost, .js-cart-price, .js-cart-payment")
            .forEach((el) => {
              if (el) el.innerHTML = formatted;
            });

          // Handle empty cart state visually
          if (count === 0) {
            const table = document.querySelector(".cart-wrapper");
            if (table) {
              table.innerHTML =
                '<div class="p-5 text-center"><img src="assets/images/empty_cart.png" style="width:150px; opacity:0.5; margin-bottom:20px;" onerror="this.style.display=\'none\'"><h3 class="h3-20 text-secondary">Giỏ hàng của bạn đang trống!</h3><a href="index.html" class="btn btn-primary mt-3 px-4 py-2" style="background:#00bfa5; border:none; border-radius:30px;">Tiếp tục mua hàng</a></div>';
            }
          }

          // Provide visual feedback instead of relying on the backend toast
          setTimeout(() => {
            alert("Đã xóa sản phẩm khỏi giỏ hàng thành công!");
          }, 50);
        }
      });
    });

    // Auto-update count on initial load just in case
    const count = Math.max(0, document.querySelectorAll(".cart-item").length);
    document
      .querySelectorAll(".cart-number, .header-icon.cart .button_notification")
      .forEach((el) => {
        el.innerHTML = count;
      });
  }, 300); // Wait slightly for page parsing
});
