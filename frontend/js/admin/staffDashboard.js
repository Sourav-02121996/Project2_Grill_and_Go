const AUTH_STORAGE_KEY = "grillandgo.auth";
const ROSTER_API_BASE = "/api/roster";

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getEl = (id) => document.getElementById(id);

const formatDate = (value) => {
  if (!value) return "Not Set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not Set";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const readAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const syncAuthUi = () => {
  if (
    window.GrillAndGoAuth &&
    typeof window.GrillAndGoAuth.sync === "function"
  ) {
    window.GrillAndGoAuth.sync();
  }
};

const normalize = (value = "") => value.trim().toLowerCase();

const setRosterInfo = (message) => {
  const info = getEl("staff-roster-info");
  if (info) {
    info.textContent = message;
  }
};

const updateRosterMeta = (roster) => {
  const meta = getEl("staff-roster-meta");
  if (!meta) return;

  meta.style.display = "flex";

  const weekDate = getEl("staff-week-date");
  if (weekDate) {
    weekDate.textContent = formatDate(roster.weekStart);
  }

  const employeeCount = getEl("staff-employee-count");
  if (employeeCount) {
    employeeCount.textContent = Array.isArray(roster.entries)
      ? roster.entries.length
      : 0;
  }

  const totalHours = getEl("staff-total-hours");
  if (totalHours) {
    const total = Array.isArray(roster.entries)
      ? roster.entries.reduce((sum, entry) => {
          if (!entry) return sum;
          if (
            typeof entry.totalHours === "number" &&
            Number.isFinite(entry.totalHours)
          ) {
            return sum + entry.totalHours;
          }
          if (Array.isArray(entry.dailySchedule)) {
            return (
              sum +
              entry.dailySchedule.reduce((daySum, day) => {
                const hours =
                  typeof day?.hours === "number" && Number.isFinite(day.hours)
                    ? day.hours
                    : 0;
                return daySum + hours;
              }, 0)
            );
          }
          return sum;
        }, 0)
      : 0;

    totalHours.textContent = `${total}h`;
  }
};

const hideRosterMeta = () => {
  const meta = getEl("staff-roster-meta");
  if (meta) {
    meta.style.display = "none";
  }
};

const clearRosterTable = () => {
  const container = getEl("staff-roster-container");
  const body = getEl("staff-roster-body");

  if (container) {
    container.style.display = "none";
  }

  if (body) {
    body.innerHTML = "";
  }
};

const showRosterTable = () => {
  const container = getEl("staff-roster-container");
  if (container) {
    container.style.display = "block";
  }
};

const showShiftPlaceholder = (message, description) => {
  const descriptionEl = getEl("staff-shift-description");
  if (descriptionEl && description) {
    descriptionEl.textContent = description;
  }

  const list = getEl("staff-shift-list");
  if (list) {
    list.innerHTML = "";
  }

  const emptyEl = getEl("staff-shift-empty");
  if (emptyEl) {
    emptyEl.textContent = message;
    emptyEl.style.display = "block";
  }
};

const hideShiftPlaceholder = () => {
  const emptyEl = getEl("staff-shift-empty");
  if (emptyEl) {
    emptyEl.style.display = "none";
  }
};

const renderShiftList = (entry) => {
  const list = getEl("staff-shift-list");
  if (!list || !entry || !Array.isArray(entry.dailySchedule)) {
    return;
  }

  list.innerHTML = "";

  entry.dailySchedule.forEach((day, index) => {
    const li = document.createElement("li");
    const label = WEEKDAY_LABELS[index] || `Day ${index + 1}`;

    if (!day || !day.hours) {
      li.textContent = `${label}: OFF`;
    } else {
      const shiftLabel = day.shift || "Scheduled";
      li.textContent = `${label}: ${shiftLabel} (${day.hours}h)`;
    }

    list.appendChild(li);
  });

  hideShiftPlaceholder();
};

const sameEntry = (target, candidate) => {
  if (!target || !candidate) {
    return false;
  }

  const candidateId = (candidate.employeeId || "").trim();
  if (candidateId && candidateId === (target.employeeId || "").trim()) {
    return true;
  }

  const candidateEmail = normalize(candidate.email || "");
  if (candidateEmail && candidateEmail === normalize(target.email || "")) {
    return true;
  }

  const candidateName = normalize(candidate.name || "");
  if (candidateName && candidateName === normalize(target.name || "")) {
    return true;
  }

  return false;
};

const renderRosterTable = (roster, highlightEntry) => {
  const body = getEl("staff-roster-body");
  if (!body || !Array.isArray(roster.entries)) {
    return;
  }

  body.innerHTML = "";
  showRosterTable();

  roster.entries.forEach((entry) => {
    if (!entry) return;

    const row = document.createElement("tr");
    if (highlightEntry && sameEntry(highlightEntry, entry)) {
      row.classList.add("current-employee-row");
    }

    const schedule = Array.isArray(entry.dailySchedule)
      ? entry.dailySchedule
      : [];

    const totalHours =
      typeof entry.totalHours === "number" && Number.isFinite(entry.totalHours)
        ? entry.totalHours
        : schedule.reduce((sum, day) => {
            const hours =
              typeof day?.hours === "number" && Number.isFinite(day.hours)
                ? day.hours
                : 0;
            return sum + hours;
          }, 0);

    const cells = schedule
      .map((day) => {
        if (!day || !day.hours) {
          return '<td class="day-off">OFF</td>';
        }

        const shiftLabel = day.shift || "Scheduled";
        return `<td class="shift-cell">${shiftLabel}<br><small>${day.hours}h</small></td>`;
      })
      .join("");

    row.innerHTML = `
      <td class="employee-name-cell">${entry.name || "Unnamed Employee"}</td>
      ${cells}
      <td class="total-hours-cell">${totalHours}h</td>
    `;

    body.appendChild(row);
  });
};

const findStaffEntry = (roster, auth) => {
  if (!auth || auth.type !== "employee" || !Array.isArray(roster.entries)) {
    return null;
  }

  const normalizedEmail = normalize(auth.email || "");
  const normalizedName = normalize(auth.name || "");
  const authId = (auth.id || "").trim();

  return roster.entries.find((entry) => {
    if (!entry) return false;

    const entryEmail = normalize(entry.email || "");
    if (entryEmail && normalizedEmail && entryEmail === normalizedEmail) {
      return true;
    }

    const entryId = (entry.employeeId || "").trim();
    if (entryId && authId && entryId === authId) {
      return true;
    }

    const entryName = normalize(entry.name || "");
    return entryName && normalizedName && entryName === normalizedName;
  });
};

const showNoRosterState = () => {
  clearRosterTable();
  hideRosterMeta();
  setRosterInfo("Roster details will appear here once published.");
  showShiftPlaceholder(
    "The roster has not been published yet.",
    "We will notify you as soon as the new roster is available.",
  );
};

const showErrorState = (message) => {
  clearRosterTable();
  hideRosterMeta();
  setRosterInfo(message || "Unable to load roster.");
  showShiftPlaceholder(
    message || "Unable to load roster.",
    "Please try again later or contact an administrator.",
  );
};

const populateRoster = (roster, auth) => {
  if (
    !roster ||
    !Array.isArray(roster.entries) ||
    roster.entries.length === 0
  ) {
    showNoRosterState();
    return;
  }

  updateRosterMeta(roster);
  const formattedWeek = formatDate(roster.weekStart);
  setRosterInfo(
    formattedWeek !== "Not Set" ? `Week of ${formattedWeek}` : "Roster details",
  );

  const staffEntry = findStaffEntry(roster, auth);
  renderRosterTable(roster, staffEntry);

  if (staffEntry) {
    const descriptionEl = getEl("staff-shift-description");
    if (descriptionEl) {
      descriptionEl.textContent =
        "Here are your scheduled shifts for this week.";
    }
    renderShiftList(staffEntry);
  } else if (auth && auth.type === "employee") {
    showShiftPlaceholder(
      "You have not been assigned any shifts this week.",
      "Reach out to your manager if you believe this is a mistake.",
    );
  } else {
    showShiftPlaceholder(
      "Sign in as a staff member to view your shifts.",
      "Sign in to see your personalised schedule.",
    );
  }
};

const fetchRoster = async () => {
  const response = await fetch(ROSTER_API_BASE, { cache: "no-store" });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Unable to load roster right now.");
  }

  return data.roster || null;
};

const loadStaffRoster = async () => {
  try {
    const auth = readAuth();
    const roster = await fetchRoster();
    populateRoster(roster, auth);
  } catch (error) {
    console.error("Failed to load staff roster", error);
    showErrorState(error.message || "Unable to load roster.");
  }
};

const initializeStaffDashboard = () => {
  syncAuthUi();
  clearRosterTable();
  hideRosterMeta();
  showShiftPlaceholder("Loading roster...", "Fetching the latest schedule.");
  loadStaffRoster();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeStaffDashboard);
} else {
  initializeStaffDashboard();
}
