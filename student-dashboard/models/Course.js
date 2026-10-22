const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    unique: true,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  description: String,
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 4
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
  instructor: {
    type: String,
    required: true
  },
  instructorEmail: String,
  schedule: {
    days: [String],
    startTime: String,
    endTime: String,
    room: String
  },
  capacity: {
    type: Number,
    required: true
  },
  currentEnrollment: {
    type: Number,
    default: 0
  },
  prerequisites: [String],
  syllabus: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
