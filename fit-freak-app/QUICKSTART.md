# Quick Start Guide - Fit-Freak Fitness Tracker

## 🚀 Getting Started

This guide will help you set up and run the Fit-Freak fitness tracker application locally.

## Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR a MongoDB Atlas account for cloud database

## Installation Steps

### Step 1: Clone or Navigate to Project

```bash
cd /home/user/September-Release-/fit-freak-app
```

### Step 2: Set up Backend

#### 2.1 Navigate to backend directory
```bash
cd backend
```

#### 2.2 Install dependencies
```bash
npm install
```

#### 2.3 Configure MongoDB
Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/fitfreak
PORT=5000
NODE_ENV=development
```

If using MongoDB Atlas, replace with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitfreak
```

#### 2.4 Start backend server
```bash
npm start
```

You should see:
```
MongoDB connected
Fit-Freak Backend API running on port 5000
```

### Step 3: Set up Frontend (in new terminal)

#### 3.1 Navigate to frontend directory
```bash
cd frontend
```

#### 3.2 Install dependencies
```bash
npm install
```

#### 3.3 Start frontend development server
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

## Usage Instructions

### 1. Register New Account
- Click "Register" on the login page
- Fill in your details:
  - Username (unique)
  - Email address
  - Password
  - Age, Weight (kg), Height (cm)
- Click "Register" button
- You'll be redirected to login page

### 2. Login
- Enter your email and password
- Click "Login"
- You'll be taken to the Dashboard

### 3. Log a Workout
On the Dashboard:
1. Select exercise type (Running, Cycling, Weight Training, etc.)
2. Enter duration in minutes
3. Optional: Enter distance in kilometers
4. Select intensity level (Low, Moderate, High)
5. Optional: Add notes about your workout
6. Click "Log Workout"

The app automatically calculates calories burned!

### 4. View Statistics
Your dashboard displays:
- **Total Workouts**: Number of completed workouts
- **Calories Burned**: Total calories from all workouts
- **Total Duration**: Combined workout minutes
- **Total Distance**: Total kilometers covered

### 5. Recent Workouts
View your last 5 logged workouts with:
- Exercise type
- Duration and intensity
- Calories burned
- Distance (if applicable)
- Any notes you added

## API Documentation

### Authentication Endpoints

**Register User**
```
POST /api/auth/register
Body: {
  username: string,
  email: string,
  password: string,
  age: number,
  weight: number,
  height: number
}
```

**Login**
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: { token, user }
```

### Workout Endpoints

**Create Workout**
```
POST /api/workouts
Body: {
  userId: string,
  exerciseType: string,
  duration: number,
  distance: number (optional),
  intensity: 'low' | 'moderate' | 'high',
  notes: string (optional)
}
```

**Get User Workouts**
```
GET /api/workouts/user/:userId
Query params: ?startDate=2024-01-01&endDate=2024-12-31
```

**Get Statistics**
```
GET /api/workouts/stats/:userId
Response: {
  totalWorkouts,
  totalCalories,
  totalDistance,
  totalDuration,
  averageCaloriesPerWorkout,
  exerciseBreakdown
}
```

### Goal Endpoints

**Create Goal**
```
POST /api/goals
Body: {
  userId: string,
  title: string,
  goalType: 'calories' | 'distance' | 'duration' | 'workouts_per_week' | 'weight',
  targetValue: number,
  deadline: date (optional)
}
```

**Get User Goals**
```
GET /api/goals/user/:userId
```

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `sudo systemctl status mongod`
- Verify port 5000 is not in use: `lsof -i :5000`
- Check `.env` file configuration

### Frontend won't connect
- Ensure backend is running on port 5000
- Clear browser cache: Ctrl+Shift+Delete
- Restart frontend: `npm start`

### MongoDB connection error
- Verify MongoDB URI in `.env`
- Check internet connection for MongoDB Atlas
- Ensure MongoDB service is running

### "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Development Tips

### Hot Reload
- Backend: Configured with nodemon (auto-reload on file change)
- Frontend: React scripts auto-reload on file change

### Testing API Endpoints
Use tools like:
- **Postman**: https://www.postman.com/
- **Insomnia**: https://insomnia.rest/
- **curl**: Command line tool

Example with curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Viewing MongoDB Data
- Use MongoDB Compass for GUI
- Or MongoDB Atlas dashboard for cloud database

## Production Deployment

To deploy this application:

1. **Backend**: Deploy to Heroku, AWS, or Digital Ocean
2. **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
3. **Database**: Use MongoDB Atlas or managed MongoDB service

See `README.md` for more details.

## Features Overview

✅ User authentication with JWT  
✅ Workout logging with 8+ exercise types  
✅ Automatic calorie burn calculation  
✅ Comprehensive statistics and tracking  
✅ Goal setting and monitoring  
✅ Responsive design  
✅ Secure password hashing  
✅ RESTful API architecture  

## Support & Feedback

For issues or suggestions:
1. Check troubleshooting section above
2. Review the project README.md
3. Check backend/frontend console for error messages
4. Create an issue on GitHub

---

**Enjoy tracking your fitness journey with Fit-Freak!** 💪

**Creator**: Mahalakshmi  
**Date**: August 28, 2024
