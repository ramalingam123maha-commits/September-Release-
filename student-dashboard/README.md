# Student Management Dashboard

A comprehensive full-stack application for administrators to manage student enrollments, track academic progress, manage course registrations, and generate performance reports.

## Features

### Student Management
- Register new students with unique registration numbers
- Manage student enrollment status (Active, Inactive, Suspended, Graduated)
- Update student information and profile data
- Search and filter students by status or program

### Enrollment Management
- Enroll students in courses with automatic capacity checking
- Drop students from courses
- Update grades, attendance, and assignment scores
- Track completion status and academic performance

### Progress Tracking
- Monitor student GPA and credits earned
- Track academic standing (Good Standing, Probation, Dean's List, Warning)
- Calculate degree completion percentage
- View semester-by-semester progress history

### Performance Reporting
- Generate student transcripts with full course history
- Generate performance reports for all students
- View program-specific statistics
- Track enrollment trends and graduation rates

### Course Management
- Create and manage courses with schedules
- Set prerequisites and course requirements
- Monitor course capacity and enrollment

## Technology Stack

**Backend:**
- Node.js with Express.js
- MongoDB for data persistence
- JWT for authentication
- Bcrypt for password hashing

**Frontend:**
- HTML5, CSS3, JavaScript
- Responsive design for all devices

## Installation & Setup

1. **Clone the repository:**
```bash
cd student-dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. **Start the server:**
```bash
npm start
# For development with nodemon:
npm run dev
```

5. **Access the application:**
Open your browser and navigate to `http://localhost:5000`

## Database Models

### Student
- Registration number, name, email
- Program, GPA, enrollment status
- Emergency contact information
- Academic history and credits

### Course
- Course code, name, credits
- Instructor information, schedule
- Prerequisites, capacity
- Syllabus and course materials

### Enrollment
- Student-Course relationship
- Grade, attendance, assignment scores
- Enrollment dates and status
- Completion tracking

### Progress
- Semester and yearly GPA
- Credits completed/in progress
- Academic standing
- Graduation timeline

### Admin
- Staff login credentials
- Role-based permissions
- Department information
- Activity logging

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/register` - Register new admin
- `GET /api/auth/verify` - Verify JWT token

### Students
- `GET /api/students` - Get all students (with pagination)
- `POST /api/students` - Register new student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `PATCH /api/students/:id/status` - Update enrollment status

### Enrollments
- `GET /api/enrollments` - Get all enrollments
- `POST /api/enrollments` - Create enrollment
- `PUT /api/enrollments/:id` - Update enrollment grades/attendance
- `PATCH /api/enrollments/:id/drop` - Drop enrollment

### Progress
- `GET /api/progress` - Get all progress records
- `POST /api/progress` - Record student progress
- `GET /api/progress/student/:studentId` - Get student progress history
- `GET /api/progress/student/:studentId/current` - Get current semester progress

### Reports
- `GET /api/reports/transcript/:studentId` - Generate PDF transcript
- `GET /api/reports/performance` - Performance report for all students
- `GET /api/reports/program/:program` - Program-specific statistics
- `GET /api/reports/stats/enrollment` - Enrollment statistics

## Key Functionalities

### For Administrators
1. **Dashboard Overview**
   - Total students statistics
   - Active/inactive/graduated student counts
   - Average GPA metrics

2. **Student Registration**
   - Bulk registration capabilities
   - Automatic registration number generation
   - Validation of email uniqueness

3. **Course Management**
   - Create courses for each semester
   - Set course capacity limits
   - Define prerequisites

4. **Enrollment Operations**
   - Manage student enrollments
   - Update grades and scores
   - Track attendance

5. **Reporting**
   - PDF transcript generation
   - Performance analytics
   - Academic standing reports

### For Students
1. **View Progress**
   - Current semester GPA
   - Credits earned
   - Degree completion percentage
   - Course history

2. **Profile Management**
   - Update contact information
   - View enrollment status
   - Track academic standing

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Protected admin-only endpoints

## Future Enhancements

- Email notifications for enrollment updates
- Integration with payment systems
- Prerequisite checking before enrollment
- Advanced reporting and analytics
- Student portal for self-service
- Mobile application
- Real-time notifications

## Contributing

This is a demonstration project. Feel free to modify and extend as needed.

## License

MIT License
