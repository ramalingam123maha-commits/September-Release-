const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let userRole = localStorage.getItem('userRole');
let userId = localStorage.getItem('userId');
let students = [];
let enrollments = [];
let progress = [];

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  if (token && userRole) {
    showDashboard();
    loadDashboardStats();
  }
});

// Tab switching
function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
  
  event.target.classList.add('active');
  document.getElementById(tab + '-login').classList.add('active');
}

// Login functions
async function loginAdmin(e) {
  e.preventDefault();
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    token = data.token;
    userRole = 'admin';
    userId = data.admin.id;

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userId', userId);

    showDashboard();
    loadDashboardStats();
  } catch (err) {
    document.getElementById('admin-error').textContent = err.message;
  }
}

async function loginStudent(e) {
  e.preventDefault();
  const email = document.getElementById('student-email').value;
  const password = document.getElementById('student-password').value;

  try {
    const res = await fetch(`${API_URL}/auth/student/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    token = data.token;
    userRole = 'student';
    userId = data.student._id;

    localStorage.setItem('token', token);
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userId', userId);

    showDashboard();
    loadStudentProgress();
  } catch (err) {
    document.getElementById('student-error').textContent = err.message;
  }
}

function logout() {
  token = null;
  userRole = null;
  userId = null;
  localStorage.clear();
  document.getElementById('login-container').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('login-container').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  
  const userInfo = userRole === 'admin' ? 'Admin' : 'Student';
  document.getElementById('user-info').textContent = `Logged in as: ${userInfo}`;

  if (userRole !== 'admin') {
    document.getElementById('add-student-btn').style.display = 'none';
    document.getElementById('add-enrollment-btn').style.display = 'none';
  }
}

// Page navigation
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');

  if (page === 'students' && userRole === 'admin') loadStudents();
  if (page === 'enrollments' && userRole === 'admin') loadEnrollments();
  if (page === 'progress' && userRole === 'admin') loadProgress();
  if (page === 'profile') loadProfile();
}

// Dashboard stats
async function loadDashboardStats() {
  if (userRole !== 'admin') return;

  try {
    const res = await fetch(`${API_URL}/reports/stats/enrollment`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    document.getElementById('total-students').textContent = data.total;
    document.getElementById('active-students').textContent = data.activeStudents;
    document.getElementById('graduated-students').textContent = data.graduatedStudents;

    // Calculate average GPA
    const studentsRes = await fetch(`${API_URL}/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const studentsData = await studentsRes.json();
    const avgGPA = studentsData.students.reduce((sum, s) => sum + (s.gpa || 0), 0) / studentsData.students.length || 0;
    document.getElementById('avg-gpa').textContent = avgGPA.toFixed(2);
  } catch (err) {
    console.error(err);
  }
}

// Students management
async function loadStudents() {
  try {
    const res = await fetch(`${API_URL}/students`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    students = (await res.json()).students;
    renderStudentsTable(students);
  } catch (err) {
    console.error(err);
  }
}

function renderStudentsTable(studentsList) {
  const tbody = document.getElementById('students-tbody');
  tbody.innerHTML = '';

  studentsList.forEach(student => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${student.registrationNumber}</td>
      <td>${student.firstName} ${student.lastName}</td>
      <td>${student.email}</td>
      <td>${student.program}</td>
      <td>${student.gpa}</td>
      <td>${student.enrollmentStatus}</td>
      <td>
        <button onclick="editStudent('${student._id}')">Edit</button>
        <button onclick="deleteStudent('${student._id}')" class="delete">Delete</button>
      </td>
    `;
  });
}

function searchStudents() {
  const query = document.getElementById('search-student').value.toLowerCase();
  const filtered = students.filter(s => 
    s.firstName.toLowerCase().includes(query) ||
    s.lastName.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query)
  );
  renderStudentsTable(filtered);
}

function filterStudents() {
  const status = document.getElementById('filter-status').value;
  const filtered = status ? students.filter(s => s.enrollmentStatus === status) : students;
  renderStudentsTable(filtered);
}

function openAddStudentModal() {
  document.getElementById('add-student-modal').classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

async function addStudent(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    firstName: form.children[0].value,
    lastName: form.children[1].value,
    email: form.children[2].value,
    password: form.children[3].value,
    phone: form.children[4].value,
    program: form.children[5].value,
    dateOfBirth: form.children[6].value
  };

  try {
    const res = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Failed to register student');
    alert('Student registered successfully!');
    form.reset();
    closeModal('add-student-modal');
    loadStudents();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteStudent(studentId) {
  if (!confirm('Are you sure?')) return;

  try {
    const res = await fetch(`${API_URL}/students/${studentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to delete student');
    alert('Student deleted successfully!');
    loadStudents();
  } catch (err) {
    alert(err.message);
  }
}

// Enrollments management
async function loadEnrollments() {
  try {
    const res = await fetch(`${API_URL}/enrollments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    enrollments = (await res.json()).enrollments;
    renderEnrollmentsTable(enrollments);
  } catch (err) {
    console.error(err);
  }
}

function renderEnrollmentsTable(enrollmentsList) {
  const tbody = document.getElementById('enrollments-tbody');
  tbody.innerHTML = '';

  enrollmentsList.forEach(enrollment => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${enrollment.studentId?.firstName} ${enrollment.studentId?.lastName}</td>
      <td>${enrollment.courseId?.courseName}</td>
      <td>${enrollment.status}</td>
      <td>${enrollment.grade}</td>
      <td>${enrollment.attendance}%</td>
      <td>
        <button onclick="editEnrollment('${enrollment._id}')">Edit</button>
        <button onclick="dropEnrollment('${enrollment._id}')" class="delete">Drop</button>
      </td>
    `;
  });
}

function openAddEnrollmentModal() {
  loadEnrollmentSelects();
  document.getElementById('add-enrollment-modal').classList.remove('hidden');
}

async function loadEnrollmentSelects() {
  // Load students for dropdown
  const studentsRes = await fetch(`${API_URL}/students`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const studentsData = await studentsRes.json();
  
  const studentSelect = document.getElementById('enrollment-student');
  studentSelect.innerHTML = '<option value="">Select Student</option>';
  studentsData.students.forEach(s => {
    const option = document.createElement('option');
    option.value = s._id;
    option.textContent = `${s.firstName} ${s.lastName}`;
    studentSelect.appendChild(option);
  });
}

async function addEnrollment(e) {
  e.preventDefault();
  const studentId = document.getElementById('enrollment-student').value;
  const courseId = document.getElementById('enrollment-course').value;

  try {
    const res = await fetch(`${API_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ studentId, courseId })
    });

    if (!res.ok) throw new Error('Failed to enroll student');
    alert('Student enrolled successfully!');
    closeModal('add-enrollment-modal');
    loadEnrollments();
  } catch (err) {
    alert(err.message);
  }
}

async function dropEnrollment(enrollmentId) {
  if (!confirm('Drop this enrollment?')) return;

  try {
    const res = await fetch(`${API_URL}/enrollments/${enrollmentId}/drop`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to drop enrollment');
    alert('Enrollment dropped!');
    loadEnrollments();
  } catch (err) {
    alert(err.message);
  }
}

// Progress tracking
async function loadProgress() {
  try {
    const res = await fetch(`${API_URL}/progress`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    progress = (await res.json()).progress;
    renderProgressTable(progress);
  } catch (err) {
    console.error(err);
  }
}

function renderProgressTable(progressList) {
  const tbody = document.getElementById('progress-tbody');
  tbody.innerHTML = '';

  progressList.forEach(p => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${p.studentId?.firstName} ${p.studentId?.lastName}</td>
      <td>${p.semester} ${p.year}</td>
      <td>${p.gpa}</td>
      <td>${p.creditsCompleted}</td>
      <td>${p.academicStanding}</td>
    `;
  });
}

async function loadStudentProgress() {
  try {
    const res = await fetch(`${API_URL}/progress/student/${userId}/current`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await res.json();
    const content = document.getElementById('progress-content');
    content.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Current GPA</h3>
          <p>${data.gpa}</p>
        </div>
        <div class="stat-card">
          <h3>Courses Completed</h3>
          <p>${data.coursesCompleted}</p>
        </div>
        <div class="stat-card">
          <h3>Credits</h3>
          <p>${data.creditsCompleted}/${data.creditsRequired}</p>
        </div>
        <div class="stat-card">
          <h3>Degree Progress</h3>
          <p>${data.degreePath}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
  }
}

// Reports
async function generatePerformanceReport() {
  try {
    const res = await fetch(`${API_URL}/reports/performance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const report = await res.json();
    let html = '<table class="data-table"><thead><tr><th>Reg #</th><th>Name</th><th>Program</th><th>GPA</th><th>Status</th><th>Courses</th><th>Standing</th></tr></thead><tbody>';

    report.forEach(student => {
      html += `<tr>
        <td>${student.registrationNumber}</td>
        <td>${student.name}</td>
        <td>${student.program}</td>
        <td>${student.gpa}</td>
        <td>${student.status}</td>
        <td>${student.coursesCompleted}</td>
        <td>${student.academicStanding}</td>
      </tr>`;
    });

    html += '</tbody></table>';
    document.getElementById('report-content').innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

async function generateEnrollmentStats() {
  try {
    const res = await fetch(`${API_URL}/reports/stats/enrollment`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const stats = await res.json();
    const html = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Active Students</h3>
          <p>${stats.activeStudents}</p>
        </div>
        <div class="stat-card">
          <h3>Inactive Students</h3>
          <p>${stats.inactiveStudents}</p>
        </div>
        <div class="stat-card">
          <h3>Suspended Students</h3>
          <p>${stats.suspendedStudents}</p>
        </div>
        <div class="stat-card">
          <h3>Graduated</h3>
          <p>${stats.graduatedStudents}</p>
        </div>
        <div class="stat-card">
          <h3>Total</h3>
          <p>${stats.total}</p>
        </div>
      </div>
    `;
    document.getElementById('report-content').innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// Profile
async function loadProfile() {
  try {
    if (userRole === 'student') {
      const res = await fetch(`${API_URL}/students/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const student = await res.json();
      displayProfile(student);
    }
  } catch (err) {
    console.error(err);
  }
}

function displayProfile(data) {
  const content = document.getElementById('profile-content');
  content.innerHTML = `
    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
    <p><strong>Email:</strong> ${data.email}</p>
    <p><strong>Registration Number:</strong> ${data.registrationNumber}</p>
    <p><strong>Program:</strong> ${data.program}</p>
    <p><strong>GPA:</strong> ${data.gpa}</p>
    <p><strong>Status:</strong> ${data.enrollmentStatus}</p>
    <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
  `;
}

function editStudent(studentId) {
  alert('Edit functionality to be implemented');
}

function editEnrollment(enrollmentId) {
  alert('Edit functionality to be implemented');
}
