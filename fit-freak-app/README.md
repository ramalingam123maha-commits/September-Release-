# Fit-Freak - Fitness Tracker Application

A comprehensive fitness tracking application built with React, Node.js, and MongoDB that helps users log workouts, track progress, and achieve fitness goals.

## Features

### 🏋️ Workout Logging
- Log various exercise types: Running, Cycling, Weight Training, Yoga, Swimming, Cardio, Sports, Walking
- Track duration, distance, and intensity levels
- Add notes to your workouts
- Automatic calorie burn calculation based on exercise type and intensity

### 📊 Progress Tracking
- View comprehensive workout statistics
- Track total calories burned
- Monitor total duration and distance
- View breakdown of exercises by type
- See recent workout history

### 👤 User Profile
- Secure authentication with JWT tokens
- User registration and login
- Store fitness goals and preferences
- Personalized calorie goals
- Track weight, height, and age

### 🎯 Goal Setting
- Create fitness goals (calories, distance, duration, workouts per week, weight)
- Set target values and deadlines
- Track progress towards goals
- Mark goals as completed or paused

## Tech Stack

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MongoDB
- **Authentication**: JWT + bcryptjs
- **API**: RESTful API

### Frontend
- **Framework**: React 18
- **Styling**: CSS3
- **HTTP Client**: Axios
- **Charts**: Chart.js with react-chartjs-2
- **Routing**: React Router DOM

## Project Structure

```
fit-freak-app/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Workout.js
│   │   └── Goal.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── workouts.js
│   │   └── goals.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── Auth.css
│   │   │   └── Dashboard.css
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas connection string)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd fit-freak-app/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/fitfreak
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The API will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd fit-freak-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The application will open on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile/:userId` - Get user profile
- `PUT /api/auth/profile/:userId` - Update user profile

### Workouts
- `POST /api/workouts` - Create new workout
- `GET /api/workouts/user/:userId` - Get user's workouts
- `GET /api/workouts/stats/:userId` - Get workout statistics
- `PUT /api/workouts/:workoutId` - Update workout
- `DELETE /api/workouts/:workoutId` - Delete workout

### Goals
- `POST /api/goals` - Create new goal
- `GET /api/goals/user/:userId` - Get user's goals
- `PUT /api/goals/:goalId` - Update goal
- `DELETE /api/goals/:goalId` - Delete goal

## Usage

1. **Register**: Create a new account with username, email, password, and basic fitness info
2. **Login**: Sign in with your credentials
3. **Dashboard**: View your fitness stats and recent workouts
4. **Log Workout**: Add new workouts with exercise type, duration, and intensity
5. **Track Progress**: Monitor your statistics and achievements

## Calorie Burn Calculation

The app automatically calculates calories burned based on:
- Exercise type (with base calorie multiplier)
- Duration (in minutes)
- Intensity level (0.8x for low, 1x for moderate, 1.3x for high)

Formula: `Calories = Exercise Multiplier × Duration × Intensity Multiplier`

## Features to Add (Future)

- [ ] Social sharing and friend connections
- [ ] Meal logging and nutrition tracking
- [ ] Advanced analytics and charts
- [ ] Mobile app version
- [ ] Personalized recommendations
- [ ] Leaderboards and challenges
- [ ] Export workout data (PDF/CSV)
- [ ] Integration with wearables
- [ ] Dark mode theme
- [ ] Community forum

## Error Handling

The application includes error handling for:
- Invalid credentials
- Database connection errors
- Missing required fields
- Duplicate email/username
- File upload errors

## Security Features

- Password hashing with bcryptjs
- JWT authentication tokens
- CORS protection
- Input validation on backend
- Secure MongoDB connection

## License

MIT

## Creator

**Mahalakshmi**
**Date**: August 28, 2024

## Support

For issues or questions, please create an issue in the repository.

---

**Fit-Freak** - Your Personal Fitness Journey Starts Here! 🚀
