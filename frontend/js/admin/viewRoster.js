const ROSTER_API_BASE = "/api/roster";

let currentRosterWeekStart = null;

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatDate = (isoString) => {
  if (!isoString) {
    return "";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const showNoRosterState = () => {
  const noRosterEl = document.getElementById("no-roster");
  const rosterContent = document.getElementById("roster-content");
  const summarySection = document.getElementById("employee-summary");

  if (noRosterEl) noRosterEl.style.display = "block";
  if (rosterContent) rosterContent.style.display = "none";
  if (summarySection) summarySection.style.display = "none";
};

const showRosterSections = () => {
  const noRosterEl = document.getElementById("no-roster");
  const rosterContent = document.getElementById("roster-content");
  const summarySection = document.getElementById("employee-summary");

  if (noRosterEl) noRosterEl.style.display = "none";
  if (rosterContent) rosterContent.style.display = "block";
  if (summarySection) summarySection.style.display = "block";
};

const renderRosterTable = (entries) => {
  const tbody = document.getElementById("saved-roster-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="employee-name-cell">${entry.name}</td>
      ${entry.dailySchedule
        .map((day) => {
          if (!day || day.hours === 0) {
            return '<td class="day-off">OFF</td>';
          }
          const shift = day.shift || "OFF";
          return `<td class="shift-cell">${shift}<br><small>${day.hours}h</small></td>`;
        })
        .join("")}
      <td class="total-hours-cell">${entry.totalHours}h</td>
    `;
    tbody.appendChild(row);
  });
};

const generateEmployeeSummaries = (entries) => {
  const summaryCards = document.getElementById("summary-cards");
  if (!summaryCards) return;

  summaryCards.innerHTML = "";

  entries.forEach((entry) => {
    const workDays = entry.dailySchedule.filter((day) => day.hours > 0).length;
    const offDays = WEEKDAY_LABELS.length - workDays;

    const card = document.createElement("div");
    card.className = "summary-card";
    card.innerHTML = `
      <h4>${entry.name}</h4>
      <div class="summary-stats">
        <div class="summary-stat">
          <span class="summary-label">Total Hours</span>
          <span class="summary-value">${entry.totalHours}h</span>
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
};

const updateInfoBar = (roster) => {
  const weekDateEl = document.getElementById("week-date");
  const empCountEl = document.getElementById("emp-count");
  const totalHoursEl = document.getElementById("total-hours");

  if (weekDateEl) weekDateEl.textContent = formatDate(roster.weekStart);

  if (empCountEl) empCountEl.textContent = roster.entries.length;

  if (totalHoursEl) {
    const totalHours = roster.entries.reduce(
      (sum, entry) => sum + (entry.totalHours || 0),
      0,
    );
    totalHoursEl.textContent = `${totalHours}h`;
  }
};

const loadRoster = async () => {
  try {
    const response = await fetch(ROSTER_API_BASE);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Failed to load roster.");
    }

    const roster = data.roster;
    if (
      !roster ||
      !Array.isArray(roster.entries) ||
      roster.entries.length === 0
    ) {
      showNoRosterState();
      return;
    }

    currentRosterWeekStart = roster.weekStart;
    showRosterSections();
    updateInfoBar(roster);
    renderRosterTable(roster.entries);
    generateEmployeeSummaries(roster.entries);
  } catch (error) {
    console.error("Failed to load roster", error);
    showNoRosterState();
  }
};

const deleteRoster = async () => {
  if (!currentRosterWeekStart) {
    alert("There is no roster to delete.");
    return;
  }

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this roster? This action cannot be undone.",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const params = new URLSearchParams({ weekStart: currentRosterWeekStart });
    const response = await fetch(`${ROSTER_API_BASE}?${params.toString()}`, {
      method: "DELETE",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Unable to delete roster.");
    }

    alert("Roster has been deleted.");
    currentRosterWeekStart = null;
    showNoRosterState();
  } catch (error) {
    alert(error.message || "Failed to delete roster.");
  }
};

if (typeof window !== "undefined") {
  window.deleteRoster = deleteRoster;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadRoster);
} else {
  loadRoster();
}
