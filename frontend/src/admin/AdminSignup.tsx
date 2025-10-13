import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from './api';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminSignup() {
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const getErrorMessage = (error: any): string => {
    const errorMsg = error?.message?.toLowerCase() || '';
    
    if (errorMsg.includes('invite') || errorMsg.includes('code') || errorMsg.includes('secret')) {
      return 'Invalid invite code. Please contact an administrator for a valid code.';
    }
    
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!email.includes('@')) {
      return 'Please enter a valid email address.';
    }
    if (!name || name.trim() === '') {
      return 'Please enter your full name.';
    }
    
    return 'Unable to create account. Please try again later.';
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(undefined);

    try {
      if (password.length < 8) {
        throw new Error('password');
      }
      if (!inviteCode.trim()) {
        throw new Error('Please enter an invite code.');
      }

      await adminApi.signup(name, email, password, inviteCode);
      toast.success('Account created! Please log in.', {
        icon: '✅',
        duration: 3000
      });
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        nav('/admin/auth');
      }, 1500);
    } catch (e: any) {
      const errorMessage = getErrorMessage(e);
      setErr(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated dynamic background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-slate-900/30"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-center px-8 xl:px-16 w-[40%] relative z-10">
        <div className="space-y-6 text-white max-w-lg">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <span className="text-white font-black text-2xl">T</span>
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">Tutorly</div>
              <div className="text-xs text-blue-200/80 font-medium">Admin Portal</div>
            </div>
          </div>
          
          {/* Hero content */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Join Our Team
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Create your admin account to help manage the platform, support tutors and students, and ensure everything runs smoothly.
            </p>
          </div>

          {/* Feature cards */}
          <div className="pt-4 space-y-2.5">
            <div className="inline-flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-500/20 border border-blue-400/30 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Invite-Only Access</div>
                <div className="text-xs text-slate-400">Valid code required</div>
              </div>
            </div>
            
            <div className="inline-flex items-center gap-3 px-4 py-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 border border-cyan-400/30 flex items-center justify-center backdrop-blur-sm">
                <svg className="w-4 h-4 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Secure Registration</div>
                <div className="text-xs text-slate-400">Protected signup process</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex items-center justify-center p-6 lg:p-8 flex-1 relative z-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl p-6 md:p-8">
          {/* Mobile logo */}
          <div className="lg:hidden mb-6 text-center">
            <div className="inline-flex items-center gap-2.5 mb-1.5">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-white">Tutorly</span>
            </div>
            <p className="text-xs text-blue-200">Admin Portal</p>
          </div>

          {/* Form header */}
          <div className="mb-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full">
              <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-5a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              <span className="text-xs font-semibold text-blue-300">Invite Code Required</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1.5">
              Create Admin Account
            </h2>
            <p className="text-sm text-slate-300">
              Please complete all required fields to get started
            </p>
          </div>

          {/* Signup Form */}
          <form className="space-y-3.5" onSubmit={onSubmit}>
            <div className="group">
              <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name
              </label>
              <input
                className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Jane Admin"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <input
                type="password"
                className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Invite Code
              </label>
              <input
                className="w-full bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-400 focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/10 hover:border-white/20 font-mono"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                required
                placeholder="XXXXXXXX-XXXX-XXXX"
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Contact an existing administrator for an invite code
              </p>
            </div>

            {/* Error display */}
            {err && (
              <div className="flex items-start gap-2.5 text-sm bg-red-500/10 backdrop-blur-sm border-2 border-red-500/30 px-4 py-3 rounded-xl shadow-lg animate-[shake_0.3s_ease-in-out]">
                <div className="shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-4 h-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-300 mb-1">Unable to create account</h3>
                  <p className="text-red-200 leading-relaxed">{err}</p>
                  
                  {err.includes('Password') && (
                    <ul className="mt-2 ml-4 space-y-1 text-xs text-red-300 list-disc">
                      <li>Must be at least 8 characters</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Include at least one number</li>
                      <li>Include at least one special character</li>
                    </ul>
                  )}
                  
                  {err.includes('invite code') && (
                    <p className="mt-2 text-xs text-red-300 leading-relaxed">
                      You need a valid invite code to create an admin account. Please contact an existing administrator.
                    </p>
                  )}
                </div>
              </div>
            )}

            <style>{`
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
              }
            `}</style>
            
            <Toaster position="top-right" />

            {/* Submit button */}
            <button
              disabled={loading}
              className="group relative w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <span className="relative z-10">
                {loading ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Creating account...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Create Admin Account</span>
                  </span>
                )}
              </span>
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-slate-300 mb-1.5">Already have an account?</p>
              <Link
                to="/admin/auth"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-white transition-colors group"
              >
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in to your account
              </Link>
            </div>

            <div className="flex items-center gap-2 justify-center">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-xs text-slate-500">or</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-300 transition-colors group"
              >
                <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to main site
              </Link>
            </div>
            
            <div className="pt-3 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500">
                © 2025 Tutorly. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
