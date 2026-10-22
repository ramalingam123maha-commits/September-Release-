const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
  registrationNumber: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  phone: String,
  dateOfBirth: Date,
  address: String,
  city: String,
  state: String,
  postalCode: String,
  parentEmail: String,
  enrollmentStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Graduated'],
    default: 'Active'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  program: {
    type: String,
    required: true
  },
  gpa: {
    type: Number,
    default: 0,
    min: 0,
    max: 4
  },
  totalCreditsEarned: {
    type: Number,
    default: 0
  },
  totalCreditsRequired: {
    type: Number,
    default: 120
  },
  password: {
    type: String,
    required: true
  },
  profileImage: String,
  emergencyContact: String,
  emergencyPhone: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Method to get student info without password
studentSchema.methods.getPublicProfile = function() {
  const student = this.toObject();
  delete student.password;
  return student;
};

module.exports = mongoose.model('Student', studentSchema);
