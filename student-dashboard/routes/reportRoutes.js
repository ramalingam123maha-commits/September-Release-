const express = require('express');
const PDFDocument = require('pdfkit');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Progress = require('../models/Progress');
const { verifyToken } = require('./authRoutes');
const router = express.Router();

// Generate student transcript
router.get('/transcript/:studentId', verifyToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const enrollments = await Enrollment.find({ studentId: req.params.studentId })
      .populate('courseId')
      .sort({ enrollmentDate: -1 });

    const progressHistory = await Progress.find({ studentId: req.params.studentId })
      .sort({ year: -1, semester: -1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=transcript.pdf');

    doc.pipe(res);
    doc.fontSize(18).text('STUDENT TRANSCRIPT', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Name: ${student.firstName} ${student.lastName}`);
    doc.text(`Registration Number: ${student.registrationNumber}`);
    doc.text(`Email: ${student.email}`);
    doc.text(`Program: ${student.program}`);
    doc.text(`Enrollment Status: ${student.enrollmentStatus}`);
    doc.text(`GPA: ${student.gpa}`);
    doc.moveDown();

    doc.fontSize(14).text('Course History', { underline: true });
    doc.fontSize(11);
    enrollments.forEach(e => {
      doc.text(`${e.courseId?.courseName} (${e.courseId?.courseCode}): Grade ${e.grade} - ${e.status}`);
    });

    doc.moveDown();
    doc.fontSize(14).text('Progress History', { underline: true });
    doc.fontSize(11);
    progressHistory.forEach(p => {
      doc.text(`${p.semester} ${p.year}: GPA ${p.gpa}, Credits ${p.creditsCompleted}, Standing: ${p.academicStanding}`);
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Performance report - all students
router.get('/performance', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const students = await Student.find().select('-password');
    const report = [];

    for (const student of students) {
      const enrollments = await Enrollment.find({ studentId: student._id, status: 'Completed' });
      const progressRecords = await Progress.find({ studentId: student._id });
      const latestProgress = progressRecords[0];

      report.push({
        registrationNumber: student.registrationNumber,
        name: `${student.firstName} ${student.lastName}`,
        program: student.program,
        gpa: student.gpa,
        status: student.enrollmentStatus,
        coursesCompleted: enrollments.length,
        totalCredits: student.totalCreditsEarned,
        academicStanding: latestProgress?.academicStanding || 'N/A'
      });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Performance report - by program
router.get('/program/:program', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const students = await Student.find({ program: req.params.program }).select('-password');
    const avgGPA = students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length || 0;
    const activeCount = students.filter(s => s.enrollmentStatus === 'Active').length;

    res.json({
      program: req.params.program,
      totalStudents: students.length,
      activeStudents: activeCount,
      averageGPA: avgGPA.toFixed(2),
      students
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enrollment statistics
router.get('/stats/enrollment', verifyToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') return res.status(403).json({ error: 'Access denied' });

    const activeStudents = await Student.countDocuments({ enrollmentStatus: 'Active' });
    const inactiveStudents = await Student.countDocuments({ enrollmentStatus: 'Inactive' });
    const suspendedStudents = await Student.countDocuments({ enrollmentStatus: 'Suspended' });
    const graduatedStudents = await Student.countDocuments({ enrollmentStatus: 'Graduated' });

    res.json({
      activeStudents,
      inactiveStudents,
      suspendedStudents,
      graduatedStudents,
      total: activeStudents + inactiveStudents + suspendedStudents + graduatedStudents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
