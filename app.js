const API_BASE = 'http://localhost:3001/api';

let allStudents = [];
let allEnrollments = [];
let allGrades = [];

// ==================== TAB NAVIGATION ====================

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            showTab(tabName);
            
            if (tabName === 'students') loadStudents();
            if (tabName === 'enrollments') loadEnrollments();
            if (tabName === 'grades') loadGrades();
            if (tabName === 'dashboard') loadDashboard();
        });
    });
    
    loadDashboard();
});

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/analytics/dashboard`);
        const stats = await response.json();
        
        document.getElementById('statTotalStudents').textContent = stats.totalStudents;
        document.getElementById('statActiveStudents').textContent = stats.activeStudents;
        document.getElementById('statTotalEnrollments').textContent = stats.totalEnrollments;
        document.getElementById('statAverageGPA').textContent = stats.averageGPA;
        document.getElementById('statCompletedCourses').textContent = stats.completedCourses;
        document.getElementById('statInProgress').textContent = stats.inProgressCourses;
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Failed to load dashboard statistics', 'error');
    }
}

// ==================== STUDENT MANAGEMENT ====================

async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        allStudents = await response.json();
        
        const tbody = document.getElementById('studentsTableBody');
        const noStudents = document.getElementById('noStudents');
        
        if (allStudents.length === 0) {
            tbody.innerHTML = '';
            noStudents.style.display = 'block';
            return;
        }
        
        noStudents.style.display = 'none';
        tbody.innerHTML = allStudents.map(student => `
            <tr>
                <td>${student.id.substring(0, 8)}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.phone || '-'}</td>
                <td><span class="badge badge-success">${student.enrollmentStatus}</span></td>
                <td>${student.gpa.toFixed(2)}</td>
                <td>
                    <button class="btn-secondary" onclick="viewStudent('${student.id}')" style="font-size:12px">View</button>
                    <button class="btn-danger" onclick="deleteStudent('${student.id}')" style="font-size:12px">Delete</button>
                </td>
            </tr>
        `).join('');
        
        updateStudentSelects();
    } catch (error) {
        console.error('Error loading students:', error);
        showAlert('Failed to load students', 'error');
    }
}

function showStudentModal() {
    document.getElementById('studentModal').classList.add('show');
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('show');
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('dateOfBirth').value = '';
    document.getElementById('address').value = '';
}

async function saveStudent(e) {
    e.preventDefault();
    
    const student = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        address: document.getElementById('address').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(student)
        });
        
        if (response.ok) {
            closeStudentModal();
            loadStudents();
            showAlert('Student registered successfully!', 'success');
        } else {
            showAlert('Failed to register student', 'error');
        }
    } catch (error) {
        console.error('Error saving student:', error);
        showAlert('Error saving student', 'error');
    }
}

async function viewStudent(studentId) {
    try {
        const response = await fetch(`${API_BASE}/students/${studentId}`);
        const student = await response.json();
        
        const progressResponse = await fetch(`${API_BASE}/reports/progress/${studentId}`);
        const progress = await progressResponse.json();
        
        alert(`
Student: ${student.firstName} ${student.lastName}
Email: ${student.email}
Phone: ${student.phone || 'N/A'}
Status: ${student.enrollmentStatus}
GPA: ${student.gpa.toFixed(2)}
Total Credits: ${progress.totalCreditsCompleted}
Completed Courses: ${progress.completedCourses}
In Progress: ${progress.inProgressCourses}
        `);
    } catch (error) {
        console.error('Error viewing student:', error);
        showAlert('Failed to load student details', 'error');
    }
}

async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        try {
            await fetch(`${API_BASE}/students/${studentId}`, { method: 'DELETE' });
            loadStudents();
            showAlert('Student deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting student:', error);
            showAlert('Failed to delete student', 'error');
        }
    }
}

// ==================== ENROLLMENT MANAGEMENT ====================

async function loadEnrollments() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        const students = await response.json();
        
        let allEnrollmentsData = [];
        
        for (const student of students) {
            const enrollResponse = await fetch(`${API_BASE}/enrollments/${student.id}`);
            const enrollments = await enrollResponse.json();
            allEnrollmentsData = allEnrollmentsData.concat(
                enrollments.map(e => ({ ...e, studentName: `${student.firstName} ${student.lastName}` }))
            );
        }
        
        allEnrollments = allEnrollmentsData;
        renderEnrollments(allEnrollments);
        updateStudentSelects();
    } catch (error) {
        console.error('Error loading enrollments:', error);
        showAlert('Failed to load enrollments', 'error');
    }
}

function renderEnrollments(enrollments) {
    const tbody = document.getElementById('enrollmentsTableBody');
    const noEnrollments = document.getElementById('noEnrollments');
    
    if (enrollments.length === 0) {
        tbody.innerHTML = '';
        noEnrollments.style.display = 'block';
        return;
    }
    
    noEnrollments.style.display = 'none';
    tbody.innerHTML = enrollments.map(enrollment => `
        <tr>
            <td>${enrollment.courseCode}</td>
            <td>${enrollment.courseName}</td>
            <td>${enrollment.studentName}</td>
            <td>${enrollment.credits}</td>
            <td>${enrollment.semester || '-'}</td>
            <td><span class="badge badge-info">${enrollment.status}</span></td>
            <td>
                <button class="btn-danger" onclick="deleteEnrollment('${enrollment.id}')" style="font-size:12px">Delete</button>
            </td>
        </tr>
    `).join('');
}

function filterEnrollments() {
    const studentId = document.getElementById('studentFilter').value;
    const filtered = studentId 
        ? allEnrollments.filter(e => e.studentId === studentId)
        : allEnrollments;
    renderEnrollments(filtered);
}

function showEnrollmentModal() {
    document.getElementById('enrollmentModal').classList.add('show');
}

function closeEnrollmentModal() {
    document.getElementById('enrollmentModal').classList.remove('show');
    document.getElementById('courseCode').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('credits').value = '';
    document.getElementById('semester').value = '';
}

async function saveEnrollment(e) {
    e.preventDefault();
    
    const enrollment = {
        studentId: document.getElementById('enrollmentStudentId').value,
        courseCode: document.getElementById('courseCode').value,
        courseName: document.getElementById('courseName').value,
        credits: parseInt(document.getElementById('credits').value),
        semester: document.getElementById('semester').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(enrollment)
        });
        
        if (response.ok) {
            closeEnrollmentModal();
            loadEnrollments();
            showAlert('Enrollment created successfully!', 'success');
        } else {
            showAlert('Failed to create enrollment', 'error');
        }
    } catch (error) {
        console.error('Error saving enrollment:', error);
        showAlert('Error saving enrollment', 'error');
    }
}

async function deleteEnrollment(enrollmentId) {
    if (confirm('Are you sure you want to delete this enrollment?')) {
        try {
            await fetch(`${API_BASE}/enrollments/${enrollmentId}`, { method: 'DELETE' });
            loadEnrollments();
            showAlert('Enrollment deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting enrollment:', error);
            showAlert('Failed to delete enrollment', 'error');
        }
    }
}

// ==================== GRADES MANAGEMENT ====================

async function loadGrades() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        const students = await response.json();
        
        let allGradesData = [];
        
        for (const student of students) {
            const gradesResponse = await fetch(`${API_BASE}/grades/${student.id}`);
            const grades = await gradesResponse.json();
            allGradesData = allGradesData.concat(
                grades.map(g => ({ ...g, studentName: `${student.firstName} ${student.lastName}` }))
            );
        }
        
        allGrades = allGradesData;
        renderGrades(allGrades);
        
        // Load enrollments for grade recording
        loadEnrollmentsForGrades();
    } catch (error) {
        console.error('Error loading grades:', error);
        showAlert('Failed to load grades', 'error');
    }
}

function renderGrades(grades) {
    const tbody = document.getElementById('gradesTableBody');
    const noGrades = document.getElementById('noGrades');
    
    if (grades.length === 0) {
        tbody.innerHTML = '';
        noGrades.style.display = 'block';
        return;
    }
    
    noGrades.style.display = 'none';
    tbody.innerHTML = grades.map(grade => `
        <tr>
            <td>${grade.studentName}</td>
            <td>${grade.courseCode} - ${grade.courseName}</td>
            <td>${grade.credits}</td>
            <td><span class="badge badge-success">${grade.grade}</span></td>
            <td>${grade.gradePoints.toFixed(1)}</td>
            <td>${new Date(grade.recordedDate).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function filterGrades() {
    const studentId = document.getElementById('studentGradeFilter').value;
    const filtered = studentId 
        ? allGrades.filter(g => g.studentId === studentId)
        : allGrades;
    renderGrades(filtered);
}

async function loadEnrollmentsForGrades() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        const students = await response.json();
        
        const select = document.getElementById('enrollmentIdForGrade');
        let options = '<option value="">Choose an enrollment</option>';
        
        for (const student of students) {
            const enrollResponse = await fetch(`${API_BASE}/enrollments/${student.id}`);
            const enrollments = await enrollResponse.json();
            
            for (const enrollment of enrollments.filter(e => !e.grade)) {
                options += `<option value="${enrollment.id}">${student.firstName} ${student.lastName} - ${enrollment.courseCode}</option>`;
            }
        }
        
        select.innerHTML = options;
    } catch (error) {
        console.error('Error loading enrollments for grades:', error);
    }
}

function showGradeModal() {
    document.getElementById('gradeModal').classList.add('show');
}

function closeGradeModal() {
    document.getElementById('gradeModal').classList.remove('show');
}

const gradeMap = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0,
    'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0
};

async function saveGrade(e) {
    e.preventDefault();
    
    const grade = {
        enrollmentId: document.getElementById('enrollmentIdForGrade').value,
        grade: document.getElementById('gradeValue').value,
        gradePoints: gradeMap[document.getElementById('gradeValue').value]
    };
    
    try {
        const response = await fetch(`${API_BASE}/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(grade)
        });
        
        if (response.ok) {
            closeGradeModal();
            loadGrades();
            showAlert('Grade recorded successfully!', 'success');
        } else {
            showAlert('Failed to record grade', 'error');
        }
    } catch (error) {
        console.error('Error saving grade:', error);
        showAlert('Error saving grade', 'error');
    }
}

// ==================== REPORTS ====================

async function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportContent = document.getElementById('reportContent');
    
    if (!reportType) {
        reportContent.innerHTML = '';
        return;
    }
    
    try {
        if (reportType === 'all-students') {
            const response = await fetch(`${API_BASE}/reports/all-students`);
            const report = await response.json();
            
            let html = '<h3>All Students Performance Report</h3><table style="width:100%"><thead><tr><th>Name</th><th>Email</th><th>Total Courses</th><th>Completed</th><th>GPA</th><th>Status</th></tr></thead><tbody>';
            
            report.forEach(student => {
                html += `<tr>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.totalCourses}</td>
                    <td>${student.completedCourses}</td>
                    <td>${student.gpa}</td>
                    <td><span class="badge badge-success">${student.status}</span></td>
                </tr>`;
            });
            
            html += '</tbody></table>';
            reportContent.innerHTML = html;
        } else if (reportType === 'individual') {
            const studentId = prompt('Enter Student ID (or leave blank to see format)');
            if (studentId) {
                const response = await fetch(`${API_BASE}/reports/progress/${studentId}`);
                if (!response.ok) {
                    showAlert('Student not found', 'error');
                    return;
                }
                
                const report = await response.json();
                
                let html = `<h3>Individual Academic Progress Report</h3>
                    <p><strong>Student:</strong> ${report.studentName}</p>
                    <p><strong>Email:</strong> ${report.email}</p>
                    <p><strong>GPA:</strong> ${report.currentGPA}</p>
                    <p><strong>Total Enrollments:</strong> ${report.totalEnrollments}</p>
                    <p><strong>Completed Courses:</strong> ${report.completedCourses}</p>
                    <p><strong>In Progress:</strong> ${report.inProgressCourses}</p>
                    <p><strong>Total Credits Completed:</strong> ${report.totalCreditsCompleted}</p>
                    <h4>Courses:</h4>
                    <table style="width:100%"><thead><tr><th>Code</th><th>Name</th><th>Credits</th><th>Semester</th><th>Grade</th><th>Status</th></tr></thead><tbody>`;
                
                report.courses.forEach(course => {
                    html += `<tr>
                        <td>${course.courseCode}</td>
                        <td>${course.courseName}</td>
                        <td>${course.credits}</td>
                        <td>${course.semester || '-'}</td>
                        <td>${course.grade}</td>
                        <td>${course.status}</td>
                    </tr>`;
                });
                
                html += '</tbody></table>';
                reportContent.innerHTML = html;
            }
        } else if (reportType === 'semester') {
            const semester = prompt('Enter semester (e.g., Fall 2024)');
            if (semester) {
                const response = await fetch(`${API_BASE}/reports/semester/${semester}`);
                const report = await response.json();
                
                if (report.length === 0) {
                    reportContent.innerHTML = '<p>No data for this semester</p>';
                    return;
                }
                
                let html = `<h3>Semester Report: ${semester}</h3>`;
                
                report.forEach(student => {
                    html += `<h4>${student.studentName}</h4>
                        <p>Courses Enrolled: ${student.coursesEnrolled} | Completed: ${student.coursesCompleted}</p>
                        <table style="width:100%; margin-bottom:20px">
                            <thead><tr><th>Code</th><th>Name</th><th>Credits</th><th>Grade</th></tr></thead>
                            <tbody>`;
                    
                    student.courses.forEach(course => {
                        html += `<tr>
                            <td>${course.code}</td>
                            <td>${course.name}</td>
                            <td>${course.credits}</td>
                            <td>${course.grade}</td>
                        </tr>`;
                    });
                    
                    html += '</tbody></table>';
                });
                
                reportContent.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showAlert('Failed to generate report', 'error');
    }
}

// ==================== UTILITIES ====================

function updateStudentSelects() {
    const selects = ['enrollmentStudentId', 'studentFilter', 'studentGradeFilter'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const currentValue = select.value;
        let options = '<option value="">All Students</option>';
        
        allStudents.forEach(student => {
            options += `<option value="${student.id}">${student.firstName} ${student.lastName}</option>`;
        });
        
        select.innerHTML = options;
        select.value = currentValue || '';
    });
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '2000';
    alertDiv.style.minWidth = '300px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 4000);
}

// Close modals when clicking outside
window.onclick = (event) => {
    ['studentModal', 'enrollmentModal', 'gradeModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
};
