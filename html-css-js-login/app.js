/**
 * AuthPortal - Pure HTML, CSS & Vanilla JS Authentication Engine
 */

// Default mock database stored in localStorage if not existing
const DEFAULT_USERS = [
  {
    fullName: "Alex Morgan",
    email: "alex@example.com",
    password: "Secret123!",
    loginCount: 1,
    lastLogin: "2025-05-10T12:00:00Z"
  }
];

// Initialize LocalStorage users database
function initializeDatabase() {
  if (!localStorage.getItem('auth_users')) {
    localStorage.setItem('auth_users', JSON.stringify(DEFAULT_USERS));
  }
}

// State
let currentUser = null;

// DOM Elements
const authCard = document.getElementById('authCard');
const dashboardCard = document.getElementById('dashboardCard');
const toastEl = document.getElementById('toast');

const tabLogin = document.getElementById('tabLogin');
const tabRegister = document.getElementById('tabRegister');
const loginFormSection = document.getElementById('loginFormSection');
const registerFormSection = document.getElementById('registerFormSection');
const forgotFormSection = document.getElementById('forgotFormSection');

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotForm = document.getElementById('forgotForm');

const fillDemoBtn = document.getElementById('fillDemoBtn');
const linkForgotPassword = document.getElementById('linkForgotPassword');
const btnBackToLogin = document.getElementById('btnBackToLogin');
const btnLogout = document.getElementById('btnLogout');
const btnTestProtected = document.getElementById('btnTestProtected');

// Inputs & Errors
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginEmailError = document.getElementById('loginEmailError');
const loginPasswordError = document.getElementById('loginPasswordError');

const regFullName = document.getElementById('regFullName');
const regEmail = document.getElementById('regEmail');
const regPassword = document.getElementById('regPassword');
const regConfirmPassword = document.getElementById('regConfirmPassword');
const termsAgreement = document.getElementById('termsAgreement');

const regFullNameError = document.getElementById('regFullNameError');
const regEmailError = document.getElementById('regEmailError');
const regPasswordError = document.getElementById('regPasswordError');
const regConfirmPasswordError = document.getElementById('regConfirmPasswordError');
const termsError = document.getElementById('termsError');

const forgotEmail = document.getElementById('forgotEmail');
const forgotEmailError = document.getElementById('forgotEmailError');

// Password Strength Elements
const strengthContainer = document.getElementById('strengthContainer');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');

// Dashboard UI
const welcomeUserName = document.getElementById('welcomeUserName');
const welcomeUserEmail = document.getElementById('welcomeUserEmail');
const userAvatar = document.getElementById('userAvatar');
const statSessionTime = document.getElementById('statSessionTime');
const statLoginCount = document.getElementById('statLoginCount');

// Toast Helper
let toastTimeout;
function showToast(message, type = 'info') {
  clearTimeout(toastTimeout);
  toastEl.textContent = message;
  toastEl.className = `toast show ${type}`;
  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 4000);
}

// Tab Switching
function switchTab(targetSectionId) {
  clearAllErrors();
  
  // Hide all sections
  [loginFormSection, registerFormSection, forgotFormSection].forEach(section => {
    section.classList.remove('active');
  });

  if (targetSectionId === 'loginFormSection') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginFormSection.classList.add('active');
    document.getElementById('authTabs').style.display = 'flex';
  } else if (targetSectionId === 'registerFormSection') {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerFormSection.classList.add('active');
    document.getElementById('authTabs').style.display = 'flex';
  } else if (targetSectionId === 'forgotFormSection') {
    document.getElementById('authTabs').style.display = 'none';
    forgotFormSection.classList.add('active');
  }
}

// Password toggle helper
function setupPasswordToggles() {
  const toggleButtons = document.querySelectorAll('.btn-toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
      } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
      }
    });
  });
}

// Password Strength Evaluation
function calculatePasswordStrength(pass) {
  let score = 0;
  if (!pass) return { score: 0, label: 'None', color: '#e2e8f0', width: '0%' };
  if (pass.length >= 8) score += 25;
  if (/[A-Z]/.test(pass)) score += 25;
  if (/[0-9]/.test(pass)) score += 25;
  if (/[^A-Za-z0-9]/.test(pass)) score += 25;

  if (score <= 25) return { score, label: 'Weak', color: '#ef4444', width: '25%' };
  if (score <= 50) return { score, label: 'Fair', color: '#f59e0b', width: '50%' };
  if (score <= 75) return { score, label: 'Good', color: '#3b82f6', width: '75%' };
  return { score, label: 'Strong', color: '#10b981', width: '100%' };
}

// Email regex
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Set error visual
function setError(inputEl, errorEl, msg) {
  inputEl.closest('.input-wrapper')?.classList.add('error');
  if (errorEl) errorEl.textContent = msg;
}

function clearError(inputEl, errorEl) {
  inputEl.closest('.input-wrapper')?.classList.remove('error');
  if (errorEl) errorEl.textContent = '';
}

function clearAllErrors() {
  document.querySelectorAll('.input-wrapper').forEach(w => w.classList.remove('error'));
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
}

// User Storage Helpers
function getUsers() {
  return JSON.parse(localStorage.getItem('auth_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('auth_users', JSON.stringify(users));
}

// Dashboard display
function showDashboard(user) {
  currentUser = user;
  sessionStorage.setItem('current_user', JSON.stringify(user));

  welcomeUserName.textContent = `Welcome back, ${user.fullName}!`;
  welcomeUserEmail.textContent = user.email;
  userAvatar.textContent = user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';
  statLoginCount.textContent = user.loginCount || 1;
  statSessionTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  authCard.classList.add('hidden');
  dashboardCard.classList.remove('hidden');
}

function showAuthCard() {
  currentUser = null;
  sessionStorage.removeItem('current_user');
  dashboardCard.classList.add('hidden');
  authCard.classList.remove('hidden');
  switchTab('loginFormSection');
}

// Event Listeners Setup
function setupEventListeners() {
  // Tabs
  tabLogin.addEventListener('click', () => switchTab('loginFormSection'));
  tabRegister.addEventListener('click', () => switchTab('registerFormSection'));
  
  // Forgot password flow
  linkForgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('forgotFormSection');
  });

  btnBackToLogin.addEventListener('click', () => {
    switchTab('loginFormSection');
  });

  // Demo auto-fill
  fillDemoBtn.addEventListener('click', () => {
    switchTab('loginFormSection');
    loginEmail.value = "alex@example.com";
    loginPassword.value = "Secret123!";
    clearError(loginEmail, loginEmailError);
    clearError(loginPassword, loginPasswordError);
    showToast('Demo credentials filled!', 'info');
  });

  // Live password strength indicator
  regPassword.addEventListener('input', () => {
    const val = regPassword.value;
    if (val.length > 0) {
      strengthContainer.classList.add('active');
      const strength = calculatePasswordStrength(val);
      strengthBar.style.width = strength.width;
      strengthBar.style.backgroundColor = strength.color;
      strengthText.textContent = `Strength: ${strength.label}`;
      strengthText.style.color = strength.color;
    } else {
      strengthContainer.classList.remove('active');
    }
  });

  // Real-time input clearing
  [loginEmail, loginPassword, regFullName, regEmail, regPassword, regConfirmPassword, forgotEmail].forEach(input => {
    input.addEventListener('input', () => {
      const errorEl = document.getElementById(`${input.id}Error`);
      clearError(input, errorEl);
    });
  });

  // Social login buttons simulation
  document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      showToast(`Redirecting to ${provider} OAuth...`, 'info');
      setTimeout(() => {
        const dummyUser = {
          fullName: `${provider} User`,
          email: `user@${provider.toLowerCase()}.com`,
          loginCount: 1,
          lastLogin: new Date().toISOString()
        };
        showToast(`Successfully logged in via ${provider}!`, 'success');
        showDashboard(dummyUser);
      }, 1000);
    });
  });

  // Login Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();

    const email = loginEmail.value.trim();
    const pass = loginPassword.value;
    let isValid = true;

    if (!email) {
      setError(loginEmail, loginEmailError, 'Please enter your email');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setError(loginEmail, loginEmailError, 'Please enter a valid email address');
      isValid = false;
    }

    if (!pass) {
      setError(loginPassword, loginPasswordError, 'Please enter your password');
      isValid = false;
    }

    if (!isValid) return;

    // Simulate async submission
    const submitBtn = document.getElementById('loginSubmitBtn');
    toggleBtnLoading(submitBtn, true);

    setTimeout(() => {
      toggleBtnLoading(submitBtn, false);
      const users = getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setError(loginEmail, loginEmailError, 'No account found with this email');
        showToast('Invalid credentials provided', 'error');
        return;
      }

      if (user.password !== pass) {
        setError(loginPassword, loginPasswordError, 'Incorrect password');
        showToast('Invalid credentials provided', 'error');
        return;
      }

      // Successful login
      user.loginCount = (user.loginCount || 1) + 1;
      user.lastLogin = new Date().toISOString();
      saveUsers(users);

      showToast(`Welcome back, ${user.fullName}!`, 'success');
      showDashboard(user);
    }, 700);
  });

  // Register Submit
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();

    const fullName = regFullName.value.trim();
    const email = regEmail.value.trim();
    const pass = regPassword.value;
    const confirmPass = regConfirmPassword.value;
    let isValid = true;

    if (!fullName) {
      setError(regFullName, regFullNameError, 'Please enter your full name');
      isValid = false;
    }

    if (!email) {
      setError(regEmail, regEmailError, 'Please enter your email address');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setError(regEmail, regEmailError, 'Please enter a valid email address');
      isValid = false;
    }

    if (!pass) {
      setError(regPassword, regPasswordError, 'Please create a password');
      isValid = false;
    } else if (pass.length < 8) {
      setError(regPassword, regPasswordError, 'Password must be at least 8 characters long');
      isValid = false;
    }

    if (!confirmPass) {
      setError(regConfirmPassword, regConfirmPasswordError, 'Please confirm your password');
      isValid = false;
    } else if (pass !== confirmPass) {
      setError(regConfirmPassword, regConfirmPasswordError, 'Passwords do not match');
      isValid = false;
    }

    if (!termsAgreement.checked) {
      termsError.textContent = 'You must agree to the Terms & Privacy Policy';
      isValid = false;
    }

    if (!isValid) return;

    const submitBtn = document.getElementById('registerSubmitBtn');
    toggleBtnLoading(submitBtn, true);

    setTimeout(() => {
      toggleBtnLoading(submitBtn, false);
      const users = getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        setError(regEmail, regEmailError, 'An account with this email already exists');
        showToast('Email already in use', 'error');
        return;
      }

      const newUser = {
        fullName,
        email,
        password: pass,
        loginCount: 1,
        lastLogin: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);

      showToast('Account created successfully! You are now logged in.', 'success');
      registerForm.reset();
      strengthContainer.classList.remove('active');
      showDashboard(newUser);
    }, 800);
  });

  // Forgot password submit
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();

    const email = forgotEmail.value.trim();
    if (!email) {
      setError(forgotEmail, forgotEmailError, 'Please enter your email');
      return;
    }
    if (!isValidEmail(email)) {
      setError(forgotEmail, forgotEmailError, 'Please enter a valid email address');
      return;
    }

    const submitBtn = document.getElementById('forgotSubmitBtn');
    toggleBtnLoading(submitBtn, true);

    setTimeout(() => {
      toggleBtnLoading(submitBtn, false);
      showToast('Reset password link sent to your email!', 'success');
      forgotForm.reset();
      setTimeout(() => {
        switchTab('loginFormSection');
      }, 1500);
    }, 700);
  });

  // Logout
  btnLogout.addEventListener('click', () => {
    showToast('Signed out successfully', 'info');
    showAuthCard();
  });

  // Test Protected
  btnTestProtected.addEventListener('click', () => {
    showToast('Authenticated API call verified: status 200 OK', 'success');
  });

  document.getElementById('btnChangePasswordModal')?.addEventListener('click', () => {
    showToast('Security settings: Multi-Factor Authentication is active.', 'info');
  });
}

function toggleBtnLoading(btn, isLoading) {
  const textSpan = btn.querySelector('.btn-text');
  const spinnerSpan = btn.querySelector('.btn-spinner');
  btn.disabled = isLoading;
  if (isLoading) {
    if (textSpan) textSpan.classList.add('hidden');
    if (spinnerSpan) spinnerSpan.classList.remove('hidden');
  } else {
    if (textSpan) textSpan.classList.remove('hidden');
    if (spinnerSpan) spinnerSpan.classList.add('hidden');
  }
}

// Auto restore session if present
function checkSession() {
  const session = sessionStorage.getItem('current_user');
  if (session) {
    try {
      const user = JSON.parse(session);
      showDashboard(user);
    } catch (e) {
      sessionStorage.removeItem('current_user');
    }
  }
}

// Initialization on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initializeDatabase();
  setupPasswordToggles();
  setupEventListeners();
  checkSession();
});
