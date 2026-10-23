# HTML Login Website

A simple, elegant, and fully functional login website built with **pure HTML, CSS, and JavaScript** (no frameworks or dependencies required).

## 🎯 Features

### ✨ Core Functionality
- **User Registration** - Create a new account with username, email, and password
- **User Login** - Secure login with email and password validation
- **User Dashboard** - Personalized user dashboard after login
- **Session Management** - Login/logout functionality with persistent storage
- **Remember Me** - Checkbox to remember user preferences (UI ready)
- **Password Visibility Toggle** - Show/hide password option

### 🔐 Security & Validation
- **Client-side Validation** - Email, password, username validation
- **Email Validation** - Proper email format checking
- **Password Requirements** - Minimum 6 characters
- **Username Validation** - 3+ characters, alphanumeric with underscore/hyphen
- **Duplicate Prevention** - Prevents duplicate email or username registration
- **Local Storage** - User data stored in browser's local storage
- **Password Matching** - Confirms password match during registration

### 🎨 User Interface
- **Modern Design** - Clean, contemporary interface with gradient backgrounds
- **Responsive Layout** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Fade-in and slide-up animations for components
- **Error Messages** - Clear, inline error messages for validation failures
- **Success Messages** - Feedback on successful registration/login
- **Interactive Elements** - Hover effects and transitions on all interactive elements
- **Password Toggle** - Eye icon to show/hide passwords

### 📊 Dashboard Features
- **User Profile Display** - Shows username, email, and user avatar
- **Login Statistics** - Displays login count and last login time
- **Account Status** - Shows current account status
- **User Avatar** - Generates avatar with user's initial
- **Logout Button** - Easy logout functionality

## 📁 File Structure

```
html-login-website/
├── index.html      # Main HTML file with all forms and dashboard
├── styles.css      # Complete CSS styling with responsive design
├── script.js       # JavaScript logic for authentication and storage
└── README.md       # This file
```

## 🚀 Quick Start

### 1. Open in Browser
Simply open `index.html` in your web browser. No installation or server required!

```bash
# On macOS
open index.html

# On Windows
start index.html

# On Linux
xdg-open index.html
```

### 2. Using a Local Server (Optional)
For better compatibility, you can use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (with http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit: `http://localhost:8000/html-login-website/`

## 👥 Demo Accounts

Pre-populated demo accounts for testing:

| Username | Email | Password |
|----------|-------|----------|
| demo | demo@example.com | demo123 |
| testuser | test@example.com | test123 |

## 📋 Usage Guide

### Creating an Account
1. Click "Create one" link on the login page
2. Enter a username (3+ characters)
3. Enter your email address
4. Create a password (minimum 6 characters)
5. Confirm your password
6. Check the "I agree to Terms & Conditions" box
7. Click "Create Account"
8. Login with your new credentials

### Logging In
1. Enter your email address
2. Enter your password
3. Optionally check "Remember me"
4. Click "Sign In"
5. View your dashboard with profile and statistics

### Logging Out
1. Click the "Logout" button on the dashboard
2. Confirm the logout action
3. You'll be redirected to the login page

## 🎨 Customization

### Change Color Theme
Edit the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #007bff;      /* Main blue */
    --primary-dark: #0056b3;        /* Dark blue */
    --danger-color: #dc3545;        /* Red for alerts */
    --success-color: #28a745;       /* Green for success */
    /* ... etc ... */
}
```

### Change Background Gradient
Edit the `body` background in `styles.css`:

```css
body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    /* Change to your preferred gradient */
}
```

### Modify Form Fields
Edit `index.html` to add or remove form fields, then update validation in `script.js`.

## 💾 Data Storage

All user data is stored in the browser's **LocalStorage**:
- `users` - Array of all registered users
- `currentUser` - Currently logged-in user (null if logged out)

Data persists across browser sessions until manually cleared via:
```javascript
localStorage.clear();  // In browser console
```

### User Data Structure
```javascript
{
    id: 1234567890,
    username: "johndoe",
    email: "john@example.com",
    password: "hashedPassword",
    loginCount: 5,
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T08:00:00Z"
}
```

## 🔒 Security Notes

⚠️ **Important for Production:**
- This project uses **client-side storage only** (LocalStorage)
- Passwords are stored in **plain text** in the browser
- This is suitable for **learning/demo purposes only**
- **DO NOT use this for real applications with sensitive data**

### For Production Use:
- Implement a backend server (Node.js, Python, etc.)
- Use password hashing (bcrypt, Argon2)
- Implement JWT or session-based authentication
- Use HTTPS for secure communication
- Implement server-side validation
- Add email verification
- Add password reset functionality

## 📱 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | Latest | ✅ Full support |
| Firefox | Latest | ✅ Full support |
| Safari | Latest | ✅ Full support |
| Edge | Latest | ✅ Full support |
| IE | 11 | ⚠️ Limited support |

## 🎓 Learning Value

This project is great for learning:
- ✅ HTML form structure and semantics
- ✅ CSS Grid and Flexbox layouts
- ✅ CSS animations and transitions
- ✅ JavaScript form validation
- ✅ LocalStorage API usage
- ✅ Event handling and DOM manipulation
- ✅ Responsive web design
- ✅ User experience (UX) design
- ✅ Session management concepts
- ✅ Object-oriented programming patterns

## 🚀 Future Enhancements

Potential features to add:
- [ ] Email verification
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] User profile editing
- [ ] Profile picture upload
- [ ] Backend integration with real database
- [ ] Password strength meter
- [ ] Login history tracking
- [ ] Account lockout after failed attempts
- [ ] User preferences/settings
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Export user data

## 📄 License

This project is open source and available for educational purposes.

## 💡 Tips & Tricks

### Clear All Data
Open browser DevTools (F12) and run:
```javascript
localStorage.clear();
```

### View Stored Users
In browser console:
```javascript
JSON.parse(localStorage.getItem('users'))
```

### Check Current User
In browser console:
```javascript
JSON.parse(localStorage.getItem('currentUser'))
```

## 🤝 Contributing

Feel free to fork, modify, and improve this project for your learning!

## 📞 Support

For issues or questions, refer to the code comments and documentation above.

---

**Enjoy building with HTML, CSS, and JavaScript! 🎉**
