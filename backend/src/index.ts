import { execSync } from 'child_process';
try { console.log('Running prisma generate …'); execSync('npx prisma generate', { stdio: 'inherit' }); } catch (err) { console.error('Could not run prisma generate:', err); process.exit(1); }
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import prisma from './prisma';
const userRoutes = require('./routes/users');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000; const NODE_ENV = process.env.NODE_ENV || 'development';
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/health', (_req, res) => { res.status(200).json({ status: 'OK', message: 'Online Tutoring Platform API is running', environment: NODE_ENV, timestamp: new Date().toISOString() }); });
app.get('/api', (_req, res) => { res.json({ message: 'Welcome to Online Tutoring Platform API', version: '1.0.0', endpoints: { health: '/health', api: '/api', users: '/api/users', 'users/:uid': '/api/users/:uid', 'users/check-role': '/api/users/check-role' } }); });
app.get('/', (_req, res) => { res.status(200).json({ message: 'Welcome to the Online Tutoring Platform API' }); });
app.use('/api', userRoutes);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => { console.error('Error:', err.stack || err); const status = err.status || 500; const message = err.message || 'Internal Server Error'; res.status(status).json({ error: { message, status, ...(NODE_ENV === 'development' && { stack: err.stack }) } }); });
app.use('*', (req, res) => { res.status(404).json({ error: { message: 'Route not found', status: 404, path: req.originalUrl } }); });
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); console.log(`📍 Environment: ${NODE_ENV}`); console.log(`🌐 Health check: http://localhost:${PORT}/health`); console.log(`📡 API endpoint: http://localhost:${PORT}/api`); });
process.on('SIGTERM', async () => { console.log('🛑 SIGTERM received. Shutting down gracefully...'); await prisma.$disconnect(); process.exit(0); });
process.on('SIGINT', async () => { console.log('🛑 SIGINT received. Shutting down gracefully...'); await prisma.$disconnect(); process.exit(0); });
process.on('uncaughtException', (error) => { console.error('Uncaught Exception:', error); process.exit(1); });
export default app;
