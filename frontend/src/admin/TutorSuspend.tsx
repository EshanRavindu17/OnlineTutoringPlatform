import { useEffect, useMemo, useState } from 'react';
import { tutorsApi } from './api';

/**
 * Table row shape for tutors.
 * - kind distinguishes individual vs mass (mirrors the active tab).
 * - 'heading' is a listing/title line (especially useful for mass tutors).
 */
type Row = {
  id: string;
  kind: 'individual' | 'mass';
  heading: string | null;
  email: string | null;
  name: string | null;
  status: 'active' | 'suspended';
  rating: number | null;
};

/** Enhanced status badge matching TutorApproval style */
const StatusPill = ({ s }: { s: Row['status'] }) => {
  const colorMap = {
    active: 'bg-green-100 text-green-800 border-green-200',
    suspended: 'bg-red-100 text-red-800 border-red-200',
  } as const;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorMap[s]} capitalize`}>
      {s}
    </span>
  );
};

/** 16px pause icon for Suspend button. */
const IconPause = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d="M6 4a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm7 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z" />
  </svg>
);
/** 16px play icon for Unsuspend button. */
const IconPlay = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d="M6 4.5v11l9-5.5-9-5.5z" />
  </svg>
);
/** 16px search icon for the search field. */
const IconSearch = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden>
    <path d="M12.9 14.32a7 7 0 1 1 1.41-1.41l3.4 3.4a1 1 0 0 1-1.41 1.41l-3.4-3.4zM14 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0z" />
  </svg>
);

/** Simple confirmation dialog */
function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Yes',
  cancelText = 'No',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={busy ? undefined : onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-2 text-gray-600 text-sm">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {busy ? 'Working…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TutorSuspend() {
  /** which group we’re looking at (affects which API we call) */
  const [tab, setTab] = useState<'individual' | 'mass'>('individual');
  /** server-side filter (we also re-filter client-side for responsiveness) */
  const [status, setStatus] = useState<'' | 'active' | 'suspended'>('');
  /** search query across name/email/heading */
  const [q, setQ] = useState('');
  /** raw rows from API (we keep this and derive `filtered` from it) */
  const [rows, setRows] = useState<Row[]>([]);
  /** global loading flag for fetches */
  const [loading, setLoading] = useState(true);
  /** which row is currently being acted on (to disable that row’s buttons) */
  const [actionId, setActionId] = useState<string | null>(null);
  /** global error surface (simple and visible) */
  const [err, setErr] = useState<string>();
  /** short-lived “snack” for actions */
  const [toast, setToast] = useState<string | null>(null);
  /** confirmation dialog state (for suspend/unsuspend) */
  const [confirm, setConfirm] = useState<{
    open: boolean;
    id: string | null;
    name: string;
    mode: 'suspend' | 'unsuspend';
  }>({ open: false, id: null, name: '', mode: 'suspend' });

  /**
   * Load from server:
   * - pushes status/q down to server when present
   * - on success, sets `rows` (UI is derived from `filtered`)
   */
  async function load() {
    try {
      setLoading(true);
      setErr(undefined);
      const params = { status: status || undefined, q: q || undefined };
      const data = tab === 'individual'
        ? await tutorsApi.listIndividuals(params)
        : await tutorsApi.listMass(params);
      setRows(data.items ?? []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load tutors');
    } finally {
      setLoading(false);
    }
  }

  /** on tab switch, fetch the new dataset (and reset filters/search via button click) */
  useEffect(() => { load(); }, [tab]);

  /**
   * Local filter/search for snappy UX
   */
  const filtered = useMemo(() => {
    let r = [...rows];
    if (status) r = r.filter(x => x.status === status);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter(x =>
        (x.name || '').toLowerCase().includes(s) ||
        (x.email || '').toLowerCase().includes(s) ||
        (x.heading || '').toLowerCase().includes(s)
      );
    }
    return r;
  }, [rows, status, q]);

  /** Suspend flow */
  async function onSuspend(id: string) {
    try {
      setActionId(id);
      await tutorsApi.suspend(tab, id);
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status: 'suspended' } : r)));
      setToast('Tutor suspended');
      setTimeout(() => setToast(null), 1400);
    } catch (e: any) {
      setErr(e?.message || 'Suspend failed');
    } finally {
      setActionId(null);
    }
  }

  /** Unsuspend flow */
  async function onUnsuspend(id: string) {
    try {
      setActionId(id);
      await tutorsApi.unsuspend(tab, id);
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status: 'active' } : r)));
      setToast('Tutor reactivated');
      setTimeout(() => setToast(null), 1400);
    } catch (e: any) {
      setErr(e?.message || 'Unsuspend failed');
    } finally {
      setActionId(null);
    }
  }

  // Calculate counts for status display
  const counts = useMemo(() => {
    const c = { active: 0, suspended: 0, total: rows.length } as any;
    for (const r of rows) c[r.status]++;
    return c as { active: number; suspended: number; total: number };
  }, [rows]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Header matching TutorApproval */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutor Management ⚡</h1>
          <p className="text-gray-600">Suspend or reactivate tutors while preserving their data</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-green-800">{counts.active}</div>
            <div className="text-xs text-green-600">Active</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
            <div className="text-lg font-bold text-red-800">{counts.suspended}</div>
            <div className="text-xs text-red-600">Suspended</div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tutor Type Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'individual', label: '👤 Individual' },
              { key: 'mass', label: '👥 Mass' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  setTab(key as any);
                  setStatus('');
                  setQ('');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === (key as any)
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="active">🟢 Active</option>
            <option value="suspended">🔴 Suspended</option>
          </select>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <IconSearch />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or heading..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          {/* Results Info & Refresh */}
          <div className="flex items-center gap-4 ml-auto">
            <span className="text-sm text-gray-600">
              <strong>{filtered.length}</strong> of <strong>{rows.length}</strong>
            </span>
            <button onClick={load} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ↻
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-semibold text-gray-900 p-4 w-56">Name</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-64">Tutor Info</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-64">Email</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-28">Type</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-28">Status</th>
                <th className="text-left font-semibold text-gray-900 p-4 w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="text-6xl mb-4">⚡</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tutors found</h3>
                    <p className="text-gray-500">
                      {q.trim() || status
                        ? 'Try adjusting your filters or search terms'
                        : 'No tutors available in this category'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const isProcessing = actionId === r.id;
                  const isActive = r.status === 'active';
                  const nameLabel = r.name || 'this tutor';

                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      {/* Name */}
                      <td className="p-4">
                        <div className="font-medium text-gray-900 truncate">{r.name || '—'}</div>
                        {r.rating != null && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                            <span>⭐</span>
                            <span className="font-medium">{Number(r.rating).toFixed(1)}</span>
                            <span className="text-gray-400">rating</span>
                          </div>
                        )}
                      </td>

                      {/* Tutor Info (heading/title) */}
                      <td className="p-4">
                        <div className="text-sm text-gray-700 truncate">{r.heading || '—'}</div>
                      </td>

                      {/* Email */}
                      <td className="p-4">
                        <div className="text-sm text-gray-900 font-medium">{r.email || '—'}</div>
                      </td>

                      {/* Tutor Type */}
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            r.kind === 'individual'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {r.kind === 'individual' ? 'Individual' : 'Mass'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <StatusPill s={r.status} />
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <button
                              onClick={() => setConfirm({ open: true, id: r.id, name: nameLabel, mode: 'suspend' })}
                              disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs transition-colors"
                            >
                              <IconPause />
                              {isProcessing ? 'Suspending…' : 'Suspend'}
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirm({ open: true, id: r.id, name: nameLabel, mode: 'unsuspend' })}
                              disabled={isProcessing}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs transition-colors"
                            >
                              <IconPlay />
                              {isProcessing ? 'Reactivating…' : 'Reactivate'}
                            </button>
                          )}
                          {isProcessing && (
                            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full ml-2" />
                          )}
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

      {/* Enhanced Error Display */}
      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{err}</span>
            <button onClick={load} className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white text-sm px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <span>✅</span>
          {toast}
        </div>
      )}

      {/* Confirm Dialog (Suspend/Unsuspend) */}
      <ConfirmDialog
        open={confirm.open}
        title={confirm.mode === 'suspend' ? 'Suspend tutor?' : 'Reactivate tutor?'}
        description={
          confirm.mode === 'suspend'
            ? `Are you sure you want to suspend ${confirm.name}? They won't be able to log in until reactivated.`
            : `Are you sure you want to reactivate ${confirm.name}? They will regain access immediately.`
        }
        confirmText={confirm.mode === 'suspend' ? 'Yes, suspend' : 'Yes, reactivate'}
        cancelText="No"
        busy={!!(confirm.id && actionId === confirm.id)}
        onCancel={() => setConfirm({ open: false, id: null, name: '', mode: 'suspend' })}
        onConfirm={async () => {
          if (!confirm.id) return;
          if (confirm.mode === 'suspend') {
            await onSuspend(confirm.id);
          } else {
            await onUnsuspend(confirm.id);
          }
          setConfirm({ open: false, id: null, name: '', mode: 'suspend' });
        }}
      />
    </div>
  );
}
