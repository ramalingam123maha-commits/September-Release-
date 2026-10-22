const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Enrolled', 'Completed', 'Dropped', 'Withdrawn'],
    default: 'Enrolled'
  },
  grade: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'F', 'Incomplete', 'Not Graded'],
    default: 'Not Graded'
  },
  gradePoints: {
    type: Number,
    min: 0,
    max: 4
  },
  attendance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  midtermScore: Number,
  finalScore: Number,
  projectScore: Number,
  participationScore: Number,
  droppedDate: Date,
  completionDate: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
