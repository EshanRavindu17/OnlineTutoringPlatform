import { Request, Response } from 'express';
import { findUserByFirebaseUid, createOrUpdateUser, validateUserRoleAndEmail, getAllUsers } from '../services/userService';
import { CreateOrUpdateUserRequest, GetUsersOptions } from '../types/user';

export const getUserByUid = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params as { uid?: string };
    console.log('🔎 Fetching DB user for UID:', uid);
    if (!uid) return res.status(400).json({ error: 'Firebase UID is required' });
    const user = await findUserByFirebaseUid(uid);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error: any) {
    console.error('❌ Error in getUserByUid controller:', error);
    res.status(500).json({ error: 'Failed to fetch user', detail: error.message });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body as CreateOrUpdateUserRequest;
    console.log('Received user data from frontend:', userData);
    const user = await createOrUpdateUser(userData);
    res.status(201).json({ created: true, user });
  } catch (error: any) {
    console.error('Error in addUser controller:', error);
    if (error.message.includes('Missing required fields') || error.message.includes('Invalid role')) return res.status(400).json({ detail: error.message });
    res.status(400).json({ detail: error.message });
  }
};

export const checkRole = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body as { email?: string; role?: any };
    if (!email || !role) return res.status(400).json({ detail: 'Email and role are required' });
    const isValid = await validateUserRoleAndEmail(email, role);
    if (isValid) return res.status(200).json({});
    res.status(400).json({ detail: 'Invalid role or email' });
  } catch (error: any) {
    console.error('Error in checkRole controller:', error);
    res.status(400).json({ detail: error.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { limit, offset, role } = req.query as { limit?: string; offset?: string; role?: any };
    const options: GetUsersOptions = { ...(limit ? { limit: parseInt(limit) } : {}), ...(offset ? { offset: parseInt(offset) } : {}), ...(role ? { role } : {}) };
    const users = await getAllUsers(options);
    res.status(200).json({ success: true, data: users, count: users.length });
  } catch (error: any) {
    console.error('Error in getUsers controller:', error);
    res.status(500).json({ error: 'Failed to fetch users', detail: error.message });
  }
};
