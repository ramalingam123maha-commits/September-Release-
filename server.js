const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
db.initializeDatabase();

// ============ STUDENT ROUTES ============

// Register a new student
app.post('/api/students', (req, res) => {
  const { name, email, phone, enrollmentDate, major } = req.body;

  if (!name || !email || !phone || !major) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const studentId = uuidv4();
  db.registerStudent(studentId, name, email, phone, enrollmentDate, major, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: studentId, name, email, phone, major, enrollmentDate });
  });
});

// Get all students
app.get('/api/students', (req, res) => {
  db.getAllStudents((err, students) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(students);
  });
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
  db.getStudentById(req.params.id, (err, student) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  });
});

// Update student
app.put('/api/students/:id', (req, res) => {
  const { name, email, phone, major } = req.body;
  db.updateStudent(req.params.id, name, email, phone, major, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: req.params.id, name, email, phone, major });
  });
});

// ============ ENROLLMENT ROUTES ============

// Create enrollment
app.post('/api/enrollments', (req, res) => {
  const { studentId, courseId, enrollmentDate, status } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const enrollmentId = uuidv4();
  db.createEnrollment(enrollmentId, studentId, courseId, enrollmentDate, status || 'active', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: enrollmentId, studentId, courseId, enrollmentDate, status: status || 'active' });
  });
});

// Get enrollments for a student
app.get('/api/enrollments/student/:studentId', (req, res) => {
  db.getEnrollmentsByStudent(req.params.studentId, (err, enrollments) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(enrollments);
  });
});

// Get all enrollments
app.get('/api/enrollments', (req, res) => {
  db.getAllEnrollments((err, enrollments) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(enrollments);
  });
});

// ============ GRADES & PROGRESS ROUTES ============

// Add grade for a student
app.post('/api/grades', (req, res) => {
  const { studentId, courseId, grade, semester } = req.body;

  if (!studentId || !courseId || !grade || !semester) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const gradeId = uuidv4();
  db.addGrade(gradeId, studentId, courseId, grade, semester, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: gradeId, studentId, courseId, grade, semester });
  });
});

// Get grades for a student
app.get('/api/grades/student/:studentId', (req, res) => {
  db.getGradesByStudent(req.params.studentId, (err, grades) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(grades);
  });
});

// ============ PERFORMANCE REPORT ROUTES ============

// Generate performance report for a student
app.get('/api/reports/student/:studentId', (req, res) => {
  db.getStudentById(req.params.studentId, (err, student) => {
    if (err || !student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    db.getGradesByStudent(req.params.studentId, (err, grades) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const averageGPA = grades.length > 0
        ? (grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / grades.length).toFixed(2)
        : 0;

      res.json({
        student: student,
        gradesCount: grades.length,
        averageGPA,
        grades,
        generatedAt: new Date().toISOString()
      });
    });
  });
});

// Get all performance reports
app.get('/api/reports', (req, res) => {
  db.getAllStudents((err, students) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const reports = [];
    let completed = 0;

    if (students.length === 0) {
      return res.json([]);
    }

    students.forEach(student => {
      db.getGradesByStudent(student.id, (err, grades) => {
        const averageGPA = grades && grades.length > 0
          ? (grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / grades.length).toFixed(2)
          : 0;

        reports.push({
          student,
          gradesCount: grades ? grades.length : 0,
          averageGPA
        });

        completed++;
        if (completed === students.length) {
          res.json(reports);
        }
      });
    });
  });
});

// ============ COURSE ROUTES ============

// Add a course
app.post('/api/courses', (req, res) => {
  const { name, code, credits, instructor } = req.body;

  if (!name || !code) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const courseId = uuidv4();
  db.addCourse(courseId, name, code, credits || 3, instructor || 'TBD', (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: courseId, name, code, credits: credits || 3, instructor: instructor || 'TBD' });
  });
});

// Get all courses
app.get('/api/courses', (req, res) => {
  db.getAllCourses((err, courses) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(courses);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
