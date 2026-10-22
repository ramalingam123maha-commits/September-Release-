const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Get all students (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const { status, program, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.enrollmentStatus = status;
    if (program) filter.program = program;

    const students = await Student.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await Student.countDocuments(filter);
    res.json({ students, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get student by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register new student (admin only)
router.post('/', [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('program').notEmpty()
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const existingStudent = await Student.findOne({ email: req.body.email });
    if (existingStudent) return res.status(400).json({ error: 'Student already exists' });

    // Generate registration number
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const registrationNumber = `STU${year}${randomNum}`;

    const student = new Student({
      ...req.body,
      registrationNumber
    });

    await student.save();
    res.status(201).json({ message: 'Student registered successfully', student: student.getPublicProfile() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update student status
router.patch('/:id/status', [
  body('status').isIn(['Active', 'Inactive', 'Suspended', 'Graduated'])
], verifyToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { enrollmentStatus: req.body.status },
      { new: true }
    ).select('-password');
    
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
