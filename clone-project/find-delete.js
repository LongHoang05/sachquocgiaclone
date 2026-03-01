const fs = require("fs");
let html = fs.readFileSync("d:/CloneWeb/Clone/clone-project/cart.html", "utf8");

// Find the delete button class by looking near "fa-trash"
const trashIndex = html.indexOf("fa-trash");
if (trashIndex > -1) {
  const snippet = html.substring(
    Math.max(0, trashIndex - 100),
    trashIndex + 50,
  );
  console.log("Delete button snippet:", snippet);
}

// Check where the cart row class is
const cartRowIndex = html.indexOf("item_cart");
if (cartRowIndex > -1) {
  const snippet = html.substring(
    Math.max(0, cartRowIndex - 50),
    cartRowIndex + 100,
  );
  console.log("Cart row snippet:", snippet);
}
