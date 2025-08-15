import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authBypass';
import {
  findUserByFirebaseUid,
  createOrUpdateUser,
  validateUserRoleAndEmail,
  getAllUsers
} from '../services/userService';

/**
 * Controller for user-related HTTP requests
 * Handles request/response logic and delegates business logic to userService
 */

/**
 * Get user by Firebase UID
 * GET /api/users/:uid
 */
export const getUserByUid = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { uid } = req.params;
    console.log("🔎 Fetching DB user for UID:", uid);

    if (!uid) {
      return res.status(400).json({ 
        error: 'Firebase UID is required' 
      });
    }

    // Verify the requesting user matches the UID or has admin privileges
    if (req.user?.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied: You can only access your own profile' 
      });
    }

    const user = await findUserByFirebaseUid(uid);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    return res.status(200).json(user);
  } catch (error: any) {
    console.error('❌ Error in getUserByUid controller:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user',
      detail: error.message 
    });
  }
};

/**
 * Add or update user
 * POST /api/users
 */
export const addUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userData = req.body;
    console.log("Received user data from frontend:", userData);

    const user = await createOrUpdateUser(userData);

    return res.status(201).json({
      created: true,
      user: user
    });
  } catch (error: any) {
    console.error('Error in addUser controller:', error);
    
    // Check if it's a validation error
    if (error.message.includes('Missing required fields') || 
        error.message.includes('Invalid role')) {
      return res.status(400).json({ 
        detail: error.message 
      });
    }

    return res.status(400).json({ 
      detail: error.message 
    });
  }
};

/**
 * Check if user exists and has the specified role
 * POST /api/users/check-role
 */
export const checkRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ 
        detail: 'Email and role are required' 
      });
    }

    const isValid = await validateUserRoleAndEmail(email, role);

    if (isValid) {
      return res.status(200).json({});
    } else {
      return res.status(400).json({ 
        detail: 'Invalid role or email' 
      });
    }
  } catch (error: any) {
    console.error('Error in checkRole controller:', error);
    return res.status(400).json({ 
      detail: error.message 
    });
  }
};

/**
 * Get all users (admin only)
 * GET /api/users
 */
export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { limit, offset, role } = req.query;
    
    const options = {
      ...(limit && { limit: parseInt(limit as string) }),
      ...(offset && { offset: parseInt(offset as string) }),
      ...(role && { role: role as string })
    };

    const users = await getAllUsers(options);

    return res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error: any) {
    console.error('Error in getUsers controller:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch users',
      detail: error.message 
    });
  }
};



export const updateUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { uid } = req.params;
    const userData = req.body;

    console.log("User data received for update:", userData);

    console.log("🔄 Update user request received for UID:", uid);
    console.log("📄 Request body:", userData);
    console.log("📸 Uploaded file:", req.file);

    if (!uid) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Verify the requesting user matches the UID or has admin privileges
    if (req.user?.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied: You can only update your own profile' 
      });
    }

    // Handle profile image upload if file is provided
    if (req.file) {
      // Type assertion for multer file with Cloudinary properties
      const file = req.file as Express.Multer.File & { 
        path: string;
        filename: string;
      };

      // Add the Cloudinary URL to userData
      userData.photo_url = file.path;
      console.log("✅ Profile image uploaded to Cloudinary:", file.path);
    }

    // Update user with the provided data (including photo_url if image was uploaded)
    const user = await createOrUpdateUser({
      firebase_uid: uid,
      ...userData
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      updated: true,
      user: user,
      ...(req.file && { 
        imageUploaded: true, 
        imageUrl: userData.photo_url 
      })
    });
  } catch (error: any) {
    console.error('❌ Error in updateUser controller:', error);
    return res.status(500).json({ 
      error: 'Failed to update user profile',
      detail: error.message 
    });
  }
};

/**
 * Upload profile image only
 * POST /api/users/upload-image/:uid
 */
export const uploadImage = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { uid } = req.params;

    console.log("📸 Upload image request received for UID:", uid);
    console.log("📄 Uploaded file:", req.file);

    if (!uid) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided' 
      });
    }

    // Verify the requesting user matches the UID or has admin privileges
    if (req.user?.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied: You can only update your own profile' 
      });
    }

    // Type assertion for multer file with Cloudinary properties
    const file = req.file as Express.Multer.File & { 
      path: string;
      filename: string;
    };

    // Get current user data first
    const currentUser = await findUserByFirebaseUid(uid);
    if (!currentUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update user with just the new image URL
    const user = await createOrUpdateUser({
      firebase_uid: uid,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role,
      photo_url: file.path
    });

    return res.status(200).json({
      message: 'Profile image uploaded successfully',
      updated: true,
      imageUrl: file.path,
      filename: file.filename,
      user: user
    });
  } catch (error: any) {
    console.error('❌ Error in uploadImage controller:', error);
    return res.status(500).json({ 
      error: 'Failed to upload profile image',
      detail: error.message 
    });
  }
};
