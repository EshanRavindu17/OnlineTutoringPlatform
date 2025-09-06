import 'express';

declare global {
  namespace Express {
    interface Request {
      admin?: {
        adminId: string;
        email: string;
        name?: string | null;
        tokenVersion: number;
      };
    }
  }
}
export {};
