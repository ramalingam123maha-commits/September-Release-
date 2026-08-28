import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

function Dashboard({ userId }) {
  const [stats, setStats] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState({
    exerciseType: 'running',
    duration: '',
    distance: '',
    intensity: 'moderate',
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const statsResponse = await axios.get(`http://localhost:5000/api/workouts/stats/${userId}`);
      const workoutsResponse = await axios.get(`http://localhost:5000/api/workouts/user/${userId}`);
      setStats(statsResponse.data);
      setWorkouts(workoutsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutChange = (e) => {
    setNewWorkout({ ...newWorkout, [e.target.name]: e.target.value });
  };

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    try {
      const workoutData = {
        userId,
        date: new Date(),
        ...newWorkout,
        duration: parseInt(newWorkout.duration),
        distance: parseFloat(newWorkout.distance) || 0
      };
      await axios.post('http://localhost:5000/api/workouts', workoutData);
      setNewWorkout({
        exerciseType: 'running',
        duration: '',
        distance: '',
        intensity: 'moderate',
        notes: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error adding workout:', err);
    }
  };

  if (loading) return <div className="dashboard">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Welcome to Fit-Freak</h1>
      
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <h3>{stats.totalWorkouts}</h3>
            <p>Total Workouts</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalCalories}</h3>
            <p>Calories Burned</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalDuration}</h3>
            <p>Total Minutes</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalDistance.toFixed(1)}</h3>
            <p>Total Distance (km)</p>
          </div>
        </div>
      )}

      <div className="workout-section">
        <h2>Log a Workout</h2>
        <form onSubmit={handleAddWorkout} className="workout-form">
          <select
            name="exerciseType"
            value={newWorkout.exerciseType}
            onChange={handleWorkoutChange}
            required
          >
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="weight_training">Weight Training</option>
            <option value="yoga">Yoga</option>
            <option value="swimming">Swimming</option>
            <option value="cardio">Cardio</option>
            <option value="sports">Sports</option>
            <option value="walking">Walking</option>
          </select>

          <input
            type="number"
            name="duration"
            placeholder="Duration (minutes)"
            value={newWorkout.duration}
            onChange={handleWorkoutChange}
            required
          />

          <input
            type="number"
            name="distance"
            placeholder="Distance (km) - optional"
            value={newWorkout.distance}
            onChange={handleWorkoutChange}
          />

          <select
            name="intensity"
            value={newWorkout.intensity}
            onChange={handleWorkoutChange}
          >
            <option value="low">Low Intensity</option>
            <option value="moderate">Moderate Intensity</option>
            <option value="high">High Intensity</option>
          </select>

          <textarea
            name="notes"
            placeholder="Add notes about your workout..."
            value={newWorkout.notes}
            onChange={handleWorkoutChange}
          />

          <button type="submit">Log Workout</button>
        </form>
      </div>

      <div className="workouts-list">
        <h2>Recent Workouts</h2>
        {workouts.length > 0 ? (
          <div className="workouts-table">
            {workouts.slice(0, 5).map((workout) => (
              <div key={workout._id} className="workout-item">
                <div className="workout-header">
                  <strong>{workout.exerciseType.replace('_', ' ')}</strong>
                  <span className="calories">{workout.caloriesBurned} cal</span>
                </div>
                <p className="workout-details">
                  {workout.duration} min • {workout.intensity} intensity
                  {workout.distance > 0 && ` • ${workout.distance} km`}
                </p>
                {workout.notes && <p className="workout-notes">{workout.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p>No workouts logged yet. Start by logging your first workout!</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
