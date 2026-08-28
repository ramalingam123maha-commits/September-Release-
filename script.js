// Form validation and handling
class LoginManager {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.rememberMeCheckbox = document.getElementById('rememberMe');
        this.successMessage = document.getElementById('successMessage');

        this.initializeEventListeners();
        this.restoreRememberedEmail();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.emailInput.addEventListener('focus', () => this.clearEmailError());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.passwordInput.addEventListener('focus', () => this.clearPasswordError());
    }

    // Email Validation
    validateEmail() {
        const email = this.emailInput.value.trim();
        const errorElement = document.getElementById('emailError');

        if (!email) {
            this.showError('emailError', 'Email address is required');
            this.emailInput.classList.add('error');
            return false;
        }

        if (!this.isValidEmail(email)) {
            this.showError('emailError', 'Please enter a valid email address');
            this.emailInput.classList.add('error');
            return false;
        }

        errorElement.textContent = '';
        errorElement.classList.remove('show');
        this.emailInput.classList.remove('error');
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearEmailError() {
        document.getElementById('emailError').textContent = '';
        document.getElementById('emailError').classList.remove('show');
        this.emailInput.classList.remove('error');
    }

    // Password Validation
    validatePassword() {
        const password = this.passwordInput.value;
        const errorElement = document.getElementById('passwordError');

        if (!password) {
            this.showError('passwordError', 'Password is required');
            this.passwordInput.classList.add('error');
            return false;
        }

        if (password.length < 8) {
            this.showError('passwordError', 'Password must be at least 8 characters');
            this.passwordInput.classList.add('error');
            return false;
        }

        errorElement.textContent = '';
        errorElement.classList.remove('show');
        this.passwordInput.classList.remove('error');
        return true;
    }

    clearPasswordError() {
        document.getElementById('passwordError').textContent = '';
        document.getElementById('passwordError').classList.remove('show');
        this.passwordInput.classList.remove('error');
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    // Form Submission
    async handleSubmit(e) {
        e.preventDefault();

        // Validate both fields
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        const submitBtn = this.form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        try {
            // Simulate API call
            await this.simulateLogin();

            // Success
            this.successMessage.style.display = 'block';
            submitBtn.textContent = 'Success! Redirecting...';

            // Handle "Remember Me"
            if (this.rememberMeCheckbox.checked) {
                this.saveRememberedEmail(this.emailInput.value);
            } else {
                this.clearRememberedEmail();
            }

            // Simulate redirect after 2 seconds
            setTimeout(() => {
                alert('Login successful! In a real app, you would be redirected to the dashboard.');
                this.resetForm();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 2000);
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // Simulate API call (replace with real API in production)
    simulateLogin() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, 1500);
        });
    }

    resetForm() {
        this.form.reset();
        this.successMessage.style.display = 'none';
        this.clearEmailError();
        this.clearPasswordError();
    }

    // Remember Me functionality
    saveRememberedEmail(email) {
        try {
            localStorage.setItem('rememberedEmail', email);
        } catch (error) {
            console.warn('Could not save email to localStorage:', error);
        }
    }

    clearRememberedEmail() {
        try {
            localStorage.removeItem('rememberedEmail');
        } catch (error) {
            console.warn('Could not clear email from localStorage:', error);
        }
    }

    restoreRememberedEmail() {
        try {
            const rememberedEmail = localStorage.getItem('rememberedEmail');
            if (rememberedEmail) {
                this.emailInput.value = rememberedEmail;
                this.rememberMeCheckbox.checked = true;
            }
        } catch (error) {
            console.warn('Could not restore email from localStorage:', error);
        }
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.toggle-password');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.textContent = '🙈';
        toggleButton.setAttribute('aria-label', 'Hide password');
    } else {
        passwordInput.type = 'password';
        toggleButton.textContent = '👁️';
        toggleButton.setAttribute('aria-label', 'Show password');
    }
}

// Initialize login manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// Prevent autofill issues
window.addEventListener('load', () => {
    // Trigger validation on autofilled inputs
    const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
    inputs.forEach(input => {
        if (input.value) {
            input.dispatchEvent(new Event('blur', { bubbles: true }));
        }
    });
});
