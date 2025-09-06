import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from './api';

export default function AdminAuth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(undefined);
    try {
      if (mode === 'signup') {
        await adminApi.signup(name, email, password, inviteCode);
      } else {
        await adminApi.login(email, password);
      }
      await adminApi.me(); // sanity check
      nav('/admin', { replace: true });
    } catch (e: any) {
      setErr(e?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Admin Portal</h1>
          <p className="text-sm text-gray-500">Sign in to manage the platform</p>
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
          <button className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode==='login' ? 'bg-white shadow' : ''}`} onClick={()=>setMode('login')}>Login</button>
          <button className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode==='signup' ? 'bg-white shadow' : ''}`} onClick={()=>setMode('signup')}>Sign up</button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm mb-1">Full name</label>
                <input className="w-full border rounded-xl px-3 py-2" value={name} onChange={e=>setName(e.target.value)} required placeholder="Jane Admin" />
              </div>
              <div>
                <label className="block text-sm mb-1">Invite code</label>
                <input className="w-full border rounded-xl px-3 py-2" value={inviteCode} onChange={e=>setInviteCode(e.target.value)} required placeholder="enter the invite code" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full border rounded-xl px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="admin@example.com" />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full border rounded-xl px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" />
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button disabled={loading} className="w-full py-2 rounded-xl bg-gray-900 text-white hover:opacity-90 disabled:opacity-50">
            {loading ? 'Please wait…' : (mode === 'login' ? 'Login' : 'Create admin account')}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          Regular user? <Link className="underline" to="/">Go to main site</Link>
        </div>
      </div>
    </div>
  );
}
