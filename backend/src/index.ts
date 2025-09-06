import { execSync } from 'child_process';

// Generate Prisma client when starting the server 
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

import adminRoutes from './routes/admin.routes';
import adminTutorsRoutes from './routes/admin.tutors.routes';

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
  allowedHeaders: ['Content-Type', 'Authorization'],
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
      'user': '/api/user/:uid'
    }
  });
});

app.get('/', (_req: Request, res: Response) => {
  console.log('Welcome to the Online Tutoring Platform API');
  res.status(200).json({ message: 'Welcome to the Online Tutoring Platform API' });
});

// Register routes
app.use('/api', userRoutes);

//Student Routes
app.use('/student', studentRoutes);

//Individual Tutor Routes
app.use('/individual-tutor', individualTutorRoutes);

// Admin Routes
app.use('/Admin', adminRoutes);
app.use('/Admin/tutors', adminTutorsRoutes);

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
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
