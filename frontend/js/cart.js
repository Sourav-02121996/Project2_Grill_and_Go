// Cart Management System

// Get cart from localStorage
function getCart() {
  const cart = localStorage.getItem("cart");
  return cart ? JSON.parse(cart) : [];
}

function getSignedInCustomer() {
  const authApi = window.GrillAndGoAuth;
  if (!authApi || typeof authApi.read !== "function") {
    return null;
  }

  const currentAuth = authApi.read();
  if (currentAuth && currentAuth.type === "customer") {
    return currentAuth;
  }

  return null;
}

function redirectToSignIn() {
  // Provide gentle feedback before redirecting
  alert("Please sign in to your Grill & Go customer account to continue.");
  window.location.href = "/login?intent=cart";
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Add item to cart
function addToCart(item) {
  const signedInCustomer = getSignedInCustomer();
  if (!signedInCustomer) {
    redirectToSignIn();
    return;
  }

  const cart = getCart();

  // Check if item already exists
  const existingItemIndex = cart.findIndex(
    (cartItem) =>
      cartItem.id === item.id &&
      JSON.stringify(cartItem.customizations) ===
        JSON.stringify(item.customizations),
  );

  if (existingItemIndex !== -1) {
    // Item exists, increase quantity
    cart[existingItemIndex].quantity += 1;
  } else {
    // New item
    cart.push({
      ...item,
      quantity: 1,
      addedAt: Date.now(),
    });
  }

  saveCart(cart);
  showAddToCartNotification();
}

// Remove item from cart
function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// Update item quantity
function updateQuantity(index, change) {
  const cart = getCart();
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    removeFromCart(index);
  } else {
    saveCart(cart);
    renderCart();
  }
}

// Calculate totals
function calculateTotals() {
  const cart = getCart();
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // 8% tax
  const deliveryFee = cart.length > 0 ? 2.99 : 0;
  const total = subtotal + tax + deliveryFee;

  return { subtotal, tax, deliveryFee, total };
}

// Update cart count badge
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countElements = document.querySelectorAll("#cart-count, .cart-count");
  countElements.forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "inline-flex" : "none";
  });
}

// Show add to cart notification
function showAddToCartNotification() {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.textContent = "✓ Added to cart!";
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

// Render cart page
function renderCart() {
  const cart = getCart();
  const cartItemsContainer = document.getElementById("cart-items");
  const emptyCart = document.getElementById("empty-cart");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!cartItemsContainer) return; // Not on cart page

  if (cart.length === 0) {
    cartItemsContainer.style.display = "none";
    emptyCart.classList.add("show");
    checkoutBtn.disabled = true;
  } else {
    cartItemsContainer.style.display = "flex";
    emptyCart.classList.remove("show");
    checkoutBtn.disabled = false;

    cartItemsContainer.innerHTML = cart
      .map(
        (item, index) => `
      <div class="cart-item">
        <div class="cart-item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.name}">` : "<span>🍔</span>"}
        </div>
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.name}</h3>
          <p class="cart-item-description">${item.description || ""}</p>
          ${item.customizations ? `<p class="cart-item-customizations">${item.customizations}</p>` : ""}
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">−</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
          </div>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  // Update totals
  const { subtotal, tax, deliveryFee, total } = calculateTotals();
  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("tax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("delivery-fee").textContent =
    deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "FREE";
  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
}

// Initialize Stripe
console.log("cart.js loaded!");
const stripe = Stripe(
  "pk_test_51SHBjYEQ3LHCYeiW3Da7yTdnJP38e06lBAcUUg2IIw8prV1n9qv3fmxtkHGYxnCSqbSPBfo2gBklqL9caWDKZOb100XxZxIGkw",
);
console.log("Stripe initialized:", stripe);

// Handle checkout
async function handleCheckout() {
  const signedInCustomer = getSignedInCustomer();
  if (!signedInCustomer) {
    redirectToSignIn();
    return;
  }

  const cart = getCart();
  if (!cart || cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  console.log("Starting checkout with cart:", cart);

  // Show loading state
  const checkoutBtn = document.getElementById("checkout-btn");
  const btnText = document.getElementById("checkout-btn-text");
  const spinner = document.getElementById("checkout-spinner");

  checkoutBtn.disabled = true;
  btnText.style.display = "none";
  spinner.style.display = "inline";

  try {
    console.log("Fetching checkout session...");

    // Create Stripe checkout session
    const response = await fetch("/api/payment/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: cart,
      }),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Server error:", errorData);
      throw new Error(errorData.error || "Failed to create checkout session");
    }

    const session = await response.json();
    console.log("Session created:", session);

    // Redirect to Stripe Checkout
    console.log("Redirecting to Stripe...");
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error("Stripe redirect error:", result.error);
      throw new Error(result.error.message);
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Payment failed: " + error.message);

    // Reset button state
    checkoutBtn.disabled = false;
    btnText.style.display = "inline";
    spinner.style.display = "none";
  }
}

// Add CSS for notification animation
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded fired!");
  updateCartCount();

  // If on cart page, render cart
  if (document.getElementById("cart-items")) {
    console.log("On cart page, setting up...");
    renderCart();

    const checkoutBtn = document.getElementById("checkout-btn");
    console.log("Checkout button:", checkoutBtn);
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", handleCheckout);
      console.log("Click listener added to checkout button!");
    }
  }
});
