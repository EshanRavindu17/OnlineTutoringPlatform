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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-xl shadow-lg dark:shadow-purple-900/30 p-6">
        <div>
          <h1 className="text-3xl font-bold text-white">📋 System Policies</h1>
          <p className="text-indigo-100 dark:text-indigo-200 mt-1">Manage platform terms, privacy, and guidelines</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all shadow-md"
        >
          + New Policy
        </button>
      </div>

      {err && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-300">{err}</div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(p => (
          <button
            key={p.policy_id}
            onClick={() => openView(p)}
            className="text-left bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{TYPE_LABELS[p.type as NonRateType] || p.type}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">{p.policy_name}</h3>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium">
                {p.type}
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
              {p.description || 'No description'}
            </p>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updated {formatDate(p.updated_at)}
            </div>
          </button>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No policies yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your first policy to get started</p>
          </div>
        )}
      </div>

      {/* View/Edit Modal */}
      {modalOpen && current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-3xl mx-4 rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-4 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-medium">
                    {TYPE_LABELS[current.type as NonRateType] || current.type}
                  </span>
                </div>
                {editing ? (
                  <input
                    className="mt-2 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    value={current.policy_name}
                    onChange={e => setCurrent({ ...current, policy_name: e.target.value })}
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{current.policy_name}</h2>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last updated {formatDate(current.updated_at)}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-3 py-2 text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(current.policy_id)}
                      className="px-3 py-2 text-sm bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditing(false); /* revert by refetching row */ policiesApi.get(current.policy_id).then(setCurrent).catch(()=>{}); }}
                      className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-2 text-sm bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                    >
                      💾 Save
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                  {editing ? (
                    <select
                      className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      value={current.type}
                      onChange={e => setCurrent({ ...current, type: e.target.value as NonRateType })}
                    >
                      {Object.keys(TYPE_LABELS).map(k => (
                        <option key={k} value={k}>{(TYPE_LABELS as any)[k]}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-1 text-gray-900 dark:text-gray-100 font-medium">{TYPE_LABELS[current.type as NonRateType] || current.type}</div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title</label>
                  {editing ? (
                    <input
                      className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      value={current.policy_name}
                      onChange={e => setCurrent({ ...current, policy_name: e.target.value })}
                    />
                  ) : (
                    <div className="mt-1 text-gray-900 dark:text-gray-100 font-medium">{current.policy_name}</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Content</label>
                {editing ? (
                  <textarea
                    className="mt-1 w-full h-72 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 font-mono text-sm"
                    value={current.description ?? ''}
                    onChange={e => setCurrent({ ...current, description: e.target.value })}
                  />
                ) : (
                  <div className="mt-1 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm">{current.description || '—'}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/70" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-xl mx-4 rounded-2xl shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Policy</h3>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                <select
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                  value={newType}
                  onChange={e => setNewType(e.target.value as NonRateType)}
                >
                  {Object.keys(TYPE_LABELS).map(k => (
                    <option key={k} value={k}>{(TYPE_LABELS as any)[k]}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Title <span className="text-red-500 dark:text-red-400">*</span></label>
                <input
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Enter policy title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Content</label>
                <textarea
                  className="mt-1 w-full h-48 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 font-mono text-sm"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Enter policy content..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setCreateOpen(false)} 
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate} 
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all shadow-md"
              >
                ✨ Create Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
