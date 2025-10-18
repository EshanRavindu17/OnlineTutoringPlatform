import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { adminApi } from './api';

interface AnalyticsData {
  // Core metrics
  totalUsers: number;
  activeUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalSessions: number;
  completedSessions: number;
  revenue: number;
  
  // Platform health
  platformHealth: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
  };
  
  // Engagement metrics
  engagement: {
    newUsersThisMonth: number;
    returningUsers: number;
    retentionRate: number;
    avgSessionsPerUser: number;
  };
  
  // Financial breakdown
  financial: {
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueGrowth: number;
    individualTutorRevenue: number;
    massTutorRevenue: number;
  };
  
  // Moderation metrics
  moderation: {
    pendingApplications: number;
    suspendedTutors: number;
    activeReports: number;
    resolvedReports: number;
  };
  
  // Chart data
  userGrowth: Array<{ date: string; users: number }>;
  sessionsBySubject: Array<{ subject: string; sessions: number }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
  tutorRatings: Array<{ rating: number; count: number }>;
  sessionsByDay: Array<{ day: string; sessions: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await adminApi.getAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const StatCard = ({ title, value, subtitle, trend }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow">
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <div className="flex items-baseline mt-4">
        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        {trend && (
          <span className={`ml-2 text-sm font-medium px-2 py-1 rounded-full ${
            trend.isPositive 
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' 
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-400 text-lg font-semibold mb-4">{error || 'Failed to load data'}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors shadow-md"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-xl shadow-lg dark:shadow-purple-900/30 p-6">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 System Analytics</h1>
          <p className="text-blue-100 dark:text-blue-200 mt-1">Real-time platform insights and metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 shadow-md font-medium"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="👥 Total Users"
          value={data.totalUsers}
        />
        <StatCard
          title="⚡ Active Users"
          value={data.activeUsers}
          subtitle={`${Math.round((data.activeUsers / data.totalUsers) * 100)}% of total users`}
        />
        <StatCard
          title="📚 Total Sessions"
          value={data.totalSessions}
        />
        <StatCard
          title="💰 Revenue"
          value={`LKR ${data.revenue.toLocaleString()}`}
        />
      </div>

      {/* Platform Health Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">💚</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Platform Health</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="System Uptime"
            value={`${data.platformHealth.uptime.toFixed(2)}%`}
          />
          <StatCard
            title="Avg Response Time"
            value={`${data.platformHealth.avgResponseTime}ms`}
          />
          <StatCard
            title="Error Rate"
            value={`${data.platformHealth.errorRate.toFixed(2)}%`}
          />
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🎯</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">User Engagement</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="🆕 New Users This Month"
            value={data.engagement.newUsersThisMonth}
          />
          <StatCard
            title="🔄 Returning Users"
            value={data.engagement.returningUsers}
          />
          <StatCard
            title="📈 Retention Rate"
            value={`${data.engagement.retentionRate.toFixed(1)}%`}
          />
          <StatCard
            title="📊 Avg Sessions/User"
            value={data.engagement.avgSessionsPerUser.toFixed(1)}
          />
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-emerald-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">💵</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Financial Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <StatCard
            title="This Month Revenue"
            value={`LKR ${data.financial.revenueThisMonth.toLocaleString()}`}
          />
          <StatCard
            title="Last Month Revenue"
            value={`LKR ${data.financial.revenueLastMonth.toLocaleString()}`}
          />
          <StatCard
            title="Revenue Growth"
            value={`${data.financial.revenueGrowth > 0 ? '+' : ''}${data.financial.revenueGrowth.toFixed(1)}%`}
            trend={{ 
              value: Math.abs(data.financial.revenueGrowth), 
              isPositive: data.financial.revenueGrowth >= 0 
            }}
          />
          <StatCard
            title="Individual Tutor Revenue"
            value={`LKR ${data.financial.individualTutorRevenue.toLocaleString()}`}
          />
          <StatCard
            title="Mass Tutor Revenue"
            value={`LKR ${data.financial.massTutorRevenue.toLocaleString()}`}
          />
        </div>
      </div>

      {/* Moderation Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🛡️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Moderation & Safety</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="⏳ Pending Applications"
            value={data.moderation.pendingApplications}
          />
          <StatCard
            title="🚫 Suspended Tutors"
            value={data.moderation.suspendedTutors}
          />
          <StatCard
            title="⚠️ Active Reports"
            value={data.moderation.activeReports}
          />
          <StatCard
            title="✅ Resolved Reports"
            value={data.moderation.resolvedReports}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📈</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">User Growth</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: '1px solid rgb(75, 85, 99)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💹</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Revenue Trend</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: '1px solid rgb(75, 85, 99)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
              <Line type="monotone" dataKey="amount" stroke="#00C49F" strokeWidth={3} dot={{ fill: '#00C49F', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions by Day */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📅</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Daily Session Activity</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sessionsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="day" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: '1px solid rgb(75, 85, 99)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="sessions" fill="#0088FE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions by Subject */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📚</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Sessions by Subject</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sessionsBySubject}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="subject" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: '1px solid rgb(75, 85, 99)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="sessions" fill="#FFBB28" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tutor Ratings Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/30 p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tutor Ratings Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.tutorRatings}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => {
                  const percent = entry.percent || 0;
                  return `${entry.rating}⭐ (${(percent * 100).toFixed(0)}%)`;
                }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.tutorRatings.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: '1px solid rgb(75, 85, 99)',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
