const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: Number,
  weight: Number,
  height: Number,
  fitnessGoal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'],
    default: 'general_fitness'
  },
  dailyCalorieGoal: {
    type: Number,
    default: 2000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
