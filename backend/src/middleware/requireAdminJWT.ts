import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';
import prisma from '../prismaClient';

export async function requireAdminJWT(req: Request, res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Missing Authorization' });

    const decoded = verifyAccess(token);
    if (decoded.typ !== 'access') return res.status(401).json({ message: 'Invalid token type' });

    const admin = await prisma.admin.findUnique({ where: { admin_id: decoded.sub } });
    if (!admin) return res.status(401).json({ message: 'Admin not found' });
    if (admin.token_version !== decoded.tv) {
      return res.status(401).json({ message: 'Token revoked' });
    }

    req.admin = {
      adminId: admin.admin_id,
      email: admin.email,
      name: admin.name,
      tokenVersion: admin.token_version,
    };

    next();
  } catch (e: any) {
    return res.status(401).json({ message: 'Unauthorized', detail: e?.message });
  }
}
