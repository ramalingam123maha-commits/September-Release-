const express = require('express');
const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get student progress history
router.get('/student/:studentId', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.find({ studentId: req.params.studentId })
      .sort({ year: -1, semester: -1 });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current semester progress
router.get('/student/:studentId/current', verifyToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.params.studentId, status: 'Enrolled' })
      .populate('courseId');

    const completedEnrollments = await Enrollment.find({ studentId: req.params.studentId, status: 'Completed' });

    let totalGPA = 0;
    let totalCredits = 0;
    let coursesCompleted = 0;

    completedEnrollments.forEach(e => {
      if (e.gradePoints) {
        totalGPA += e.gradePoints * 3; // assuming 3 credits per course
        totalCredits += 3;
        coursesCompleted += 1;
      }
    });

    const currentGPA = totalCredits > 0 ? (totalGPA / totalCredits).toFixed(2) : 0;

    const student = await Student.findById(req.params.studentId);
    const creditsCompleted = student?.totalCreditsEarned || 0;
    const creditsRequired = student?.totalCreditsRequired || 120;
    const degreePath = ((creditsCompleted / creditsRequired) * 100).toFixed(1);

    res.json({
      enrollments,
      gpa: currentGPA,
      coursesCompleted,
      creditsCompleted,
      creditsRequired,
      degreePath: `${degreePath}%`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record progress
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const progress = new Progress(req.body);
    await progress.save();
    res.status(201).json({ message: 'Progress recorded successfully', progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all progress records (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const { page = 1, limit = 10 } = req.query;
    const progress = await Progress.find()
      .populate('studentId', 'firstName lastName registrationNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ recordedDate: -1 });

    const total = await Progress.countDocuments();
    res.json({ progress, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
