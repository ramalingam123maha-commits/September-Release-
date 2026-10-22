const express = require('express');
const { body, validationResult } = require('express-validator');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Course = require('../models/Course');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all enrollments
router.get('/', verifyToken, async (req, res) => {
  try {
    const { studentId, courseId, status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (studentId) filter.studentId = studentId;
    if (courseId) filter.courseId = courseId;
    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
      .populate('studentId', 'firstName lastName registrationNumber')
      .populate('courseId', 'courseCode courseName')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enrollment.countDocuments(filter);
    res.json({ enrollments, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student enrollments
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.params.studentId })
      .populate('courseId');
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll student in course
router.post('/', [
  body('studentId').notEmpty(),
  body('courseId').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    // Check if student and course exist
    const student = await Student.findById(req.body.studentId);
    const course = await Course.findById(req.body.courseId);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (!course) return res.status(404).json({ error: 'Course not found' });

    // Check if already enrolled
    const existing = await Enrollment.findOne({ studentId: req.body.studentId, courseId: req.body.courseId });
    if (existing) return res.status(400).json({ error: 'Student already enrolled in this course' });

    // Check course capacity
    if (course.currentEnrollment >= course.capacity) {
      return res.status(400).json({ error: 'Course is full' });
    }

    const enrollment = new Enrollment(req.body);
    await enrollment.save();

    // Update course enrollment count
    course.currentEnrollment += 1;
    await course.save();

    res.status(201).json({ message: 'Student enrolled successfully', enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update enrollment (grade, attendance, etc.)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
    
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drop enrollment
router.patch('/:id/drop', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status: 'Dropped', droppedDate: new Date() },
      { new: true }
    );

    if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

    // Decrease course enrollment
    const course = await Course.findById(enrollment.courseId);
    if (course && course.currentEnrollment > 0) {
      course.currentEnrollment -= 1;
      await course.save();
    }

    res.json({ message: 'Enrollment dropped successfully', enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
