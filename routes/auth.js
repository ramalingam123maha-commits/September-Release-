const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for registration
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour
  message: 'Too many registrations, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post(
  '/register',
  registerLimiter,
  registerValidation,
  handleValidationErrors,
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

// Protected routes
router.get('/verify', verifyToken, authController.verify);

router.post('/logout', verifyToken, authController.logout);

module.exports = router;
