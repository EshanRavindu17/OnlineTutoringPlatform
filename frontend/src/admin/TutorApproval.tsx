import { useEffect, useMemo, useState } from 'react';
import { moderationApi } from './api';

type Candidate = {
  id: string;
  name: string | null;
  email: string | null;
  role: 'Individual' | 'Mass';
  bio: string | null;
  dob: string | null;
  phone_number: number | null;
  user_id: string | null;
  applied_at: string | null;
  status: 'pending' | 'approved' | 'rejected';
  User?: { id: string; name: string | null; email: string; photo_url: string | null } | null;
};

const fmtDateTime = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const StatusPill = ({ status }: { status: Candidate['status'] }) => {
  const tone =
    status === 'approved' ? 'badge-green' : status === 'rejected' ? 'badge-red' : 'badge-gray';
  return <span className={`admin-badge ${tone} capitalize`}>{status}</span>;
};

const IconCheck = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
    <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.1a1 1 0 1 1 1.4-1.4l3.1 3.1 6.5-6.5a1 1 0 0 1 1.4 0z" />
  </svg>
);
const IconX = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
    <path d="M11.41 10l4.3-4.29a1 1 0 1 0-1.42-1.42L10 8.59 5.71 4.29a1 1 0 0 0-1.42 1.42L8.59 10l-4.3 4.29a1 1 0 1 0 1.42 1.42L10 11.41l4.29 4.3a1 1 0 0 0 1.42-1.42z" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
    <path d="M12.9 14.32a7 7 0 1 1 1.41-1.41l3.4 3.4a1 1 0 0 1-1.41 1.41l-3.4-3.4zM14 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0z" />
  </svg>
);

export default function TutorApproval() {
  const [allRows, setAllRows] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Individual' | 'Mass'>('all');
  const [q, setQ] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(undefined);
      const data = await moderationApi.listCandidates(); // fetch all; filter client-side
      setAllRows(data.candidates ?? []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = { all: allRows.length, pending: 0, approved: 0, rejected: 0 };
    for (const r of allRows) (c as any)[r.status]++;
    return c;
  }, [allRows]);

  const filtered = useMemo(() => {
    let r = [...allRows];
    if (statusTab !== 'all') r = r.filter((x) => x.status === statusTab);
    if (roleFilter !== 'all') r = r.filter((x) => x.role === roleFilter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter(
        (x) =>
          (x.name || '').toLowerCase().includes(s) ||
          (x.email || '').toLowerCase().includes(s) ||
          (x.User?.email || '').toLowerCase().includes(s)
      );
    }
    return r;
  }, [allRows, statusTab, roleFilter, q]);

  async function onApprove(id: string) {
    try {
      setActionId(id);
      await moderationApi.approveCandidate(id);
      setAllRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
      setToast('Candidate approved'); setTimeout(() => setToast(null), 1400);
    } catch (e: any) {
      setErr(e?.message || 'Approve failed');
    } finally { setActionId(null); }
  }

  async function onReject(id: string) {
    try {
      setActionId(id);
      await moderationApi.rejectCandidate(id);
      setAllRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
      setToast('Candidate rejected'); setTimeout(() => setToast(null), 1400);
    } catch (e: any) {
      setErr(e?.message || 'Reject failed');
    } finally { setActionId(null); }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Approve / Reject Tutor</h1>
        <p className="text-sm text-gray-500">Review tutor applications and update their status.</p>
      </div>

      {/* Filters / toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {([
            { key: 'all', label: `All (${counts.all})` },
            { key: 'pending', label: `Pending (${counts.pending})` },
            { key: 'approved', label: `Approved (${counts.approved})` },
            { key: 'rejected', label: `Rejected (${counts.rejected})` },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusTab(key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                statusTab === key ? 'bg-white shadow' : 'opacity-75 hover:opacity-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
        >
          <option value="all">All roles</option>
          <option value="Individual">Individual</option>
          <option value="Mass">Mass</option>
        </select>

        <div className="relative">
          <span className="absolute left-2 top-2.5 text-gray-400"><IconSearch /></span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or email…"
            className="pl-7 pr-3 py-2 border rounded-lg text-sm w-64"
          />
        </div>

        <button onClick={load} className="ml-auto admin-btn admin-btn-ghost">Refresh</button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="text-left font-medium p-3 w-48">Name</th>
                <th className="text-left font-medium p-3 w-64">Email</th>
                <th className="text-left font-medium p-3 w-24">Role</th>
                <th className="text-left font-medium p-3 w-40">Applied at</th>
                <th className="text-left font-medium p-3 w-32">Status</th>
                <th className="text-left font-medium p-3 w-48">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3"><div className="h-3 w-40 bg-gray-200 rounded" /></td>
                    <td className="p-3"><div className="h-3 w-48 bg-gray-200 rounded" /></td>
                    <td className="p-3"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                    <td className="p-3"><div className="h-3 w-36 bg-gray-200 rounded" /></td>
                    <td className="p-3"><div className="h-5 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="p-3"><div className="h-8 w-48 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-500">No candidates match your filters.</td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const disabled = c.status !== 'pending' || actionId === c.id;
                  return (
                    <tr key={c.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium truncate">{c.name ?? '—'}</div>
                        {c.bio && <div className="text-xs text-gray-500 line-clamp-1 max-w-[12rem]">{c.bio}</div>}
                      </td>
                      <td className="p-3 truncate">{c.email ?? c.User?.email ?? '—'}</td>
                      <td className="p-3">{c.role}</td>
                      <td className="p-3">{fmtDateTime(c.applied_at)}</td>
                      <td className="p-3"><StatusPill status={c.status} /></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onApprove(c.id)}
                            disabled={disabled}
                            className={`admin-btn admin-btn-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Create tutor row & mark approved"
                          >
                            <IconCheck /> Approve
                          </button>
                          <button
                            onClick={() => onReject(c.id)}
                            disabled={disabled}
                            className={`admin-btn admin-btn-ghost text-red-600 ring-1 ring-red-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Mark as rejected"
                          >
                            <IconX /> Reject
                          </button>
                          {actionId === c.id && <span className="text-xs text-gray-500">Saving…</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {err && <div className="text-red-600 text-sm">{err}</div>}
      {toast && <div className="fixed bottom-6 right-6 bg-black text-white text-sm px-3 py-2 rounded-xl shadow">{toast}</div>}
    </div>
  );
}
