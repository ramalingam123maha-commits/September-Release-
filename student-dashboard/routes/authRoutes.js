const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin Login
router.post('/admin/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const admin = await Admin.findOne({ username: req.body.username });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await admin.comparePassword(req.body.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, role: admin.role, type: 'admin' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    admin.lastLogin = new Date();
    await admin.save();

    res.json({ token, admin: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Student Login
router.post('/student/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const student = await Student.findOne({ email: req.body.email });
    if (!student) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await student.comparePassword(req.body.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: student._id, type: 'student' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ token, student: student.getPublicProfile() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Registration
router.post('/admin/register', [
  body('username').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const existingAdmin = await Admin.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
    if (existingAdmin) return res.status(400).json({ error: 'Admin already exists' });

    const admin = new Admin(req.body);
    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully', admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Token
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
