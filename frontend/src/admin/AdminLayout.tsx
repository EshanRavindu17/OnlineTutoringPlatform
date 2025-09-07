import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import React from 'react';
import { adminApi } from './api';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: DashboardIcon },
  { to: '/admin/tutors/approval', label: 'Approve / Reject Tutor', icon: CheckIcon },
  { to: '/admin/tutors/suspend', label: 'Suspend Tutor', icon: PauseIcon },
  { to: '/admin/analytics', label: 'System Analytics', icon: ChartIcon },
  { to: '/admin/broadcast', label: 'Broadcast Messages', icon: MegaphoneIcon },
  { to: '/admin/policies', label: 'System Policies', icon: DocIcon },
];

export default function AdminLayout() {
    const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // calls POST /Admin/auth/logout and clears tokens in your api helper
      await adminApi.logout();
      console.log('✅ admin logged out');
    } catch (e) {
      console.log('⚠️ logout request failed (will still navigate):', e);
    } finally {
      setLoggingOut(false);
      navigate('/admin/auth', { replace: true }); // <-- redirect to auth page
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 text-[15px]">
      {/* Top brand bar */}
      <header className="admin-hero text-white">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-24">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              <div className="text-xl font-semibold tracking-wide">Tutorly • Admin</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl px-3 py-2">
                <SearchIcon />
                <input
                  placeholder="Search…"
                  className="bg-transparent placeholder-white/70 text-white text-sm outline-none w-64"
                />
              </div>

              {/* Profile button */}
              <Link
                to="/admin/profile"
                className="admin-btn !text-white/100 !border-white/25 hover:!bg-white/15"
                title="Profile"
              >
                <UserIcon />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="admin-btn !bg-red-600 !text-white !border-transparent hover:!bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
                title="Sign out"
              >
                {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          </div>

          <h1 className="mt-8 text-3xl md:text-4xl font-bold">Admin Portal</h1>
          <p className="mt-2 text-white/80">Manage tutors, monitor activity and keep the platform healthy.</p>
        </div>
      </header>

      {/* Body: sidebar + page */}
      <div className="-mt-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="col-span-12 md:col-span-3 lg:col-span-3">
              <div className="admin-card p-2">
                {nav.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                        isActive
                          ? 'bg-[var(--brand-50)] text-[var(--brand-700)] ring-1 ring-[var(--brand-200)]'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`
                    }
                  >
                    <Icon />
                    <span className="text-sm font-medium">{label}</span>
                  </NavLink>
                ))}
              </div>

              <div className="mt-6 admin-card p-4">
                <div className="text-sm text-gray-500">Quick links</div>
                <div className="mt-2 flex flex-col gap-2">
                  <a className="text-sm text-[var(--brand-600)] hover:underline" href="/admin/tutors/approval">
                    Approve pending tutors
                  </a>
                  <a className="text-sm text-[var(--brand-600)] hover:underline" href="/admin/broadcast">
                    Broadcast a message
                  </a>
                </div>
              </div>
            </aside>

            {/* Page content */}
            <main className="col-span-12 md:col-span-9 lg:col-span-9">
              <div className="admin-card p-5 md:p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>

      <footer className="mt-10 py-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Tutorly — Admin
      </footer>
    </div>
  );
}

/* ---------- Icons (inline SVG, no deps) ---------- */
function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-xl bg-white/90 flex items-center justify-center text-[var(--brand-600)] font-extrabold">
        T
      </div>
      <span className="sr-only">Tutorly</span>
    </div>
  );
}
function SearchIcon(){return(<svg className="w-4 h-4 opacity-90" viewBox="0 0 20 20" fill="currentColor"><path d="M12.9 14.32a7 7 0 1 1 1.41-1.41l3.4 3.4a1 1 0 0 1-1.41 1.41l-3.4-3.4zM14 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0z"/></svg>);}
function DashboardIcon(){return(<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v9h-6V3zm0 11h6v3h-6v-3z"/></svg>);}
function CheckIcon(){return(<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.1a1 1 0 1 1 1.4-1.4l3.1 3.1 6.5-6.5a1 1 0 0 1 1.4 0z"/></svg>);}
function PauseIcon(){return(<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm7 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z"/></svg>);}
function ChartIcon(){return(<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h2v14H3V3zm12 4h2v10h-2V7zM8 9h2v8H8V9zm4-6h2v14h-2V3z"/></svg>);}
function MegaphoneIcon(){return(<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2 8v4a2 2 0 0 0 2 2h1l2 3h2V6L5 8H4a2 2 0 0 0-2 2zM13 5l5-2v14l-5-2V5z"/></svg>);}
function DocIcon(){return(<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3h6l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm6 1.5V7h2.5L11 4.5z"/></svg>);}
function UserIcon(){return(<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 10a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-7 2-7 4v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1c0-2-3-4-7-4z"/></svg>);}
