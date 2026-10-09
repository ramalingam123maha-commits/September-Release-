const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database
const studentsDB = {};
const enrollmentsDB = {};
const gradesDB = {};

// ==================== STUDENT MANAGEMENT ====================

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
    phone,
    dateOfBirth,
    address,
    enrollmentStatus: 'Active',
    registeredDate: new Date(),
    totalCredits: 0,
    gpa: 0.0
  };

  studentsDB[studentId] = student;
  res.status(201).json(student);
});

// Get all students
app.get('/api/students', (req, res) => {
  const students = Object.values(studentsDB);
  res.json(students);
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
  const student = studentsDB[req.params.id];
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

// Update student
app.put('/api/students/:id', (req, res) => {
  const student = studentsDB[req.params.id];
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  Object.assign(student, req.body);
  res.json(student);
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  delete studentsDB[req.params.id];
  res.json({ message: 'Student deleted' });
});

// ==================== ENROLLMENT MANAGEMENT ====================

// Create enrollment
app.post('/api/enrollments', (req, res) => {
  const { studentId, courseCode, courseName, credits, semester } = req.body;

  if (!studentId || !courseCode || !courseName || !credits) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!studentsDB[studentId]) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const enrollmentId = uuidv4();
  const enrollment = {
    id: enrollmentId,
    studentId,
    courseCode,
    courseName,
    credits,
    semester,
    enrollmentDate: new Date(),
    status: 'Enrolled',
    grade: null,
    gradePoints: 0
  };

  enrollmentsDB[enrollmentId] = enrollment;
  studentsDB[studentId].totalCredits += credits;
  
  res.status(201).json(enrollment);
});

// Get all enrollments for a student
app.get('/api/enrollments/:studentId', (req, res) => {
  const enrollments = Object.values(enrollmentsDB).filter(
    e => e.studentId === req.params.studentId
  );
  res.json(enrollments);
});

// Update enrollment status
app.put('/api/enrollments/:id', (req, res) => {
  const enrollment = enrollmentsDB[req.params.id];
  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  Object.assign(enrollment, req.body);
  res.json(enrollment);
});

// Delete enrollment
app.delete('/api/enrollments/:id', (req, res) => {
  const enrollment = enrollmentsDB[req.params.id];
  if (enrollment) {
    studentsDB[enrollment.studentId].totalCredits -= enrollment.credits;
    delete enrollmentsDB[req.params.id];
  }
  res.json({ message: 'Enrollment deleted' });
});

// ==================== GRADES & PERFORMANCE ====================

// Record grade for an enrollment
app.post('/api/grades', (req, res) => {
  const { enrollmentId, grade, gradePoints } = req.body;

  if (!enrollmentId || !grade) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const enrollment = enrollmentsDB[enrollmentId];
  if (!enrollment) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  enrollment.grade = grade;
  enrollment.gradePoints = gradePoints;

  const gradeId = uuidv4();
  gradesDB[gradeId] = {
    id: gradeId,
    enrollmentId,
    studentId: enrollment.studentId,
    courseCode: enrollment.courseCode,
    courseName: enrollment.courseName,
    grade,
    gradePoints,
    credits: enrollment.credits,
    recordedDate: new Date()
  };

  // Recalculate GPA
  const studentEnrollments = Object.values(enrollmentsDB).filter(
    e => e.studentId === enrollment.studentId && e.grade
  );
  
  if (studentEnrollments.length > 0) {
    const totalPoints = studentEnrollments.reduce(
      (sum, e) => sum + (e.gradePoints * e.credits),
      0
    );
    const totalCredits = studentEnrollments.reduce((sum, e) => sum + e.credits, 0);
    studentsDB[enrollment.studentId].gpa = totalPoints / totalCredits;
  }

  res.status(201).json(gradesDB[gradeId]);
});

// Get student grades
app.get('/api/grades/:studentId', (req, res) => {
  const grades = Object.values(gradesDB).filter(
    g => g.studentId === req.params.studentId
  );
  res.json(grades);
});

// ==================== PERFORMANCE REPORTS ====================

// Get academic progress report for a student
app.get('/api/reports/progress/:studentId', (req, res) => {
  const student = studentsDB[req.params.studentId];
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const enrollments = Object.values(enrollmentsDB).filter(
    e => e.studentId === req.params.studentId
  );

  const completedCourses = enrollments.filter(e => e.grade);
  const inProgressCourses = enrollments.filter(e => !e.grade);

  const report = {
    studentName: `${student.firstName} ${student.lastName}`,
    studentId: student.id,
    email: student.email,
    totalEnrollments: enrollments.length,
    completedCourses: completedCourses.length,
    inProgressCourses: inProgressCourses.length,
    totalCreditsCompleted: completedCourses.reduce((sum, e) => sum + e.credits, 0),
    currentGPA: student.gpa.toFixed(2),
    enrollmentStatus: student.enrollmentStatus,
    registeredDate: student.registeredDate,
    courses: enrollments.map(e => ({
      courseCode: e.courseCode,
      courseName: e.courseName,
      credits: e.credits,
      semester: e.semester,
      grade: e.grade || 'In Progress',
      status: e.status
    }))
  };

  res.json(report);
});

// Get all students performance report
app.get('/api/reports/all-students', (req, res) => {
  const students = Object.values(studentsDB);
  
  const report = students.map(student => {
    const enrollments = Object.values(enrollmentsDB).filter(
      e => e.studentId === student.id
    );
    const completedCourses = enrollments.filter(e => e.grade);
    
    return {
      studentId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      totalCourses: enrollments.length,
      completedCourses: completedCourses.length,
      gpa: student.gpa.toFixed(2),
      status: student.enrollmentStatus
    };
  });

  res.json(report);
});

// Get semester report
app.get('/api/reports/semester/:semester', (req, res) => {
  const semesterEnrollments = Object.values(enrollmentsDB).filter(
    e => e.semester === req.params.semester
  );

  const studentIds = [...new Set(semesterEnrollments.map(e => e.studentId))];
  
  const report = studentIds.map(studentId => {
    const student = studentsDB[studentId];
    const courses = semesterEnrollments.filter(e => e.studentId === studentId);
    const completedCourses = courses.filter(e => e.grade);

    return {
      studentName: `${student.firstName} ${student.lastName}`,
      studentId,
      coursesEnrolled: courses.length,
      coursesCompleted: completedCourses.length,
      courses: courses.map(c => ({
        code: c.courseCode,
        name: c.courseName,
        credits: c.credits,
        grade: c.grade || 'In Progress'
      }))
    };
  });

  res.json(report);
});

// ==================== ANALYTICS ====================

// Get dashboard statistics
app.get('/api/analytics/dashboard', (req, res) => {
  const students = Object.values(studentsDB);
  const enrollments = Object.values(enrollmentsDB);
  
  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.enrollmentStatus === 'Active').length,
    totalEnrollments: enrollments.length,
    averageGPA: students.length > 0
      ? (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(2)
      : 0,
    completedCourses: enrollments.filter(e => e.grade).length,
    inProgressCourses: enrollments.filter(e => !e.grade).length
  };

  res.json(stats);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Student Management Dashboard API running on port ${PORT}`);
});
