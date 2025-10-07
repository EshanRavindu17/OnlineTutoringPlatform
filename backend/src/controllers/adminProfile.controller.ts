import { Request, Response } from 'express';
import {
  getAdminProfileService,
  updateAdminProfileService,
  changeAdminPasswordService,
} from '../services/admin.service';

export async function getAdminProfile(req: Request, res: Response) {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthenticated' });
    
    const profile = await getAdminProfileService(req.admin.adminId);
    res.json(profile);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Failed to get profile' });
  }
}

export async function updateAdminProfile(req: Request, res: Response) {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthenticated' });
    
    const { name, email, phone } = req.body || {};
    const updatedProfile = await updateAdminProfileService(req.admin.adminId, { name, email, phone });
    res.json(updatedProfile);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Failed to update profile' });
  }
}

export async function changeAdminPassword(req: Request, res: Response) {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthenticated' });
    
    const { currentPassword, newPassword } = req.body || {};
    await changeAdminPasswordService(req.admin.adminId, currentPassword, newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Failed to change password' });
  }
}