const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer'],
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  gpa: {
    type: Number,
    required: true,
    min: 0,
    max: 4
  },
  creditsCompleted: {
    type: Number,
    default: 0
  },
  creditsInProgress: {
    type: Number,
    default: 0
  },
  totalCreditsCompleted: {
    type: Number,
    default: 0
  },
  coursesCompleted: {
    type: Number,
    default: 0
  },
  averageGrade: String,
  academicStanding: {
    type: String,
    enum: ['Good Standing', 'Probation', 'Dean\'s List', 'Warning'],
    default: 'Good Standing'
  },
  degreePath: {
    type: String,
    default: '0%'
  },
  estimatedGraduationDate: Date,
  notes: String,
  recordedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
