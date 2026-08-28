// API Base URL
const API_BASE = '/api';

// Token Management
const TokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  isTokenValid: () => TokenManager.getToken() !== null,
};

// UI State Management
const UIState = {
  currentUser: null,
  isLoggedIn: false,

  setLoggedIn: (user) => {
    UIState.currentUser = user;
    UIState.isLoggedIn = true;
    UIState.updateUI();
  },

  setLoggedOut: () => {
    UIState.currentUser = null;
    UIState.isLoggedIn = false;
    UIState.updateUI();
  },

  updateUI: () => {
    const authContainer = document.getElementById('authContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (UIState.isLoggedIn) {
      authContainer.classList.add('hidden');
      dashboardContainer.classList.remove('hidden');
      userMenuBtn.classList.remove('hidden');
      document.getElementById('userDisplayName').textContent = UIState.currentUser.username || UIState.currentUser.email;
      updateDashboard(UIState.currentUser);
    } else {
      authContainer.classList.remove('hidden');
      dashboardContainer.classList.add('hidden');
      userMenuBtn.classList.add('hidden');
      userDropdown.classList.add('hidden');
      TokenManager.removeToken();
    }
  },
};

// Message Display
function showMessage(message, type = 'info') {
  const container = document.getElementById('messageContainer');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  container.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// API Calls
async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const token = TokenManager.getToken();
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication Functions
async function handleLogin(email, password) {
  try {
    const response = await apiCall('/auth/login', 'POST', { email, password });

    if (response.success) {
      TokenManager.setToken(response.token);
      UIState.setLoggedIn(response.user);
      showMessage('Login successful!', 'success');
      return true;
    }
  } catch (error) {
    showMessage(error.message || 'Login failed', 'error');
    return false;
  }
}

async function handleRegister(username, email, password, confirmPassword) {
  if (password !== confirmPassword) {
    showMessage('Passwords do not match', 'error');
    return false;
  }

  try {
    const response = await apiCall('/auth/register', 'POST', {
      username,
      email,
      password,
    });

    if (response.success) {
      TokenManager.setToken(response.token);
      UIState.setLoggedIn(response.user);
      showMessage('Registration successful!', 'success');
      return true;
    }
  } catch (error) {
    showMessage(error.message || 'Registration failed', 'error');
    return false;
  }
}

async function handleLogout() {
  try {
    await apiCall('/auth/logout', 'POST');
    UIState.setLoggedOut();
    showMessage('Logout successful', 'success');
  } catch (error) {
    console.error('Logout error:', error);
    UIState.setLoggedOut();
  }
}

// Dashboard Functions
function updateDashboard(user) {
  document.getElementById('dashboardUsername').textContent = user.username || 'User';
  document.getElementById('dashboardEmail').textContent = user.email;
  document.getElementById('dashboardId').textContent = user.id;
  document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
}

// Form Handlers
function setupFormHandlers() {
  // Login form
  document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (rememberMe) {
      localStorage.setItem('rememberEmail', email);
    } else {
      localStorage.removeItem('rememberEmail');
    }

    await handleLogin(email, password);
  });

  // Register form
  document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    await handleRegister(username, email, password, confirmPassword);
  });

  // Toggle between forms
  document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');
  });

  document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
  });

  // User menu
  document.getElementById('userMenuBtn').addEventListener('click', () => {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('hidden');
  });

  // Dashboard link
  document.getElementById('dashboardLink').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('userDropdown').classList.add('hidden');
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    handleLogout();
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const dropdown = document.getElementById('userDropdown');
    if (e.target !== userMenuBtn && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

// Check if user is already logged in
async function checkAuthStatus() {
  if (TokenManager.isTokenValid()) {
    try {
      const response = await apiCall('/auth/verify', 'GET');
      if (response.success) {
        UIState.setLoggedIn(response.user);
      } else {
        TokenManager.removeToken();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      TokenManager.removeToken();
    }
  }

  // Restore remember me
  const rememberedEmail = localStorage.getItem('rememberEmail');
  if (rememberedEmail) {
    document.getElementById('loginEmail').value = rememberedEmail;
    document.getElementById('rememberMe').checked = true;
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  setupFormHandlers();
  await checkAuthStatus();
});
