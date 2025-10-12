const EMPLOYEES_API_BASE = "/api/employees";

let currentRosterData = [];
let employeeSelectionContainer = null;

function formatEmployeeName(employee = {}) {
  const direct = (employee.name || "").trim();
  if (direct) {
    return direct;
  }

  const first = (employee.firstName || "").trim();
  const last = (employee.lastName || "").trim();
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) {
    return combined;
  }

  const email = (employee.email || "").trim();
  if (email) {
    return email;
  }

  return "Unnamed Employee";
}

function formatRoleLabel(role) {
  const normalized = (role || "staff").toString().trim().toLowerCase();
  if (!normalized) {
    return "Staff";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getRoleBadgeClass(role) {
  return (role || "").toLowerCase() === "admin" ? "admin-badge" : "staff-badge";
}

function getDefaultMaxHours(role) {
  return (role || "").toLowerCase() === "admin" ? 20 : 30;
}

function getAvatarContent(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) {
    return "👤";
  }

  const firstChar = trimmed.charAt(0);
  return /[A-Za-z0-9]/.test(firstChar) ? firstChar.toUpperCase() : "👤";
}

function showEmployeeSelectionStatus(message, type = "info") {
  if (!employeeSelectionContainer) {
    return;
  }

  employeeSelectionContainer.innerHTML = "";
  const statusEl = document.createElement("div");
  statusEl.className = `employee-selection-status${
    type !== "info" ? ` ${type}` : ""
  }`;
  statusEl.textContent = message;
  employeeSelectionContainer.appendChild(statusEl);
}

function toggleEmployee(checkbox) {
  const card = checkbox.closest(".employee-select-card");
  if (!card) {
    return;
  }

  const hoursContainer = card.querySelector(".hours-input-container");
  if (!hoursContainer) {
    return;
  }

  hoursContainer.style.display = checkbox.checked ? "flex" : "none";
}

function createEmployeeCard(employee, index) {
  const displayName = formatEmployeeName(employee);
  const role = (employee.role || "staff").toLowerCase();
  const email = (employee.email || "").trim().toLowerCase();

  const card = document.createElement("div");
  card.className = "employee-select-card";
  if (employee.id) {
    card.dataset.employeeId = employee.id;
  }

  const checkboxWrapper = document.createElement("div");
  checkboxWrapper.className = "employee-checkbox";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  const checkboxId = `employee-roster-${employee.id ?? index}`;
  checkbox.id = checkboxId;
  checkbox.value = displayName;
  if (employee.id) {
    checkbox.dataset.employeeId = employee.id;
  }
  if (email) {
    checkbox.dataset.employeeEmail = email;
  }
  checkbox.addEventListener("change", () => toggleEmployee(checkbox));

  const label = document.createElement("label");
  label.setAttribute("for", checkboxId);

  const avatar = document.createElement("span");
  avatar.className = "emp-avatar";
  avatar.textContent = getAvatarContent(displayName);

  const info = document.createElement("div");
  info.className = "emp-info";

  const nameEl = document.createElement("strong");
  nameEl.textContent = displayName;
  info.appendChild(nameEl);

  const roleEl = document.createElement("span");
  roleEl.className = `emp-role ${getRoleBadgeClass(role)}`;
  roleEl.textContent = formatRoleLabel(role);
  info.appendChild(roleEl);

  label.appendChild(avatar);
  label.appendChild(info);

  checkboxWrapper.appendChild(checkbox);
  checkboxWrapper.appendChild(label);
  card.appendChild(checkboxWrapper);

  const hoursContainer = document.createElement("div");
  hoursContainer.className = "hours-input-container";
  hoursContainer.style.display = "none";

  const hoursLabel = document.createElement("label");
  hoursLabel.textContent = "Max Hours:";
  hoursContainer.appendChild(hoursLabel);

  const hoursInput = document.createElement("input");
  hoursInput.type = "number";
  hoursInput.className = "hours-input";
  hoursInput.min = "1";
  hoursInput.max = "40";
  hoursInput.value = String(getDefaultMaxHours(role));
  hoursInput.placeholder = "Hours";
  hoursContainer.appendChild(hoursInput);

  card.appendChild(hoursContainer);

  return card;
}

function renderEmployeeSelection(employees) {
  if (!employeeSelectionContainer) {
    return;
  }

  if (!Array.isArray(employees) || employees.length === 0) {
    showEmployeeSelectionStatus(
      "No employees available yet. Add employees to build a roster.",
      "empty",
    );
    return;
  }

  employeeSelectionContainer.innerHTML = "";
  const sortedEmployees = [...employees].sort((a, b) =>
    formatEmployeeName(a).localeCompare(formatEmployeeName(b)),
  );

  sortedEmployees.forEach((employee, index) => {
    const card = createEmployeeCard(employee, index);
    employeeSelectionContainer.appendChild(card);
  });
}

async function fetchEmployeesForRoster() {
  if (!employeeSelectionContainer) {
    return;
  }

  showEmployeeSelectionStatus("Loading employees…");

  try {
    const response = await fetch(EMPLOYEES_API_BASE);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Request failed with status ${response.status}`,
      );
    }

    const employees = Array.isArray(data.employees) ? data.employees : [];
    renderEmployeeSelection(employees);
  } catch (error) {
    console.error("Failed to load employees for roster", error);
    showEmployeeSelectionStatus(
      "Unable to load employees. Please try again later.",
      "error",
    );
  }
}

function generateRoster() {
  const selectedEmployees = [];
  const checkboxes = document.querySelectorAll(
    '.employee-select-card input[type="checkbox"]:checked',
  );

  if (checkboxes.length === 0) {
    alert("Please select at least one employee");
    return;
  }

  checkboxes.forEach((checkbox) => {
    const card = checkbox.closest(".employee-select-card");
    const hoursInput = card ? card.querySelector(".hours-input") : null;
    const parsedHours = hoursInput ? parseInt(hoursInput.value, 10) : 0;
    const maxHours = Number.isNaN(parsedHours)
      ? 0
      : Math.max(0, Math.min(parsedHours, 40));

    selectedEmployees.push({
      name: checkbox.value || "Unnamed Employee",
      employeeId:
        typeof checkbox.dataset.employeeId === "string"
          ? checkbox.dataset.employeeId
          : null,
      email:
        typeof checkbox.dataset.employeeEmail === "string"
          ? checkbox.dataset.employeeEmail
          : null,
      maxHours,
    });
  });

  const rosterBody = document.getElementById("roster-body");
  rosterBody.innerHTML = "";

  currentRosterData = [];

  selectedEmployees.forEach((emp) => {
    const row = document.createElement("tr");
    let totalHours = 0;
    const dailyHours = [];
    const dailySchedule = [];

    let remainingHours = emp.maxHours;
    const days = 7;

    for (let i = 0; i < days; i += 1) {
      let hoursToday;
      if (remainingHours > 0 && Math.random() > 0.2) {
        hoursToday = Math.min(
          Math.floor(Math.random() * 5) + 4,
          remainingHours,
          8,
        );
        remainingHours -= hoursToday;
      } else {
        hoursToday = 0;
      }

      dailyHours.push(hoursToday);
      totalHours += hoursToday;

      dailySchedule.push({
        hours: hoursToday,
        shift: hoursToday > 0 ? getShiftTime(hoursToday) : "OFF",
      });
    }

    currentRosterData.push({
      employeeId: emp.employeeId ?? null,
      email: emp.email ?? null,
      name: emp.name,
      dailySchedule,
      totalHours,
    });

    row.innerHTML = `
      <td class="employee-name-cell">${emp.name}</td>
      ${dailyHours
        .map((hours) => {
          if (hours === 0) {
            return '<td class="day-off">OFF</td>';
          }
          const shift = getShiftTime(hours);
          return `<td class="shift-cell">${shift}<br><small>${hours}h</small></td>`;
        })
        .join("")}
      <td class="total-hours-cell">${totalHours}h</td>
    `;

    rosterBody.appendChild(row);
  });

  document.getElementById("generated-roster").style.display = "block";
  document
    .getElementById("generated-roster")
    .scrollIntoView({ behavior: "smooth" });
}

function getShiftTime(hours) {
  if (hours <= 4) {
    return "9AM-1PM";
  }
  if (hours <= 6) {
    return "9AM-3PM";
  }
  if (hours <= 8) {
    return "9AM-5PM";
  }
  return "8AM-5PM";
}

async function saveRoster() {
  if (currentRosterData.length === 0) {
    alert("Please generate a roster first before saving");
    return;
  }

  const weekStartInput = document.getElementById("week-start");
  if (!weekStartInput || !weekStartInput.value) {
    alert("Please select a week start date");
    return;
  }

  const payload = {
    weekStart: weekStartInput.value,
    entries: currentRosterData,
  };

  try {
    const response = await fetch("/api/roster", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to save roster. Please try again later.",
      );
    }

    alert("Roster saved successfully!");

    setTimeout(() => {
      window.location.href = "ViewRoster.html";
    }, 500);
  } catch (error) {
    alert(error.message || "We were unable to save the roster.");
  }
}

function setDefaultWeekStart() {
  const weekStartInput = document.getElementById("week-start");
  if (!weekStartInput) {
    return;
  }

  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7));
  weekStartInput.valueAsDate = nextMonday;
}

function initializeCreateRosterPage() {
  employeeSelectionContainer = document.getElementById("employee-selection");
  setDefaultWeekStart();
  fetchEmployeesForRoster();
}

if (typeof window !== "undefined") {
  window.generateRoster = generateRoster;
  window.saveRoster = saveRoster;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCreateRosterPage);
} else {
  initializeCreateRosterPage();
}
