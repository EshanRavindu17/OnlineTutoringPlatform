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
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorMap[status]} capitalize`}>
      {status}
    </span>
  );
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutor Applications 📋</h1>
          <p className="text-gray-600">Review and manage tutor applications</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-yellow-800">{counts.pending}</div>
            <div className="text-xs text-yellow-600">Pending</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-green-800">{counts.approved}</div>
            <div className="text-xs text-green-600">Approved</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-red-800">{counts.rejected}</div>
            <div className="text-xs text-red-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: counts.all },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'approved', label: 'Approved', count: counts.approved },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusTab(key as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusTab === key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Individual">Individual</option>
            <option value="Mass">Mass</option>
          </select>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={q}
              onChange={e => setQ(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          {/* Results Info & Refresh */}
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              <strong>{filtered.length}</strong> of <strong>{counts.all}</strong>
            </span>
            <button 
              onClick={load}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-semibold text-gray-900 p-4 w-48">Applicant</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-64">Contact</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-32">Type</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-40">Applied</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-32">Status</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-500">
                      {q.trim() || statusTab !== 'all' || roleFilter !== 'all' 
                        ? 'Try adjusting your filters or search terms'
                        : 'No tutor applications have been submitted yet'
                      }
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((candidate) => {
                  const isProcessing = actionId === candidate.id;
                  const isPending = candidate.status === 'pending';
                  
                  return (
                    <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                      {/* Applicant Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {candidate.User?.photo_url && (
                            <img 
                              src={candidate.User.photo_url} 
                              alt={candidate.User.name || 'User'} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                              {candidate.name || candidate.User?.name || 'Unknown'}
                            </div>
                            {candidate.bio && (
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {candidate.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      {/* Contact Info */}
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-gray-900 font-medium">
                            {candidate.email || candidate.User?.email || '—'}
                          </div>
                          {candidate.phone_number && (
                            <div className="text-gray-500">
                              {candidate.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Tutor Type */}
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          candidate.role === 'Individual' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {candidate.role}
                        </span>
                      </td>
                      
                      {/* Applied Date */}
                      <td className="p-4 text-sm text-gray-600">
                        {fmtDateTime(candidate.applied_at)}
                      </td>
                      
                      {/* Status */}
                      <td className="p-4">
                        <StatusPill status={candidate.status} />
                      </td>
                      
                      {/* Actions */}
                      <td className="p-4">
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onApprove(candidate.id)}
                              disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs transition-colors"
                            >
                              <IconCheck />
                              {isProcessing ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => onReject(candidate.id)}
                              disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs transition-colors"
                            >
                              <IconX />
                              {isProcessing ? 'Processing...' : 'Reject'}
                            </button>
                            {isProcessing && (
                              <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full ml-2"></div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 italic">
                            {candidate.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{err}</span>
            <button 
              onClick={load}
              className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span>✅</span>
          {toast}
        </div>
      )}
    </div>
  );
}
