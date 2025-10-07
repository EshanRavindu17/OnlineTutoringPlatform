import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Calendar, Users2, Megaphone,
  Video, UserCog, DollarSign, FolderOpen, Menu, X, ChevronRight,
  Sparkles, TrendingUp, Zap, Target, Award, Bell, Search, Star
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { massTutorAPI } from '../../api/massTutorAPI';

const navSections = [
  {
    title: 'Main',
    items: [
      { to: '/mass-tutor-dashboard', label: 'Overview', icon: LayoutDashboard, color: 'blue', description: 'Dashboard & stats', badge: null },
      { to: '/mass-tutor/classes', label: 'Classes', icon: BookOpen, color: 'purple', description: 'Manage your classes', badge: null },
      { to: '/mass-tutor/schedule', label: 'Schedule', icon: Calendar, color: 'green', description: 'Plan sessions', badge: '3' },
    ]
  },
  {
    title: 'Management',
    items: [
      { to: '/mass-tutor/students', label: 'Students', icon: Users2, color: 'orange', description: 'Track enrollments', badge: null },
      { to: '/mass-tutor/broadcast', label: 'Broadcast', icon: Megaphone, color: 'pink', description: 'Send announcements', badge: 'NEW' },
    ]
  },
  {
    title: 'Resources',
    items: [
      { to: '/mass-tutor/materials', label: 'Materials', icon: FolderOpen, color: 'indigo', description: 'Course resources', badge: null },
      { to: '/mass-tutor/recordings', label: 'Recordings', icon: Video, color: 'red', description: 'Session recordings', badge: null },
    ]
  },
  {
    title: 'Account',
    items: [
      { to: '/mass-tutor/earnings', label: 'Earnings', icon: DollarSign, color: 'emerald', description: 'Revenue & payouts', badge: null },
      { to: '/mass-tutor/reviews', label: 'Reviews', icon: Star, color: 'yellow', description: 'Student feedback', badge: null },
      { to: '/mass-tutor/profile', label: 'Profile', icon: UserCog, color: 'slate', description: 'Account settings', badge: null },
    ]
  }
];

const colorClasses: Record<string, { bg: string; text: string; border: string; gradient: string; hover: string; glow: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-500 to-blue-600', hover: 'hover:shadow-blue-500/20', glow: 'shadow-blue-500/30' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-500 to-purple-600', hover: 'hover:shadow-purple-500/20', glow: 'shadow-purple-500/30' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', gradient: 'from-green-500 to-green-600', hover: 'hover:shadow-green-500/20', glow: 'shadow-green-500/30' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', gradient: 'from-orange-500 to-orange-600', hover: 'hover:shadow-orange-500/20', glow: 'shadow-orange-500/30' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', gradient: 'from-pink-500 to-pink-600', hover: 'hover:shadow-pink-500/20', glow: 'shadow-pink-500/30' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-500 to-indigo-600', hover: 'hover:shadow-indigo-500/20', glow: 'shadow-indigo-500/30' },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', gradient: 'from-red-500 to-red-600', hover: 'hover:shadow-red-500/20', glow: 'shadow-red-500/30' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-emerald-600', hover: 'hover:shadow-emerald-500/20', glow: 'shadow-emerald-500/30' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', gradient: 'from-yellow-500 to-yellow-600', hover: 'hover:shadow-yellow-500/20', glow: 'shadow-yellow-500/30' },
  slate: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', gradient: 'from-slate-500 to-slate-600', hover: 'hover:shadow-slate-500/20', glow: 'shadow-slate-500/30' },
};

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  upcomingSlots: number;
  completedSlots: number;
  monthlyRevenue?: number;
}

export default function MassTutorLayout() {
  const loc = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    upcomingSlots: 0,
    completedSlots: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const [classStats, earningsData] = await Promise.all([
        massTutorAPI.getClassStats(),
        massTutorAPI.getEarnings().catch(() => ({ earnings: [] })),
      ]);
      
      // Get earnings for current month
      // Based on the screenshot, paidMonth is stored as just "October" (month name only)
      const now = new Date();
      const currentMonthName = now.toLocaleDateString('en-US', { month: 'long' }); // "October"
      
      console.log('🔍 Current month name:', currentMonthName);
      console.log('📊 All earnings:', JSON.stringify(earningsData.earnings, null, 2));
      
      // Find the first earning entry (most recent, since backend sorts by date DESC)
      // that matches the current month name
      const monthlyEarning = earningsData.earnings?.find((e: any) => {
        console.log(`Comparing "${e.month}" with "${currentMonthName}"`);
        return e.month === currentMonthName || e.month?.startsWith(currentMonthName);
      });
      
      console.log('💰 Found monthly earning:', monthlyEarning);
      console.log('� Payout value:', monthlyEarning?.payout);
      
      setStats({
        ...classStats,
        monthlyRevenue: monthlyEarning?.payout || 0,
      });
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex flex-col relative">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <Navbar />
      
      <div className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Ultra Enhanced Header */}
        <div className="relative rounded-3xl p-8 mb-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl overflow-hidden group">
          {/* Animated background elements with parallax effect */}
          <div className="absolute inset-0 overflow-hidden opacity-50">
            <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-300/10 rounded-full blur-2xl animate-float"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl animate-pulse-slow"></div>
                  <div className="relative p-3 bg-white/20 backdrop-blur-sm rounded-2xl ring-2 ring-white/30">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Mass Tutor Portal</h1>
                    <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-yellow-400/20 backdrop-blur-sm rounded-full text-xs font-bold text-yellow-100 border border-yellow-400/30">
                      <Zap className="w-3 h-3" />
                      PRO
                    </div>
                  </div>
                  <p className="text-white/90 text-sm md:text-base">
                    Empower students, scale your impact, maximize your earnings
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm border border-white/20 hover:border-white/40 group/btn">
                  <Bell className="w-5 h-5 group-hover/btn:animate-wiggle" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm border border-white/20 hover:border-white/40">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Enhanced Quick Stats with animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
              <a 
                href="/mass-tutor/classes"
                className="group/stat bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 hover:border-white/30 hover:scale-105 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                    <div className="p-1.5 bg-blue-400/20 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    Active Classes
                  </div>
                  <TrendingUp className="w-3 h-3 text-green-300 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {loadingStats ? (
                    <div className="h-9 w-12 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    stats.totalClasses
                  )}
                </div>
                <div className="text-xs text-white/60">Click to view all</div>
              </a>
              
              <a 
                href="/mass-tutor/students"
                className="group/stat bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 hover:border-white/30 hover:scale-105 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                    <div className="p-1.5 bg-purple-400/20 rounded-lg">
                      <Users2 className="w-3.5 h-3.5" />
                    </div>
                    Total Students
                  </div>
                  <Target className="w-3 h-3 text-purple-300 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {loadingStats ? (
                    <div className="h-9 w-12 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    stats.totalStudents
                  )}
                </div>
                <div className="text-xs text-white/60">Across all classes</div>
              </a>
              
              <a 
                href="/mass-tutor/earnings"
                className="group/stat bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 hover:border-white/30 hover:scale-105 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                    <div className="p-1.5 bg-green-400/20 rounded-lg">
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    This Month
                  </div>
                  <Award className="w-3 h-3 text-yellow-300 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {loadingStats ? (
                    <div className="h-9 w-20 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    `LKR ${stats.monthlyRevenue?.toLocaleString() || '0'}`
                  )}
                </div>
                <div className="text-xs text-white/60">Revenue earned</div>
              </a>
              
              <a 
                href="/mass-tutor/schedule"
                className="group/stat bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 hover:border-white/30 hover:scale-105 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                    <div className="p-1.5 bg-orange-400/20 rounded-lg">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    Upcoming
                  </div>
                  <Zap className="w-3 h-3 text-orange-300 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                </div>
                <div className="text-3xl font-bold mb-1">
                  {loadingStats ? (
                    <div className="h-9 w-12 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    stats.upcomingSlots
                  )}
                </div>
                <div className="text-xs text-white/60">Sessions scheduled</div>
              </a>
            </div>
          </div>
        </div>

        {/* Ultra Enhanced Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group/fab"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl opacity-50 group-hover/fab:opacity-75 transition-opacity"></div>
          <div className="relative">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </div>
        </button>

        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Ultra Enhanced Sidebar */}
          <aside className={`
            ${sidebarOpen ? 'fixed inset-y-0 left-0 z-50 w-80 animate-slide-in-left' : 'hidden'} 
            lg:block lg:relative ${sidebarCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} lg:z-0 transition-all duration-300
          `}>
            <div className={`sticky top-6 ${sidebarOpen ? 'h-screen overflow-y-auto p-4' : ''}`}>
              <div className={`bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl ${sidebarCollapsed ? 'p-3' : 'p-5'} space-y-6 relative overflow-hidden transition-all duration-300`}>
                {/* Decorative corner accent */}
                {!sidebarCollapsed && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-bl-full"></div>
                )}
                {navSections.map((section, idx) => (
                  <div key={idx} className="relative">
                    {!sidebarCollapsed && (
                      <div className="flex items-center justify-between mb-3 px-3">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {section.title}
                        </h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent ml-3"></div>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {section.items.map(({ to, label, icon: Icon, color, description, badge }) => {
                        const active = loc.pathname === to;
                        const colors = colorClasses[color];
                        
                        return (
                          <NavLink
                            key={to}
                            to={to}
                            onClick={() => setSidebarOpen(false)}
                            title={sidebarCollapsed ? label : ''}
                            className={`group/item flex items-center ${sidebarCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3.5'} rounded-2xl font-medium transition-all duration-300 relative overflow-hidden ${
                              active
                                ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg ${colors.glow} scale-[1.02]`
                                : `text-gray-700 hover:bg-gradient-to-r hover:${colors.bg} hover:scale-[1.02] ${colors.hover} hover:shadow-lg`
                            }`}
                          >
                            {/* Shimmer effect on hover */}
                            {!active && (
                              <div className="absolute inset-0 -translate-x-full group-hover/item:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            )}
                            
                            {/* Icon with animated background */}
                            <div className={`relative z-10 transition-transform duration-300 ${active ? 'text-white' : colors.text} group-hover/item:scale-110 ${sidebarCollapsed ? '' : 'flex-shrink-0'}`}>
                              <div className={`absolute inset-0 ${active ? 'bg-white/20' : colors.bg} rounded-lg blur-lg opacity-0 group-hover/item:opacity-100 transition-opacity`}></div>
                              <Icon className="w-5 h-5 relative z-10" />
                            </div>
                            
                            {/* Label - Hidden when collapsed */}
                            {!sidebarCollapsed && (
                              <>
                                <div className="flex-1 relative z-10">
                                  <div className={`text-sm font-semibold transition-colors ${active ? 'text-white' : 'text-gray-900'}`}>
                                    {label}
                                  </div>
                                  {!active && (
                                    <div className="text-xs text-gray-500 group-hover/item:text-gray-600 transition-colors line-clamp-1">
                                      {description}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Badge */}
                                {badge && (
                                  <div className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    active 
                                      ? 'bg-white/20 text-white' 
                                      : 'bg-gradient-to-r ' + colors.gradient + ' text-white'
                                  } ${badge === 'NEW' ? 'animate-pulse' : ''}`}>
                                    {badge}
                                  </div>
                                )}
                                
                                {/* Arrow indicator for active item with bounce */}
                                {active && (
                                  <ChevronRight className="w-4 h-4 text-white relative z-10 animate-bounce-horizontal" />
                                )}
                              </>
                            )}
                            
                            {/* Badge indicator dot when collapsed */}
                            {sidebarCollapsed && badge && (
                              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            )}
                            
                            {/* Hover glow effect */}
                            {!active && (
                              <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover/item:opacity-50 transition-opacity duration-300 rounded-2xl`}></div>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ultra Enhanced Help Card - Hidden when collapsed */}
              {!sidebarCollapsed && (
                <div className="mt-6 relative group/help overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/0 via-purple-400/30 to-pink-400/0 rounded-3xl opacity-0 group-hover/help:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-float animation-delay-500"></div>
                  <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-float animation-delay-1000"></div>
                  <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-white/40 rounded-full animate-float animation-delay-1500"></div>
                </div>
                
                <div className="relative p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative group-hover/help:rotate-12 transition-transform duration-500">
                      <div className="absolute inset-0 bg-white/30 rounded-lg blur-xl"></div>
                      <div className="relative p-2 bg-white/20 backdrop-blur-sm rounded-lg ring-1 ring-white/40">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="font-bold text-lg">Need Help?</h4>
                  </div>
                  <p className="text-sm text-white/90 mb-4 leading-relaxed">
                    Check out our guides and tutorials to make the most of your teaching platform.
                  </p>
                  <button className="w-full px-4 py-3 bg-white text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg hover:shadow-xl relative overflow-hidden group/btn">
                    <div className="absolute inset-0 bg-white group-hover/btn:bg-gradient-to-r group-hover/btn:from-blue-50 group-hover/btn:to-purple-50 transition-all"></div>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      View Resources
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </div>
              )}
            </div>
          </aside>

          {/* Ultra Enhanced Content */}
          <main className={`${sidebarCollapsed ? 'lg:col-span-11' : 'lg:col-span-9'} transition-all duration-300`}>
            {/* Sidebar Toggle Button for Desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center gap-2 mb-4 px-4 py-2 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-lg hover:bg-white hover:shadow-md transition-all text-gray-700 text-sm font-medium"
            >
              <Menu className="w-4 h-4" />
              {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
            </button>

            <div className={`bg-white/80 backdrop-blur-xl rounded-3xl border border-white/40 shadow-2xl overflow-hidden transition-all duration-300 ${
              scrolled ? 'shadow-xl' : 'shadow-2xl'
            }`}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
