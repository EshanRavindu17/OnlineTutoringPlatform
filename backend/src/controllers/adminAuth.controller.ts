import { Request, Response } from 'express';
import {
  adminSignupService,
  adminLoginService,
  adminRefreshService,
  adminLogoutService,
  adminMeService,
  adminMetricsService,
  adminAnalyticsService,
} from '../services/admin.service';

export async function adminSignup(req: Request, res: Response) {
  try {
    const { name, email, password, inviteCode } = req.body || {};
    const out = await adminSignupService(name, email, password, inviteCode);
    res.status(201).json(out);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Signup failed' });
  }
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body || {};
    const out = await adminLoginService(email, password);
    res.json(out);
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Login failed' });
  }
}

export async function adminRefresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body || {};
    const tokens = await adminRefreshService(refreshToken);
    res.json({ tokens });
  } catch (e: any) {
    res.status(e?.status || 401).json({ message: e?.message || 'Refresh failed' });
  }
}

export async function adminLogout(req: Request, res: Response) {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthenticated' });
    await adminLogoutService(req.admin.adminId);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Logout failed' });
  }
}

export async function adminMe(req: Request, res: Response) {
  try {
    if (!req.admin) return res.status(401).json({ message: 'Unauthenticated' });
    const admin = await adminMeService(req.admin.adminId);
    res.json({ admin });
  } catch (e: any) {
    res.status(e?.status || 500).json({ message: e?.message || 'Failed to load admin' });
  }
}

export async function adminMetrics(req: Request, res: Response) {
  try {
    const m = await adminMetricsService();
    res.json(m);
  } catch (e: any) {
    res.status(500).json({ message: 'Failed to load metrics' });
  }
}

export async function adminAnalytics(req: Request, res: Response) {
  try {
    const analytics = await adminAnalyticsService();
    res.json(analytics);
  } catch (e: any) {
    console.error('Analytics error:', e);
    res.status(500).json({ error: e?.message || 'Failed to fetch analytics' });
  }
}
