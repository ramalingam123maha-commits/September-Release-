const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
const db = new sqlite3.Database('./students.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite database');
});

// Create tables
db.serialize(() => {
  // Students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      rollNumber TEXT UNIQUE NOT NULL,
      phone TEXT,
      dateOfBirth TEXT,
      address TEXT,
      enrollmentDate TEXT,
      status TEXT DEFAULT 'active',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Enrollments table
  db.run(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      courseCode TEXT NOT NULL,
      courseName TEXT NOT NULL,
      instructor TEXT,
      semester TEXT,
      enrollmentDate TEXT,
      status TEXT DEFAULT 'enrolled',
      credits INTEGER,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  // Academic Progress table
  db.run(`
    CREATE TABLE IF NOT EXISTS academicProgress (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      enrollmentId TEXT NOT NULL,
      semester TEXT,
      gpa REAL,
      attendancePercentage REAL,
      assignments INTEGER DEFAULT 0,
      assignmentsCompleted INTEGER DEFAULT 0,
      midtermScore REAL,
      finalScore REAL,
      projectScore REAL,
      totalScore REAL,
      grade TEXT,
      status TEXT DEFAULT 'in-progress',
      lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (enrollmentId) REFERENCES enrollments(id) ON DELETE CASCADE
    )
  `);

  // Reports table
  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      reportType TEXT,
      generatedDate TEXT,
      academicYear TEXT,
      semester TEXT,
      overallGPA REAL,
      totalCredits INTEGER,
      completedCredits INTEGER,
      performanceStatus TEXT,
      recommendations TEXT,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
    )
  `);
});

// ============ STUDENT ENDPOINTS ============

// Register new student
app.post('/api/students', (req, res) => {
  const { name, email, rollNumber, phone, dateOfBirth, address } = req.body;
  
  if (!name || !email || !rollNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const studentId = uuidv4();
  const enrollmentDate = new Date().toISOString();

  db.run(
    `INSERT INTO students (id, name, email, rollNumber, phone, dateOfBirth, address, enrollmentDate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentId, name, email, rollNumber, phone, dateOfBirth, address, enrollmentDate],
    (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id: studentId, message: 'Student registered successfully' });
    }
  );
});

// Get all students
app.get('/api/students', (req, res) => {
  db.all(`SELECT * FROM students ORDER BY enrollmentDate DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get student by ID
app.get('/api/students/:id', (req, res) => {
  const { id } = req.params;
  
  db.get(`SELECT * FROM students WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(row);
  });
});

// Update student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, dateOfBirth, address, status } = req.body;

  db.run(
    `UPDATE students SET name = ?, email = ?, phone = ?, dateOfBirth = ?, address = ?, status = ?, updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, email, phone, dateOfBirth, address, status, id],
    (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'Student updated successfully' });
    }
  );
});

// Delete student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM students WHERE id = ?`, [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

// ============ ENROLLMENT ENDPOINTS ============

// Enroll student in course
app.post('/api/enrollments', (req, res) => {
  const { studentId, courseCode, courseName, instructor, semester, credits } = req.body;

  if (!studentId || !courseCode || !courseName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const enrollmentId = uuidv4();
  const enrollmentDate = new Date().toISOString();

  db.run(
    `INSERT INTO enrollments (id, studentId, courseCode, courseName, instructor, semester, enrollmentDate, credits)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [enrollmentId, studentId, courseCode, courseName, instructor, semester, enrollmentDate, credits],
    (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id: enrollmentId, message: 'Enrollment successful' });
    }
  );
});

// Get enrollments for student
app.get('/api/students/:studentId/enrollments', (req, res) => {
  const { studentId } = req.params;

  db.all(`SELECT * FROM enrollments WHERE studentId = ?`, [studentId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Update enrollment status
app.put('/api/enrollments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE enrollments SET status = ? WHERE id = ?`,
    [status, id],
    (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'Enrollment updated successfully' });
    }
  );
});

// ============ ACADEMIC PROGRESS ENDPOINTS ============

// Create or update academic progress
app.post('/api/progress', (req, res) => {
  const { studentId, enrollmentId, semester, gpa, attendancePercentage, midtermScore, finalScore, projectScore } = req.body;

  if (!studentId || !enrollmentId || !semester) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const progressId = uuidv4();
  const totalScore = (midtermScore || 0) * 0.35 + (finalScore || 0) * 0.35 + (projectScore || 0) * 0.3;
  let grade = 'F';
  if (totalScore >= 90) grade = 'A';
  else if (totalScore >= 80) grade = 'B';
  else if (totalScore >= 70) grade = 'C';
  else if (totalScore >= 60) grade = 'D';

  db.run(
    `INSERT INTO academicProgress 
     (id, studentId, enrollmentId, semester, gpa, attendancePercentage, midtermScore, finalScore, projectScore, totalScore, grade)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [progressId, studentId, enrollmentId, semester, gpa, attendancePercentage, midtermScore, finalScore, projectScore, totalScore, grade],
    (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id: progressId, totalScore, grade, message: 'Progress recorded' });
    }
  );
});

// Get academic progress for student
app.get('/api/students/:studentId/progress', (req, res) => {
  const { studentId } = req.params;

  db.all(
    `SELECT ap.*, e.courseName, e.courseCode FROM academicProgress ap
     JOIN enrollments e ON ap.enrollmentId = e.id
     WHERE ap.studentId = ?
     ORDER BY ap.semester DESC`,
    [studentId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// ============ REPORTS ENDPOINTS ============

// Generate performance report
app.post('/api/reports/generate', (req, res) => {
  const { studentId, academicYear, semester } = req.body;

  if (!studentId || !academicYear || !semester) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.get(
    `SELECT s.*, COUNT(DISTINCT ap.id) as coursesCompleted, AVG(ap.gpa) as overallGPA
     FROM students s
     LEFT JOIN academicProgress ap ON s.id = ap.studentId
     WHERE s.id = ?
     GROUP BY s.id`,
    [studentId],
    (err, student) => {
      if (err || !student) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const reportId = uuidv4();
      const performanceStatus = student.overallGPA >= 3.5 ? 'Excellent' : 
                                student.overallGPA >= 3.0 ? 'Good' :
                                student.overallGPA >= 2.5 ? 'Satisfactory' : 'Needs Improvement';

      db.run(
        `INSERT INTO reports (id, studentId, reportType, generatedDate, academicYear, semester, overallGPA, performanceStatus, completedCredits)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [reportId, studentId, 'performance', new Date().toISOString(), academicYear, semester, student.overallGPA || 0, performanceStatus, student.coursesCompleted || 0],
        (err) => {
          if (err) {
            return res.status(400).json({ error: err.message });
          }
          res.status(201).json({ reportId, message: 'Report generated successfully', performanceStatus, overallGPA: student.overallGPA });
        }
      );
    }
  );
});

// Get all reports
app.get('/api/reports', (req, res) => {
  db.all(`SELECT r.*, s.name, s.rollNumber FROM reports r JOIN students s ON r.studentId = s.id ORDER BY r.generatedDate DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get reports for specific student
app.get('/api/students/:studentId/reports', (req, res) => {
  const { studentId } = req.params;

  db.all(`SELECT * FROM reports WHERE studentId = ? ORDER BY generatedDate DESC`, [studentId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// ============ ANALYTICS ENDPOINTS ============

// Get dashboard statistics
app.get('/api/analytics/dashboard', (req, res) => {
  db.serialize(() => {
    let stats = {};

    db.get(`SELECT COUNT(*) as totalStudents FROM students WHERE status = 'active'`, (err, row) => {
      stats.totalStudents = row?.totalStudents || 0;

      db.get(`SELECT COUNT(*) as activeEnrollments FROM enrollments WHERE status = 'enrolled'`, (err, row) => {
        stats.activeEnrollments = row?.activeEnrollments || 0;

        db.get(`SELECT AVG(totalScore) as avgPerformance FROM academicProgress`, (err, row) => {
          stats.averagePerformance = (row?.avgPerformance || 0).toFixed(2);

          db.all(`SELECT grade, COUNT(*) as count FROM academicProgress GROUP BY grade`, (err, rows) => {
            stats.gradeDistribution = rows || [];

            res.json(stats);
          });
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Student Management Dashboard server running on port ${PORT}`);
});
