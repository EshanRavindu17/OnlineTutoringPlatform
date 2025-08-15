// routes/userRoutes
import express from 'express';
import { getUserByUid, addUser, checkRole, getUsers } from '../controllers/userController'; 

const router = express.Router();

// GET routes
router.get('/users', getUsers); // Get all users (admin only)
router.get('/user/:uid', getUserByUid); // Get user by Firebase UID

// POST routes
router.post('/add-user', addUser); // Create or update user
router.post('/check-role', checkRole); // Validate user role and email

export default router;
