# Login Website - Secure Authentication System

A complete, production-ready login website built with React and Node.js featuring secure authentication, account protection, and modern UI.

## 🎯 Features

### 🔐 Security
- **Password Hashing**: bcrypt with salt rounds (10) for secure password storage
- **JWT Authentication**: Token-based authentication with configurable expiry
- **Rate Limiting**: API rate limiting (10 requests per 15 minutes) to prevent brute force attacks
- **Account Lockout**: Automatic lockout after 5 failed login attempts for 30 minutes
- **CORS Protection**: Cross-Origin Resource Sharing configured for security
- **Input Validation**: Express-validator for all user inputs

### 👤 User Management
- **User Registration**: New user signup with email and username uniqueness checks
- **User Login**: Secure login with email and password
- **User Profile**: Retrieve user information and account details
- **Session Management**: Token-based sessions with automatic cleanup on logout

### 🎨 User Interface
- **Login Page**: Clean, responsive login form
- **Registration Page**: Complete signup form with password confirmation
- **Dashboard**: User profile and feature showcase
- **Protected Routes**: Automatic redirect for unauthorized users
- **Error Handling**: User-friendly error messages

### ⚙️ Technical Features
- **MongoDB Database**: NoSQL database for flexible user storage
- **RESTful API**: Clean API endpoints for authentication
- **Form Validation**: Client and server-side validation
- **Context API**: Global state management with React Context
- **Responsive Design**: Mobile-friendly interface

## 📋 Project Structure

```
login-website/
├── backend/
│   ├── models/
│   │   └── User.js           # User data model with methods
│   ├── routes/
│   │   └── auth.js           # Authentication endpoints
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── server.js             # Express server setup
│   ├── package.json          # Backend dependencies
│   └── .env.example          # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js      # Auth state management
    │   ├── pages/
    │   │   ├── AuthPages.js        # Login & Register pages
    │   │   └── Dashboard.js        # User dashboard
    │   ├── components/
    │   │   └── ProtectedRoute.js   # Route protection
    │   ├── styles/
    │   │   ├── Auth.css            # Auth pages styling
    │   │   ├── Dashboard.css       # Dashboard styling
    │   │   ├── App.css             # App styling
    │   │   └── index.css           # Global styles
    │   ├── App.js              # Main app component
    │   ├── index.js            # React entry point
    │   └── package.json        # Frontend dependencies
    └── public/
        └── index.html          # HTML template
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd login-website/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/login-website
   JWT_SECRET=your-super-secret-key-here
   JWT_EXPIRY=7d
   NODE_ENV=development
   ```

5. **Start MongoDB** (if local):
   ```bash
   mongod
   ```

6. **Start the backend server**:
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Open new terminal and navigate to frontend directory**:
   ```bash
   cd login-website/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   App will open at `http://localhost:3000`

## 📡 API Endpoints

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
  ```

#### Get User Profile
- **GET** `/api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "user": {
      "id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00Z",
      "lastLogin": "2024-01-20T14:25:00Z"
    }
  }
  ```

#### Logout
- **POST** `/api/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "message": "Logout successful"
  }
  ```

## 🔐 Security Features Explained

### Password Security
- Passwords are hashed using bcryptjs with 10 salt rounds
- Original password never stored in database
- Password comparison done securely on each login

### Account Protection
- Maximum 5 failed login attempts allowed
- Account automatically locked for 30 minutes after 5 failures
- Login attempts counter resets on successful login

### API Rate Limiting
- 10 requests per 15 minutes per IP address on login endpoint
- Prevents brute force and denial-of-service attacks

### JWT Tokens
- Tokens expire after 7 days (configurable)
- Token validated on each protected route
- Invalid tokens rejected automatically

### Input Validation
- Email format validation
- Username length requirements
- Password strength requirements (minimum 6 characters)
- All inputs sanitized before storage

## 🧪 Testing

### Test Account Creation
1. Go to `http://localhost:3000/register`
2. Create an account with:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`

### Test Login
1. Go to `http://localhost:3000/login`
2. Enter credentials
3. Should redirect to dashboard showing user info

### Test Account Lockout
1. Try logging in with wrong password 5 times
2. Account will lock for 30 minutes
3. Error message will inform user of lockout

### Test Protected Routes
1. Try accessing `/dashboard` without logging in
2. Should redirect to `/login`

## 📦 Dependencies

### Backend
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation
- **cors**: Cross-origin resource sharing
- **express-validator**: Input validation
- **express-rate-limit**: Rate limiting
- **dotenv**: Environment variables

### Frontend
- **react**: UI framework
- **react-router-dom**: Routing
- **axios**: HTTP client
- **react-scripts**: React build tools

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running. Start with: mongod
```

### CORS Error
```
Solution: Backend CORS is configured. Ensure frontend is on http://localhost:3000
```

### "Can't login" Issues
```
Solution: 
1. Check if backend is running on http://localhost:5000
2. Verify MongoDB is running
3. Check browser console for error messages
4. Ensure passwords match
```

### Port Already in Use
```
Solution: Kill process using the port or change PORT in .env
```

## 🔄 User Flow

```
User → Registration Page → Enter Details → Validate → Store in DB
User → Login Page → Enter Credentials → Verify → Generate Token
User → Redirected to Dashboard → View Profile → Logout
```

## 🛠️ Customization

### Change JWT Expiry
Edit `.env`:
```env
JWT_EXPIRY=30d  # Change to desired expiry
```

### Modify Lockout Duration
Edit `backend/models/User.js`, line with `lockTime`:
```javascript
const lockTime = 60 * 60 * 1000; // Change to desired minutes
```

### Update Theme Colors
Edit `frontend/src/index.css` in `:root`:
```css
:root {
  --primary-color: #your-color;
  ...
}
```

## 📝 License

This project is provided as-is for educational and commercial use.

## 🤝 Contributing

Feel free to fork and submit pull requests for any improvements.

## 📧 Support

For issues or questions, check the troubleshooting section or review the code comments.

---

**Happy Coding!** 🚀
