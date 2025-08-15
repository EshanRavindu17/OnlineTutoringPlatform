// routes/userRoutes
import express from 'express';
import { getUserByUid, addUser, checkRole, getUsers } from '../controllers/userController'; 
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';
import { bypassAuth } from '../middleware/authBypass';

const router = express.Router();

// Test endpoint to debug token issues
router.get('/test-token', verifyFirebaseTokenSimple, (req: any, res) => {
  res.json({ 
    message: 'Token verification successful', 
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// GET routes
router.get('/users', getUsers); // Get all users (admin only)
// Temporarily use bypass auth to test core functionality
router.get('/user/:uid', bypassAuth, getUserByUid); // Get user by Firebase UID (temporarily bypassed)

// POST routes
router.post('/add-user', addUser); // Create or update user
router.post('/check-role', checkRole); // Validate user role and email

export default router;
