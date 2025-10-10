// View Roster page functionality

function loadRoster() {
  const savedRoster = localStorage.getItem("weeklyRoster");
  const weekStart = localStorage.getItem("weekStartDate");

  if (!savedRoster || !weekStart) {
    document.getElementById("no-roster").style.display = "block";
    document.getElementById("roster-content").style.display = "none";
    document.getElementById("employee-summary").style.display = "none";
    return;
  }

  const rosterData = JSON.parse(savedRoster);

  // Hide empty state, show roster
  document.getElementById("no-roster").style.display = "none";
  document.getElementById("roster-content").style.display = "block";
  document.getElementById("employee-summary").style.display = "block";

  // Update info bar
  document.getElementById("week-date").textContent = formatDate(weekStart);
  document.getElementById("emp-count").textContent = rosterData.length;

  let grandTotal = 0;
  rosterData.forEach((emp) => (grandTotal += emp.totalHours));
  document.getElementById("total-hours").textContent = grandTotal + "h";

  // Display roster table
  const tbody = document.getElementById("saved-roster-body");
  tbody.innerHTML = "";

  rosterData.forEach((emp) => {
    const row = document.createElement("tr");
    row.innerHTML = `
			<td class="employee-name-cell">${emp.name}</td>
			${emp.dailySchedule
        .map((day) => {
          if (day.hours === 0) {
            return '<td class="day-off">OFF</td>';
          }
          return `<td class="shift-cell">${day.shift}<br><small>${day.hours}h</small></td>`;
        })
        .join("")}
			<td class="total-hours-cell">${emp.totalHours}h</td>
		`;
    tbody.appendChild(row);
  });

  // Generate employee summary cards
  generateEmployeeSummaries(rosterData);
}

function generateEmployeeSummaries(rosterData) {
  const summaryCards = document.getElementById("summary-cards");
  summaryCards.innerHTML = "";

  rosterData.forEach((emp) => {
    const workDays = emp.dailySchedule.filter((d) => d.hours > 0).length;
    const offDays = 7 - workDays;

    const card = document.createElement("div");
    card.className = "summary-card";
    card.innerHTML = `
			<h4>${emp.name}</h4>
			<div class="summary-stats">
				<div class="summary-stat">
					<span class="summary-label">Total Hours</span>
					<span class="summary-value">${emp.totalHours}h</span>
				</div>
				<div class="summary-stat">
					<span class="summary-label">Work Days</span>
					<span class="summary-value">${workDays}</span>
				</div>
				<div class="summary-stat">
					<span class="summary-label">Days Off</span>
					<span class="summary-value">${offDays}</span>
				</div>
			</div>
		`;
    summaryCards.appendChild(card);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function deleteRoster() {
  if (
    confirm(
      "Are you sure you want to delete this roster? This action cannot be undone.",
    )
  ) {
    localStorage.removeItem("weeklyRoster");
    localStorage.removeItem("weekStartDate");
    alert("Roster has been deleted");
    location.reload();
  }
}

// Load roster on page load
window.onload = loadRoster;
