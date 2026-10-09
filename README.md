# Student Management Dashboard

A comprehensive web-based student management system built with Express.js and vanilla JavaScript. This application enables educational administrators to efficiently manage student records, track academic progress, manage enrollments, and generate performance reports.

## Features

### ✅ Student Management
- **Student Registration**: Register new students with detailed information (name, email, phone, date of birth, address)
- **Student List**: View all registered students with filtering capabilities
- **Profile Updates**: Modify student information as needed
- **Student Deletion**: Remove student records from the system
- **Status Tracking**: Monitor student enrollment status
- **GPA Tracking**: Automatic GPA calculation and tracking

### ✅ Enrollment Management
- **Course Enrollment**: Enroll students in available courses
- **Enrollment Tracking**: View all student enrollments with course details
- **Course Catalog**: Browse available courses with descriptions and credits
- **Enrollment Status**: Track active, completed, and dropped enrollments
- **Drop Courses**: Remove students from courses

### ✅ Grade Management
- **Grade Recording**: Record multiple grade components (midterm, final, assignments)
- **GPA Calculation**: Automatic GPA calculation based on all assessments
- **Grade Tracking**: View grades for each enrollment
- **Student GPA Update**: Automatic update of overall student GPA

### ✅ Academic Reports
- **Performance Reports**: System-wide performance analytics
- **Top Performers**: Identify students with GPA ≥ 3.5
- **At-Risk Students**: Flag students with GPA < 2.0
- **Progress Reports**: Individual student academic progress
- **Enrollment Statistics**: Track active and completed enrollments

### ✅ Dashboard
- **Overview Stats**: Total students, enrollments, average GPA, available courses
- **Top Performers List**: Highlighted high-achieving students
- **At-Risk Students**: Quick identification of struggling students
- **Real-time Updates**: Dynamic dashboard that reflects changes

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **body-parser** - Request parsing middleware
- **cors** - Cross-Origin Resource Sharing
- **uuid** - Unique ID generation

### Frontend
- **HTML5** - Markup structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - Client-side logic
- **Fetch API** - HTTP requests

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   The application will run on `http://localhost:3000`

3. **Access the Dashboard**
   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
/
├── server.js              # Express server and API endpoints
├── package.json           # Project dependencies
├── public/
│   ├── index.html         # Main HTML structure
│   ├── app.js             # Client-side logic
│   └── styles.css         # Styling
```

## API Endpoints

### Students
- `POST /api/students` - Register new student
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student information
- `DELETE /api/students/:id` - Delete student

### Enrollments
- `POST /api/enrollments` - Enroll student in course
- `GET /api/enrollments` - Get all enrollments
- `GET /api/students/:studentId/enrollments` - Get student's enrollments
- `DELETE /api/enrollments/:id` - Drop enrollment

### Grades
- `POST /api/grades` - Record student grades
- `GET /api/enrollments/:enrollmentId/grades` - Get grades for enrollment

### Reports
- `GET /api/reports/performance` - Get system performance report
- `GET /api/students/:studentId/progress` - Get student progress report

### Courses
- `GET /api/courses` - Get available courses

## Data Models

### Student
```javascript
{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  dateOfBirth: string,
  address: string,
  enrollmentDate: ISO8601,
  status: "active" | "inactive",
  gpa: number
}
```

### Enrollment
```javascript
{
  id: string,
  studentId: string,
  courseId: string,
  enrollmentDate: ISO8601,
  status: "active" | "completed",
  grade: number | null
}
```

### Grade
```javascript
{
  id: string,
  enrollmentId: string,
  midtermScore: number,
  finalScore: number,
  assignment1: number,
  assignment2: number,
  gpa: number,
  calculatedAt: ISO8601
}
```

## Usage Guide

### Registering a Student
1. Navigate to the **Students** section
2. Fill in the registration form with student details
3. Click **Register Student**
4. Student appears in the student list

### Enrolling a Student in a Course
1. Go to **Enrollments** section
2. Select student and course from dropdowns
3. Click **Enroll Student**
4. Enrollment is added to the records

### Recording Grades
1. Go to **Grades** section
2. Select an enrollment
3. Enter midterm, final, and assignment scores
4. Click **Record Grades**
5. GPA is automatically calculated

### Generating Reports
1. Navigate to **Reports** section
2. **Performance Summary** shows system-wide analytics
3. **Student Progress Report** allows selecting individual student for detailed report

## Features Overview

### Dashboard
- Displays key metrics at a glance
- Shows top performers and at-risk students
- Real-time statistics updates

### Student Management
- Comprehensive student database
- Quick filters and search capabilities
- Easy CRUD operations

### Enrollment Tracking
- Complete enrollment history
- Course-wise enrollment details
- Status management

### Grade Management
- Multi-component grade tracking
- Automatic GPA calculation
- Grade history

### Reporting
- System-wide performance analytics
- Individual student progress reports
- Enrollment statistics
- Academic performance trends

## Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements
- Database integration (MongoDB/PostgreSQL)
- User authentication and authorization
- Email notifications
- PDF report generation
- Advanced analytics and charts
- Student portal for viewing grades
- Parent/Guardian access
- Transcript generation

## License
MIT License

## Support
For issues or questions, please contact the development team.
