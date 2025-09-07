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
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-700)]">
      {/* Left Side - Branding */}
      <div className="hidden md:flex flex-col justify-center px-12 lg:px-16">
        <div className="space-y-6 text-white">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/90 flex items-center justify-center text-[var(--brand-600)] font-extrabold text-2xl">
              T
            </div>
            <div className="text-2xl font-semibold tracking-wide">Tutorly • Admin</div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="text-lg text-white/80">
              Access your admin dashboard to manage tutors, monitor platform activity, and keep everything running smoothly.
            </p>
          </div>
          <div className="pt-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur rounded-xl text-sm">
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure admin authentication portal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex items-center justify-center p-6 bg-white md:rounded-l-[2.5rem]">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Sign in to Dashboard' : 'Create Admin Account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {mode === 'login' ? 'Enter your credentials to continue' : 'Please complete all required fields'}
            </p>
          </div>

          <div className="flex rounded-xl bg-gray-100/50 p-1 mb-8">
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--brand-200)] focus:border-[var(--brand-500)] transition-all"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Jane Admin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Invite Code</label>
                  <input
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--brand-200)] focus:border-[var(--brand-500)] transition-all"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    required
                    placeholder="Enter your invite code"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--brand-200)] focus:border-[var(--brand-500)] transition-all"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--brand-200)] focus:border-[var(--brand-500)] transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            {err && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {err}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--brand-600)] text-white font-medium hover:bg-[var(--brand-700)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-200)] transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                mode === 'login' ? 'Sign in to Dashboard' : 'Create Admin Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-[var(--brand-600)] transition-colors"
            >
              ← Return to main site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
