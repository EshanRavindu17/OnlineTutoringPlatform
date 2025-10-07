import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddlewareSimple';

export const verifyRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'No role found. Please authenticate.' });
    }

    if (userRole !== requiredRole) {
      return res.status(403).json({ error: `Access denied. Only ${requiredRole}s can access this route.` });
    }

    next();
  };
};
