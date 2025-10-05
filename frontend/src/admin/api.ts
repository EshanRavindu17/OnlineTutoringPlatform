// Base URL for all admin endpoints
const BASE = 'http://localhost:5000/Admin';

// Token management helpers
// AT = Access Token (short-lived)
// RT = Refresh Token (long-lived)
// Note: Prefixing with 'adm_' to avoid conflicts with other tokens in localStorage

function getAT() { return localStorage.getItem('adm_at') || ''; }  // Get access token
function getRT() { return localStorage.getItem('adm_rt') || ''; }  // Get refresh token
function setTokens(at: string, rt: string) {
  // Store both tokens after successful login/signup/refresh
  localStorage.setItem('adm_at', at);
  localStorage.setItem('adm_rt', rt);
}
function clearTokens() {
  // Clear tokens on logout or authentication failure
  localStorage.removeItem('adm_at');
  localStorage.removeItem('adm_rt');
}

// Core request function with automatic token refresh
// This is the heart of API - handles all HTTP requests and token management
async function request(path: string, init: RequestInit = {}, retry = true) {
  // Set up headers with content type and auth token if available
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(init.headers as any) };
  const at = getAT();
  if (at) headers['Authorization'] = `Bearer ${at}`;  // Add token to auth header

  // Try the request with current access token
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  
  // Handle 401 (Unauthorized) by trying to refresh the token
  // But only try once (retry=true) to avoid infinite loops
  if (res.status === 401 && retry) {
    // Get refresh token and try to get new access token
    const rt = getRT();
    if (!rt) throw new Error('No refresh token');
    
    // Attempt to refresh tokens
    const rr = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    
    // If refresh fails, clear everything and make user log in again
    if (!rr.ok) {
      clearTokens();
      throw new Error('Refresh failed');
    }
    
    // Store new tokens and retry the original request
    const data = await rr.json();
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return request(path, init, false);  // retry=false to prevent infinite loops
  }

  // Handle any other errors
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${t}`);
  }

  return res.json();
}

// Main admin API object - handles auth and basic admin functions
export const adminApi = {
  // Create new admin account - requires invite code
  async signup(name: string, email: string, password: string, inviteCode: string) {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, inviteCode }),
    });
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    return res.admin as { admin_id: string; name: string; email: string; };
  },

  // Login with existing account
  async login(email: string, password: string) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    return res.admin as { admin_id: string; name: string; email: string; };
  },

  // Get current admin profile - used for session checks
  async me() {
    return request('/auth/me');
  },

  // Logout - clear tokens and notify server
  // Note: Using try-catch because we want to clear tokens even if request fails
  async logout() {
    try { await request('/auth/logout', { method: 'POST' }); } catch {}
    clearTokens();
  },

  // Get dashboard metrics
  async metrics() {
    return request('/dashboard/metrics');
  },

  // Get current admin profile
  async getProfile() {
    return request('/profile');
  },

  // Update admin profile
  async updateProfile(data: { name?: string; email?: string; phone?: string }) {
    return request('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return request('/profile/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Get comprehensive analytics data
  async getAnalytics() {
    return request('/analytics');
  },

  // Get all reports/complaints
  async listReports() {
    return request('/reports');
  },

  // Toggle report status (solve <-> under_review)
  async toggleReportStatus(reportId: string) {
    return request(`/reports/${reportId}/toggle-status`, {
      method: 'PUT',
    });
  },
};

// Tutor application moderation endpoints
// Handles reviewing and approving/rejecting tutor applications
export const moderationApi = {
  // List all tutor candidates with optional filters
  // status: filter by application status
  // role: filter by tutor type (Individual/Mass)
  listCandidates(params?: { status?: 'pending'|'approved'|'rejected'; role?: 'Individual'|'Mass' }) {
    // Build query string for filters
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.role) qs.set('role', params.role);
    const q = qs.toString();
    return request(`/tutors/candidates${q ? `?${q}` : ''}`);
  },

  // Approve a tutor application
  approveCandidate(id: string) {
    return request(`/tutors/candidates/${id}/approve`, { method: 'POST' });
  },

  // Reject a tutor application
  rejectCandidate(id: string) {
    return request(`/tutors/candidates/${id}/reject`, { method: 'POST' });
  },
};

// Active tutor management API
// Handles listing and managing approved tutors
export const tutorsApi = {
  // List individual tutors with optional filters
  // status: active/suspended
  // q: search query for name/email
  listIndividuals(params?: { status?: 'active'|'suspended'; q?: string }) {
    // Build query string for filters and search
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    const q = qs.toString();
    return request(`/tutors/individuals${q ? `?${q}` : ''}`);
  },

  // List mass tutors (teaching institutions) with same filters
  listMass(params?: { status?: 'active'|'suspended'; q?: string }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    const q = qs.toString();
    return request(`/tutors/mass${q ? `?${q}` : ''}`);
  },

  // Suspend a tutor (individual or mass)
  // Used when tutors violate platform policies
  suspend(kind: 'individual'|'mass', id: string) {
    return request(`/tutors/${kind}/${id}/suspend`, { method: 'POST' });
  },

  // Unsuspend a previously suspended tutor
  // Used after suspension period or appeal
  unsuspend(kind: 'individual'|'mass', id: string) {
    return request(`/tutors/${kind}/${id}/unsuspend`, { method: 'POST' });
  },

  // Get detailed profile of a specific tutor
};

// ---------------- Policies API ----------------
export const policiesApi = {
  list() {
    return request('/policies') as Promise<{ policies: PolicyRow[] }>;
  },
  get(id: string) {
    return request(`/policies/${id}`) as Promise<PolicyRow>;
  },
  create(data: { policy_name: string; type: 'tos'|'privacy'|'guidelines'|'conduct'; description?: string }) {
    return request('/policies', { method: 'POST', body: JSON.stringify(data) }) as Promise<PolicyRow>;
  },
  update(id: string, data: { policy_name?: string; type?: 'tos'|'privacy'|'guidelines'|'conduct'; description?: string }) {
    return request(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }) as Promise<PolicyRow>;
  },
  remove(id: string) {
    return request(`/policies/${id}`, { method: 'DELETE' }) as Promise<{ ok: boolean; policy_id: string }>;
  },
};

// Shared policy row shape from backend
export type PolicyRow = {
  policy_id: string;
  policy_name: string;
  type: 'tos'|'privacy'|'guidelines'|'conduct'|'rates';
  description: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};