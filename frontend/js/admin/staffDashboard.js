// Simple Staff Dashboard - Load and Display Roster
console.log("🚀 Staff Dashboard JS Loaded");

// Fetch and display roster
async function loadAndDisplayRoster() {
  try {
    console.log("📡 Fetching roster from API...");

    // Fetch roster from API
    const response = await fetch("/api/roster");
    const data = await response.json();

    console.log("📋 API Response:", data);

    if (
      !data.success ||
      !data.roster ||
      !data.roster.entries ||
      data.roster.entries.length === 0
    ) {
      console.log("⚠️ No roster found");
      document.getElementById("staff-roster-info").textContent =
        "No roster has been published yet.";
      return;
    }

    const roster = data.roster;
    console.log("✅ Roster loaded with", roster.entries.length, "employees");

    // Set week date (used in multiple places)
    const weekDate = new Date(roster.weekStart);

    // Show roster metadata
    const metaBar = document.getElementById("staff-roster-meta");
    if (metaBar) {
      metaBar.style.display = "flex";

      // Set week date
      const weekDateEl = document.getElementById("staff-week-date");
      if (weekDateEl) {
        weekDateEl.textContent = weekDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      // Set employee count
      const empCountEl = document.getElementById("staff-employee-count");
      if (empCountEl) {
        empCountEl.textContent = roster.entries.length;
      }

      // Calculate total hours
      const totalHours = roster.entries.reduce(
        (sum, entry) => sum + (entry.totalHours || 0),
        0,
      );
      const totalHoursEl = document.getElementById("staff-total-hours");
      if (totalHoursEl) {
        totalHoursEl.textContent = totalHours + "h";
      }
    }

    // Update info text
    const rosterInfoEl = document.getElementById("staff-roster-info");
    if (rosterInfoEl) {
      rosterInfoEl.textContent = `Week of ${weekDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
    }

    // Show roster table
    const tableContainer = document.getElementById("staff-roster-container");
    if (tableContainer) {
      tableContainer.style.display = "block";
    }

    // Render roster table
    const tbody = document.getElementById("staff-roster-body");
    if (!tbody) {
      console.error("❌ Could not find staff-roster-body element");
      return;
    }

    tbody.innerHTML = "";

    roster.entries.forEach((employee) => {
      const row = document.createElement("tr");

      // Employee name
      let html = `<td class="employee-name-cell">${employee.name}</td>`;

      // Daily schedule (7 days)
      employee.dailySchedule.forEach((day) => {
        if (day.hours === 0) {
          html += `<td class="day-off">OFF</td>`;
        } else {
          html += `<td class="shift-cell">${day.shift}<br><small>${day.hours}h</small></td>`;
        }
      });

      // Total hours
      html += `<td class="total-hours-cell">${employee.totalHours}h</td>`;

      row.innerHTML = html;
      tbody.appendChild(row);
    });

    console.log("✅ Roster table rendered successfully");
  } catch (error) {
    console.error("❌ Error loading roster:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    const infoEl = document.getElementById("staff-roster-info");
    if (infoEl) {
      infoEl.textContent = "Error loading roster: " + error.message;
    }
  }
}

// Initialize when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 DOM loaded, initializing...");
    loadAndDisplayRoster();
  });
} else {
  console.log("📄 DOM already loaded, initializing...");
  loadAndDisplayRoster();
}
