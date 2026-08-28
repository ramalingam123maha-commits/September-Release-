# Fit-Freak Architecture & Technical Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (React Frontend)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Authentication Flow  │  Dashboard  │  Workout Logging│  │
│  │  - Login/Register     │  - Stats    │  - Exercise     │  │
│  │  - Token Storage      │  - History  │  - Duration     │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API (Axios)
                       │ JSON payloads
                       │ JWT Authorization
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           EXPRESS SERVER (Node.js Backend)                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Routes                                               │  │
│  │  ├─ /api/auth/*        (Authentication)              │  │
│  │  ├─ /api/workouts/*    (Workout CRUD)               │  │
│  │  └─ /api/goals/*       (Goal Management)            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Business Logic                                       │  │
│  │  ├─ Authentication    (JWT, bcryptjs)               │  │
│  │  ├─ Calorie Calculation                              │  │
│  │  ├─ Statistics Aggregation                           │  │
│  │  └─ Data Validation                                  │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Mongoose ODM
                       │ Native queries
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         MONGODB DATABASE                                    │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │    Users     │  Workouts    │    Goals     │            │
│  │ Collection   │ Collection   │ Collection   │            │
│  │              │              │              │            │
│  │ - Profiles   │ - Exercises  │ - Targets    │            │
│  │ - Auth Info  │ - Tracking   │ - Progress   │            │
│  │ - Metrics    │ - Calories   │ - Deadlines  │            │
│  └──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Registration Flow
```
User Form Submit
    ↓
React Component (Register.js)
    ↓
Axios POST /api/auth/register
    ↓
Express Router (auth.js)
    ↓
Validation & Password Hashing
    ↓
Mongoose Model (User.js)
    ↓
MongoDB Insert
    ↓
Response: Success/Error
```

### 2. Workout Logging Flow
```
User Submits Workout Form
    ↓
React Component (Dashboard.js)
    ↓
Calculate Calories (Client-side validation)
    ↓
Axios POST /api/workouts
    ↓
Express Router (workouts.js)
    ↓
Calorie Burn Calculation
    ↓
Mongoose Model (Workout.js)
    ↓
MongoDB Insert
    ↓
Frontend refreshes stats
    ↓
UI updates with new workout
```

### 3. Dashboard Statistics Flow
```
User visits Dashboard
    ↓
React useEffect triggered
    ↓
Axios GET /api/workouts/stats/:userId
    ↓
Express aggregates user's workouts
    ↓
Calculate statistics:
  - Total workouts
  - Total calories
  - Total duration
  - Total distance
  - Average calories per workout
  - Exercise breakdown
    ↓
Response with stats JSON
    ↓
React updates state
    ↓
UI renders statistics cards
```

## Component Architecture

### Frontend Components

```
App.js (Main Router)
├── Authentication Handler
├── Session Manager
└── Route Manager
    ├── Login Component
    │   └── API: POST /api/auth/login
    ├── Register Component
    │   └── API: POST /api/auth/register
    └── Dashboard Component
        ├── Stats Display
        │   └── API: GET /api/workouts/stats/:userId
        ├── Workout Form
        │   └── API: POST /api/workouts
        └── Workout History
            └── API: GET /api/workouts/user/:userId
```

### Backend Structure

```
server.js (Express App)
├── Middleware Setup
│   ├── CORS
│   ├── JSON Parser
│   └── Error Handlers
├── MongoDB Connection
├── Routes
│   ├── auth.js
│   │   ├── POST /register
│   │   ├── POST /login
│   │   ├── GET /profile/:userId
│   │   └── PUT /profile/:userId
│   ├── workouts.js
│   │   ├── POST / (Create)
│   │   ├── GET /user/:userId (Read)
│   │   ├── GET /stats/:userId (Stats)
│   │   ├── PUT /:workoutId (Update)
│   │   └── DELETE /:workoutId (Delete)
│   └── goals.js
│       ├── POST / (Create)
│       ├── GET /user/:userId (Read)
│       ├── PUT /:goalId (Update)
│       └── DELETE /:goalId (Delete)
└── Models
    ├── User.js
    ├── Workout.js
    └── Goal.js
```

## API Endpoint Design

### RESTful Conventions

```
Authentication
├── POST   /api/auth/register      Create new user
├── POST   /api/auth/login          User login
├── GET    /api/auth/profile/:id    Fetch profile
└── PUT    /api/auth/profile/:id    Update profile

Workouts
├── POST   /api/workouts            Create workout
├── GET    /api/workouts/user/:id   List user workouts
├── GET    /api/workouts/stats/:id  Get statistics
├── PUT    /api/workouts/:id        Update workout
└── DELETE /api/workouts/:id        Delete workout

Goals
├── POST   /api/goals               Create goal
├── GET    /api/goals/user/:id      List user goals
├── PUT    /api/goals/:id           Update goal
└── DELETE /api/goals/:id           Delete goal
```

## Authentication Flow

```
1. User registers with credentials
   ↓
2. Password hashed using bcryptjs (10 rounds)
   ↓
3. User stored in MongoDB
   ↓
4. User logs in with email/password
   ↓
5. Password compared with stored hash
   ↓
6. If valid, JWT token generated
   ↓
7. Token sent to client, stored in localStorage
   ↓
8. Token included in subsequent API requests (Authorization header)
   ↓
9. Token verified on each protected route
   ↓
10. User ID extracted from token for personalized data
```

## Database Relationships

```
User
├── 1:N with Workout
│   └── One user has many workouts
├── 1:N with Goal
│   └── One user has many goals
└── Stores profile and preferences

Workout
├── N:1 with User
│   └── Many workouts belong to one user
├── References userId
└── Timestamp for tracking history

Goal
├── N:1 with User
│   └── Many goals belong to one user
├── References userId
└── Tracks progress towards target
```

## Calorie Calculation Engine

```
Formula: Calories = Multiplier × Duration × Intensity

Exercise Type Multipliers:
┌──────────────────┬────────────────┐
│ Exercise         │ Cal/min Factor │
├──────────────────┼────────────────┤
│ Running          │      12        │
│ Swimming         │      11        │
│ Cycling          │      10        │
│ Cardio           │       9        │
│ Sports           │      10        │
│ Weight Training  │       8        │
│ Walking          │       4        │
│ Yoga             │       3        │
└──────────────────┴────────────────┘

Intensity Multipliers:
┌──────────────┬────────────────┐
│ Intensity    │ Multiplier     │
├──────────────┼────────────────┤
│ Low          │      0.8       │
│ Moderate     │      1.0       │
│ High         │      1.3       │
└──────────────┴────────────────┘

Example: 30-minute moderate-intensity running
Calories = 12 × 30 × 1.0 = 360 calories
```

## State Management (Frontend)

```
React Hooks:
├── useState
│   ├── User authentication state
│   ├── Workout form data
│   ├── Statistics data
│   ├── Workouts list
│   └── Error messages
├── useEffect
│   ├── Load user profile on mount
│   ├── Fetch statistics
│   └── Fetch workout history
└── localStorage
    ├── Store JWT token
    └── Store userId
```

## Error Handling Strategy

```
Frontend Errors:
├── Network errors → Catch in try-catch
├── Validation errors → Display to user
├── API errors → Extract from response
└── State errors → Graceful fallbacks

Backend Errors:
├── Input validation → 400 Bad Request
├── Authentication errors → 401 Unauthorized
├── Not found errors → 404 Not Found
├── Server errors → 500 Internal Server Error
└── Conflict errors → 409 Conflict (duplicate entry)
```

## Security Architecture

```
Password Security
├── User enters password
├── Password hashed with bcryptjs
│   └── 10 salt rounds
├── Hash stored in DB
└── Never store plain text

Authentication Security
├── JWT tokens for stateless auth
├── Token stored in localStorage
├── Token included in Authorization header
├── Server validates token on each request
└── Token expiration: 7 days

API Security
├── CORS enabled for frontend origin
├── Input validation on server
├── MongoDB schema validation
└── Error messages don't leak sensitive info
```

## Performance Considerations

```
Frontend Optimization:
├── React lazy loading
├── Component memoization
├── Debounced form inputs
└── Efficient state updates

Backend Optimization:
├── Database indexing on userId
├── Aggregation pipeline for stats
├── Connection pooling
└── Query optimization

Caching Strategies:
├── Browser cache for static assets
├── Local state for user data
└── Minimal API calls on navigation
```

## Scalability Architecture

```
Current Single-Server Setup:
Frontend → Backend → Database

Scalability Path:
1. Add caching layer (Redis)
2. Separate read/write databases
3. Load balancing for backend
4. CDN for static assets
5. Database sharding by userId
6. Microservices separation
7. Message queue for async tasks
```

## Deployment Architecture

```
Development:
localhost:3000 (Frontend)
localhost:5000 (Backend)
localhost:27017 (MongoDB)

Production:
┌─────────────────────────────────────────┐
│ CDN / Static Hosting (Vercel/Netlify)   │
│         Frontend (React)                 │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Application Server (Heroku/AWS/Azure)   │
│     Backend (Express.js Node)            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ Database Service (MongoDB Atlas/AWS)    │
│         Managed Database                │
└─────────────────────────────────────────┘
```

---

**Architecture designed for:**
✅ Scalability  
✅ Maintainability  
✅ Security  
✅ Performance  
✅ User Experience  

**Created by**: Mahalakshmi  
**Date**: August 28, 2024
