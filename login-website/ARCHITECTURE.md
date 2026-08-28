# Login Website - Project Structure & Architecture

## 📦 Complete File Structure

```
login-website/
│
├── README.md                          ← Main documentation
├── QUICKSTART.md                      ← Quick setup guide
├── API_DOCUMENTATION.md               ← API endpoints reference
│
├── backend/                           ← Node.js/Express Server
│   ├── server.js                      ← Express app & server setup
│   ├── package.json                   ← Backend dependencies
│   ├── .env.example                   ← Environment template
│   │
│   ├── models/
│   │   └── User.js                    ← MongoDB user schema
│   │                                      - Password hashing
│   │                                      - Login attempt tracking
│   │                                      - Account lockout logic
│   │
│   ├── routes/
│   │   └── auth.js                    ← Authentication endpoints
│   │                                      - POST /register
│   │                                      - POST /login
│   │                                      - GET /profile
│   │                                      - POST /logout
│   │
│   └── middleware/
│       └── auth.js                    ← JWT verification
│                                          - Token validation
│                                          - Protected routes
│
└── frontend/                          ← React Web Application
    ├── package.json                   ← Frontend dependencies
    ├── public/
    │   └── index.html                 ← HTML template
    │
    └── src/
        ├── App.js                     ← Main app component
        ├── App.css                    ← App styles
        ├── index.js                   ← React entry point
        ├── index.css                  ← Global styles
        │
        ├── context/
        │   └── AuthContext.js         ← Auth state management
        │                                  - User state
        │                                  - Token storage
        │                                  - Login/Register/Logout
        │
        ├── pages/
        │   ├── AuthPages.js           ← Login & Register pages
        │   │                              - LoginPage component
        │   │                              - RegisterPage component
        │   │                              - Form validation
        │   │
        │   └── Dashboard.js           ← User dashboard
        │                                  - User profile display
        │                                  - Feature showcase
        │                                  - Logout button
        │
        ├── components/
        │   └── ProtectedRoute.js      ← Route protection
        │                                  - ProtectedRoute wrapper
        │                                  - PublicRoute wrapper
        │                                  - Redirect logic
        │
        └── styles/
            ├── Auth.css               ← Login/Register styling
            ├── Dashboard.css          ← Dashboard styling
            └── (index.css above)      ← Global styling
```

## 🔄 Data Flow

### Registration Flow
```
User Input Form
       ↓
   Validation (Client)
       ↓
   axios POST /api/auth/register
       ↓
   Validation (Server)
       ↓
   Check User Exists
       ↓
   Hash Password
       ↓
   Save to MongoDB
       ↓
   Generate JWT Token
       ↓
   Store Token (localStorage)
       ↓
   Redirect to Dashboard
```

### Login Flow
```
User Input Form
       ↓
   Validation (Client)
       ↓
   axios POST /api/auth/login
       ↓
   Rate Limit Check
       ↓
   Find User in MongoDB
       ↓
   Check Account Lock Status
       ↓
   Compare Password Hash
       ↓
   (Wrong) → Increment Attempts
       ↓
   (Correct) → Reset Attempts
       ↓
   Generate JWT Token
       ↓
   Store Token (localStorage)
       ↓
   Redirect to Dashboard
```

### Protected Route Flow
```
Access /dashboard
       ↓
   Check localStorage for token
       ↓
   Token exists?
       ├─ Yes → ProtectedRoute passes through
       │         ↓
       │     Render Dashboard
       │
       └─ No → ProtectedRoute redirects
               ↓
            Redirect to /login
```

## 🛡️ Security Layers

### Layer 1: Input Validation
```
Frontend (Client-side)
├─ Email format validation
├─ Password length check
└─ Username format validation

Backend (Server-side)
├─ express-validator checks
├─ Type checking
└─ Database constraints
```

### Layer 2: Authentication
```
User Registration
├─ Check duplicate email/username
├─ Hash password with bcrypt
└─ Store securely in MongoDB

User Login
├─ Find user by email
├─ Compare password hashes
├─ Generate JWT token
└─ Return token to client
```

### Layer 3: Account Protection
```
Failed Login Attempts
├─ Track attempts per user
├─ Lock account after 5 failures
├─ Lock for 30 minutes
└─ Automatic unlock
```

### Layer 4: Rate Limiting
```
API Endpoints
├─ 10 requests per 15 minutes
├─ Per IP address tracking
└─ Automatic throttling
```

### Layer 5: Token Security
```
JWT Tokens
├─ Signed with secret key
├─ 7-day expiration
├─ Validated on each request
└─ Verified in middleware
```

## 📊 Database Schema

### User Collection (MongoDB)
```json
{
  "_id": ObjectId,
  "username": String (unique, min 3 chars),
  "email": String (unique, email format),
  "password": String (hashed),
  "isEmailVerified": Boolean,
  "lastLogin": Date,
  "loginAttempts": Number,
  "lockUntil": Date,
  "createdAt": Date (auto),
  "updatedAt": Date (auto)
}
```

## 🔌 API Architecture

### REST Endpoints
```
POST /api/auth/register       → Create new user
POST /api/auth/login          → Authenticate user
GET  /api/auth/profile        → Get user details (protected)
POST /api/auth/logout         → End session (protected)
```

### Response Format
```json
{
  "message": "Operation successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com"
  }
}
```

### Error Responses
```json
{
  "message": "Error description",
  "errors": [
    {
      "param": "field_name",
      "msg": "Validation message"
    }
  ]
}
```

## 🎯 Component Hierarchy

```
App
├─ BrowserRouter
│  └─ AuthProvider
│     └─ AppRoutes
│        ├─ PublicRoute
│        │  ├─ LoginPage
│        │  └─ RegisterPage
│        │
│        ├─ ProtectedRoute
│        │  └─ Dashboard
│        │
│        └─ ProtectedRoute (default)
│           └─ Dashboard
```

## 🔐 Authentication Context

```
AuthContext
├─ State
│  ├─ user
│  ├─ token
│  ├─ loading
│  └─ error
│
└─ Methods
   ├─ register()
   ├─ login()
   ├─ logout()
   ├─ getProfile()
   └─ isAuthenticated
```

## 🚀 Deployment Architecture

```
Production Setup
│
├─ Frontend (Deployed to Vercel/Netlify)
│  └─ React build artifacts
│
├─ Backend (Deployed to Heroku/AWS)
│  ├─ Express server
│  ├─ Environment variables
│  └─ SSL/TLS enabled
│
└─ Database (MongoDB Atlas)
   ├─ Cloud hosted
   ├─ SSL connection
   └─ Backups enabled
```

## 📈 Performance Considerations

### Frontend Optimization
- React lazy loading components
- Context API for efficient state
- CSS-in-JS for minimal bundle
- LocalStorage for token persistence

### Backend Optimization
- JWT for stateless auth
- MongoDB indexing on email/username
- Rate limiting for resource protection
- Connection pooling

### Security Practices
- HTTPS/TLS for all traffic
- Secure headers (CORS)
- Password hashing with salt
- Token expiration
- Account lockout mechanism

## 🔄 Scalability

### Horizontal Scaling
- Stateless JWT tokens
- Database connection pooling
- Load balancing ready
- Session independent

### Vertical Scaling
- Optimized queries
- Efficient data structures
- Minimal memory footprint
- Caching ready

---

**Architecture Last Updated:** 2024  
**Version:** 1.0.0
