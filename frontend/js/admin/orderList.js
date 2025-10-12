// Order List page functionality

let allOrders = [];
let currentActivePage = 1;
let currentCancelledPage = 1;
const ORDERS_PER_PAGE = 20;

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

  // Render active/completed orders with pagination
  renderOrdersWithPagination(
    activeCompletedOrders,
    currentActivePage,
    "active-orders-list",
    "active-pagination",
    "active",
  );

  // Render cancelled orders with pagination
  renderOrdersWithPagination(
    cancelledOrders,
    currentCancelledPage,
    "cancelled-orders-list",
    "cancelled-pagination",
    "cancelled",
  );
}

// Render orders with pagination
function renderOrdersWithPagination(
  orders,
  currentPage,
  listId,
  paginationId,
  type,
) {
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const ordersToShow = orders.slice(startIndex, endIndex);

  // Render orders
  const listElement = document.getElementById(listId);
  if (orders.length === 0) {
    listElement.innerHTML =
      '<p style="text-align: center; color: #666; padding: 2rem;">No orders yet</p>';
  } else {
    listElement.innerHTML = ordersToShow
      .map((order) => {
        const canEdit =
          order.status !== "completed" && order.status !== "cancelled";
        return createOrderCard(order, canEdit);
      })
      .join("");
  }

  // Render pagination controls
  const paginationElement = document.getElementById(paginationId);
  if (totalPages <= 1) {
    paginationElement.style.display = "none";
  } else {
    paginationElement.style.display = "flex";
    paginationElement.innerHTML = createPaginationControls(
      currentPage,
      totalPages,
      type,
    );
  }
}

// Create pagination controls HTML
function createPaginationControls(currentPage, totalPages, type) {
  let html = '<div class="pagination-controls">';

  // Previous button
  html += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPage - 1})" ${currentPage === 1 ? "disabled" : ""}>
    ← Previous
  </button>`;

  // Page info
  html += `<span class="pagination-info">
    Page ${currentPage} of ${totalPages} (${type === "active" ? allOrders.filter((o) => o.status !== "cancelled").length : allOrders.filter((o) => o.status === "cancelled").length} total orders)
  </span>`;

  // Next button
  html += `<button class="pagination-btn" onclick="changePage('${type}', ${currentPage + 1})" ${currentPage === totalPages ? "disabled" : ""}>
    Next →
  </button>`;

  html += "</div>";
  return html;
}

// Change page
function changePage(type, newPage) {
  if (type === "active") {
    const activeOrders = allOrders.filter((o) => o.status !== "cancelled");
    const totalPages = Math.ceil(activeOrders.length / ORDERS_PER_PAGE);
    if (newPage >= 1 && newPage <= totalPages) {
      currentActivePage = newPage;
      renderOrders();
      // Scroll to top of orders section
      document
        .getElementById("active-orders")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } else if (type === "cancelled") {
    const cancelledOrders = allOrders.filter((o) => o.status === "cancelled");
    const totalPages = Math.ceil(cancelledOrders.length / ORDERS_PER_PAGE);
    if (newPage >= 1 && newPage <= totalPages) {
      currentCancelledPage = newPage;
      renderOrders();
      // Scroll to top of orders section
      document
        .getElementById("cancelled-orders")
        .scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
}

// Create order card HTML
function createOrderCard(order, isActive) {
  // Handle both old and new date formats
  let orderDate;
  if (order.createdAt === "iso_8601" || !order.createdAt) {
    orderDate = new Date(); // Use current date for invalid dates
  } else {
    orderDate = new Date(order.createdAt);
  }
  const timeAgo = getTimeAgo(orderDate);

  const statusClass = `status-${order.status}`;
  const statusText =
    order.status.charAt(0).toUpperCase() + order.status.slice(1);

  // Support both old and new schema field names
  const customerName = order["customer name"] || order.customerName || "Guest";
  const customerEmail = order["email"] || order.email || "";
  const totalPrice = order["total price"] || order.totalPrice || 0;
  const orderDetails = order["order details"] || [];

  // Handle order items - new schema uses array, old schema uses string
  let itemsHTML = "";
  if (Array.isArray(orderDetails) && orderDetails.length > 0) {
    // New schema: array of item objects
    itemsHTML = orderDetails
      .map(
        (item) =>
          `<div class="item">${item.quantity || 1}x ${item.name} - $${((item.quantity || 1) * item.price).toFixed(2)}</div>`,
      )
      .join("");
  } else if (order.orderDetails && typeof order.orderDetails === "string") {
    // Old schema: string like "Turkey Avocado x1; Cookie x2"
    itemsHTML = `<div class="item">${order.orderDetails}</div>`;
  } else {
    itemsHTML = '<div class="item">No items</div>';
  }

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
          <strong>Customer:</strong> ${customerName}<br/>
          ${customerEmail ? `<strong>Email:</strong> ${customerEmail}<br/>` : ""}
        </div>
        <div class="order-items">
          ${itemsHTML}
        </div>
        <div class="order-total">
          <strong>Total: $${typeof totalPrice === "number" ? totalPrice.toFixed(2) : totalPrice}</strong>
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

window.changePage = changePage;
window.updateOrderStatus = updateOrderStatus;
window.showOrders = showOrders;

// Load orders on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchOrders();

  // Auto-refresh every 30 seconds
  setInterval(fetchOrders, 30000);
});
