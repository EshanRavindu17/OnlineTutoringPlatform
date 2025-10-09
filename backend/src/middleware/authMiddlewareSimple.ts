import { Request, Response, NextFunction } from 'express';
import prisma from '../prismaClient';

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
  };
}

// Simple JWT-like verification for development
// This extracts the Firebase ID token and validates basic structure
export const verifyFirebaseTokenSimple = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    console.log('Token:', idToken);
    
    try {
      // Check if token has proper JWT structure (3 parts separated by dots)
      const tokenParts = idToken.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Token does not have 3 parts');
      }
      
      // Decode the JWT payload (middle part)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

      console.log("🔍 Decoded token payload:", payload);

      console.log('🔍 Decoded token payload:', {
        uid: payload.sub || payload.uid,
        email: payload.email,
        exp: payload.exp,
        iat: payload.iat,
        aud: payload.aud
      });
      
      // Firebase ID tokens use 'sub' field for user ID, not 'uid'
      const userId = payload.sub || payload.uid;
      if (!userId) {
        throw new Error('No user ID found in token (missing sub/uid field)');
      }
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        throw new Error('Token expired');
      }
      
      req.user = {
        uid: userId,
        email: payload.email
      };
      
      console.log('✅ Token verified for user:', userId);

      // Find user role from database
      const user = await prisma.user.findUnique({
        where: { firebase_uid: userId },
        select: { role: true , id: true }
      });

      if (user) {
        (req.user as any).role = user.role;
        (req.user as any).userId = user.id; // Add internal user ID to request
        console.log('🔍 User role:', user.role);
        console.log('🔍 User ID:', user.id);
      } else {
        console.log('⚠️ No user record found for UID:', userId);

      }
      next();
    } catch (tokenError) {
      console.error('❌ Token verification failed:', tokenError.message);
      console.error('Token parts count:', idToken.split('.').length);
      console.error('Token preview:', idToken.substring(0, 50) + '...');
      return res.status(401).json({ error: 'Invalid or expired token', detail: tokenError.message });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export { AuthRequest };
