const AUTH_STORAGE_KEY = 'grillandgo.auth';
const LOGOUT_URL = '/auth/logout';

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
  const buttons = document.querySelectorAll('.signin-btn');

  buttons.forEach((button) => {
    button.removeEventListener('click', handleLogoutClick);

    if (!auth) {
      button.textContent = 'Sign In';
      button.setAttribute('href', '/login');
      button.dataset.action = 'signin';
    } else {
      button.textContent = 'Logout';
      button.setAttribute('href', LOGOUT_URL);
      button.dataset.action = 'logout';
      button.addEventListener('click', handleLogoutClick);
    }
  });
};

const storeAuth = (payload) => {
  writeAuth(payload);
  syncSignInButtons();
};

document.addEventListener('DOMContentLoaded', () => {
  syncSignInButtons();
});

window.GrillAndGoAuth = {
  store: storeAuth,
  clear: () => {
    writeAuth(null);
    syncSignInButtons();
  },
  read: readAuth,
};
