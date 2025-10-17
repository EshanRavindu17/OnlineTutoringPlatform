import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { adminApi } from './api';
import { useTheme } from './ThemeContext';

/**
 * Sidebar nav item type for clarity and type-safety
 */
type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

/**
 * Navigation config used for both sidebar items and header context
 */
const nav: NavItem[] = [
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
    to : '/admin/sessions',
    label: 'Session Management',
    icon: BookOpen,
    description: 'Manage tutoring sessions'
  },
  {
    to: '/admin/meetings',
    label: 'Create Meetings',
    icon: VideoIcon,
    description: 'Create and send meeting invitations'
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
    to: '/admin/complaints', 
    label: 'Reports & Complaints', 
    icon: FlagIcon,
    description: 'Manage student reports'
  },
  { 
    to: '/admin/finance', 
    label: 'Finance & Revenue', 
    icon: MoneyIcon,
    description: 'Manage commission and payments'
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
  const { theme, toggleTheme } = useTheme();

  /**
   * \n  Desktop sidebar behavior
   * - Collapsed by default
   * - Expands on hover (original behavior)
   * - NEW: Can be pinned open via a pin button (optional enhancement; hover still works)
   */
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [sidebarPinned, setSidebarPinned] = useState(false);

  /**
   * Mobile sidebar behavior
   * - NEW: Hamburger toggles an overlay drawer on small screens
   */
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Expanded state on desktop is true when pinned or hovered.
   * On mobile we render a separate overlay sidebar; this flag only affects desktop layout.
   */
  const isExpanded = sidebarPinned || sidebarHovered;

  /**
   * Determine current page for header based on longest path prefix match.
   * Handles nested paths like `/admin/tutors/approval/123`.
   */
  const currentPage = React.useMemo<NavItem>(() => {
    const candidates = nav
      .filter(item => location.pathname === item.to || location.pathname.startsWith(item.to + '/'))
      .sort((a, b) => b.to.length - a.to.length);
    return candidates[0] ?? nav[0];
  }, [location.pathname]);

  /**
   * Logout (same functionality): attempt API logout, then navigate to /admin/auth regardless.
   */
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

  /**
   * Utility: close mobile drawer after navigating
   */
  const onNavClick = () => setMobileOpen(false);

  return (
    <div className="flex min-h-svh bg-gray-50 dark:bg-gray-900">
      {/* Skip link for keyboard users */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded shadow"
      >
        Skip to content
      </a>

      {/* --- MOBILE SIDEBAR OVERLAY (md:hidden) --- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer panel */}
          <aside className="absolute inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl flex flex-col">
            {/* Header inside drawer */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">Tutorly Admin</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Management Portal</div>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Nav list (mobile) */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto grid grid-cols-1 auto-rows-fr gap-1" aria-label="Primary">
              {nav.map(({ to, label, icon: Icon, description }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-lg transition-colors px-3 py-3 h-full min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ` +
                    (isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100')
                  }
                  aria-label={label}
                >
                  <span className="relative">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
                  </div>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR (hidden on mobile) --- */}
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        onFocus={() => setSidebarHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setSidebarHovered(false);
        }}
        aria-expanded={isExpanded}
        className={`hidden md:flex bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-16'} flex-col`}
      >
        {/* Brand row with optional pin toggle */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Tutorly Admin</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Management Portal</div>
              </div>
            )}
          </div>

          {/* Pin toggle appears only when expanded to avoid accidental clicks while collapsed */}
          {isExpanded && (
            <button
              aria-pressed={sidebarPinned}
              aria-label={sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              onClick={() => setSidebarPinned(s => !s)}
              className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${sidebarPinned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
              title={sidebarPinned ? 'Unpin' : 'Pin'}
            >
              <PinIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Scrollable nav with subtle top/bottom fades for polish */}
        <div className="relative flex-1 overflow-hidden">
          {/* Top fade */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-gray-100 dark:from-gray-800 to-transparent" />

          <nav className="h-full px-2 py-4 overflow-y-auto grid grid-cols-1 auto-rows-fr gap-1" role="navigation" aria-label="Primary">
            {nav.map(({ to, label, icon: Icon, description }) => (
              <div key={to} className="relative group">
                <NavLink
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center rounded-lg px-2 py-2 transition-colors h-full min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ` +
                    (isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100')
                  }
                  title={!isExpanded ? label : ''}
                  aria-label={label}
                >
                  {/* Icon with active indicator bar */}
                  <span className="relative flex h-8 w-8 items-center justify-center">
                    {/* Active bar on the left for quick visual cue */}
                    <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-blue-600 dark:bg-blue-400 opacity-0 group-[.active]:opacity-100" />
                    <Icon className="h-5 w-5 flex-shrink-0" />
                  </span>

                  {/* When expanded, show label + description */}
                  {isExpanded && (
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-medium leading-none">{label}</div>
                      <div className="text-[11px] mt-1 text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                        {description}
                      </div>
                    </div>
                  )}
                </NavLink>

                {/* Lightweight tooltip when collapsed: label + description */}
                {!isExpanded && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="min-w-[12rem] max-w-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-gray-100 dark:from-gray-800 to-transparent" />
        </div>

        {/* Optional compact footer area inside sidebar (kept simple; no new routes) */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <span>{isExpanded ? 'Tutorly Admin • v1.0' : 'v1.0'}</span>
            {isExpanded && <span className="hidden xl:inline">© {new Date().getFullYear()} Tutorly</span>}
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Top header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-3 md:py-4" role="banner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Hamburger only on mobile to open sidebar */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Open sidebar"
                onClick={() => setMobileOpen(true)}
              >
                <MenuIcon className="h-5 w-5" />
              </button>

              <div>
                <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">{currentPage.label}</h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{currentPage.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 md:space-x-4">
              {/* Search */}
              <div className="relative hidden sm:block">
                <label htmlFor="global-search" className="sr-only">Search</label>
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  id="global-search"
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {/* Theme toggle (unchanged functionality) */}
              <button
                onClick={() => {
                  console.log('Toggle clicked! Current theme:', theme);
                  toggleTheme();
                  console.log('After toggle');
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <button
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Notifications"
                title="Notifications"
              >
                <NotificationIcon className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" aria-hidden="true" />
              </button>

              {/* Profile link */}
              <div className="relative">
                <Link
                  to="/admin/profile"
                  className="flex items-center space-x-3 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Profile & Settings"
                >
                  <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium">Admin</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Profile & Settings</div>
                  </div>
                </Link>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Logout"
              >
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{loggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Routed page content */}
        <main id="main" className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900" role="main">
          <div className="p-4 md:p-6 min-h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Icons (inline SVG) ---------------- */
function SearchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M12.9 14.32a7 7 0 1 1 1.41-1.41l3.4 3.4a1 1 0 0 1-1.41 1.41l-3.4-3.4zM14 8a6 6 0 1 0-12 0 6 6 0 0 0 12 0z"/></svg>
  );
}

function DashboardIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v9h-6V3zm0 11h6v3h-6v-3z"/></svg>
  );
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.3 9.1a1 1 0 1 1 1.4-1.4l3.1 3.1 6.5-6.5a1 1 0 0 1 1.4 0z"/></svg>
  );
}

function PauseIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6 4a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1zm7 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z"/></svg>
  );
}

function ChartIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 3h2v14H3V3zm12 4h2v10h-2V7zM8 9h2v8H8V9zm4-6h2v14h-2V3z"/></svg>
  );
}

function MegaphoneIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2 8v4a2 2 0 0 0 2 2h1l2 3h2V6L5 8H4a2 2 0 0 0-2 2zM13 5l5-2v14l-5-2V5z"/></svg>
  );
}

function FlagIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 0 1 1-1h12a1 1 0 0 1 .707 1.707L14.414 6l2.293 2.293A1 1 0 0 1 16 10H4v7a1 1 0 1 1-2 0V3z"/></svg>
  );
}

function MoneyIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267zM10 0a10 10 0 1010 10A10.011 10.011 0 0010 0zm0 18a8 8 0 118-8 8.009 8.009 0 01-8 8zm1-13h2a1 1 0 010 2h-2v1.849c.863.142 1.683.521 2.217 1.15C14.13 10.95 14 11.924 14 12c0 .914-.53 1.712-1.217 2.217C12.183 14.848 11.363 15.227 10.5 15.369V16h-1v-.631c-.863-.142-1.683-.521-2.217-1.15C6.37 13.05 6.5 12.076 6.5 12c0-.914.53-1.712 1.217-2.217C8.317 9.152 9.137 8.773 10 8.631V7H8a1 1 0 010-2h2V4h1z"/></svg>
  );
}

function DocIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M5 3h6l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm6 1.5V7h2.5L11 4.5z"/></svg>
  );
}

function UserIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 10a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-7 2-7 4v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1c0-2-3-4-7-4z"/></svg>
  );
}

function NotificationIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6zM10 18a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z"/></svg>
  );
}

function LogoutIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h6a1 1 0 1 0 0-2H4V5h5a1 1 0 0 0 0-2H3zm10.293 4.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414L14.586 12H9a1 1 0 1 1 0-2h5.586l-1.293-1.293a1 1 0 0 1 0-1.414z"/></svg>
  );
}

function BookOpen({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2 4a2 2 0 012-2h5v16H4a2 2 0 01-2-2V4zm12-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-5V2h5z"/></svg>
  );
}

function VideoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/></svg>
  );
}

function MoonIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
  );
}

function SunIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
  );
}

function MenuIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M3 5h14a1 1 0 100-2H3a1 1 0 100 2zm0 6h14a1 1 0 100-2H3a1 1 0 100 2zm0 6h14a1 1 0 100-2H3a1 1 0 100 2z"/></svg>
  );
}

function CloseIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 8.586l4.95-4.95a1 1 0 111.414 1.414L11.414 10l4.95 4.95a1 1 0 11-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 11-1.414-1.414L8.586 10 3.636 5.05A1 1 0 115.05 3.636L10 8.586z"/></svg>
  );
}

function PinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M6.5 2.5l5 5-1.5 1.5 3.5 5.5-5.5-3.5L6.5 13.5 2 9l4.5-4.5z"/></svg>
  );
}
