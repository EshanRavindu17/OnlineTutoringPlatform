// Need these for form navigation and state management
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from './api';
import toast, { Toaster } from 'react-hot-toast'; // For showing success messages

export default function AdminAuth() {
  // Using a single mode state instead of two booleans - clever!
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Form fields - only name and inviteCode needed for signup
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI states for error handling and loading
  const [err, setErr] = useState<string>();
  const [loading, setLoading] = useState(false);
  const nav = useNavigate(); // Will use this to redirect after successful auth

  // Helper function to convert backend errors into user-friendly messages
  // Note: We're not showing backend messages directly to users for security
  const getErrorMessage = (error: any): string => {
    if (mode === 'login') {
      // For login, keep it vague for security
      return 'Incorrect email or password. Please try again.';
    } else {
      // For signup, we need more specific messages to help users
      const errorMsg = error?.message?.toLowerCase() || '';
      
      // Most important check first - invalid invite code is a blocker
      if (errorMsg.includes('invite') || errorMsg.includes('code') || errorMsg.includes('secret')) {
        return 'Invalid invite code. Please contact an administrator for a valid code.';
      }
      
      // Form validation errors - ordered by field appearance
      if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long.';
      }
      if (!email.includes('@')) {
        return 'Please enter a valid email address.';
      }
      if (!name || name.trim() === '') {
        return 'Please enter your full name.';
      }
      
      // Fallback error - something else went wrong
      return 'Unable to create account. Please try again later.';
    }
  };

  // Main form submission handler - handles both login and signup
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); // Show loading spinner
    setErr(undefined); // Clear any previous errors

    try {
      if (mode === 'signup') {
        // Client-side validation before making API call
        if (password.length < 8) {
          throw new Error('password');
        }
        if (!inviteCode.trim()) {
          throw new Error('Please enter an invite code.');
        }

        // Create account then show success message
        await adminApi.signup(name, email, password, inviteCode);
        toast.success('Account created! Please log in.', {
          icon: '✅',
          duration: 3000
        });
        setMode('login'); // Switch to login mode after successful signup
      } else {
        // For login: first try to log in
        await adminApi.login(email, password);
        await adminApi.me(); // Then verify the session is valid
        
        // Show welcome message and redirect to admin dashboard
        toast.success('Welcome back!', {
          icon: '👋',
          duration: 3000
        });
        nav('/admin', { replace: true }); // replace: true prevents going back to login page
      }
    } catch (e: any) {
      // Convert any errors to user-friendly messages
      const errorMessage = getErrorMessage(e);
      setErr(errorMessage);
    } finally {
      setLoading(false); // Always hide loading spinner
    }
  }

  return (
    // Main container - using grid for the split screen layout
    // Note: min-h-screen ensures it fills the viewport even with little content
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-700)]">
      {/* Left Side - Branding (hidden on mobile) */}
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
      {/* Using rounded corners only on desktop for better mobile UX */}
      <div className="flex items-center justify-center p-6 bg-white md:rounded-l-[2.5rem]">
        <div className="w-full max-w-md">
          {/* Form header - changes based on mode */}
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Sign in to Dashboard' : 'Create Admin Account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {mode === 'login' ? 'Enter your credentials to continue' : 'Please complete all required fields'}
            </p>
          </div>

          {/* Mode toggle - styled like a segmented control */}
          {/* Nice UI trick: using bg-gray-100/50 for a subtle background */}
          <div className="flex rounded-xl bg-gray-100/50 p-1 mb-8">
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white shadow text-gray-900' // Active state
                  : 'text-gray-600 hover:text-gray-900' // Inactive state
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white shadow text-gray-900' // Active state
                  : 'text-gray-600 hover:text-gray-900' // Inactive state
              }`}
              onClick={() => setMode('signup')}
            >
              Sign up
            </button>
          </div>

          {/* Main form - space-y-5 gives consistent spacing between fields */}
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

            {/* Error display - only shown when there's an error */}
            {err && (
              <div className="flex items-start gap-3 text-sm bg-red-50 px-4 py-3 rounded-xl">
                {/* Error icon - using shrink-0 to prevent icon from squishing */}
                <div className="shrink-0">
                  <svg className="w-5 h-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  {/* Error title - changes based on mode */}
                  <h3 className="font-medium text-red-800 mb-1">Unable to {mode === 'login' ? 'sign in' : 'create account'}</h3>
                  <p className="text-red-700">{err}</p>
                  
                  {/* Additional help text for signup errors */}
                  {mode === 'signup' && (
                    <>
                      {/* Password requirements - only shown for password errors */}
                      {err.includes('Password') && (
                        <ul className="mt-2 ml-4 space-y-1 text-xs text-red-600 list-disc">
                          <li>Must be at least 8 characters</li>
                          <li>Include uppercase and lowercase letters</li>
                          <li>Include at least one number</li>
                          <li>Include at least one special character</li>
                        </ul>
                      )}
                      {/* Invite code help text */}
                      {err.includes('invite code') && (
                        <p className="mt-2 text-xs text-red-600">
                          You need a valid invite code to create an admin account. Please contact an existing administrator.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Toast Container */}
            <Toaster position="top-right" />

            {/* Submit button - handles both login and signup */}
            <button
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--brand-600)] text-white font-medium hover:bg-[var(--brand-700)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-200)] transition-all disabled:opacity-50"
            >
              {loading ? (
                // Loading state - shows spinner and "Please wait"
                <span className="flex items-center justify-center gap-2">
                  {/* Cool spinner animation using SVG */}
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Please wait...
                </span>
              ) : (
                // Normal state - different text based on mode
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
