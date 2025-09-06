import prisma from '../prismaClient';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from '../utils/jwt';

export type AdminSafe = {
  admin_id: string;
  name: string | null;
  email: string;
  token_version: number;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
};

export type Tokens = { accessToken: string; refreshToken: string };

function sanitizeAdmin(a: any): AdminSafe {
  const { password_hash, ...rest } = a;
  return rest as AdminSafe;
}

/**
 * Create admin account (invite-code gated).
 */
export async function adminSignupService(
  name: string,
  email: string,
  password: string,
  inviteCode?: string
): Promise<{ admin: AdminSafe; tokens: Tokens }> {
  if (!name || !email || !password) {
    throw Object.assign(new Error('Missing fields'), { status: 400 });
  }
  if (process.env.ADMIN_INVITE_CODE && inviteCode !== process.env.ADMIN_INVITE_CODE) {
    throw Object.assign(new Error('Invalid invite code'), { status: 403 });
  }

  const exists = await prisma.admin.findUnique({ where: { email } });
  if (exists) {
    throw Object.assign(new Error('Email already registered'), { status: 409 });
  }

  const password_hash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: { name, email, password_hash },
  });

  const accessToken  = signAccessToken(admin.admin_id, admin.email, admin.token_version);
  const refreshToken = signRefreshToken(admin.admin_id, admin.email, admin.token_version);

  return { admin: sanitizeAdmin(admin), tokens: { accessToken, refreshToken } };
}

/**
 * Login existing admin.
 */
export async function adminLoginService(
  email: string,
  password: string
): Promise<{ admin: AdminSafe; tokens: Tokens }> {
  if (!email || !password) {
    throw Object.assign(new Error('Missing fields'), { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  await prisma.admin.update({
    where: { admin_id: admin.admin_id },
    data: { last_login_at: new Date() },
  });

  const accessToken  = signAccessToken(admin.admin_id, admin.email, admin.token_version);
  const refreshToken = signRefreshToken(admin.admin_id, admin.email, admin.token_version);

  return { admin: sanitizeAdmin(admin), tokens: { accessToken, refreshToken } };
}

/**
 * Rotate tokens using a refresh token.
 */
export async function adminRefreshService(refreshToken: string): Promise<Tokens> {
  if (!refreshToken) {
    throw Object.assign(new Error('refreshToken required'), { status: 400 });
  }

  const decoded = verifyRefresh(refreshToken);
  if (decoded.typ !== 'refresh') {
    throw Object.assign(new Error('Invalid token type'), { status: 401 });
  }

  const admin = await prisma.admin.findUnique({ where: { admin_id: decoded.sub } });
  if (!admin) {
    throw Object.assign(new Error('Admin not found'), { status: 401 });
  }
  if (admin.token_version !== decoded.tv) {
    throw Object.assign(new Error('Token revoked'), { status: 401 });
  }

  const accessToken  = signAccessToken(admin.admin_id, admin.email, admin.token_version);
  const newRefresh   = signRefreshToken(admin.admin_id, admin.email, admin.token_version);

  return { accessToken, refreshToken: newRefresh };
}

/**
 * Logout (revoke refresh tokens by bumping token_version).
 */
export async function adminLogoutService(adminId: string): Promise<void> {
  await prisma.admin.update({
    where: { admin_id: adminId },
    data: { token_version: { increment: 1 } },
  });
}

/**
 * Me (current admin object).
 */
export async function adminMeService(adminId: string): Promise<AdminSafe> {
  const admin = await prisma.admin.findUnique({ where: { admin_id: adminId } });
  if (!admin) {
    throw Object.assign(new Error('Not found'), { status: 404 });
  }
  return sanitizeAdmin(admin);
}

/**
 * Example: dashboard metrics (put all business logic here)
 */
export async function adminMetricsService() {
  const [students, indTutors, massTutors, candidates, sessions] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }).catch(() => 0),
    prisma.individual_Tutor.count().catch(() => 0),
    prisma.mass_Tutor.count().catch(() => 0),
    prisma.candidates.count().catch(() => 0),
    prisma.sessions.count().catch(() => 0),
  ]);
  return { students, individualTutors: indTutors, massTutors, candidates, sessions };
}
