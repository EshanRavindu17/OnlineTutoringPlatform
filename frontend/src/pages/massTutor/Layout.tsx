import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Calendar, Users2, Megaphone,
  Video, UserCog, DollarSign, FolderOpen
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const nav = [
  { to: '/mass-tutor-dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/mass-tutor/classes', label: 'Classes', icon: BookOpen },
  { to: '/mass-tutor/schedule', label: 'Schedule', icon: Calendar },
  { to: '/mass-tutor/students', label: 'Students', icon: Users2 },
  { to: '/mass-tutor/broadcast', label: 'Broadcast', icon: Megaphone },
  { to: '/mass-tutor/recordings', label: 'Recordings', icon: Video },
  { to: '/mass-tutor/materials', label: 'Materials', icon: FolderOpen },
  { to: '/mass-tutor/earnings', label: 'Earnings', icon: DollarSign },
  { to: '/mass-tutor/profile', label: 'Profile', icon: UserCog },
];

export default function MassTutorLayout() {
  const loc = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl p-6 mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold">Mass Tutor Portal</h1>
          <p className="text-white/90 mt-1">Create classes, manage students, share materials, and track earnings.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
              {nav.map(({ to, label, icon: Icon }) => {
                const active = loc.pathname === to;
                return (
                  <NavLink
                    key={to}
                    to={to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all mb-2 ${
                      active ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </NavLink>
                );
              })}
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-9">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
