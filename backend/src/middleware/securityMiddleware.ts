// middleware/securityMiddleware.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Security middleware that adds essential security headers
 * Helps prevent XSS, clickjacking, and other common attacks
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy to prevent XSS
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https:;"
  );
  
  // Prevent clickjacking
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HTTPS enforcement in production
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
};

/**
 * Rate limiting middleware to prevent brute force attacks
 */
export const createRateLimiter = () => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 100; // Max requests per window

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [ip, data] of requests.entries()) {
      if (now > data.resetTime) {
        requests.delete(ip);
      }
    }
    
    // Check current request count
    const clientData = requests.get(clientIP) || { count: 0, resetTime: now + WINDOW_MS };
    
    if (now > clientData.resetTime) {
      // Reset window
      clientData.count = 1;
      clientData.resetTime = now + WINDOW_MS;
    } else {
      clientData.count++;
    }
    
    requests.set(clientIP, clientData);
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - clientData.count));
    res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString());
    
    if (clientData.count > MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    next();
  };
};

/**
 * Token security validator - ensures tokens are properly formatted
 */
export const validateTokenFormat = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Basic JWT format validation
    if (token.split('.').length !== 3) {
      return res.status(401).json({
        error: 'Invalid token format',
        message: 'Token must be a valid JWT'
      });
    }
    
    // Check for suspicious token patterns
    if (token.length < 100) { // Firebase tokens are typically much longer
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token appears to be malformed'
      });
    }
  }
  
  next();
};
