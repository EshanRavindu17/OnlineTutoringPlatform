// JWT utilities for auth - handles both access and refresh tokens
// Using separate secrets for each token type (more secure!)
import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

// Type for token expiration
// Can use either seconds (like 3600) or human-readable (like '1h')
// Examples: '15m' for access tokens, '7d' for refresh tokens
type ExpiresIn = NonNullable<SignOptions['expiresIn']>;

// Secret keys for signing tokens
// TODO: In production, these MUST be strong random strings!
// NEVER commit real secrets to git - use env vars
const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || 'dev_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me';

// Token expiration times
// Access tokens: Short lived (15 mins) for security
// Refresh tokens: Long lived (7 days) for better UX
// Using ?? for null coalescing - falls back to defaults if not in env
const ACCESS_EXPIRES  = (process.env.JWT_ACCESS_EXPIRES  ?? '15m') as ExpiresIn;
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES ?? '7d')  as ExpiresIn;

// Our JWT payload structure:
// - sub: User ID (called subject in JWT terms)
// - email: User's email for identification
// - tv: Token version, increments when we want to invalidate all existing tokens
// - typ: Differentiates between access and refresh tokens
export type Payload = JwtPayload & {
  sub: string;                 // admin_id
  email: string;
  tv: number;                  // token_version - increment to invalidate all tokens
  typ: 'access' | 'refresh';   // token type - helps prevent token misuse
};

// Creates short-lived access tokens
// These are used for API authorization
// Example: signAccessToken('123', 'user@example.com', 1)
export function signAccessToken(sub: string, email: string, tv: number): string {
  const payload: Payload = { sub, email, tv, typ: 'access' };
  const opts: SignOptions = { expiresIn: ACCESS_EXPIRES };
  return jwt.sign(payload, ACCESS_SECRET, opts);
}

// Creates long-lived refresh tokens
// Used to get new access tokens without login
// Security: Uses different secret than access tokens
export function signRefreshToken(sub: string, email: string, tv: number): string {
  const payload: Payload = { sub, email, tv, typ: 'refresh' };
  const opts: SignOptions = { expiresIn: REFRESH_EXPIRES };
  return jwt.sign(payload, REFRESH_SECRET, opts);
}

// Type guard function to ensure the token payload has the right shape
// This is a TypeScript assertion function - tells TS the type is correct
// Also acts as runtime validation - throws if payload is invalid
function ensureObjectPayload(decoded: string | JwtPayload): asserts decoded is Payload {
  if (typeof decoded === 'string') throw new Error('Invalid token payload type');
  if (
    decoded == null ||
    typeof decoded.sub !== 'string' ||
    typeof decoded.email !== 'string' ||
    typeof decoded.tv !== 'number' ||
    (decoded.typ !== 'access' && decoded.typ !== 'refresh')
  ) {
    throw new Error('Invalid token payload shape');
  }
}

// Validates access tokens and extracts payload
// Use this for protected API routes
// Throws if token is invalid/expired/wrong type
export function verifyAccess(token: string): Payload {
  const decoded = jwt.verify(token, ACCESS_SECRET);
  ensureObjectPayload(decoded);
  if (decoded.typ !== 'access') throw new Error('Not an access token');
  return decoded;
}

// Similar to verifyAccess but for refresh tokens
// Use this in the token refresh endpoint
// Extra check for token type prevents using access token as refresh
export function verifyRefresh(token: string): Payload {
  const decoded = jwt.verify(token, REFRESH_SECRET);
  ensureObjectPayload(decoded);
  if (decoded.typ !== 'refresh') throw new Error('Not a refresh token');
  return decoded;
}
