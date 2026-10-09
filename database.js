const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'students.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  db.serialize(() => {
    // Students table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        enrollmentDate TEXT,
        major TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Courses table
    db.run(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        credits INTEGER DEFAULT 3,
        instructor TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Enrollments table
    db.run(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        courseId TEXT NOT NULL,
        enrollmentDate TEXT,
        status TEXT DEFAULT 'active',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      )
    `);

    // Grades table
    db.run(`
      CREATE TABLE IF NOT EXISTS grades (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        courseId TEXT NOT NULL,
        grade REAL NOT NULL,
        semester TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(studentId) REFERENCES students(id),
        FOREIGN KEY(courseId) REFERENCES courses(id)
      )
    `);
  });
};

const registerStudent = (studentId, name, email, phone, enrollmentDate, major, callback) => {
  const query = `
    INSERT INTO students (id, name, email, phone, enrollmentDate, major)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [studentId, name, email, phone, enrollmentDate, major], callback);
};

const getAllStudents = (callback) => {
  db.all('SELECT * FROM students ORDER BY name', callback);
};

const getStudentById = (studentId, callback) => {
  db.get('SELECT * FROM students WHERE id = ?', [studentId], callback);
};

const updateStudent = (studentId, name, email, phone, major, callback) => {
  const query = 'UPDATE students SET name = ?, email = ?, phone = ?, major = ? WHERE id = ?';
  db.run(query, [name, email, phone, major, studentId], callback);
};

const createEnrollment = (enrollmentId, studentId, courseId, enrollmentDate, status, callback) => {
  const query = `
    INSERT INTO enrollments (id, studentId, courseId, enrollmentDate, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [enrollmentId, studentId, courseId, enrollmentDate, status], callback);
};

const getEnrollmentsByStudent = (studentId, callback) => {
  const query = `
    SELECT e.*, c.name as courseName, c.code as courseCode
    FROM enrollments e
    LEFT JOIN courses c ON e.courseId = c.id
    WHERE e.studentId = ?
  `;
  db.all(query, [studentId], callback);
};

const getAllEnrollments = (callback) => {
  const query = `
    SELECT e.*, s.name as studentName, c.name as courseName
    FROM enrollments e
    LEFT JOIN students s ON e.studentId = s.id
    LEFT JOIN courses c ON e.courseId = c.id
  `;
  db.all(query, callback);
};

const addGrade = (gradeId, studentId, courseId, grade, semester, callback) => {
  const query = `
    INSERT INTO grades (id, studentId, courseId, grade, semester)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [gradeId, studentId, courseId, grade, semester], callback);
};

const getGradesByStudent = (studentId, callback) => {
  const query = `
    SELECT g.*, c.name as courseName, c.code as courseCode
    FROM grades g
    LEFT JOIN courses c ON g.courseId = c.id
    WHERE g.studentId = ?
    ORDER BY g.semester DESC
  `;
  db.all(query, [studentId], callback);
};

const addCourse = (courseId, name, code, credits, instructor, callback) => {
  const query = `
    INSERT INTO courses (id, name, code, credits, instructor)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(query, [courseId, name, code, credits, instructor], callback);
};

const getAllCourses = (callback) => {
  db.all('SELECT * FROM courses ORDER BY name', callback);
};

module.exports = {
  initializeDatabase,
  registerStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  createEnrollment,
  getEnrollmentsByStudent,
  getAllEnrollments,
  addGrade,
  getGradesByStudent,
  addCourse,
  getAllCourses
};
