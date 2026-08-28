import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Auth API
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const getUserProfile = (userId) => API.get(`/auth/profile/${userId}`);
export const updateUserProfile = (userId, data) => API.put(`/auth/profile/${userId}`, data);

// Workout API
export const createWorkout = (workoutData) => API.post('/workouts', workoutData);
export const getUserWorkouts = (userId, params) => API.get(`/workouts/user/${userId}`, { params });
export const getWorkoutStats = (userId) => API.get(`/workouts/stats/${userId}`);
export const updateWorkout = (workoutId, data) => API.put(`/workouts/${workoutId}`, data);
export const deleteWorkout = (workoutId) => API.delete(`/workouts/${workoutId}`);

// Goals API
export const createGoal = (goalData) => API.post('/goals', goalData);
export const getUserGoals = (userId) => API.get(`/goals/user/${userId}`);
export const updateGoal = (goalId, data) => API.put(`/goals/${goalId}`, data);
export const deleteGoal = (goalId) => API.delete(`/goals/${goalId}`);

export default API;
