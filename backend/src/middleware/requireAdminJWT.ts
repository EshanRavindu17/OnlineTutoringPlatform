
import { Request, Response, NextFunction } from 'express';
import { verifyAccess } from '../utils/jwt';
import prisma from '../prismaClient';

/**
 * Middleware to protect admin-only routes
 * Checks for valid JWT in Authorization header
 * Also verifies the admin still exists and token hasn't been revoked
 * 
 * Usage: router.get('/admin/stats', requireAdminJWT, adminController.getStats);
 */
export async function requireAdminJWT(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    // Format should be: "Bearer eyJhbGciOiJIUzI1NiIs..."
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!token) return res.status(401).json({ message: 'Missing Authorization' });

    // Verify the JWT and make sure it's an access token
    const decoded = verifyAccess(token);
    if (decoded.typ !== 'access') return res.status(401).json({ message: 'Invalid token type' });

    // Check if admin still exists in database
    // decoded.sub contains the admin_id from the token
    const admin = await prisma.admin.findUnique({ where: { admin_id: decoded.sub } });
    if (!admin) return res.status(401).json({ message: 'Admin not found' });

    // Check if token has been invalidated
    // token_version changes when we want to force re-login (e.g., password change)
    if (admin.token_version !== decoded.tv) {
      return res.status(401).json({ message: 'Token revoked' });
    }

    // Add admin info to request object for use in route handlers
    // This saves having to look up the admin again in each route
    req.admin = {
      adminId: admin.admin_id,
      email: admin.email,
      name: admin.name,
      tokenVersion: admin.token_version,
    };

    // Everything's good - continue to route handler
    next();
  } catch (e: any) {
    // Handle JWT verification errors or database errors
    // Don't expose internal error details in production!
    return res.status(401).json({ message: 'Unauthorized', detail: e?.message });
  }
}
