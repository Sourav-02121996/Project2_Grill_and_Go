const AUTH_STORAGE_KEY = "grillandgo.auth";
const LOGOUT_URL = "/auth/logout";
const CUSTOMER_API_BASE = "/api/customers";
const MIN_PASSWORD_LENGTH = 6;

const readAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeAuth = (payload) => {
  if (!payload) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

const handleLogoutClick = (event) => {
  if (event) {
    event.preventDefault();
  }
  writeAuth(null);
  window.location.href = LOGOUT_URL;
};

const syncSignInButtons = () => {
  const auth = readAuth();
  const buttons = document.querySelectorAll(".signin-btn");

  buttons.forEach((button) => {
    button.removeEventListener("click", handleLogoutClick);

    if (!auth) {
      button.textContent = "Sign In";
      button.setAttribute("href", "/login");
      button.dataset.action = "signin";
    } else {
      button.textContent = "Logout";
      button.setAttribute("href", LOGOUT_URL);
      button.dataset.action = "logout";
      button.addEventListener("click", handleLogoutClick);
    }
  });

  // Show/hide admin-only nav items
  const adminNavItems = document.querySelectorAll(".admin-only");
  const isAdmin = auth && auth.type === "employee" && auth.role === "admin";

  adminNavItems.forEach((item) => {
    item.style.display = isAdmin ? "block" : "none";
  });
};

const storeAuth = (payload) => {
  writeAuth(payload);
  syncSignInButtons();
};

const clearMessage = (element) => {
  if (!element) return;
  element.textContent = "";
  element.classList.remove("show");
};

const setMessage = (element, message, type = "error") => {
  if (!element) return;

  element.textContent = message;

  if (!message) {
    element.classList.remove("show");
    return;
  }

  if (type === "success") {
    element.classList.add("auth-message--success");
  } else {
    element.classList.remove("auth-message--success");
  }

  element.classList.add("show");
};

const parseJsonSafely = async (response) => {
  try {
    return await response.json();
  } catch (error) {
    console.debug("auth: response was not JSON", error);
    return {};
  }
};

const initLoginForm = () => {
  const form = document.getElementById("customer-login-form");
  if (!form) return;

  const loginErrorEl = document.getElementById("login-error");
  let allowDirectSubmit = false;

  form.addEventListener("submit", async (event) => {
    if (allowDirectSubmit) {
      return;
    }

    event.preventDefault();
    clearMessage(loginErrorEl);

    const formData = new FormData(form);
    const email = (formData.get("email") || "").trim();
    const password = formData.get("password") || "";

    if (!email || !password) {
      setMessage(loginErrorEl, "Email and password are required.");
      return;
    }

    try {
      const response = await fetch(`${CUSTOMER_API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const customer = data.customer;
        storeAuth({
          type: "customer",
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        });
        window.location.href = "/";
        return;
      }

      if (response.status === 401) {
        const data = await parseJsonSafely(response);
        setMessage(
          loginErrorEl,
          data.message || "Incorrect password. Please try again.",
        );
        return;
      }

      if (response.status === 404) {
        allowDirectSubmit = true;
        form.submit();
        return;
      }

      const data = await parseJsonSafely(response);
      setMessage(
        loginErrorEl,
        data.message || "Unable to sign in right now. Please try again.",
      );
    } catch (error) {
      console.error("auth: login request failed", error);
      setMessage(
        loginErrorEl,
        "We couldn't reach the server. Please check your connection and try again.",
      );
    }
  });
};

const initSignupForm = () => {
  const form = document.getElementById("customer-signup-form");
  if (!form) return;

  const signupErrorEl = document.getElementById("signup-error");
  const signupSuccessEl = document.getElementById("signup-success");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(signupErrorEl);
    clearMessage(signupSuccessEl);

    const formData = new FormData(form);
    const name = (formData.get("name") || "").trim();
    const email = (formData.get("email") || "").trim();
    const phone = (formData.get("phone") || "").trim();
    const password = formData.get("password") || "";
    const confirmPassword = formData.get("confirmPassword") || "";

    if (!name || !email || !password) {
      setMessage(signupErrorEl, "Name, email, and password are required.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(
        signupErrorEl,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(signupErrorEl, "Passwords do not match. Please try again.");
      return;
    }

    try {
      const response = await fetch(`${CUSTOMER_API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          password,
          confirmPassword,
        }),
      });

      const data = await parseJsonSafely(response);

      if (response.ok) {
        setMessage(
          signupSuccessEl,
          "Account created successfully! You can now sign in.",
          "success",
        );
        form.reset();
        showLogin();
        return;
      }

      setMessage(
        signupErrorEl,
        data.message ||
          "Unable to create your account right now. Please try again.",
      );
    } catch (error) {
      console.error("auth: signup request failed", error);
      setMessage(
        signupErrorEl,
        "We couldn't reach the server. Please check your connection and try again.",
      );
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  syncSignInButtons();
  initLoginForm();
  initSignupForm();
});

window.GrillAndGoAuth = {
  store: storeAuth,
  clear: () => {
    writeAuth(null);
    syncSignInButtons();
  },
  read: readAuth,
  sync: syncSignInButtons,
};

// Authentication page functionality (Login/Signup tabs)
function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";
  clearMessage(document.getElementById("signup-error"));
  clearMessage(document.getElementById("signup-success"));

  // Update active tab
  const tabs = document.querySelectorAll(".auth-tab");
  tabs[0].classList.add("active");
  tabs[1].classList.remove("active");
}

function showSignup() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";
  clearMessage(document.getElementById("login-error"));

  // Update active tab
  const tabs = document.querySelectorAll(".auth-tab");
  tabs[0].classList.remove("active");
  tabs[1].classList.add("active");
}

window.showLogin = showLogin;
window.showSignup = showSignup;
