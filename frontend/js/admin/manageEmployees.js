(() => {
  const EMPLOYEES_API_BASE = "/api/employees";

  const modal = document.getElementById("addEmployeeModal");
  const modalTitle = document.getElementById("employee-modal-title");
  const form = document.getElementById("employee-form");
  const formFeedback = document.getElementById("employee-form-feedback");
  const listFeedback = document.getElementById("employee-feedback");
  const listContainer = document.getElementById("employee-list-items");

  const nameInput = document.getElementById("emp-name");
  const emailInput = document.getElementById("emp-email");
  const phoneInput = document.getElementById("emp-phone");
  const roleInput = document.getElementById("emp-role");
  const passwordInput = document.getElementById("emp-password");
  const idInput = document.getElementById("emp-id");

  const statTotalEl = document.getElementById("stat-total-employees");
  const statAdminEl = document.getElementById("stat-admin-count");
  const statStaffEl = document.getElementById("stat-staff-count");

  let employees = [];
  let modalMode = "create";

  const resetForm = () => {
    if (form) {
      form.reset();
    }
    if (idInput) {
      idInput.value = "";
    }
    clearEmployeeMessage(formFeedback);
    if (passwordInput) {
      passwordInput.type = "password";
    }
  };

  const openModal = (employee = null) => {
    if (!modal) return;
    resetForm();
    modal.style.display = "flex";

    if (employee) {
      modalMode = "edit";
      modalTitle.textContent = `Edit Employee`;
      if (idInput) idInput.value = employee.id;
      if (nameInput) nameInput.value = employee.name ?? "";
      if (emailInput) emailInput.value = employee.email ?? "";
      if (phoneInput) phoneInput.value = employee.phone ?? "";
      if (roleInput)
        roleInput.value = (employee.role ?? "staff").toLowerCase();
      if (passwordInput) {
        passwordInput.placeholder = "Leave blank to keep current password";
        passwordInput.required = false;
      }
    } else {
      modalMode = "create";
      modalTitle.textContent = "Add New Employee";
      if (passwordInput) {
        passwordInput.placeholder = "Set initial password (min 6 characters)";
        passwordInput.required = true;
      }
    }
  };

  const closeAddEmployeeModal = () => {
    if (modal) {
      modal.style.display = "none";
    }
  };

  const showEmployeeMessage = (element, message, type = "error") => {
    if (!element) return;
    if (!message) {
      element.classList.remove("show", "error", "success");
      element.textContent = "";
      return;
    }
    element.textContent = message;
    element.classList.add("show");
    element.classList.toggle("error", type === "error");
    element.classList.toggle("success", type === "success");
  };

  const clearEmployeeMessage = (element) => {
    showEmployeeMessage(element, "");
  };

  const parseJson = async (response) => {
    try {
      return await response.json();
    } catch (error) {
      return {};
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(EMPLOYEES_API_BASE);
      if (!response.ok) {
        const data = await parseJson(response);
        throw new Error(data.message || "Failed to load employees.");
      }

      const data = await response.json();
      employees = Array.isArray(data.employees) ? data.employees : [];
      renderEmployees();
      updateStats();
      clearEmployeeMessage(listFeedback);
    } catch (error) {
      console.error("Failed to fetch employees", error);
      showEmployeeMessage(
        listFeedback,
        error.message || "Unable to load employees.",
      );
    }
  };

  const updateStats = () => {
    const total = employees.length;
    const admins = employees.filter(
      (employee) => (employee.role ?? "").toLowerCase() === "admin",
    ).length;
    const staff = total - admins;

    if (statTotalEl) statTotalEl.textContent = total;
    if (statAdminEl) statAdminEl.textContent = admins;
    if (statStaffEl) statStaffEl.textContent = staff;
  };

  const createAvatarContent = (employee) => {
    const name = employee.name ?? "";
    const firstChar = name.trim().charAt(0);
    if (!firstChar) {
      return "👤";
    }
    return firstChar.toUpperCase();
  };

  const formatDate = (isoString) => {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderEmployees = () => {
    if (!listContainer) return;

    listContainer.innerHTML = "";

    employees.forEach((employee) => {
      const card = document.createElement("div");
      card.className = "employee-card";
      card.dataset.employeeId = employee.id;

      const avatar = document.createElement("div");
      avatar.className = "employee-avatar";
      avatar.textContent = createAvatarContent(employee);

      const info = document.createElement("div");
      info.className = "employee-info";

      const heading = document.createElement("h3");
      heading.textContent = employee.name ?? "Unnamed";

      const roleLabel = document.createElement("p");
      roleLabel.className = `employee-role ${
        (employee.role ?? "staff").toLowerCase() === "admin"
          ? "admin-role"
          : "staff-role"
      }`;
      roleLabel.textContent =
        (employee.role ?? "staff").charAt(0).toUpperCase() +
        (employee.role ?? "staff").slice(1);

      const details = document.createElement("p");
      details.className = "employee-details";
      details.innerHTML = `
        <strong>Email:</strong> ${employee.email ?? "—"}<br />
        <strong>Phone:</strong> ${employee.phone ?? "—"}<br />
        <strong>Joined:</strong> ${formatDate(employee.createdAt)}
      `;

      info.appendChild(heading);
      info.appendChild(roleLabel);
      info.appendChild(details);

      const actions = document.createElement("div");
      actions.className = "employee-actions";

      const toggleBtn = document.createElement("button");
      const isAdmin = (employee.role ?? "").toLowerCase() === "admin";
      toggleBtn.className = `btn-toggle-admin ${isAdmin ? "active" : ""}`;
      toggleBtn.textContent = isAdmin ? "Remove Admin" : "Make Admin";
      toggleBtn.addEventListener("click", () =>
        toggleAdminRole(employee.id, isAdmin ? "staff" : "admin"),
      );

      const editBtn = document.createElement("button");
      editBtn.className = "btn-edit";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openModal(employee));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => confirmDelete(employee));

      actions.appendChild(toggleBtn);
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      card.appendChild(avatar);
      card.appendChild(info);
      card.appendChild(actions);
      listContainer.appendChild(card);
    });
  };

  const toggleAdminRole = async (id, nextRole) => {
    try {
      const response = await fetch(`${EMPLOYEES_API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!response.ok) {
        const data = await parseJson(response);
        throw new Error(data.message || "Unable to update role.");
      }

      await fetchEmployees();
      showEmployeeMessage(listFeedback, "Employee role updated.", "success");
    } catch (error) {
      showEmployeeMessage(
        listFeedback,
        error.message || "Failed to update employee.",
      );
    }
  };

  const confirmDelete = async (employee) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${
          employee.name ?? "this employee"
        }?`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${EMPLOYEES_API_BASE}/${employee.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await parseJson(response);
        throw new Error(data.message || "Unable to delete employee.");
      }

      await fetchEmployees();
      showEmployeeMessage(listFeedback, "Employee removed.", "success");
    } catch (error) {
      showEmployeeMessage(
        listFeedback,
        error.message || "Failed to delete employee.",
      );
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    clearEmployeeMessage(formFeedback);

    if (!nameInput || !emailInput || !roleInput) {
      showEmployeeMessage(
        formFeedback,
        "Unable to submit the form. Please reload the page and try again.",
      );
      return;
    }

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: (phoneInput?.value || "").trim(),
      role: roleInput.value,
    };

    const passwordValue = passwordInput ? passwordInput.value.trim() : "";
    if (modalMode === "create") {
      if (!payload.name || !payload.email || !passwordValue) {
        showEmployeeMessage(
          formFeedback,
          "Name, email, and password are required to create an employee.",
        );
        return;
      }
      payload.password = passwordValue;
    } else if (modalMode === "edit") {
      if (!payload.name || !payload.email) {
        showEmployeeMessage(
          formFeedback,
          "Name and email are required when updating an employee.",
        );
        return;
      }
      if (passwordValue) {
        payload.password = passwordValue;
      }
    }

    if (!payload.phone) {
      payload.phone = null;
    }

    try {
      const endpoint =
        modalMode === "create"
          ? EMPLOYEES_API_BASE
          : `${EMPLOYEES_API_BASE}/${idInput.value}`;

      const method = modalMode === "create" ? "POST" : "PUT";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Unable to save employee.");
      }

      await fetchEmployees();
      showEmployeeMessage(
        listFeedback,
        modalMode === "create"
          ? "Employee added successfully."
          : "Employee updated successfully.",
        "success",
      );

      closeAddEmployeeModal();
    } catch (error) {
      showEmployeeMessage(
        formFeedback,
        error.message || "We could not save this employee record.",
      );
    }
  };

  const showAddEmployeeModal = () => openModal(null);

  window.showAddEmployeeModal = showAddEmployeeModal;
  window.closeAddEmployeeModal = closeAddEmployeeModal;

  const initializeEmployeesPage = () => {
    if (!form) {
      console.warn("ManageEmployees: employee form not found; skipping init.");
      return;
    }

    form.addEventListener("submit", handleFormSubmit);
    fetchEmployees();

    if (modal) {
      window.addEventListener("click", (event) => {
        if (event.target === modal) {
          closeAddEmployeeModal();
        }
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeEmployeesPage);
  } else {
    initializeEmployeesPage();
  }
})();
