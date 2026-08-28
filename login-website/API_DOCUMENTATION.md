# Backend API Documentation

## Overview
The backend provides secure REST API endpoints for user authentication, registration, and profile management.

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Responses

All endpoints may return error responses:

### 400 Bad Request
```json
{
  "errors": [
    {
      "param": "email",
      "msg": "Please enter a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### 500 Internal Server Error
```json
{
  "message": "Registration failed",
  "error": "Error details"
}
```

## Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Validation Rules:**
- Username: min 3 characters, must be unique
- Email: valid email format, must be unique
- Password: min 6 characters

---

### POST /api/auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Rate Limit:**
- 10 requests per 15 minutes per IP

**Security:**
- Account locks after 5 failed attempts for 30 minutes

---

### GET /api/auth/profile
Retrieve authenticated user's profile information.

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-20T14:25:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "message": "No token provided"
}
```

---

### POST /api/auth/logout
End the current session (token cleanup on client side).

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Security Considerations

### Password Hashing
- Passwords are hashed using bcryptjs with 10 salt rounds
- Plaintext passwords never stored in database
- Password field excluded from most queries for safety

### JWT Tokens
- Token valid for 7 days (configured in `.env`)
- Tokens include user ID in payload
- Invalid/expired tokens rejected with 401 status

### Rate Limiting
- Login endpoint limited to 10 attempts per 15 minutes
- Prevents brute force attacks
- Per-IP tracking

### Account Protection
- Failed login counter incremented on wrong password
- Account locked after 5 failed attempts
- 30-minute lockout period with automatic unlock

### Input Validation
- All inputs validated using express-validator
- Email format validated
- Username and password length checked
- SQL injection prevented through mongoose ODM

## Example Usage

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Fetch API (JavaScript)

```javascript
// Register
const registerRes = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123'
  })
});

// Login
const loginRes = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123'
  })
});

// Get Profile
const token = 'your_jwt_token';
const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

**Version:** 1.0.0  
**Last Updated:** 2024
