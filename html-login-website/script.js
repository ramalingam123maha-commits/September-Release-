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
// Form Validation
// ========================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(username) {
    return username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username);
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.classList.remove('show');
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

// ========================================
// Form Switching
// ========================================

function switchToRegister(event) {
    event.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    clearAllErrors();
}

function switchToLogin(event) {
    event.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    clearAllErrors();
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
        msg.textContent = '';
        msg.classList.remove('show');
    });
}

// ========================================
// Password Visibility
// ========================================

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// ========================================
// Login Handler
// ========================================

function handleLogin(event) {
    event.preventDefault();
    
    // Clear previous messages
    clearError('loginError');
    clearError('loginSuccess');
    clearError('loginEmailError');
    clearError('loginPasswordError');
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validation
    let isValid = true;
    
    if (!email) {
        showError('loginEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('loginEmailError', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        showError('loginPasswordError', 'Password is required');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Find user
    const user = findUser(email);
    
    if (!user) {
        showError('loginError', 'Invalid email or password');
        return;
    }
    
    // Check password (in real app, this would be hashed)
    if (user.password !== password) {
        showError('loginError', 'Invalid email or password');
        return;
    }
    
    // Login successful
    showSuccess('loginSuccess', 'Login successful! Redirecting...');
    
    // Set current user and show dashboard
    setCurrentUser(user);
    
    setTimeout(() => {
        showDashboard(user);
    }, 500);
}

// ========================================
// Register Handler
// ========================================

function handleRegister(event) {
    event.preventDefault();
    
    // Clear previous messages
    clearError('registerError');
    clearError('registerSuccess');
    clearError('usernameError');
    clearError('registerEmailError');
    clearError('registerPasswordError');
    clearError('confirmPasswordError');
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validation
    let isValid = true;
    
    if (!username) {
        showError('usernameError', 'Username is required');
        isValid = false;
    } else if (!validateUsername(username)) {
        showError('usernameError', 'Username must be 3+ characters (letters, numbers, _, -)');
        isValid = false;
    }
    
    if (!email) {
        showError('registerEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('registerEmailError', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        showError('registerPasswordError', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('registerPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }
    
    if (!agreeTerms) {
        showError('registerError', 'You must agree to the Terms and Conditions');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Save user
    const result = saveUser({
        username,
        email,
        password
    });
    
    if (!result.success) {
        if (result.message === 'User already exists') {
            const existingUser = findUser(email);
            if (existingUser.email === email) {
                showError('registerEmailError', 'Email already registered');
            } else {
                showError('usernameError', 'Username already taken');
            }
        } else {
            showError('registerError', result.message);
        }
        return;
    }
    
    // Registration successful
    showSuccess('registerSuccess', 'Account created successfully! Logging in...');
    
    setTimeout(() => {
        setCurrentUser(result.user);
        showDashboard(result.user);
    }, 500);
}

// ========================================
// Dashboard
// ========================================

function showDashboard(user) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    // Populate dashboard
    const userInitial = user.username.charAt(0).toUpperCase();
    document.getElementById('userInitial').textContent = userInitial;
    document.getElementById('dashboardUsername').textContent = user.username;
    document.getElementById('dashboardEmail').textContent = user.email;
    document.getElementById('loginCount').textContent = user.loginCount;
    
    // Format login time
    const loginTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('loginTime').textContent = loginTime;
    
    // Format last login
    if (user.lastLogin) {
        const lastLogin = new Date(user.lastLogin);
        const today = new Date();
        const isToday = lastLogin.toDateString() === today.toDateString();
        document.getElementById('lastLoginTime').textContent = isToday ? 'Today' : lastLogin.toLocaleDateString();
    } else {
        document.getElementById('lastLoginTime').textContent = 'First login';
    }
}

// ========================================
// Logout Handler
// ========================================

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        setCurrentUser(null);
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        
        // Reset form
        document.getElementById('loginFormElement').reset();
        document.getElementById('registerFormElement').reset();
        
        clearAllErrors();
    }
}

// ========================================
// Initialize App
// ========================================

function initializeApp() {
    initializeStorage();
    
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        showDashboard(currentUser);
    } else {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeApp);

// Prevent accidental refresh warning (optional)
let formChanged = false;
document.addEventListener('change', () => {
    formChanged = true;
});

window.addEventListener('beforeunload', (e) => {
    if (formChanged && !getCurrentUser()) {
        e.preventDefault();
        e.returnValue = '';
    }
});
