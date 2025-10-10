// Authentication page functionality (Login/Signup tabs)

function showLogin() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("signupForm").style.display = "none";

  // Update active tab
  const tabs = document.querySelectorAll(".auth-tab");
  tabs[0].classList.add("active");
  tabs[1].classList.remove("active");
}

function showSignup() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("signupForm").style.display = "block";

  // Update active tab
  const tabs = document.querySelectorAll(".auth-tab");
  tabs[0].classList.remove("active");
  tabs[1].classList.add("active");
}
