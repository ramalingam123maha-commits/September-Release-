const API_BASE = 'http://localhost:3000/api';

let students = [];
let enrollments = [];
let allProgress = [];
let reports = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadDashboard();
    setupFormHandlers();
});

// Navigation
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const section = e.target.dataset.section;
            switchSection(section);
        });
    });
}

function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    
    if (sectionId === 'students') loadStudents();
    if (sectionId === 'enrollments') loadEnrollments();
    if (sectionId === 'progress') loadProgress();
    if (sectionId === 'reports') loadReports();
}

// Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/analytics/dashboard`);
        const stats = await response.json();
        
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('activeEnrollments').textContent = stats.activeEnrollments;
        document.getElementById('avgPerformance').textContent = stats.averagePerformance + '%';
        
        renderGradeChart(stats.gradeDistribution);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function renderGradeChart(gradeData) {
    const chartHtml = gradeData.map(item => `
        <div class="grade-bar">
            <div class="grade-label">${item.grade}</div>
            <div class="grade-progress">
                <div class="grade-fill" style="width: ${Math.min(item.count * 10, 100)}%">
                    ${item.count}
                </div>
            </div>
            <div class="grade-count">${item.count}</div>
        </div>
    `).join('');
    
    document.getElementById('gradeChart').innerHTML = chartHtml || '<p>No grade data available</p>';
}

// ============ STUDENTS ============

async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        students = await response.json();
        renderStudents(students);
        populateStudentSelects();
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function renderStudents(data) {
    const html = data.map(student => `
        <div class="student-card">
            <h3>${student.name}</h3>
            <div class="card-content">
                <div class="card-field"><strong>Roll:</strong> ${student.rollNumber}</div>
                <div class="card-field"><strong>Email:</strong> ${student.email}</div>
                <div class="card-field"><strong>Phone:</strong> ${student.phone || 'N/A'}</div>
                <div class="card-field"><strong>Status:</strong> <span class="status-badge status-${student.status}">${student.status}</span></div>
            </div>
            <div class="card-actions">
                <button class="btn-sm btn-view" onclick="viewStudentDetails('${student.id}')">View</button>
                <button class="btn-sm btn-delete" onclick="deleteStudent('${student.id}')">Delete</button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('studentsList').innerHTML = html || '<p>No students found</p>';
}

async function deleteStudent(id) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
        loadStudents();
    } catch (error) {
        console.error('Error deleting student:', error);
    }
}

function viewStudentDetails(id) {
    const student = students.find(s => s.id === id);
    if (student) {
        alert(`${student.name}\nEmail: ${student.email}\nRoll: ${student.rollNumber}\nEnrolled: ${student.enrollmentDate}`);
    }
}

function openStudentModal() {
    document.getElementById('studentModal').style.display = 'block';
}

function closeStudentModal() {
    document.getElementById('studentModal').style.display = 'none';
}

function populateStudentSelects() {
    const selects = ['enrollmentStudentId', 'progressStudentId', 'reportStudentId'];
    const options = students.map(s => `<option value="${s.id}">${s.name} (${s.rollNumber})</option>`).join('');
    
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            const currentValue = select.value;
            select.innerHTML = '<option value="">Select Student</option>' + options;
            select.value = currentValue;
        }
    });
}

// ============ ENROLLMENTS ============

async function loadEnrollments() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        students = await response.json();
        
        let allEnrollments = [];
        for (const student of students) {
            const response = await fetch(`${API_BASE}/students/${student.id}/enrollments`);
            const enrollments = await response.json();
            allEnrollments.push(...enrollments.map(e => ({ ...e, studentName: student.name })));
        }
        
        renderEnrollments(allEnrollments);
    } catch (error) {
        console.error('Error loading enrollments:', error);
    }
}

function renderEnrollments(data) {
    const html = data.map(enrollment => `
        <div class="enrollment-card">
            <h3>${enrollment.courseName}</h3>
            <div class="card-content">
                <div class="card-field"><strong>Code:</strong> ${enrollment.courseCode}</div>
                <div class="card-field"><strong>Student:</strong> ${enrollment.studentName}</div>
                <div class="card-field"><strong>Instructor:</strong> ${enrollment.instructor || 'N/A'}</div>
                <div class="card-field"><strong>Semester:</strong> ${enrollment.semester || 'N/A'}</div>
                <div class="card-field"><strong>Credits:</strong> ${enrollment.credits || 'N/A'}</div>
                <div class="card-field"><strong>Status:</strong> <span class="status-badge status-enrolled">${enrollment.status}</span></div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('enrollmentsList').innerHTML = html || '<p>No enrollments found</p>';
}

function openEnrollmentModal() {
    document.getElementById('enrollmentModal').style.display = 'block';
}

function closeEnrollmentModal() {
    document.getElementById('enrollmentModal').style.display = 'none';
}

// ============ PROGRESS ============

async function loadProgress() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        students = await response.json();
        
        let allProgress = [];
        for (const student of students) {
            const response = await fetch(`${API_BASE}/students/${student.id}/progress`);
            const progress = await response.json();
            allProgress.push(...progress.map(p => ({ ...p, studentName: student.name })));
        }
        
        renderProgress(allProgress);
    } catch (error) {
        console.error('Error loading progress:', error);
    }
}

function renderProgress(data) {
    const html = data.map(progress => `
        <div class="progress-card">
            <h3>${progress.courseName || 'Unknown Course'}</h3>
            <div class="card-content">
                <div class="card-field"><strong>Student:</strong> ${progress.studentName}</div>
                <div class="card-field"><strong>Semester:</strong> ${progress.semester}</div>
                <div class="card-field"><strong>GPA:</strong> ${progress.gpa || 'N/A'}</div>
                <div class="card-field"><strong>Attendance:</strong> ${progress.attendancePercentage || 'N/A'}%</div>
                <div class="card-field"><strong>Total Score:</strong> ${progress.totalScore ? progress.totalScore.toFixed(2) : 'N/A'}</div>
                <div class="card-field"><strong>Grade:</strong> <strong style="color: #667eea">${progress.grade}</strong></div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('progressList').innerHTML = html || '<p>No progress records found</p>';
}

function openProgressModal() {
    document.getElementById('progressModal').style.display = 'block';
}

function closeProgressModal() {
    document.getElementById('progressModal').style.display = 'none';
}

// ============ REPORTS ============

async function loadReports() {
    try {
        const response = await fetch(`${API_BASE}/reports`);
        reports = await response.json();
        renderReports(reports);
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

function renderReports(data) {
    const html = data.map(report => `
        <div class="report-card">
            <h3>${report.name} (${report.rollNumber})</h3>
            <div class="card-content">
                <div class="card-field"><strong>Year:</strong> ${report.academicYear}</div>
                <div class="card-field"><strong>Semester:</strong> ${report.semester}</div>
                <div class="card-field"><strong>GPA:</strong> ${report.overallGPA ? report.overallGPA.toFixed(2) : 'N/A'}</div>
                <div class="card-field"><strong>Status:</strong> ${report.performanceStatus}</div>
                <div class="card-field"><strong>Generated:</strong> ${new Date(report.generatedDate).toLocaleDateString()}</div>
                <div class="card-field"><strong>Courses:</strong> ${report.completedCredits}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('reportsList').innerHTML = html || '<p>No reports found</p>';
}

function openReportModal() {
    document.getElementById('reportModal').style.display = 'block';
}

function closeReportModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// ============ FORM HANDLERS ============

function setupFormHandlers() {
    document.getElementById('studentForm').addEventListener('submit', registerStudent);
    document.getElementById('enrollmentForm').addEventListener('submit', enrollStudent);
    document.getElementById('progressForm').addEventListener('submit', recordProgress);
    document.getElementById('reportForm').addEventListener('submit', generateReport);
}

async function registerStudent(e) {
    e.preventDefault();
    
    const student = {
        name: document.getElementById('studentName').value,
        email: document.getElementById('studentEmail').value,
        rollNumber: document.getElementById('studentRollNumber').value,
        phone: document.getElementById('studentPhone').value,
        dateOfBirth: document.getElementById('studentDOB').value,
        address: document.getElementById('studentAddress').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        
        if (response.ok) {
            alert('Student registered successfully!');
            e.target.reset();
            closeStudentModal();
            loadStudents();
        } else {
            alert('Error registering student');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error registering student');
    }
}

async function enrollStudent(e) {
    e.preventDefault();
    
    const enrollment = {
        studentId: document.getElementById('enrollmentStudentId').value,
        courseCode: document.getElementById('courseCode').value,
        courseName: document.getElementById('courseName').value,
        instructor: document.getElementById('instructor').value,
        semester: document.getElementById('semester').value,
        credits: parseInt(document.getElementById('credits').value)
    };
    
    try {
        const response = await fetch(`${API_BASE}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrollment)
        });
        
        if (response.ok) {
            alert('Enrollment successful!');
            e.target.reset();
            closeEnrollmentModal();
            loadEnrollments();
        } else {
            alert('Error creating enrollment');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating enrollment');
    }
}

async function recordProgress(e) {
    e.preventDefault();
    
    const progress = {
        studentId: document.getElementById('progressStudentId').value,
        enrollmentId: document.getElementById('progressEnrollmentId').value,
        semester: document.getElementById('progressSemester').value,
        gpa: parseFloat(document.getElementById('gpa').value),
        attendancePercentage: parseFloat(document.getElementById('attendance').value),
        midtermScore: parseFloat(document.getElementById('midterm').value),
        finalScore: parseFloat(document.getElementById('final').value),
        projectScore: parseFloat(document.getElementById('project').value)
    };
    
    try {
        const response = await fetch(`${API_BASE}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(progress)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Progress recorded!\nGrade: ${result.grade}\nTotal Score: ${result.totalScore.toFixed(2)}`);
            e.target.reset();
            closeProgressModal();
            loadProgress();
        } else {
            alert('Error recording progress');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error recording progress');
    }
}

async function generateReport(e) {
    e.preventDefault();
    
    const report = {
        studentId: document.getElementById('reportStudentId').value,
        academicYear: document.getElementById('academicYear').value,
        semester: document.getElementById('reportSemester').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/reports/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Report Generated!\nPerformance: ${result.performanceStatus}\nGPA: ${result.overallGPA.toFixed(2)}`);
            e.target.reset();
            closeReportModal();
            loadReports();
        } else {
            alert('Error generating report');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating report');
    }
}

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.id === 'studentModal') closeStudentModal();
    if (e.target.id === 'enrollmentModal') closeEnrollmentModal();
    if (e.target.id === 'progressModal') closeProgressModal();
    if (e.target.id === 'reportModal') closeReportModal();
});

// Search functionality
document.getElementById('studentSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = students.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.rollNumber.toLowerCase().includes(query)
    );
    renderStudents(filtered);
});

// Handle enrollment course select change
document.getElementById('progressStudentId').addEventListener('change', async (e) => {
    const studentId = e.target.value;
    if (!studentId) return;
    
    try {
        const response = await fetch(`${API_BASE}/students/${studentId}/enrollments`);
        const enrollments = await response.json();
        const options = enrollments.map(e => 
            `<option value="${e.id}">${e.courseName} (${e.courseCode})</option>`
        ).join('');
        
        document.getElementById('progressEnrollmentId').innerHTML = 
            '<option value="">Select Course</option>' + options;
    } catch (error) {
        console.error('Error loading enrollments:', error);
    }
});
