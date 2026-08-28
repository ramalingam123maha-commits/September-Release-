const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Register user
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email or username already in use',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// Verify token
const verify = (req, res) => {
  return res.json({
    success: true,
    message: 'Token is valid',
    user: req.user,
  });
};

// Logout (frontend will handle token removal)
const logout = (req, res) => {
  return res.json({
    success: true,
    message: 'Logout successful',
  });
};

module.exports = {
  register,
  login,
  verify,
  logout,
};
