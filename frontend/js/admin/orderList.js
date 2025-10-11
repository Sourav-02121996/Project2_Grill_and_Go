// Order List page functionality

function showOrders(type) {
  const activeSection = document.getElementById("active-orders");
  const completedSection = document.getElementById("completed-orders");
  const tabs = document.querySelectorAll(".order-tab");

  if (type === "active") {
    activeSection.style.display = "block";
    completedSection.style.display = "none";
    tabs[0].classList.add("active");
    tabs[1].classList.remove("active");
  } else {
    activeSection.style.display = "none";
    completedSection.style.display = "block";
    tabs[0].classList.remove("active");
    tabs[1].classList.add("active");
  }
}

