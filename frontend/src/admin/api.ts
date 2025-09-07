const BASE = 'http://localhost:5000/Admin';

function getAT() { return localStorage.getItem('adm_at') || ''; }
function getRT() { return localStorage.getItem('adm_rt') || ''; }
function setTokens(at: string, rt: string) {
  localStorage.setItem('adm_at', at);
  localStorage.setItem('adm_rt', rt);
}
function clearTokens() {
  localStorage.removeItem('adm_at');
  localStorage.removeItem('adm_rt');
}

async function request(path: string, init: RequestInit = {}, retry = true) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(init.headers as any) };
  const at = getAT();
  if (at) headers['Authorization'] = `Bearer ${at}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (res.status === 401 && retry) {
    // try refresh
    const rt = getRT();
    if (!rt) throw new Error('No refresh token');
    const rr = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!rr.ok) {
      clearTokens();
      throw new Error('Refresh failed');
    }
    const data = await rr.json();
    setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return request(path, init, false);
  }
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${t}`);
  }
  return res.json();
}

export const adminApi = {
  async signup(name: string, email: string, password: string, inviteCode: string) {
    const res = await request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, inviteCode }),
    });
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    return res.admin as { admin_id: string; name: string; email: string; };
  },
  async login(email: string, password: string) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(res.tokens.accessToken, res.tokens.refreshToken);
    return res.admin as { admin_id: string; name: string; email: string; };
  },
  async me() {
    return request('/auth/me');
  },
  async logout() {
    try { await request('/auth/logout', { method: 'POST' }); } catch {}
    clearTokens();
  },
  async metrics() {
    return request('/dashboard/metrics');
  },
};

// Candidates & moderation
export const moderationApi = {
  listCandidates(params?: { status?: 'pending'|'approved'|'rejected'; role?: 'Individual'|'Mass' }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.role) qs.set('role', params.role);
    const q = qs.toString();
    return request(`/tutors/candidates${q ? `?${q}` : ''}`);
  },
  approveCandidate(id: string) {
    return request(`/tutors/candidates/${id}/approve`, { method: 'POST' });
  },
  rejectCandidate(id: string) {
    return request(`/tutors/candidates/${id}/reject`, { method: 'POST' });
  },
};

export const tutorsApi = {
  listIndividuals(params?: { status?: 'active'|'suspended'; q?: string }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    const q = qs.toString();
    return request(`/tutors/individuals${q ? `?${q}` : ''}`);
  },
  listMass(params?: { status?: 'active'|'suspended'; q?: string }) {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.q) qs.set('q', params.q);
    const q = qs.toString();
    return request(`/tutors/mass${q ? `?${q}` : ''}`);
  },
  suspend(kind: 'individual'|'mass', id: string) {
    return request(`/tutors/${kind}/${id}/suspend`, { method: 'POST' });
  },
  unsuspend(kind: 'individual'|'mass', id: string) {
    return request(`/tutors/${kind}/${id}/unsuspend`, { method: 'POST' });
  },
};
