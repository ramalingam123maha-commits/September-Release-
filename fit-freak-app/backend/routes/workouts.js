const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');

// Create workout
router.post('/', async (req, res) => {
  try {
    const { userId, date, exerciseType, duration, distance, intensity, notes } = req.body;

    if (!userId || !exerciseType || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate calories burned (simplified formula)
    const calorieMultiplier = {
      'running': 12,
      'cycling': 10,
      'weight_training': 8,
      'yoga': 3,
      'swimming': 11,
      'cardio': 9,
      'sports': 10,
      'walking': 4,
      'other': 5
    };

    const intensityMultiplier = { 'low': 0.8, 'moderate': 1, 'high': 1.3 };
    const caloriesBurned = Math.round(
      (calorieMultiplier[exerciseType] || 5) * duration * (intensityMultiplier[intensity] || 1)
    );

    const workout = new Workout({
      userId,
      date: date || new Date(),
      exerciseType,
      duration,
      distance: distance || 0,
      intensity: intensity || 'moderate',
      caloriesBurned,
      notes
    });

    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user workouts
router.get('/user/:userId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { userId: req.params.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(query).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get workout stats
router.get('/stats/:userId', async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.params.userId });
    
    const stats = {
      totalWorkouts: workouts.length,
      totalCalories: workouts.reduce((sum, w) => sum + w.caloriesBurned, 0),
      totalDistance: workouts.reduce((sum, w) => sum + w.distance, 0),
      totalDuration: workouts.reduce((sum, w) => sum + w.duration, 0),
      averageCaloriesPerWorkout: workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + w.caloriesBurned, 0) / workouts.length) : 0,
      exerciseBreakdown: {}
    };

    workouts.forEach(w => {
      stats.exerciseBreakdown[w.exerciseType] = (stats.exerciseBreakdown[w.exerciseType] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update workout
router.put('/:workoutId', async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(req.params.workoutId, req.body, { new: true });
    res.json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete workout
router.delete('/:workoutId', async (req, res) => {
  try {
    await Workout.findByIdAndDelete(req.params.workoutId);
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
