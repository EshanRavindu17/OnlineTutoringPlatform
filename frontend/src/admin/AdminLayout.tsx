import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const nav = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/tutors/approval', label: 'Approve / Reject Tutor' },
  { to: '/admin/tutors/suspend', label: 'Suspend Tutor' },
  { to: '/admin/analytics', label: 'System Analytics' },
  { to: '/admin/broadcast', label: 'Broadcast Messages' },
  { to: '/admin/policies', label: 'System Policies' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col border-r bg-white p-4 gap-4">
        <div className="text-lg font-semibold">Admin</div>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact as any}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-sm ${isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto text-xs text-gray-500">© {new Date().getFullYear()} Online Tutoring</div>
      </aside>

      {/* Main */}
      <div className="flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
          <div className="h-14 flex items-center justify-between px-4">
            <button className="md:hidden px-3 py-2 rounded-lg border" onClick={() => alert('TODO: open drawer')}>
              Menu
            </button>
            <div className="hidden md:block text-sm text-gray-500">Admin Portal</div>
            <div className="flex items-center gap-3">
              <input className="hidden md:block border rounded-xl px-3 py-2 text-sm" placeholder="Search…" />
              <button className="text-sm px-3 py-2 border rounded-xl" onClick={() => navigate('/admin/auth')}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
