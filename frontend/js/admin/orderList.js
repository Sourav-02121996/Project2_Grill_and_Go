// Order List page functionality

let allOrders = [];

// Fetch orders from database
async function fetchOrders() {
  try {
    const response = await fetch("/api/orders");
    const data = await response.json();
    if (data.success) {
      allOrders = data.orders;
      renderOrders();
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  }
}

// Render orders in the UI
function renderOrders() {
  const activeCompletedOrders = allOrders.filter(
    (o) => o.status !== "cancelled",
  );
  const cancelledOrders = allOrders.filter((o) => o.status === "cancelled");

  // Update tab counts
  const tabs = document.querySelectorAll(".order-tab");
  tabs[0].textContent = `Active/Completed Orders (${activeCompletedOrders.length})`;
  tabs[1].textContent = `Cancelled Orders (${cancelledOrders.length})`;

  // Render active/completed orders (with action buttons for pending/preparing/ready)
  const activeSection = document.getElementById("active-orders");
  activeSection.innerHTML =
    "<h2>Active/Completed Orders</h2>" +
    (activeCompletedOrders.length > 0
      ? activeCompletedOrders
          .map((order) => {
            const canEdit = order.status !== "completed";
            return createOrderCard(order, canEdit);
          })
          .join("")
      : '<p style="text-align: center; color: #666; padding: 2rem;">No orders yet</p>');

  // Render cancelled orders
  const cancelledSection = document.getElementById("cancelled-orders");
  cancelledSection.innerHTML =
    "<h2>Cancelled Orders</h2>" +
    (cancelledOrders.length > 0
      ? cancelledOrders.map((order) => createOrderCard(order, false)).join("")
      : '<p style="text-align: center; color: #666; padding: 2rem;">No cancelled orders</p>');
}

// Create order card HTML
function createOrderCard(order, isActive) {
  const timeAgo = getTimeAgo(new Date(order.createdAt));
  const statusClass = `status-${order.status}`;
  const statusText =
    order.status.charAt(0).toUpperCase() + order.status.slice(1);

  const orderDetails = order["order details"] || [];
  const itemsHTML = orderDetails
    .map(
      (item) =>
        `<div class="item">${item.quantity || 1}x ${item.name} - $${((item.quantity || 1) * item.price).toFixed(2)}</div>`,
    )
    .join("");

  const actionsHTML = isActive
    ? `
    <div class="order-actions">
      <button class="btn-action btn-confirm" onclick="updateOrderStatus('${order._id}', 'completed')">
        Mark as Complete
      </button>
      <button class="btn-action btn-cancel" onclick="updateOrderStatus('${order._id}', 'cancelled')">
        Cancel Order
      </button>
    </div>
  `
    : "";

  return `
    <div class="order-card ${isActive ? "active-order" : "completed-order"}">
      <div class="order-header">
        <div class="order-info">
          <span class="order-id">#${order._id.toString().slice(-8).toUpperCase()}</span>
          <span class="order-time">${timeAgo}</span>
        </div>
        <span class="order-status ${statusClass}">${statusText}</span>
      </div>
      <div class="order-body">
        <div class="customer-info">
          <strong>Customer:</strong> ${order["customer name"] || "Guest"}<br/>
          ${order["email"] ? `<strong>Email:</strong> ${order["email"]}<br/>` : ""}
        </div>
        <div class="order-items">
          ${itemsHTML}
        </div>
        <div class="order-total">
          <strong>Total: $${order["total price"]?.toFixed(2) || "0.00"}</strong>
        </div>
      </div>
      ${actionsHTML}
    </div>
  `;
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();
    if (data.success) {
      console.log(`✅ Order ${orderId} updated to ${newStatus}`);
      fetchOrders(); // Refresh the list
    }
  } catch (error) {
    console.error("Failed to update order:", error);
    alert("Failed to update order status");
  }
}

// Get time ago helper
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  if (seconds < 60) return `${seconds} secs ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

// Show/hide order sections
function showOrders(type) {
  const activeSection = document.getElementById("active-orders");
  const cancelledSection = document.getElementById("cancelled-orders");
  const tabs = document.querySelectorAll(".order-tab");

  // Hide all sections
  activeSection.style.display = "none";
  cancelledSection.style.display = "none";

  // Remove active class from all tabs
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Show selected section and activate tab
  if (type === "active") {
    activeSection.style.display = "block";
    tabs[0].classList.add("active");
  } else if (type === "cancelled") {
    cancelledSection.style.display = "block";
    tabs[1].classList.add("active");
  }
}

// Load orders on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();

  // Auto-refresh every 30 seconds
  setInterval(fetchOrders, 30000);
});
