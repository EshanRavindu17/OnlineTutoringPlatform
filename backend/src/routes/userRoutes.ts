// routes/userRoutes
import express from 'express';
import { getUserByUid, addUser, checkRole, getUsers, updateUser, uploadImage } from '../controllers/userController'; 
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';
import { bypassAuth } from '../middleware/authBypass';
import { securityHeaders, validateTokenFormat } from '../middleware/securityMiddleware';
import upload from '../config/multer';

const router = express.Router();

// Apply security headers to all routes
router.use(securityHeaders);

// Apply token format validation to protected routes
router.use('/update-profile/*', validateTokenFormat);
router.use('/upload-image/*', validateTokenFormat);
router.use('/user/*', validateTokenFormat);

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
// Use proper authentication for user profile access
router.get('/user/:uid', verifyFirebaseTokenSimple,getUserByUid); // Get user by Firebase UID (with authentication)

// POST routes
router.post('/add-user', addUser); // Create or update user
router.post('/check-role', checkRole); // Validate user role and email

// Protected routes with Firebase authentication
router.post('/update-profile/:uid', verifyFirebaseTokenSimple, upload.single('profileImage'), updateUser); // Update user profile with authentication

// Alternative route for uploading image only
router.post('/upload-image/:uid', verifyFirebaseTokenSimple, upload.single('profileImage'), uploadImage); // Upload profile image with authentication

export default router;
