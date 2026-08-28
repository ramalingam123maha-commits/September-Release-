const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  exerciseType: {
    type: String,
    enum: ['running', 'cycling', 'weight_training', 'yoga', 'swimming', 'cardio', 'sports', 'walking', 'other'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  distance: {
    type: Number,
    default: 0
  },
  intensity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    default: 'moderate'
  },
  caloriesBurned: {
    type: Number,
    required: true
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Workout', workoutSchema);
