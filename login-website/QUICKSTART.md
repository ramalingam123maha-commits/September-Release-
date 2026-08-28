# Quick Start Guide - Login Website

## 🚀 Installation & Setup (5 minutes)

### Step 1: Install Backend Dependencies
```bash
cd login-website/backend
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
# Edit .env and set your MongoDB URI if needed
```

### Step 3: Start MongoDB (if using local)
```bash
mongod
```
In another terminal, continue to Step 4.

### Step 4: Start Backend Server
```bash
cd login-website/backend
npm start
```
You should see: `Server running on port 5000`

### Step 5: Install Frontend Dependencies
Open a NEW terminal and run:
```bash
cd login-website/frontend
npm install
```

### Step 6: Start Frontend Development Server
```bash
npm start
```
Browser will automatically open at `http://localhost:3000`

## 📝 First Test

1. Click "Sign Up" on the login page
2. Create an account:
   - Username: `demo`
   - Email: `demo@example.com`
   - Password: `password123`
3. Click "Sign Up"
4. You should be redirected to the Dashboard showing your user info

## 🧪 Try These Features

### Login/Logout
1. Logout from dashboard
2. Login with your credentials
3. Should see your profile again

### Account Lockout (Security Feature)
1. Try logging in with wrong password 5 times
2. On 5th attempt, account locks for 30 minutes
3. Try again, you'll see lockout message

### Protected Routes
1. Logout and try accessing `/dashboard` manually
2. Should redirect to `/login`

## 📁 Project Files Overview

```
login-website/
├── backend/          → Node.js/Express API
│   ├── server.js     → Main server file
│   ├── routes/       → API endpoints
│   └── models/       → User data model
│
└── frontend/         → React web app
    ├── src/pages/    → Login, Register, Dashboard pages
    ├── src/context/  → Auth state management
    └── src/styles/   → CSS styling
```

## 🔑 Default Testing

**Test Account (after registration):**
- Email: `demo@example.com`
- Password: `password123`
- Username: `demo`

## 🛠️ Troubleshooting

### Backend won't start
```
Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: Start MongoDB with: mongod
```

### Frontend can't connect to backend
```
Error: POST /api/auth/login 404
Solution: Make sure backend is running on port 5000
```

### Port already in use
```
Solution: 
- For port 5000: sudo lsof -i :5000 | kill -9 <PID>
- For port 3000: sudo lsof -i :3000 | kill -9 <PID>
```

### MongoDB error
```
Solution: 
1. Check MongoDB is installed
2. Start MongoDB: mongod
3. For cloud DB, update MONGODB_URI in .env
```

## 📚 Next Steps

1. Read `README.md` for full documentation
2. Check `API_DOCUMENTATION.md` for API details
3. Customize themes in `frontend/src/index.css`
4. Deploy to production with proper env vars

## 🔐 Security Features (Built-in)

✅ Password hashing with bcrypt  
✅ JWT token authentication  
✅ Account lockout after failed attempts  
✅ Rate limiting on login endpoint  
✅ Input validation on all endpoints  
✅ Protected routes on frontend  

## 🎯 Architecture

```
User → React Frontend → Express API → MongoDB
         ↓
    Secure JWT Token
    Protected Routes
    Error Handling
```

## 📞 Need Help?

1. Check browser console for errors (F12)
2. Check server logs in terminal
3. Read README.md for detailed docs
4. Review code comments in source files

---

**You're all set!** 🎉 Start building awesome things with your secure login system!
