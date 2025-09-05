import { execSync } from 'child_process';

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


//importing routes
import userRoutes from './routes/userRoutes';
import studentRoutes from './routes/studentsRoutes';
import individualTutorRoutes from './routes/individualTutorRouter';

import scheduleRoutes from './routes/scheduleRoutes';

import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

// Initialize Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
      'user': '/api/user/:uid',
      'schedule': '/api/schedule'
    }
  });
});

app.get('/', (_req: Request, res: Response) => {
  console.log('Welcome to the Online Tutoring Platform API');
  res.status(200).json({ message: 'Welcome to the Online Tutoring Platform API' });
});

//Routes for user management
app.use('/api', userRoutes);

// const formatToEnum = (value) => {
//   return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
// };


// Register routes
app.use('/api', userRoutes);

//Student Routes
app.use('/student', studentRoutes);

//Individual Tutor Routes
app.use('/individual-tutor', individualTutorRoutes);

//Schedule Routes
app.use('/api/schedule', scheduleRoutes);
//Payment Routes
app.use('/payment', paymentRoutes);

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
