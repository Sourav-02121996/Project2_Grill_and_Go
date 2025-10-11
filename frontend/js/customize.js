// Customize page functionality

function updateSummary() {
  const selectedItemsDiv = document.getElementById("selected-items");
  const totalPriceSpan = document.getElementById("total-price");

  let total = 0;
  let items = [];

  // Get all checked inputs
  const allInputs = document.querySelectorAll(
    'input[type="checkbox"]:checked, input[type="radio"]:checked',
  );

  allInputs.forEach((input) => {
    const price = parseFloat(input.getAttribute("data-price"));
    const label = input.getAttribute("data-label");
    total += price;
    items.push({ label, price });
  });

  // Update selected items display
  if (items.length === 0) {
    selectedItemsDiv.innerHTML =
      '<p class="empty-message">Select items to build your sandwich</p>';
  } else {
    let html = "";
    items.forEach((item) => {
      html += `<div class="order-item-row">
				<span>${item.label}</span>
				<span>$${item.price.toFixed(2)}</span>
			</div>`;
    });
    selectedItemsDiv.innerHTML = html;
  }

  // Update total
  totalPriceSpan.textContent = `$${total.toFixed(2)}`;
}

function proceedToCheckout() {
  const total = document.getElementById("total-price").textContent;
  const totalPrice = parseFloat(total.replace("$", ""));

  if (totalPrice === 0) {
    alert("Please select at least one item to build your sandwich.");
  } else {
    // Collect all selected items
    const allInputs = document.querySelectorAll(
      'input[type="checkbox"]:checked, input[type="radio"]:checked',
    );
    let customizations = [];

    allInputs.forEach((input) => {
      const label = input.getAttribute("data-label");
      customizations.push(label);
    });

    const item = {
      id: "custom-sandwich-" + Date.now(),
      name: "Custom Sandwich",
      description: "Your personalized sandwich with selected toppings",
      price: totalPrice,
      image: null,
      type: "custom",
      customizations: customizations.join(", "),
    };

    addToCart(item);

    // Reset the form
    const inputs = document.querySelectorAll(
      'input[type="checkbox"], input[type="radio"]',
    );
    inputs.forEach((input) => (input.checked = false));
    updateSummary();

    // Redirect to cart page
    window.location.href = "cart.html";
  }
}

