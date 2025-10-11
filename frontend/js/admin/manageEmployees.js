// Manage Employees page functionality

function showAddEmployeeModal() {
  document.getElementById("addEmployeeModal").style.display = "flex";
}

function closeAddEmployeeModal() {
  document.getElementById("addEmployeeModal").style.display = "none";
}

function toggleAdmin(button) {
  const card = button.closest(".employee-card");
  const roleLabel = card.querySelector(".employee-role");

  if (button.classList.contains("active")) {
    // Remove admin
    button.classList.remove("active");
    button.textContent = "Make Admin";
    roleLabel.textContent = "Staff";
    roleLabel.classList.remove("admin-role");
    roleLabel.classList.add("staff-role");
    alert("Admin privileges removed");
  } else {
    // Make admin
    button.classList.add("active");
    button.textContent = "Remove Admin";
    roleLabel.textContent = "Admin";
    roleLabel.classList.remove("staff-role");
    roleLabel.classList.add("admin-role");
    alert("Employee promoted to Admin");
  }
}

function deleteEmployee(name) {
  if (confirm(`Are you sure you want to delete ${name}?`)) {
    alert(`${name} has been removed from the system`);
    // In production, this would delete from database
  }
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("addEmployeeModal");
  if (event.target == modal) {
    closeAddEmployeeModal();
  }
};

