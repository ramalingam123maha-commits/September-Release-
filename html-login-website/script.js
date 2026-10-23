// ========================================
// Local Storage Management
// ========================================

// Initialize users storage
function initializeStorage() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
}

// Get all users
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save user
function saveUser(user) {
    const users = getUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === user.email || u.username === user.username);
    if (existingUser) {
        return { success: false, message: 'User already exists' };
    }
    
    user.id = Date.now();
    user.loginCount = 0;
    user.lastLogin = null;
    user.createdAt = new Date().toISOString();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    return { success: true, user };
}

// Find user by email
function findUser(email) {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Update user login info
function updateUserLogin(user) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        users[userIndex].loginCount = (users[userIndex].loginCount || 0) + 1;
        users[userIndex].lastLogin = new Date().toISOString();
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Get current user
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Set current user
function setCurrentUser(user) {
    if (user) {
        updateUserLogin(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.setItem('currentUser', JSON.stringify(null));
    }
}

// ========================================
// Validation Functions
// ========================================

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password validation
function isValidPassword(password) {
    return password && password.length >= 6;
}

// Username validation
function isValidUsername(username) {
    return username && username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username);
}

// ========================================
// Form Switching
// ========================================

function switchToRegister(event) {
    event.preventDefault();
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    clearMessages();
}

function switchToLogin(event) {
    event.preventDefault();
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    clearMessages();
}

// ========================================
// Password Visibility Toggle
// ========================================

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
}

// ========================================
// Message Management
// ========================================

function showMessage(message, type = 'info', containerId = 'loginMessage') {
    const container = document.getElementById(containerId);
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    messageEl.textContent = message;
    container.innerHTML = '';
    container.appendChild(messageEl);
}

function showSuccessMessage(message, containerId = 'loginMessage') {
    showMessage(message, 'success', containerId);
}

function showErrorMessage(message, containerId = 'loginMessage') {
    showMessage(message, 'error', containerId);
}

function clearMessages() {
    document.getElementById('loginMessage').innerHTML = '';
    document.getElementById('registerMessage').innerHTML = '';
}

// ========================================
// Error Display
// ========================================

function showError(fieldId, message) {
    const errorEl = document.getElementById(fieldId + 'Error');
    if (errorEl) {
        errorEl.textContent = message;
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
        el.textContent = '';
    });
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.classList.remove('error');
    });
}

// ========================================
// Login Handler
// ========================================

function handleLogin(event) {
    event.preventDefault();
    clearErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validation
    if (!email) {
        showError('loginEmail', 'Email is required');
        return;
    }

    if (!isValidEmail(email)) {
        showError('loginEmail', 'Please enter a valid email');
        return;
    }

    if (!password) {
        showError('loginPassword', 'Password is required');
        return;
    }

    // Find user
    const user = findUser(email);
    if (!user || user.password !== password) {
        showErrorMessage('Invalid email or password', 'loginMessage');
        return;
    }

    // Login successful
    setCurrentUser(user);
    showSuccessMessage('Login successful! Redirecting...', 'loginMessage');
    
    setTimeout(() => {
        showDashboard(user);
        document.getElementById('loginFormElement').reset();
    }, 500);
}

// ========================================
// Register Handler
// ========================================

function handleRegister(event) {
    event.preventDefault();
    clearErrors();

    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Username validation
    if (!username) {
        showError('registerUsername', 'Username is required');
        return;
    }

    if (!isValidUsername(username)) {
        showError('registerUsername', 'Username must be 3+ characters (letters, numbers, _, -)');
        return;
    }

    // Email validation
    if (!email) {
        showError('registerEmail', 'Email is required');
        return;
    }

    if (!isValidEmail(email)) {
        showError('registerEmail', 'Please enter a valid email');
        return;
    }

    // Check if email exists
    if (findUser(email)) {
        showError('registerEmail', 'Email already registered');
        return;
    }

    // Password validation
    if (!password) {
        showError('registerPassword', 'Password is required');
        return;
    }

    if (!isValidPassword(password)) {
        showError('registerPassword', 'Password must be at least 6 characters');
        return;
    }

    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        return;
    }

    if (!agreeTerms) {
        showError('agreeTerms', 'You must agree to the terms');
        return;
    }

    // Create user
    const result = saveUser({ username, email, password });
    if (!result.success) {
        showErrorMessage(result.message, 'registerMessage');
        return;
    }

    // Registration successful
    showSuccessMessage('Account created successfully! Please log in.', 'registerMessage');
    
    setTimeout(() => {
        switchToLogin({ preventDefault: () => {} });
        document.getElementById('loginEmail').value = email;
        document.getElementById('registerFormElement').reset();
    }, 1500);
}

// ========================================
// Dashboard Display
// ========================================

function showDashboard(user) {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    // Populate dashboard
    const firstLetter = user.username.charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = firstLetter;
    document.getElementById('dashboardUsername').textContent = user.username;
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('loginCount').textContent = user.loginCount || 1;

    // Format last login time
    if (user.lastLogin) {
        const lastLogin = new Date(user.lastLogin);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastLogin) / 60000);
        
        if (diffMinutes === 0) {
            document.getElementById('lastLoginTime').textContent = 'Just now';
        } else if (diffMinutes < 60) {
            document.getElementById('lastLoginTime').textContent = `${diffMinutes}m ago`;
        } else if (diffMinutes < 1440) {
            const hours = Math.floor(diffMinutes / 60);
            document.getElementById('lastLoginTime').textContent = `${hours}h ago`;
        } else {
            document.getElementById('lastLoginTime').textContent = lastLogin.toLocaleDateString();
        }
    } else {
        document.getElementById('lastLoginTime').textContent = 'Today';
    }

    // Format member since
    if (user.createdAt) {
        const createdDate = new Date(user.createdAt);
        document.getElementById('memberSince').textContent = createdDate.toLocaleDateString();
    }
}

// ========================================
// Logout Handler
// ========================================

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        setCurrentUser(null);
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        
        // Reset forms
        document.getElementById('loginFormElement').reset();
        document.getElementById('registerFormElement').reset();
        clearMessages();
        clearErrors();
    }
}

// ========================================
// Forgot Password (UI Placeholder)
// ========================================

function showForgotPassword() {
    alert('Forgot password feature coming soon!\n\nYou would receive a password reset link via email.');
}

// ========================================
// Page Initialization
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();

    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        showDashboard(currentUser);
    }

    // Add some demo users for testing (optional)
    if (getUsers().length === 0) {
        saveUser({
            username: 'demo',
            email: 'demo@example.com',
            password: 'demo123'
        });
        saveUser({
            username: 'testuser',
            email: 'test@example.com',
            password: 'test123'
        });
    }
});
