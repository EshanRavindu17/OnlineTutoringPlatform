import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import prisma from '../prisma/prismaClient.js';
dotenv.config();

// Get __dirname equivalent in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Online Tutoring Platform API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
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

app.get('/', (req, res) => {
  console.log('Welcome to the Online Tutoring Platform API');
  res.status(200).json({ message: 'Welcome to the Online Tutoring Platform API' });
});

app.get('/api/user/:uid', async (req, res) => {
  const { uid } = req.params;
  console.log("🔎 Fetching DB user for UID:", req.params.uid);
  try {
    const user = await prisma.user.findUnique({
      where: { firebase_uid: uid },
      select: {
        id: true,
        firebase_uid: true,
        name: true,
        email: true,
        role: true,
        photo_url: true,
        createdAt: true,
        bio: true,
        dob: true
      }
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', detail: error.message });
  }
});

const formatToEnum = (value) => {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

app.post('/api/add-user', async (req, res) => {
  let { firebase_uid, email, role, name, photo_url, bio = '', dob = null } = req.body;
  role = formatToEnum(role);

  console.log("Received user data from frontend:", req.body);

  try {
    const user = await prisma.user.upsert({
      where: { firebase_uid },
      update: { email, role, name, photo_url, bio, dob },
      create: { firebase_uid, email, role, name, photo_url, bio, dob }
    });

    res.status(201).json({ created: true });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(400).json({ detail: error.message });
  }
});

app.post('/api/check-role', async (req, res) => {
  const { email, role } = req.body;

  try {
    const users = await prisma.user.findMany();
    const user = await prisma.user.findFirst({
      where: {
        email
      }
    });
    if (user) {
      res.status(200).json({});
    } else {
      res.status(400).json({ detail: 'Invalid role or email' });
    }
  } catch (error) {
    console.error('Error checking role:', error);
    res.status(400).json({ detail: error.message });
  }
});

// TODO: Import and use route modules
// import authRoutes from './routes/auth.js';
// import userRoutes from './routes/users.js';
// import tutorRoutes from './routes/tutors.js';
// import studentRoutes from './routes/students.js';
// import sessionRoutes from './routes/sessions.js';
// import courseRoutes from './routes/courses.js';
// 
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/tutors', tutorRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/courses', courseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
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
app.use('*', (req, res) => {
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