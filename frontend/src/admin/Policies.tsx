import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { policiesApi, PolicyRow } from './api';

type NonRateType = 'tos' | 'privacy' | 'guidelines' | 'conduct';

const TYPE_LABELS: Record<NonRateType, string> = {
  tos: 'Terms of Service',
  privacy: 'Privacy Policy',
  guidelines: 'Community Guidelines',
  conduct: 'Code of Conduct',
};

function formatDate(s: string) {
  try { return new Date(s).toLocaleString(); } catch { return s; }
}

export default function Policies() {
  const [items, setItems] = useState<PolicyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState<PolicyRow | null>(null);

  // New policy (create dialog)
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<NonRateType>('tos');
  const [newDesc, setNewDesc] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr(undefined);
      const res = await policiesApi.list();
      // ignore 'rates' here
      setItems(res.policies.filter(p => p.type !== 'rates'));
    } catch (e: any) {
      setErr(e?.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const m: Record<NonRateType, PolicyRow[]> = { tos: [], privacy: [], guidelines: [], conduct: [] };
    for (const p of items) if ((TYPE_LABELS as any)[p.type]) m[p.type as NonRateType].push(p);
    return m;
  }, [items]);

  const openView = (p: PolicyRow) => { setCurrent(p); setEditing(false); setModalOpen(true); };

  const handleSave = async () => {
    if (!current) return;
    try {
      const updated = await policiesApi.update(current.policy_id, {
        policy_name: current.policy_name,
        type: current.type as NonRateType,
        description: current.description ?? '',
      });
      setItems(prev => prev.map(p => p.policy_id === updated.policy_id ? updated : p));
      setEditing(false);
      toast.success('Policy updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await policiesApi.remove(id);
      setItems(prev => prev.filter(p => p.policy_id !== id));
      setModalOpen(false);
      toast.success('Policy deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error('Title is required');
    try {
      const created = await policiesApi.create({
        policy_name: newName.trim(),
        type: newType,
        description: newDesc || '',
      });
      setItems(prev => [created, ...prev]);
      setCreateOpen(false);
      setNewName(''); setNewDesc(''); setNewType('tos');
      toast.success('Policy created');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create');
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">System Policies</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + New Policy
        </button>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">{err}</div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(p => (
          <button
            key={p.policy_id}
            onClick={() => openView(p)}
            className="text-left bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500">{TYPE_LABELS[p.type as NonRateType] || p.type}</div>
                <h3 className="text-lg font-semibold text-gray-900">{p.policy_name}</h3>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                {p.type}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600 line-clamp-3 whitespace-pre-wrap">
              {p.description || 'No description'}
            </p>
            <div className="mt-4 text-xs text-gray-500">
              Updated {formatDate(p.updated_at)}
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-gray-500">No policies yet. Create one.</div>
        )}
      </div>

      {/* View/Edit Modal */}
      {modalOpen && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white w-full max-w-3xl mx-4 rounded-2xl shadow-xl border border-gray-200">
            <div className="p-5 border-b flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-gray-500">{TYPE_LABELS[current.type as NonRateType] || current.type}</div>
                {editing ? (
                  <input
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                    value={current.policy_name}
                    onChange={e => setCurrent({ ...current, policy_name: e.target.value })}
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900">{current.policy_name}</h2>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Last updated {formatDate(current.updated_at)}
                </div>
              </div>
              <div className="flex gap-2">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(current.policy_id)}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditing(false); /* revert by refetching row */ policiesApi.get(current.policy_id).then(setCurrent).catch(()=>{}); }}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Type</label>
                  {editing ? (
                    <select
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      value={current.type}
                      onChange={e => setCurrent({ ...current, type: e.target.value as NonRateType })}
                    >
                      {Object.keys(TYPE_LABELS).map(k => (
                        <option key={k} value={k}>{(TYPE_LABELS as any)[k]}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-1 text-gray-800">{TYPE_LABELS[current.type as NonRateType] || current.type}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Title</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full border rounded-lg px-3 py-2"
                      value={current.policy_name}
                      onChange={e => setCurrent({ ...current, policy_name: e.target.value })}
                    />
                  ) : (
                    <div className="mt-1 text-gray-800">{current.policy_name}</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm text-gray-600">Content</label>
                {editing ? (
                  <textarea
                    className="mt-1 w-full h-72 border rounded-lg px-3 py-2"
                    value={current.description ?? ''}
                    onChange={e => setCurrent({ ...current, description: e.target.value })}
                  />
                ) : (
                  <pre className="mt-1 whitespace-pre-wrap text-gray-800">{current.description || '—'}</pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white w-full max-w-xl mx-4 rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold">Create Policy</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Type</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={newType}
                  onChange={e => setNewType(e.target.value as NonRateType)}
                >
                  {Object.keys(TYPE_LABELS).map(k => (
                    <option key={k} value={k}>{(TYPE_LABELS as any)[k]}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="text-sm text-gray-600">Title</label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Content</label>
                <textarea
                  className="mt-1 w-full h-48 border rounded-lg px-3 py-2"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCreateOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
