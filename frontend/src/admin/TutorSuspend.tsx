import { useEffect, useMemo, useState } from 'react';
import { tutorsApi } from './api';

type Row = {
  id: string;
  kind: 'individual' | 'mass';
  heading: string | null;
  email: string | null;
  name: string | null;
  status: 'active' | 'suspended';
  rating: number | null;
};

const StatusPill = ({ s }: { s: Row['status'] }) => {
  const tone = s === 'active' ? 'badge-green' : 'badge-red';
  return <span className={`admin-badge ${tone} capitalize`}>{s}</span>;
};

const IconPause = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
    <path d="M6 4a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm7 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z" />
  </svg>
);
const IconPlay = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
    <path d="M6 4.5v11l9-5.5-9-5.5z" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
    <path d="M12.9 14.32a7 7 0 1 1 1.41-1.41l3.4 3.4a1 1 0 0 1-1.41 1.41l-3.4-3.4zM14 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0z" />
  </svg>
);

export default function TutorSuspend() {
  const [tab, setTab] = useState<'individual' | 'mass'>('individual');
  const [status, setStatus] = useState<'' | 'active' | 'suspended'>('');
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [err, setErr] = useState<string>();
  const [toast, setToast] = useState<string | null>(null);

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

  useEffect(() => { load(); }, [tab]);
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

  async function onSuspend(id: string) {
    try {
      setActionId(id);
      await tutorsApi.suspend(tab, id);
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'suspended' } : r));
      setToast('Tutor suspended'); setTimeout(() => setToast(null), 1400);
    } catch (e: any) {
      setErr(e?.message || 'Suspend failed');
    } finally { setActionId(null); }
  }

  async function onUnsuspend(id: string) {
    try {
      setActionId(id);
      await tutorsApi.unsuspend(tab, id);
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r));
      setToast('Tutor unsuspended'); setTimeout(() => setToast(null), 1400);
    } catch (e: any) {
      setErr(e?.message || 'Unsuspend failed');
    } finally { setActionId(null); }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Suspend / Unsuspend Tutors</h1>
        <p className="text-sm text-gray-500">Temporarily disable tutors without deleting their data.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {(['individual', 'mass'] as const).map(k => (
            <button
              key={k}
              onClick={() => { setTab(k); setStatus(''); setQ(''); }}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${tab === k ? 'bg-white shadow' : 'opacity-75 hover:opacity-100'}`}
            >
              {k === 'individual' ? 'Individual Tutors' : 'Mass Tutors'}
            </button>
          ))}
        </div>

        <select className="border rounded-lg px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>

        <div className="relative">
          <span className="absolute left-2 top-2.5 text-gray-400"><IconSearch /></span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search name / email / heading…"
            className="pl-7 pr-3 py-2 border rounded-lg text-sm w-72"
          />
        </div>

        <button onClick={load} className="ml-auto admin-btn admin-btn-ghost">Refresh</button>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="text-left font-medium p-3">Heading</th>
                <th className="text-left font-medium p-3">Tutor name</th>
                <th className="text-left font-medium p-3">Email</th>
                <th className="text-left font-medium p-3">Status</th>
                <th className="text-left font-medium p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-3"><div className="h-3 w-40 bg-gray-200 rounded" /></td>
                    <td className="p-3"><div className="h-3 w-32 bg-gray-200 rounded" /></td>
                    <td className="p-3"><div className="h-3 w-48 bg-gray-200 rounded" /></td>
                    <td className="p-3"><div className="h-5 w-20 bg-gray-200 rounded-full" /></td>
                    <td className="p-3"><div className="h-8 w-44 bg-gray-200 rounded" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-gray-500">No tutors match your filters.</td></tr>
              ) : (
                filtered.map(r => {
                  const busy = actionId === r.id;
                  return (
                    <tr key={r.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{r.heading || '—'}</div>
                        {r.rating != null && <div className="text-xs text-gray-500">Rating: {r.rating}</div>}
                      </td>
                      <td className="p-3">{r.name ?? '—'}</td>
                      <td className="p-3">{r.email ?? '—'}</td>
                      <td className="p-3"><StatusPill s={r.status} /></td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {r.status === 'active' ? (
                            <button
                              onClick={() => onSuspend(r.id)}
                              disabled={busy}
                              className={`admin-btn admin-btn-ghost text-red-600 ring-1 ring-red-200 ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <IconPause /> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => onUnsuspend(r.id)}
                              disabled={busy}
                              className={`admin-btn admin-btn-primary ${busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <IconPlay /> Unsuspend
                            </button>
                          )}
                          {busy && <span className="text-xs text-gray-500">Saving…</span>}
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
