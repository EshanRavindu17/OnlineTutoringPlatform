import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { adminApi } from './api';

const nav = [
  { 
    to: '/admin', 
    label: 'Dashboard', 
    icon: DashboardIcon,
    description: 'Overview and key metrics'
  },
  { 
    to: '/admin/tutors/approval', 
    label: 'Tutor Applications', 
    icon: CheckIcon,
    description: 'Review and approve tutors'
  },
  { 
    to: '/admin/tutors/suspend', 
    label: 'Tutor Management', 
    icon: PauseIcon,
    description: 'Suspend or manage tutors'
  },
  { 
    to: '/admin/analytics', 
    label: 'Analytics', 
    icon: ChartIcon,
    description: 'Platform insights and reports'
  },
  { 
    to: '/admin/broadcast', 
    label: 'Communications', 
    icon: MegaphoneIcon,
    description: 'Send platform announcements'
  },
  { 
    to: '/admin/policies', 
    label: 'Policies', 
    icon: DocIcon,
    description: 'Manage platform policies'
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  // Sidebar expands only while hovered
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const isExpanded = sidebarHovered; // collapsed by default; expands on hover only

  // Get current page info for header
  const currentPage = nav.find(item => item.to === location.pathname) || nav[0];

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await adminApi.logout();
      console.log('✅ admin logged out');
    } catch (e) {
      console.log('⚠️ logout request failed (will still navigate):', e);
    } finally {
      setLoggingOut(false);
      navigate('/admin/auth', { replace: true });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (auto-expand on hover) */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        aria-expanded={isExpanded}
        className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'} flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <div className="font-semibold text-gray-900">Tutorly Admin</div>
                <div className="text-xs text-gray-500">Management Portal</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {nav.map(({ to, label, icon: Icon, description }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'} 
              className={({ isActive }) =>
                `group flex items-center rounded-lg transition-all duration-200 px-3 py-3 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
              title={!isExpanded ? label : ''}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && (
                <div className="ml-3 flex-1">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600">
                    {description}
                  </div>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* No manual toggle; auto by hover */}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentPage.label}</h1>
                <p className="text-sm text-gray-500">{currentPage.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <NotificationIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="relative">
                <Link
                  to="/admin/profile"
                  className="flex items-center space-x-3 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium">Admin</div>
                    <div className="text-xs text-gray-500">Profile & Settings</div>
                  </div>
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <LogoutIcon className="h-4 w-4" />
                <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Icons (inline SVG, no deps) ---------- */
function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M12.9 14.32a7 7 0 1 1 1.41-1.41l3.4 3.4a1 1 0 0 1-1.41 1.41l-3.4-3.4zM14 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0z"/></svg>;
}

function DashboardIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v9h-6V3zm0 11h6v3h-6v-3z"/></svg>;
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.1a1 1 0 1 1 1.4-1.4l3.1 3.1 6.5-6.5a1 1 0 0 1 1.4 0z"/></svg>;
}

function PauseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6 4a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm7 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z"/></svg>;
}

function ChartIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h2v14H3V3zm12 4h2v10h-2V7zM8 9h2v8H8V9zm4-6h2v14h-2V3z"/></svg>;
}

function MegaphoneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2 8v4a2 2 0 0 0 2 2h1l2 3h2V6L5 8H4a2 2 0 0 0-2 2zM13 5l5-2v14l-5-2V5z"/></svg>;
}

function DocIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 3h6l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm6 1.5V7h2.5L11 4.5z"/></svg>;
}

function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 10a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-7 2-7 4v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1c0-2-3-4-7-4z"/></svg>;
}

function NotificationIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zM10 18a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z"/></svg>;
}

function LogoutIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 1 0 0-2H4V5h5a1 1 0 0 0 0-2H3zm10.293 4.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L14.586 12H9a1 1 0 1 1 0-2h5.586l-1.293-1.293a1 1 0 0 1 0-1.414z"/></svg>;
}
