# Online Tutoring Platform - Backend

This is the backend API for the Online Tutoring Platform built with Node.js and Express.js.

## Project Structure

```
backend/
├── src/
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   └── userController.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── tutors.js
│   │   ├── students.js
│   │   ├── sessions.js
│   │   └── courses.js
│   ├── services/          # Business logic (to be implemented)
│   ├── utils/             # Utility functions
│   │   ├── responseUtil.js
│   │   └── validationUtil.js
│   └── index.js           # Main application file
├── uploads/               # File uploads directory
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

## Features (Planned)

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (Admin, Tutor, Student)

- **User Management**
  - User profiles
  - Profile picture uploads
  - User preferences

- **Tutor Management**
  - Tutor profiles and qualifications
  - Availability scheduling
  - Subject expertise

- **Student Management**
  - Student profiles
  - Learning preferences
  - Session history

- **Session Management**
  - Session booking and scheduling
  - Real-time session handling
  - Session recordings and materials

- **Course Management**
  - Course creation and management
  - Subject categorization
  - Course materials

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your configuration
   ```

3. **Development Server**
   ```bash
   # Start development server with auto-reload
   npm run dev
   
   # Or start production server
   npm start
   ```

4. **API Testing**
   - Health check: `GET http://localhost:5000/health`
   - API info: `GET http://localhost:5000/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Tutors
- `GET /api/tutors` - Get all tutors
- `GET /api/tutors/:id` - Get tutor profile
- `POST /api/tutors` - Create tutor profile
- `PUT /api/tutors/:id` - Update tutor profile
- `GET /api/tutors/:id/availability` - Get tutor availability
- `PUT /api/tutors/:id/availability` - Update tutor availability

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student profile
- `POST /api/students` - Create student profile
- `PUT /api/students/:id` - Update student profile
- `GET /api/students/:id/sessions` - Get student sessions

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions` - Book new session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Cancel session
- `POST /api/sessions/:id/join` - Join session
- `POST /api/sessions/:id/end` - End session

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `GET /api/courses/subjects` - Get all subjects

## Environment Variables

Check `.env.example` for all available environment variables.

## Development Status

🚧 **This project is currently in development**

All endpoints are currently returning 501 (Not Implemented) status codes with placeholder responses. The implementation will be done progressively.

## Next Steps

1. Set up database (MongoDB/PostgreSQL)
2. Implement authentication system
3. Create data models
4. Implement API endpoints
5. Add input validation and sanitization
6. Implement file upload functionality
7. Add real-time features for sessions
8. Write tests
9. Add API documentation (Swagger)
10. Set up logging and monitoring

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **nodemon** - Development auto-reload

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test your changes
4. Submit a pull request

## License

ISC License
