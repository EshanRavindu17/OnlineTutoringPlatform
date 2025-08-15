import { Request, Response } from 'express';
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
export const getUserByUid = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { uid } = req.params;
    console.log("🔎 Fetching DB user for UID:", uid);

    if (!uid) {
      return res.status(400).json({ 
        error: 'Firebase UID is required' 
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
