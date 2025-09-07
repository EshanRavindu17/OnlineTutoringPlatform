// backend/src/utils/jwt.ts
import jwt, { type SignOptions, type JwtPayload } from 'jsonwebtoken';

// Accepts number (seconds) or string literals like "15m" | "7d"
type ExpiresIn = NonNullable<SignOptions['expiresIn']>;

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || 'dev_access_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me';

// Narrow env values to the library's accepted union
const ACCESS_EXPIRES  = (process.env.JWT_ACCESS_EXPIRES  ?? '15m') as ExpiresIn;
const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES ?? '7d')  as ExpiresIn;

export type Payload = JwtPayload & {
  sub: string;                 // admin_id
  email: string;
  tv: number;                  // token_version
  typ: 'access' | 'refresh';
};

export function signAccessToken(sub: string, email: string, tv: number): string {
  const payload: Payload = { sub, email, tv, typ: 'access' };
  const opts: SignOptions = { expiresIn: ACCESS_EXPIRES };
  return jwt.sign(payload, ACCESS_SECRET, opts);
}

export function signRefreshToken(sub: string, email: string, tv: number): string {
  const payload: Payload = { sub, email, tv, typ: 'refresh' };
  const opts: SignOptions = { expiresIn: REFRESH_EXPIRES };
  return jwt.sign(payload, REFRESH_SECRET, opts);
}

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

export function verifyAccess(token: string): Payload {
  const decoded = jwt.verify(token, ACCESS_SECRET);
  ensureObjectPayload(decoded);
  if (decoded.typ !== 'access') throw new Error('Not an access token');
  return decoded;
}

export function verifyRefresh(token: string): Payload {
  const decoded = jwt.verify(token, REFRESH_SECRET);
  ensureObjectPayload(decoded);
  if (decoded.typ !== 'refresh') throw new Error('Not a refresh token');
  return decoded;
}
