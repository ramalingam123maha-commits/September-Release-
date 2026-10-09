const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory data storage
const students = new Map();
const enrollments = new Map();
const courses = new Map();
const grades = new Map();

// Initialize sample courses
function initializeCourses() {
  courses.set('MATH101', { id: 'MATH101', name: 'Mathematics Fundamentals', credits: 3, instructor: 'Dr. Smith' });
  courses.set('CS101', { id: 'CS101', name: 'Introduction to Computer Science', credits: 3, instructor: 'Prof. Johnson' });
  courses.set('ENG101', { id: 'ENG101', name: 'English Composition', credits: 3, instructor: 'Dr. Williams' });
  courses.set('SCI101', { id: 'SCI101', name: 'General Biology', credits: 4, instructor: 'Prof. Brown' });
}

initializeCourses();

// ============ STUDENT ENDPOINTS ============

// Register a new student
app.post('/api/students', (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth, address } = req.body;
  
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const studentId = uuidv4();
  const student = {
    id: studentId,
    firstName,
    lastName,
    email,
    phone: phone || '',
    dateOfBirth: dateOfBirth || '',
    address: address || '',
    enrollmentDate: new Date().toISOString(),
    status: 'active',
    gpa: 0
  };
  
  students.set(studentId, student);
  res.status(201).json(student);
});

// Get all students
app.get('/api/students', (req, res) => {
  const studentList = Array.from(students.values());
  res.json(studentList);
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
  const student = students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

// Update student information
app.put('/api/students/:id', (req, res) => {
  const student = students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  const { firstName, lastName, email, phone, address } = req.body;
  if (firstName) student.firstName = firstName;
  if (lastName) student.lastName = lastName;
  if (email) student.email = email;
  if (phone) student.phone = phone;
  if (address) student.address = address;
  
  students.set(req.params.id, student);
  res.json(student);
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  if (!students.has(req.params.id)) {
    return res.status(404).json({ error: 'Student not found' });
  }
  students.delete(req.params.id);
  res.json({ message: 'Student deleted successfully' });
});

// ============ ENROLLMENT ENDPOINTS ============

// Enroll student in a course
app.post('/api/enrollments', (req, res) => {
  const { studentId, courseId } = req.body;
  
  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (!students.has(studentId)) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  if (!courses.has(courseId)) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  const enrollmentId = uuidv4();
  const enrollment = {
    id: enrollmentId,
    studentId,
    courseId,
    enrollmentDate: new Date().toISOString(),
    status: 'active',
    grade: null
  };
  
  enrollments.set(enrollmentId, enrollment);
  res.status(201).json(enrollment);
});

// Get enrollments for a student
app.get('/api/students/:studentId/enrollments', (req, res) => {
  const { studentId } = req.params;
  const studentEnrollments = Array.from(enrollments.values())
    .filter(e => e.studentId === studentId)
    .map(e => ({
      ...e,
      course: courses.get(e.courseId)
    }));
  
  res.json(studentEnrollments);
});

// Get all enrollments
app.get('/api/enrollments', (req, res) => {
  const enrollmentList = Array.from(enrollments.values())
    .map(e => ({
      ...e,
      course: courses.get(e.courseId),
      student: students.get(e.studentId)
    }));
  
  res.json(enrollmentList);
});

// Drop enrollment
app.delete('/api/enrollments/:id', (req, res) => {
  if (!enrollments.has(req.params.id)) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }
  enrollments.delete(req.params.id);
  res.json({ message: 'Enrollment dropped successfully' });
});

// ============ GRADES ENDPOINTS ============

// Add/Update grade
app.post('/api/grades', (req, res) => {
  const { enrollmentId, midtermScore, finalScore, assignment1, assignment2 } = req.body;
  
  if (!enrollmentId) {
    return res.status(400).json({ error: 'Missing enrollmentId' });
  }
  
  if (!enrollments.has(enrollmentId)) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }
  
  const gradeId = uuidv4();
  const grade = {
    id: gradeId,
    enrollmentId,
    midtermScore: midtermScore || 0,
    finalScore: finalScore || 0,
    assignment1: assignment1 || 0,
    assignment2: assignment2 || 0,
    calculatedAt: new Date().toISOString()
  };
  
  // Calculate GPA (simple average)
  const scores = [grade.midtermScore, grade.finalScore, grade.assignment1, grade.assignment2];
  grade.gpa = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  
  grades.set(gradeId, grade);
  
  // Update enrollment grade status
  const enrollment = enrollments.get(enrollmentId);
  enrollment.grade = grade.gpa;
  
  // Update student GPA (average of all courses)
  const enrollment_obj = enrollments.get(enrollmentId);
  const student = students.get(enrollment_obj.studentId);
  const studentGrades = Array.from(grades.values())
    .filter(g => {
      const enr = enrollments.get(g.enrollmentId);
      return enr.studentId === student.id;
    });
  
  if (studentGrades.length > 0) {
    student.gpa = (studentGrades.reduce((sum, g) => sum + parseFloat(g.gpa), 0) / studentGrades.length).toFixed(2);
  }
  
  res.status(201).json(grade);
});

// Get grades for an enrollment
app.get('/api/enrollments/:enrollmentId/grades', (req, res) => {
  const enrollmentGrades = Array.from(grades.values())
    .filter(g => g.enrollmentId === req.params.enrollmentId);
  
  if (enrollmentGrades.length === 0) {
    return res.json({ message: 'No grades found for this enrollment' });
  }
  
  res.json(enrollmentGrades[enrollmentGrades.length - 1]);
});

// ============ REPORTS ENDPOINTS ============

// Get academic progress report for a student
app.get('/api/students/:studentId/progress', (req, res) => {
  const { studentId } = req.params;
  const student = students.get(studentId);
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  const studentEnrollments = Array.from(enrollments.values())
    .filter(e => e.studentId === studentId);
  
  const progressReport = {
    student: student,
    totalEnrolledCourses: studentEnrollments.length,
    coursesCompleted: studentEnrollments.filter(e => e.status === 'completed').length,
    currentGPA: student.gpa,
    enrollments: studentEnrollments.map(e => ({
      course: courses.get(e.courseId),
      grade: e.grade,
      status: e.status,
      enrollmentDate: e.enrollmentDate
    }))
  };
  
  res.json(progressReport);
});

// Get performance report (all students)
app.get('/api/reports/performance', (req, res) => {
  const report = {
    totalStudents: students.size,
    averageGPA: 0,
    topPerformers: [],
    atRiskStudents: [],
    enrollmentStats: {
      totalEnrollments: enrollments.size,
      activeEnrollments: Array.from(enrollments.values()).filter(e => e.status === 'active').length,
      completedEnrollments: Array.from(enrollments.values()).filter(e => e.status === 'completed').length
    }
  };
  
  const studentList = Array.from(students.values());
  if (studentList.length > 0) {
    report.averageGPA = (studentList.reduce((sum, s) => sum + parseFloat(s.gpa || 0), 0) / studentList.length).toFixed(2);
    
    // Top performers (GPA >= 3.5)
    report.topPerformers = studentList
      .filter(s => parseFloat(s.gpa) >= 3.5)
      .map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, gpa: s.gpa }));
    
    // At-risk students (GPA < 2.0)
    report.atRiskStudents = studentList
      .filter(s => parseFloat(s.gpa) < 2.0 && s.gpa > 0)
      .map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, gpa: s.gpa }));
  }
  
  res.json(report);
});

// Get available courses
app.get('/api/courses', (req, res) => {
  const courseList = Array.from(courses.values());
  res.json(courseList);
});

// Start server
app.listen(PORT, () => {
  console.log(`Student Management Dashboard running on http://localhost:${PORT}`);
});
