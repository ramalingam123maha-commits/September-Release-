const API_BASE = 'http://localhost:3000/api';

// ============ UTILITY FUNCTIONS ============

function showSection(sectionId) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  if (sectionId === 'dashboard') {
    loadDashboard();
  } else if (sectionId === 'students') {
    loadStudents();
  } else if (sectionId === 'enrollments') {
    loadEnrollments();
  } else if (sectionId === 'grades') {
    loadGrades();
  } else if (sectionId === 'reports') {
    loadReports();
  }
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

function showNotification(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  document.body.insertBefore(alertDiv, document.body.firstChild);
  
  setTimeout(() => alertDiv.remove(), 4000);
}

// ============ DASHBOARD ============

async function loadDashboard() {
  try {
    const [studentsResp, enrollmentsResp, reportsResp] = await Promise.all([
      fetchAPI('/students'),
      fetchAPI('/enrollments'),
      fetchAPI('/reports/performance')
    ]);
    
    document.getElementById('totalStudents').textContent = studentsResp.length;
    document.getElementById('totalEnrollments').textContent = enrollmentsResp.length;
    document.getElementById('averageGPA').textContent = reportsResp.averageGPA;
    
    // Top performers
    const topPerformersList = document.getElementById('topPerformersList');
    topPerformersList.innerHTML = '';
    if (reportsResp.topPerformers.length > 0) {
      reportsResp.topPerformers.forEach(student => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${student.name}</span>
          <span class="gpa-badge">GPA: ${student.gpa}</span>
        `;
        topPerformersList.appendChild(li);
      });
    } else {
      topPerformersList.innerHTML = '<li><em>No top performers yet</em></li>';
    }
    
    // At-risk students
    const atRiskList = document.getElementById('atRiskList');
    atRiskList.innerHTML = '';
    if (reportsResp.atRiskStudents.length > 0) {
      reportsResp.atRiskStudents.forEach(student => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${student.name}</span>
          <span class="gpa-badge" style="background: #ff6b6b;">GPA: ${student.gpa}</span>
        `;
        atRiskList.appendChild(li);
      });
    } else {
      atRiskList.innerHTML = '<li><em>No at-risk students</em></li>';
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// ============ STUDENTS ============

async function loadStudents() {
  try {
    const students = await fetchAPI('/students');
    
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${student.id.substring(0, 8)}</td>
        <td>${student.firstName} ${student.lastName}</td>
        <td>${student.email}</td>
        <td>${student.phone || 'N/A'}</td>
        <td>${student.gpa || '0.00'}</td>
        <td><span class="status-badge status-${student.status}">${student.status}</span></td>
        <td>
          <button onclick="deleteStudent('${student.id}')" class="btn-delete">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    // Populate student select dropdowns
    populateStudentSelects(students);
  } catch (error) {
    console.error('Error loading students:', error);
  }
}

function populateStudentSelects(students) {
  const selects = document.querySelectorAll('#studentSelect, #studentReportSelect');
  selects.forEach(select => {
    select.innerHTML = '<option value="">Select Student</option>';
    students.forEach(student => {
      const option = document.createElement('option');
      option.value = student.id;
      option.textContent = `${student.firstName} ${student.lastName} (${student.email})`;
      select.appendChild(option);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value,
      dateOfBirth: document.getElementById('dateOfBirth').value,
      address: document.getElementById('address').value
    };
    
    try {
      await fetchAPI('/students', 'POST', studentData);
      showNotification('Student registered successfully!', 'success');
      document.getElementById('studentForm').reset();
      loadStudents();
    } catch (error) {
      console.error('Error registering student:', error);
    }
  });
});

async function deleteStudent(studentId) {
  if (confirm('Are you sure you want to delete this student?')) {
    try {
      await fetchAPI(`/students/${studentId}`, 'DELETE');
      showNotification('Student deleted successfully!', 'success');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  }
}

// ============ ENROLLMENTS ============

async function loadEnrollments() {
  try {
    const [students, courses, enrollments] = await Promise.all([
      fetchAPI('/students'),
      fetchAPI('/courses'),
      fetchAPI('/enrollments')
    ]);
    
    populateStudentSelects(students);
    populateCourseSelect(courses);
    populateEnrollmentSelect(enrollments, students, courses);
    
    const tbody = document.querySelector('#enrollmentsTable tbody');
    tbody.innerHTML = '';
    
    enrollments.forEach(enrollment => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${enrollment.student.firstName} ${enrollment.student.lastName}</td>
        <td>${enrollment.course.name}</td>
        <td>${new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
        <td><span class="status-badge status-${enrollment.status}">${enrollment.status}</span></td>
        <td>${enrollment.grade || 'N/A'}</td>
        <td>
          <button onclick="dropEnrollment('${enrollment.id}')" class="btn-delete">Drop</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading enrollments:', error);
  }
}

function populateCourseSelect(courses) {
  const select = document.getElementById('courseSelect');
  select.innerHTML = '<option value="">Select Course</option>';
  courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = `${course.name} (${course.id})`;
    select.appendChild(option);
  });
}

function populateEnrollmentSelect(enrollments, students, courses) {
  const select = document.getElementById('enrollmentSelect');
  select.innerHTML = '<option value="">Select Enrollment</option>';
  enrollments.forEach(enrollment => {
    const option = document.createElement('option');
    option.value = enrollment.id;
    option.textContent = `${enrollment.student.firstName} ${enrollment.student.lastName} - ${enrollment.course.name}`;
    select.appendChild(option);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('enrollmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const enrollmentData = {
      studentId: document.getElementById('studentSelect').value,
      courseId: document.getElementById('courseSelect').value
    };
    
    try {
      await fetchAPI('/enrollments', 'POST', enrollmentData);
      showNotification('Student enrolled successfully!', 'success');
      document.getElementById('enrollmentForm').reset();
      loadEnrollments();
    } catch (error) {
      console.error('Error enrolling student:', error);
    }
  });
});

async function dropEnrollment(enrollmentId) {
  if (confirm('Are you sure you want to drop this enrollment?')) {
    try {
      await fetchAPI(`/enrollments/${enrollmentId}`, 'DELETE');
      showNotification('Enrollment dropped successfully!', 'success');
      loadEnrollments();
    } catch (error) {
      console.error('Error dropping enrollment:', error);
    }
  }
}

// ============ GRADES ============

async function loadGrades() {
  try {
    const enrollments = await fetchAPI('/enrollments');
    
    populateEnrollmentSelect(enrollments, [], []);
    
    const tbody = document.querySelector('#gradesTable tbody');
    tbody.innerHTML = '';
    
    for (const enrollment of enrollments) {
      try {
        const grade = await fetchAPI(`/enrollments/${enrollment.id}/grades`);
        
        if (grade && grade.id) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${enrollment.student.firstName} ${enrollment.student.lastName}</td>
            <td>${enrollment.course.name}</td>
            <td>${grade.midtermScore}</td>
            <td>${grade.finalScore}</td>
            <td>${grade.assignment1}</td>
            <td>${grade.assignment2}</td>
            <td><strong>${grade.gpa}</strong></td>
          `;
          tbody.appendChild(tr);
        }
      } catch (error) {
        // Enrollment has no grades yet
      }
    }
  } catch (error) {
    console.error('Error loading grades:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('gradesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const gradesData = {
      enrollmentId: document.getElementById('enrollmentSelect').value,
      midtermScore: parseInt(document.getElementById('midtermScore').value) || 0,
      finalScore: parseInt(document.getElementById('finalScore').value) || 0,
      assignment1: parseInt(document.getElementById('assignment1').value) || 0,
      assignment2: parseInt(document.getElementById('assignment2').value) || 0
    };
    
    try {
      await fetchAPI('/grades', 'POST', gradesData);
      showNotification('Grades recorded successfully!', 'success');
      document.getElementById('gradesForm').reset();
      loadGrades();
    } catch (error) {
      console.error('Error recording grades:', error);
    }
  });
});

// ============ REPORTS ============

async function loadReports() {
  try {
    const report = await fetchAPI('/reports/performance');
    const students = await fetchAPI('/students');
    
    populateStudentSelects(students);
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
      <div class="report-item">
        <h4>System Overview</h4>
        <p><strong>Total Students:</strong> ${report.totalStudents}</p>
        <p><strong>Average GPA:</strong> ${report.averageGPA}</p>
        <p><strong>Total Enrollments:</strong> ${report.enrollmentStats.totalEnrollments}</p>
        <p><strong>Active Enrollments:</strong> ${report.enrollmentStats.activeEnrollments}</p>
        <p><strong>Completed Enrollments:</strong> ${report.enrollmentStats.completedEnrollments}</p>
      </div>
      <div class="report-item">
        <h4>Top Performers (GPA ≥ 3.5)</h4>
        ${report.topPerformers.length > 0 ? `
          <ul>
            ${report.topPerformers.map(s => `<li>${s.name} - GPA: ${s.gpa}</li>`).join('')}
          </ul>
        ` : '<p>No top performers yet</p>'}
      </div>
      <div class="report-item">
        <h4>At-Risk Students (GPA < 2.0)</h4>
        ${report.atRiskStudents.length > 0 ? `
          <ul>
            ${report.atRiskStudents.map(s => `<li>${s.name} - GPA: ${s.gpa}</li>`).join('')}
          </ul>
        ` : '<p>No at-risk students</p>'}
      </div>
    `;
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('studentReportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = document.getElementById('studentReportSelect').value;
    
    try {
      const report = await fetchAPI(`/students/${studentId}/progress`);
      
      const reportContent = document.getElementById('progressReportContent');
      reportContent.innerHTML = `
        <div class="report-item">
          <h4>${report.student.firstName} ${report.student.lastName}</h4>
          <p><strong>Student ID:</strong> ${report.student.id}</p>
          <p><strong>Email:</strong> ${report.student.email}</p>
          <p><strong>Current GPA:</strong> ${report.student.gpa}</p>
          <p><strong>Total Enrolled Courses:</strong> ${report.totalEnrolledCourses}</p>
          <p><strong>Courses Completed:</strong> ${report.coursesCompleted}</p>
        </div>
        <div class="report-item">
          <h4>Current Enrollments</h4>
          ${report.enrollments.length > 0 ? `
            <ul>
              ${report.enrollments.map(e => `
                <li>
                  <strong>${e.course.name}</strong> (${e.course.id})<br>
                  Grade: ${e.grade || 'N/A'} | Status: ${e.status}
                </li>
              `).join('')}
            </ul>
          ` : '<p>No enrollments</p>'}
        </div>
      `;
      
      showNotification('Report generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating report:', error);
    }
  });
});

// Initialize dashboard on load
window.addEventListener('load', () => {
  loadDashboard();
});
