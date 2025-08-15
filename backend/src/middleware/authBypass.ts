import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

// For development: bypass token verification completely
// This allows you to test the app without token issues
export const bypassAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Extract UID from URL params for testing
  const { uid } = req.params;
  
  if (uid) {
    req.user = {
      uid: uid,
      email: 'test@example.com'
    };
    console.log('🚨 DEV MODE: Bypassing auth for UID:', uid);
  }
  
  next();
};

export { AuthRequest };
