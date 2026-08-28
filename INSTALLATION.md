# Login Website Setup & Running Guide

**Current Date & Time**: Friday, August 28, 2026 - 11:14:56 UTC

## Project Overview

A secure, modern login website built with Node.js/Express backend and vanilla JavaScript frontend. Features JWT authentication, bcrypt password hashing, rate limiting, and input validation.

## ✅ Features Implemented

### Authentication & Security
- ✅ User registration with validation
- ✅ Secure login with JWT tokens
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Session management via JWT
- ✅ Token verification and validation
- ✅ Rate limiting (5 login attempts per 15 min, 3 registrations per hour)
- ✅ CORS protection
- ✅ Input validation with express-validator

### Frontend UI/UX
- ✅ Beautiful, modern login form
- ✅ User registration form with password confirmation
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Real-time form switching (Login ↔ Register)
- ✅ User dashboard with account information
- ✅ User profile menu with logout
- ✅ Remember me functionality
- ✅ Toast notifications for user feedback
- ✅ Smooth animations and transitions

### Backend
- ✅ Express.js API server
- ✅ PostgreSQL database integration
- ✅ Authentication routes (register, login, verify)
- ✅ Protected routes with JWT middleware
- ✅ Error handling
- ✅ Database initialization
- ✅ Request validation middleware

## 📁 Project Structure

```
September-Release-/
├── server.js                    # Express server entry point
├── package.json                 # Dependencies & scripts
├── .env                         # Environment variables (create this)
├── .env.example                 # Example env file
├── config/
│   └── database.js             # PostgreSQL connection & initialization
├── routes/
│   └── auth.js                 # Authentication routes
├── controllers/
│   └── authController.js       # Auth logic (register, login, verify, logout)
├── middleware/
│   ├── auth.js                 # JWT token verification
│   └── validation.js           # Input validation rules
├── public/
│   ├── index.html              # Main HTML file
│   ├── css/
│   │   └── styles.css          # Modern responsive styling
│   └── js/
│       └── app.js              # Frontend logic & API calls
└── README.md                    # Documentation
```

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Create a PostgreSQL database:
```bash
# Using psql
createdb login_website
```

Or using pgAdmin GUI.

### 4. Configure Environment
The `.env` file should be created with these settings:
```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=login_website
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=5000
NODE_ENV=development
```

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on http://localhost:5000

## 📝 How to Use

### Registration
1. Click "Sign up here" link
2. Enter username (3-50 characters)
3. Enter email address
4. Enter password (minimum 6 characters)
5. Confirm password
6. Click "Create Account"

### Login
1. Enter your email
2. Enter your password
3. Optionally check "Remember me" to save email
4. Click "Login"

### Dashboard
After login, you'll see:
- Welcome message with your username
- Account Information card (email, user ID, login status)
- Security Information card (password protection, session info)
- User dropdown menu in navbar with Logout option

### Logout
Click the user menu (top right) → Select "Logout"

## 🔐 Security Features

### Password Protection
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Compared securely during login

### Authentication
- JWT tokens with 1-hour expiration
- Tokens stored in browser localStorage
- Automatic token validation on protected routes

### Rate Limiting
- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP

### Input Validation
- Email format validation
- Username length (3-50 characters)
- Password minimum length (6 characters)
- Server-side validation on all requests

### CORS Protection
- Configured for development
- Can be restricted in production

## 🔌 API Endpoints

### Public Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: {
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "john_doe"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response: {
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "john_doe"
  }
}
```

### Protected Endpoints

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <token>

Response: {
  "success": true,
  "message": "Token is valid",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "username": "john_doe"
  }
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>

Response: {
  "success": true,
  "message": "Logout successful"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

The table is automatically created on first server startup.

## 🧪 Testing

### Manual Testing Steps

1. **Test Registration**
   - Go to http://localhost:5000
   - Click "Sign up here"
   - Fill form and submit
   - Should see success message and dashboard

2. **Test Login**
   - Refresh page (logs out)
   - Enter registered email and password
   - Should see dashboard

3. **Test Remember Me**
   - Check "Remember me" before login
   - Logout
   - Email should still be in login form

4. **Test Rate Limiting**
   - Try logging in with wrong password 6 times
   - Should get "Too many login attempts" error

5. **Test Token Expiry**
   - Login successfully
   - Wait for token to expire (1 hour) or manually modify token in localStorage
   - Refresh page
   - Should be logged out

## 🛠️ Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running
```bash
# macOS with Homebrew
brew services start postgresql

# Windows
# Use PostgreSQL services or pgAdmin

# Linux
sudo systemctl start postgresql
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change PORT in .env or kill process on port 5000
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

### Module Not Found
```
Cannot find module 'express'
```
**Solution**: Install dependencies
```bash
npm install
```

### Database Doesn't Exist
```
Error: database "login_website" does not exist
```
**Solution**: Create database first
```bash
createdb login_website
```

## 📦 Dependencies

- **express** (v4.18.2) - Web framework
- **pg** (v8.10.0) - PostgreSQL client
- **bcryptjs** (v2.4.3) - Password hashing
- **jsonwebtoken** (v9.0.0) - JWT tokens
- **cors** (v2.8.5) - CORS middleware
- **dotenv** (v16.0.3) - Environment variables
- **express-rate-limit** (v6.7.0) - Rate limiting
- **express-validator** (v7.0.0) - Input validation

## 🔄 Development Workflow

### Auto-reload on Changes
```bash
npm run dev
```
Uses nodemon to auto-restart server on file changes.

### Standard Start
```bash
npm start
```

## 📱 Responsive Design

- **Mobile** (< 480px): Single column, optimized touch targets
- **Tablet** (480px - 768px): Adjusted padding and font sizes
- **Desktop** (> 768px): Full feature layout with 2-column cards

## 🎨 Design Features

- Modern gradient background (purple/violet)
- Clean white containers with shadows
- Smooth animations and transitions
- Color-coded messages (green/success, red/error, orange/warning)
- Professional typography
- Accessible form controls
- Hover effects and visual feedback

## 🚦 Next Steps & Enhancements

Consider adding:
1. Email verification for new accounts
2. Forgot password functionality
3. Two-factor authentication (2FA)
4. Social login (Google, GitHub, Facebook)
5. User profile editing
6. Password change functionality
7. Account deletion
8. Login history
9. Session management dashboard
10. Admin panel

## ✍️ Notes

- JWT tokens expire after 1 hour
- Password minimum: 6 characters (can be increased in validation.js)
- Database tables created automatically on startup
- All passwords hashed with bcryptjs (10 salt rounds)
- CORS enabled for development (restrict in production)

## 📞 Support

For issues:
1. Check .env file configuration
2. Verify PostgreSQL is running
3. Check Node version (use v14+)
4. Review console logs for errors
5. Ensure all dependencies installed: `npm install`

---

**Built with Security in Mind** 🔐
