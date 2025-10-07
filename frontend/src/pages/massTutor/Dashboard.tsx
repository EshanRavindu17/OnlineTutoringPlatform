import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, DollarSign, Star, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface AnalyticsData {
  overview: {
    totalClasses: number;
    totalStudents: number;
    totalRevenue: number;
    totalSessions: number;
    upcomingSessions: number;
    averageRating: number;
    commissionRate: number;
  };
  revenuePerClass: Array<{ className: string; subject: string; revenue: number }>;
  studentsPerClass: Array<{ className: string; subject: string; students: number }>;
  ratingsPerClass: Array<{ className: string; subject: string; rating: number; reviewCount: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  sessionsPerClass: Array<{ className: string; subject: string; upcoming: number; completed: number; total: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e', '#6366f1'];

export default function MassTutorDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await massTutorAPI.getDashboardAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatLKR = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Failed to load analytics</div>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Students', 
      value: analytics.overview.totalStudents.toLocaleString(), 
      icon: Users, 
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100'
    },
    { 
      title: 'Active Classes', 
      value: analytics.overview.totalClasses.toString(), 
      icon: BookOpen, 
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100'
    },
    { 
      title: 'Upcoming Sessions', 
      value: analytics.overview.upcomingSessions.toString(), 
      icon: Calendar, 
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100'
    },
    { 
      title: 'Total Revenue', 
      value: formatLKR(analytics.overview.totalRevenue), 
      icon: DollarSign, 
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100'
    },
    { 
      title: 'Total Sessions', 
      value: analytics.overview.totalSessions.toString(), 
      icon: Activity, 
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100'
    },
    { 
      title: 'Average Rating', 
      value: analytics.overview.averageRating > 0 ? analytics.overview.averageRating.toFixed(1) : 'N/A', 
      icon: Star, 
      color: 'bg-yellow-50 text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Analytics
        </h2>
        <p className="text-gray-600 mt-1">Comprehensive insights into your teaching performance</p>
      </div>

      {/* Stats Grid - 3 columns for better space utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-lg ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{s.title}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue by Month</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => formatLKR(value)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Students per Class */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Students per Class</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.studentsPerClass.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="className" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="students" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue per Class */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue per Class</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.revenuePerClass.slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="className" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => formatLKR(value)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ratings per Class */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ratings per Class</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.ratingsPerClass.filter(r => r.rating > 0).slice(0, 6)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="className" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Bar dataKey="rating" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sessions Overview - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sessions per Class</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.sessionsPerClass.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="className" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
            <Legend />
            <Bar dataKey="upcoming" fill="#3b82f6" name="Upcoming" radius={[8, 8, 0, 0]} />
            <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Stats Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Classes by Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Classes by Revenue</h3>
          <div className="space-y-3">
            {analytics.revenuePerClass.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.className}</p>
                  <p className="text-xs text-gray-500">{item.subject}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">{formatLKR(item.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Classes by Students */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Classes by Students</h3>
          <div className="space-y-3">
            {analytics.studentsPerClass.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{item.className}</p>
                  <p className="text-xs text-gray-500">{item.subject}</p>
                </div>
                <span className="text-sm font-bold text-purple-600">{item.students} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
