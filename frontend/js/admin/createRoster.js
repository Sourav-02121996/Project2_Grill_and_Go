// Create Roster page functionality

let currentRosterData = [];

function toggleEmployee(checkbox) {
  const card = checkbox.closest(".employee-select-card");
  const hoursContainer = card.querySelector(".hours-input-container");

  if (checkbox.checked) {
    hoursContainer.style.display = "flex";
  } else {
    hoursContainer.style.display = "none";
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

  // Collect selected employees and their max hours
  checkboxes.forEach((checkbox) => {
    const card = checkbox.closest(".employee-select-card");
    const name = checkbox.value;
    const maxHours = parseInt(card.querySelector(".hours-input").value);
    selectedEmployees.push({ name, maxHours });
  });

  // Generate roster
  const rosterBody = document.getElementById("roster-body");
  rosterBody.innerHTML = "";

  currentRosterData = []; // Reset

  selectedEmployees.forEach((emp) => {
    const row = document.createElement("tr");
    let totalHours = 0;
    const dailyHours = [];
    const dailySchedule = [];

    // Distribute hours across the week (max 8 hours per day)
    let remainingHours = emp.maxHours;
    const days = 7;

    for (let i = 0; i < days; i++) {
      // Random distribution with rest days
      let hoursToday;
      if (remainingHours > 0 && Math.random() > 0.2) {
        // 80% chance of working
        hoursToday = Math.min(
          Math.floor(Math.random() * 5) + 4, // 4-8 hours
          remainingHours,
          8,
        );
        remainingHours -= hoursToday;
      } else {
        hoursToday = 0;
      }
      dailyHours.push(hoursToday);
      totalHours += hoursToday;

      // Store shift data
      dailySchedule.push({
        hours: hoursToday,
        shift: hoursToday > 0 ? getShiftTime(hoursToday) : "OFF",
      });
    }

    // Store employee roster data
    currentRosterData.push({
      name: emp.name,
      dailySchedule: dailySchedule,
      totalHours: totalHours,
    });

    // Create row
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

  // Show the generated roster
  document.getElementById("generated-roster").style.display = "block";

  // Scroll to roster
  document
    .getElementById("generated-roster")
    .scrollIntoView({ behavior: "smooth" });
}

function getShiftTime(hours) {
  // Generate shift times based on hours
  if (hours <= 4) {
    return "9AM-1PM";
  } else if (hours <= 6) {
    return "9AM-3PM";
  } else if (hours <= 8) {
    return "9AM-5PM";
  } else {
    return "8AM-5PM";
  }
}

function saveRoster() {
  if (currentRosterData.length === 0) {
    alert("Please generate a roster first before saving");
    return;
  }

  const weekStart = document.getElementById("week-start").value;
  if (!weekStart) {
    alert("Please select a week start date");
    return;
  }

  // Save to localStorage
  localStorage.setItem("weeklyRoster", JSON.stringify(currentRosterData));
  localStorage.setItem("weekStartDate", weekStart);

  alert("Roster saved successfully!");

  // Redirect to view roster
  setTimeout(() => {
    window.location.href = "ViewRoster.html";
  }, 500);
}

// Set default week start to next Monday
window.onload = function () {
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((8 - today.getDay()) % 7));
  document.getElementById("week-start").valueAsDate = nextMonday;
};
