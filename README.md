# 📚 Tutorly - Online Tutoring Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

## 🌟 Overview

**Tutorly** is a comprehensive online tutoring platform that connects students with qualified tutors for personalized learning experiences. The platform supports both individual one-on-one sessions and mass group classes, providing flexible learning options for students of all levels.

### 🎯 Key Features

- **👨‍🎓 Multi-Role System**: Students, Individual Tutors, Mass Tutors, and Administrators
- **📅 Smart Scheduling**: Automated session booking with Zoom integration
- **💰 Secure Payments**: Stripe integration for individual sessions and monthly subscriptions
- **📊 Analytics Dashboard**: Comprehensive insights for tutors and administrators
- **💬 Real-time Chat**: Built-in messaging system with Socket.io
- **🎥 Video Integration**: Seamless Zoom meeting creation and management
- **📱 Responsive Design**: Mobile-first approach for all user interfaces
- **🔒 Enterprise Security**: Firebase authentication with role-based access control

---

## 🏗️ Architecture

### Tech Stack

#### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **Recharts** for data visualization
- **Lucide React** for icons

#### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **Socket.io** for WebSocket connections
- **Firebase Admin SDK** for authentication
- **SendGrid** for email services
- **Cloudinary** for file storage

#### External Services
- **PostgreSQL** (Supabase/Neon)
- **Firebase Authentication**
- **Zoom API** for video meetings
- **Stripe** for payment processing
- **SendGrid** for transactional emails
- **Cloudinary** for document storage

---

## 📁 Project Structure

```
OnlineTutoringPlatform/
├── 📂 backend/                 # Node.js + Express API
│   ├── 📂 prisma/             # Database schema & migrations
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── 📂 src/
│   │   ├── 📂 controllers/    # HTTP request handlers
│   │   ├── 📂 services/       # Business logic layer
│   │   ├── 📂 routes/         # API route definitions
│   │   ├── 📂 middleware/     # Authentication & validation
│   │   ├── 📂 socket/         # WebSocket server logic
│   │   ├── 📂 utils/          # Helper functions
│   │   └── index.ts           # Application entry point
│   ├── 📂 uploads/            # File upload storage
│   ├── package.json
│   └── tsconfig.json
├── 📂 frontend/               # React SPA
│   ├── 📂 public/            # Static assets
│   ├── 📂 src/
│   │   ├── 📂 components/     # Reusable UI components
│   │   ├── 📂 pages/          # Route-based pages
│   │   │   ├── 📂 student/    # Student portal
│   │   │   ├── 📂 individualTutor/ # Individual tutor portal
│   │   │   └── 📂 massTutor/  # Mass tutor portal
│   │   ├── 📂 admin/          # Admin dashboard
│   │   ├── 📂 api/            # HTTP client functions
│   │   ├── 📂 context/        # React context providers
│   │   ├── 📂 hooks/          # Custom React hooks
│   │   └── App.tsx            # Root component
│   ├── package.json
│   └── vite.config.ts
├── 📄 USER_MANUAL.md          # User documentation
├── 📄 README.md               # This file
└── 📄 .gitignore
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **Firebase** project
- **Stripe** account (for payments)
- **Zoom** developer account
- **SendGrid** account (for emails)
- **Cloudinary** account (for file storage)

### 1. Clone the Repository

```bash
git clone https://github.com/EshanRavindu17/OnlineTutoringPlatform.git
cd OnlineTutoringPlatform
```

### 2. Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your configuration values

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy  # if you change the data base , run this otherwise not

# Seed the database (optional) # if you change the data base , run this otherwise not
npx prisma db seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your configuration values

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin

---

## 🔧 Environment Configuration

### Backend Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tutorly"
DIRECT_URL="postgresql://username:password@localhost:5432/tutorly"

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Stripe
STRIPE_SECRET_KEY=sk_test_...

# Zoom API
YOUR_CLIENT_ID=your_zoom_client_id
YOUR_CLIENT_SECRET=your_zoom_client_secret
YOUR_ACCOUNT_ID=your_zoom_account_id

# SendGrid
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_EMAIL=admin@tutorly.com
ADMIN_INVITE_CODE=super-secret-code
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_CLIENT_URL=http://localhost:5173

# Firebase Config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🌐 API Documentation

### Authentication Endpoints

```
POST   /Admin/login                    # Admin login
POST   /Admin/signup                   # Admin registration
POST   /Admin/refresh                  # Refresh JWT token
POST   /Admin/logout                   # Admin logout
```

### Student Endpoints

```
GET    /student/getAllIndividualTutors # Get all individual tutors
GET    /student/getIndividualTutorById/:id # Get tutor details
POST   /student/createASession         # Book tutoring session
GET    /student/getAllSessionsByStudentId/:id # Get student sessions
POST   /student/cancelSession/:id      # Cancel session
GET    /student/getPaymentHistory/:id  # Get payment history
```

### Individual Tutor Endpoints

```
GET    /individual-tutor/profile       # Get tutor profile
PUT    /individual-tutor/profile       # Update profile
GET    /individual-tutor/sessions      # Get tutor sessions
POST   /individual-tutor/availability  # Set availability
GET    /individual-tutor/analytics     # Get performance analytics
```

### Mass Tutor Endpoints

```
GET    /mass-tutor/classes            # Get all classes
POST   /mass-tutor/classes            # Create new class
GET    /mass-tutor/classes/:id        # Get class details
PUT    /mass-tutor/classes/:id        # Update class
DELETE /mass-tutor/classes/:id        # Delete class
POST   /mass-tutor/classes/:id/slots  # Create class session
GET    /mass-tutor/analytics          # Get dashboard analytics
GET    /mass-tutor/reviews            # Get reviews & ratings
GET    /mass-tutor/students/:classId  # Get class enrollments
```

### Admin Endpoints

```
GET    /Admin/metrics                 # Dashboard metrics
GET    /Admin/analytics               # Platform analytics
GET    /Admin/tutors/candidates       # Tutor applications
PUT    /Admin/tutors/candidates/:id/approve # Approve tutor
PUT    /Admin/tutors/candidates/:id/reject  # Reject tutor
GET    /Admin/sessions/individual     # Individual sessions
GET    /Admin/sessions/mass           # Mass class sessions
PUT    /Admin/sessions/:id/status     # Update session status
GET    /Admin/reports                 # Student complaints
POST   /Admin/meetings/create         # Create Zoom meeting
GET    /Admin/finance/commission      # Commission rates
PUT    /Admin/finance/commission      # Update commission
```

### Payment Endpoints

```
POST   /payment/create-payment-intent-individual # Individual session payment
POST   /payment/create-payment-intent-mass      # Mass class subscription
POST   /payment/webhook-individual              # Stripe webhook (individual)
POST   /payment/webhook-mass                    # Stripe webhook (mass)
```

### Real-time Chat Endpoints

```
GET    /api/chat/conversations        # Get user conversations
POST   /api/chat/conversations        # Create conversation
GET    /api/chat/conversations/:id/messages # Get messages
POST   /api/chat/conversations/:id/messages # Send message
PUT    /api/chat/messages/:id         # Edit message
DELETE /api/chat/messages/:id         # Delete message
```

---

## 🎭 User Roles & Features

### 👨‍🎓 Student Portal

- **Tutor Discovery**: Browse and filter tutors by subject, rating, price
- **Session Booking**: Schedule individual sessions with preferred tutors
- **Class Enrollment**: Subscribe to group classes for ongoing learning
- **Payment Management**: Secure payment processing with Stripe
- **Calendar Integration**: View all upcoming sessions and classes
- **Progress Tracking**: Monitor learning progress and session history
- **Communication**: Real-time chat with tutors
- **Reviews & Ratings**: Provide feedback after sessions

### 👨‍🏫 Individual Tutor Portal

- **Profile Management**: Comprehensive tutor profile with qualifications
- **Availability Setting**: Configure teaching schedule and time slots
- **Session Management**: Accept/decline bookings, conduct sessions
- **Student Interaction**: Communicate with students via chat
- **Analytics Dashboard**: Track earnings, student count, ratings
- **Document Sharing**: Upload and share learning materials
- **Zoom Integration**: Automatic meeting creation for sessions

### 👥 Mass Tutor Portal

- **Class Creation**: Design and schedule group classes
- **Student Management**: Monitor enrollments and attendance
- **Session Scheduling**: Plan multiple sessions per class
- **Revenue Analytics**: Track subscription revenue and commission
- **Batch Communication**: Send emails to all class students
- **Content Delivery**: Upload class materials and recordings
- **Performance Metrics**: Monitor class success and student feedback

### 🛡️ Admin Dashboard

- **Platform Overview**: Comprehensive metrics and analytics
- **Tutor Management**: Review applications, approve/reject tutors
- **Session Monitoring**: Oversee all platform sessions and classes
- **User Administration**: Manage students, tutors, and their activities
- **Financial Controls**: Set commission rates and payment thresholds
- **Communication Tools**: Create meetings and send platform announcements
- **Complaint Resolution**: Handle student reports and disputes
- **Policy Management**: Create and update platform policies

---

## 💳 Payment System

### Individual Sessions
- **Hourly Billing**: Pay-per-session model
- **Instant Booking**: Immediate session confirmation upon payment
- **Flexible Cancellation**: Cancel with refund based on policy
- **Admin Commission**: Configurable percentage deduction

### Mass Classes
- **Monthly Subscriptions**: Recurring payment model
- **Unlimited Access**: Join all sessions within subscription period
- **Auto-renewal**: Automatic monthly billing
- **Prorated Billing**: Fair pricing for mid-month enrollments

### Payment Processing
- **Stripe Integration**: Secure credit card processing
- **Multiple Currencies**: Support for international payments
- **Receipt Generation**: Automatic invoice creation
- **Refund Management**: Automated refund processing

---

## 🎥 Video Integration

### Zoom API Features
- **Automatic Meeting Creation**: Sessions generate Zoom links automatically
- **Host Controls**: Tutors receive host privileges
- **Security Settings**: Waiting rooms and passwords enabled
- **Recording Options**: Automatic session recording available
- **Admin Oversight**: Administrators can join any session

### Meeting Management
- **Scheduled Meetings**: Sessions are pre-scheduled with calendar integration
- **Join Links**: Students receive participant access links
- **Host URLs**: Tutors get direct host access for immediate control
- **Meeting History**: Track all past and upcoming sessions

---

## 💬 Real-time Features

### Chat System
- **WebSocket Architecture**: Socket.io for instant messaging
- **Multi-user Support**: Students and tutors can communicate directly
- **Message History**: Persistent conversation storage
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message delivery confirmation
- **File Sharing**: Document and image sharing capabilities

### Live Notifications
- **Session Reminders**: Automated email and in-app notifications
- **Booking Confirmations**: Instant confirmation of session bookings
- **Payment Alerts**: Real-time payment success/failure notifications
- **System Updates**: Platform-wide announcements

---

## 📊 Analytics & Reporting

### Student Analytics
- **Learning Progress**: Track completed sessions and time spent
- **Performance Metrics**: Monitor improvement across subjects
- **Spending Analysis**: Payment history and budget tracking
- **Tutor Ratings**: Review history and feedback provided

### Tutor Analytics
- **Earnings Dashboard**: Revenue tracking with commission breakdown
- **Student Metrics**: Total students taught and retention rates
- **Session Statistics**: Completed sessions and average ratings
- **Performance Trends**: Monthly growth and popular subjects

### Admin Analytics
- **Platform Metrics**: Total users, sessions, and revenue
- **Growth Trends**: User acquisition and retention analysis
- **Financial Reports**: Revenue streams and commission tracking
- **Quality Metrics**: Average ratings and complaint resolution

---

## 🔒 Security Features

### Authentication & Authorization
- **Firebase Integration**: Secure user authentication
- **JWT Tokens**: Stateless session management
- **Role-based Access**: Granular permission control
- **Multi-factor Support**: Optional 2FA for enhanced security

### Data Protection
- **Encryption at Rest**: Database encryption for sensitive data
- **HTTPS Enforcement**: All communications encrypted in transit
- **Input Validation**: Comprehensive request sanitization
- **SQL Injection Prevention**: Prisma ORM provides built-in protection

### Privacy Controls
- **GDPR Compliance**: User data management and deletion rights
- **Profile Privacy**: Configurable visibility settings
- **Communication Controls**: Opt-in/opt-out for notifications
- **Data Anonymization**: Personal information protection in analytics

---

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run component tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Test Categories
- **Unit Tests**: Individual function and component testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Complete user workflow testing
- **Security Tests**: Authentication and authorization validation

---

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

```bash
# Build the application
npm run build

# Set environment variables in hosting platform
# Deploy using Git integration or CLI
```

### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy dist folder to hosting platform
```

### Database Setup (Production)

```bash
# Run migrations on production database
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed initial data
npx prisma db seed
```

### Environment Configuration
- Set all required environment variables in hosting platform
- Configure domain names and SSL certificates
- Set up database backups and monitoring
- Configure CDN for static assets

---

## 📈 Performance Optimization

### Backend Optimizations
- **Database Indexing**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Redis for session and frequently accessed data
- **API Rate Limiting**: Protect against abuse and ensure fair usage

### Frontend Optimizations
- **Code Splitting**: Lazy loading for route-based chunks
- **Asset Optimization**: Image compression and WebP format
- **Bundle Analysis**: Regular monitoring of bundle size
- **CDN Integration**: Static asset delivery optimization

### Monitoring & Logging
- **Application Monitoring**: Real-time performance tracking
- **Error Logging**: Comprehensive error reporting and alerting
- **User Analytics**: Usage patterns and feature adoption
- **Performance Metrics**: Response times and throughput monitoring

---

## 🤝 Contributing

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/OnlineTutoringPlatform.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Set up environment
   cp .env.example .env
   
   # Start development servers
   npm run dev
   ```

4. **Code Standards**
   - Follow TypeScript best practices
   - Use ESLint and Prettier for code formatting
   - Write comprehensive tests for new features
   - Update documentation for API changes

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide detailed description of changes
   - Include screenshots for UI changes
   - Ensure all tests pass
   - Request review from maintainers

### Code Review Process
- **Automated Checks**: All PRs run through CI/CD pipeline
- **Peer Review**: Minimum two approvals required
- **Testing**: Comprehensive test coverage verification
- **Documentation**: Updated documentation for new features

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Complete user authentication system
- ✅ Individual and mass tutoring features
- ✅ Payment processing with Stripe
- ✅ Real-time chat system
- ✅ Admin dashboard with analytics
- ✅ Zoom integration for video sessions
- ✅ Email notification system
- ✅ Mobile-responsive design
- ✅ Comprehensive user roles and permissions

### Upcoming Features (v1.1.0)
- 🔄 Mobile application (React Native)
- 🔄 Advanced scheduling algorithms
- 🔄 AI-powered tutor matching
- 🔄 Multi-language support
- 🔄 Advanced analytics and reporting
- 🔄 Integration with learning management systems

---

## 🐛 Known Issues & Limitations

### Current Limitations
- **File Upload Size**: Limited to 10MB per file
- **Concurrent Users**: Optimized for up to 1000 concurrent users
- **Video Quality**: Dependent on Zoom API limitations
- **Email Delivery**: Subject to SendGrid rate limits

### Planned Improvements
- **Scalability**: Microservices architecture for larger scale
- **Performance**: Database optimization for complex queries
- **User Experience**: Enhanced mobile interface
- **Feature Completeness**: Advanced calendar features

---

## 📞 Support & Contact

### Technical Support
- **Documentation**: Comprehensive user manual available
- **Issue Tracking**: GitHub Issues for bug reports
- **Feature Requests**: GitHub Discussions for new features
- **Community**: Discord server for real-time support

### Development Team
- **Eshan Deepthika** - Backend Lead & Co-Founder
  - GitHub: [@EshanRavindu17](https://github.com/EshanRavindu17)
  - Email: eshan.22@cse.mrt.ac.lk
  - LinkedIn: [eshan-ravindu](https://www.linkedin.com/in/eshan-ravindu-a56978299/)

- **Gayashan De Silva** - Full Stack Developer & Co-Founder
  - GitHub: [@Gayashan](https://github.com/Gayashan)
  - Email: kavishka.22@cse.mrt.ac.lk

- **Pamoj Hansindu** - UI/UX Designer & Frontend Developer
  - GitHub: [@PamojX](https://github.com/PamojX)
  - Email: pamoj.22@cse.mrt.ac.lk
  - LinkedIn: [pamoj-hansindu](https://linkedin.com/in/pamoj-hansindu-447751292)

### Contact Information
- **Platform Email**: admin@tutorly.com
- **Business Inquiries**: business@tutorly.com
- **Technical Issues**: support@tutorly.com

---

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

### License Summary
- ✅ Commercial use allowed
- ✅ Private use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ❌ Liability and warranty not provided

---

## 🙏 Acknowledgments

### Technologies Used
- **[React](https://reactjs.org/)** - Frontend framework
- **[Node.js](https://nodejs.org/)** - Backend runtime
- **[PostgreSQL](https://postgresql.org/)** - Database
- **[Prisma](https://prisma.io/)** - Database ORM
- **[Firebase](https://firebase.google.com/)** - Authentication
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Zoom](https://zoom.us/)** - Video conferencing
- **[SendGrid](https://sendgrid.com/)** - Email service
- **[Socket.io](https://socket.io/)** - Real-time communication

### Special Thanks
- University of Moratuwa - Department of Computer Science and Engineering
- Open source community for amazing tools and libraries
- Beta testers and early adopters for valuable feedback

---

## 🚀 Getting Started

Ready to explore Tutorly? Check out our [User Manual](USER_MANUAL.md) for detailed instructions on how to use the platform, or follow the [Quick Start](#-quick-start) guide above to set up your development environment.

For any questions or support, don't hesitate to reach out to our development team or create an issue in this repository.

**Happy Learning! 📚✨**

---

*Last Updated: October 2025*  
*Version: 1.0.0*  
*Repository: [OnlineTutoringPlatform](https://github.com/EshanRavindu17/OnlineTutoringPlatform)*