const { execSync } = require("child_process");

// Generate Prisma client when starting the server 
// Commented out to avoid permission issues - run manually if needed

try {
  console.log('Running prisma generate …');
  execSync('npx prisma generate', { stdio: 'inherit' }); 
} catch (err) {
  console.error('Could not run prisma generate:', err);
  process.exit(1);
}


import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import prisma from './prismaClient';
import cookieParser from 'cookie-parser';

//importing routes
import userRoutes from './routes/userRoutes';
import studentRoutes from './routes/studentsRoutes';
import individualTutorRoutes from './routes/individualTutorRouter';
import documentRoutes from './routes/documentRoutes';

import scheduleRoutes from './routes/scheduleRoutes';
import sessionRoutes from './routes/sessionRoutes';
import earningsRoutes from './routes/earningsRoutes';
import reviewsRoutes from './routes/reviewsRoutes';

import paymentRoutes from './routes/paymentRoutes';

import adminRoutes from './routes/admin.routes';
import adminTutorsRoutes from './routes/admin.tutors.routes';
import reminderRoutes from './routes/reminderRoutes';

import zoomRouter from './routes/zoom.routes'

// Import reminder service
import { startReminderJobs, getReminderJobStatus } from './services/remider.service';
// Import session cleanup service
import { sessionCleanupService } from './services/sessionCleanupService';
import  {DateTime}  from 'luxon';

dotenv.config();

// Initialize Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
// CORS — allow admin subdomain in dev
const allowlist: (string | RegExp)[] = [
  process.env.CLIENT_URL || '',
  'http://localhost:5173',
  'http://admin.localhost:5173',
  /^http:\/\/localhost:\d+$/i,
].filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    const ok = allowlist.some(o => typeof o === 'string' ? o === origin : o.test(origin));
    cb(ok ? null : new Error(`Not allowed by CORS: ${origin}`), ok);
  },
  credentials: false, // we're sending tokens in headers, not cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files (for file uploads, profile pictures, etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Online Tutoring Platform API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Reminder jobs health check endpoint
app.get('/health/reminders', (_req: Request, res: Response) => {
  try {
    const reminderStatus = getReminderJobStatus();
    res.status(200).json({
      status: 'OK',
      message: 'Email reminder system is active',
      ...reminderStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Email reminder system error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Session cleanup health check endpoint
app.get('/health/session-cleanup', (_req: Request, res: Response) => {
  try {
    const cleanupStatus = sessionCleanupService.getStatus();
    res.status(200).json({
      status: 'OK',
      message: 'Session cleanup system status',
      ...cleanupStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Session cleanup system error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Routes
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Online Tutoring Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      'add-user': '/api/add-user',
      'check-role': '/api/check-role',
      'user': '/api/user/:uid',
      'schedule': '/api/schedule'
    }
  });
});

app.get('/', (_req: Request, res: Response) => {
  console.log('Welcome to the Online Tutoring Platform API');
  res.status(200).json({ message: 'Welcome to the Online Tutoring Platform API' });
});

// Register routes
app.use('/api', userRoutes);

//Document Routes
app.use('/api/documents', documentRoutes);

//Student Routes
app.use('/student', studentRoutes);

//Individual Tutor Routes
app.use('/individual-tutor', individualTutorRoutes);

//Schedule Routes
app.use('/api/schedule', scheduleRoutes);
//Session Routes
app.use('/api/sessions', sessionRoutes);
//Earnings Routes
app.use('/api/earnings', earningsRoutes);
//Reviews Routes
app.use('/api/reviews', reviewsRoutes);
//Payment Routes
app.use('/payment', paymentRoutes);

// Admin Routes
app.use('/Admin', adminRoutes);
app.use('/Admin/tutors', adminTutorsRoutes);

// Reminder Routes
app.use('/api/reminders', reminderRoutes);

app.use('/zoom',zoomRouter)

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    error: {
      message,
      status,
      ...(NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Handle 404 - Route not found
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);
  
  // Initialize reminder cron jobs
  try {
    startReminderJobs();
  } catch (error) {
    console.error('❌ Failed to start reminder jobs:', error);
  }

  // Initialize session cleanup service
  try {
    sessionCleanupService.start({
      expireCheckIntervalMs: 5 * 60 * 1000, // Check every 5 minutes for expired sessions
      completeCheckIntervalMs: 10 * 60 * 1000, // Check every 10 minutes for long-running sessions
    });
    console.log('✅ Session cleanup service started successfully');
  } catch (error) {
    console.error('❌ Failed to start session cleanup service:', error);
  }
});

// const time = new Date();
// console.log(time.toISOString());
// console.log(new Date(time.getTime()+5*60*60*1000+30*60*1000))
// console.log(time.toString());
// console.log(time.toLocaleTimeString());



// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  
  // Stop session cleanup service
  try {
    sessionCleanupService.stop();
    console.log('✅ Session cleanup service stopped');
  } catch (error) {
    console.error('❌ Error stopping session cleanup service:', error);
  }
  
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  
  // Stop session cleanup service
  try {
    sessionCleanupService.stop();
    console.log('✅ Session cleanup service stopped');
  } catch (error) {
    console.error('❌ Error stopping session cleanup service:', error);
  }
  
  await prisma.$disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
