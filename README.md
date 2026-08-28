# Login Website - Secure Authentication System

A modern, secure login website built with Node.js/Express backend and React frontend.

## Features

✅ User Registration with Email Validation
✅ Secure Login with JWT Authentication
✅ Password Hashing with bcrypt
✅ Session Management
✅ Protected Routes
✅ Logout Functionality
✅ Rate Limiting on Login Attempts
✅ CORS Protection
✅ Input Validation
✅ Error Handling

## Tech Stack

- **Backend**: Express.js, Node.js
- **Frontend**: HTML/CSS/JavaScript (Vanilla) + Modern UI
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, express-rate-limit, input validation

## Project Structure

```
login-website/
├── server.js                 # Express server entry point
├── config/
│   └── database.js          # Database configuration
├── routes/
│   └── auth.js              # Authentication routes
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   └── validation.js        # Input validation middleware
├── models/
│   └── User.js              # User model
├── public/
│   ├── index.html           # Main HTML file
│   ├── css/
│   │   └── styles.css       # Styling
│   └── js/
│       └── app.js           # Frontend logic
├── .env                      # Environment variables
└── package.json             # Dependencies
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Create a PostgreSQL database and update `.env`:
```
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=login_website
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### 3. Run Migrations
```bash
npm run migrate
```

### 4. Start Server
```bash
npm start
```

## API Endpoints

### Register
**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "secure_password"
}
```

### Login
**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Verify Token
**GET** `/api/auth/verify`
Headers: `Authorization: Bearer <token>`

### Logout
**POST** `/api/auth/logout`

## Security Features

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens with 1-hour expiration
- ✅ Rate limiting (5 attempts per 15 minutes)
- ✅ CORS enabled for trusted origins
- ✅ Input validation on all endpoints
- ✅ Secure HTTP-only cookies (optional)
- ✅ HTTPS recommended for production

## Usage

1. Navigate to http://localhost:5000
2. Register a new account
3. Login with your credentials
4. Access protected content
5. Logout to end session

## License

ISC
