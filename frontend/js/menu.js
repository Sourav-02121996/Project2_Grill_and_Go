// Menu page functionality for Add to Cart buttons

// Add click handlers to all "Add to Cart" buttons
document.addEventListener("DOMContentLoaded", function () {
  const addToCartButtons = document.querySelectorAll(".btn-add-to-cart");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const menuItem = this.closest(".menu-item");
      const title = menuItem.querySelector(".menu-item-title").textContent;
      const description = menuItem.querySelector(
        ".menu-item-description",
      ).textContent;
      const priceText = menuItem.querySelector(".menu-item-price").textContent;
      const price = parseFloat(priceText.replace("$", ""));
      const imageElement = menuItem.querySelector(".menu-item-image img");
      const image = imageElement ? imageElement.src : null;

      // Determine type based on current page
      let type = "item";
      if (
        window.location.pathname.includes("ReadyToOrder") ||
        window.location.pathname.includes("Sandwiches")
      ) {
        type = "sandwich";
      } else if (window.location.pathname.includes("beverages")) {
        type = "beverage";
      }

      const item = {
        id: type + "-" + title.toLowerCase().replace(/\s+/g, "-"),
        name: title,
        description: description,
        price: price,
        image: image,
        type: type,
      };

      window.addToCart(item);
    });
  });
});
