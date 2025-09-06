import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalSessions: number;
  revenue: number;
  userGrowth: Array<{ date: string; users: number }>;
  sessionsBySubject: Array<{ subject: string; sessions: number }>;
  revenueByMonth: Array<{ month: string; amount: number }>;
  tutorRatings: Array<{ rating: number; count: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 1250,
    activeUsers: 890,
    totalTutors: 150,
    totalStudents: 1100,
    totalSessions: 3200,
    revenue: 45600,
    userGrowth: [
      { date: '2025-03', users: 800 },
      { date: '2025-04', users: 900 },
      { date: '2025-05', users: 1000 },
      { date: '2025-06', users: 1100 },
      { date: '2025-07', users: 1180 },
      { date: '2025-08', users: 1250 },
    ],
    sessionsBySubject: [
      { subject: 'Mathematics', sessions: 850 },
      { subject: 'Science', sessions: 620 },
      { subject: 'English', sessions: 540 },
      { subject: 'Programming', sessions: 480 },
      { subject: 'Others', sessions: 710 },
    ],
    revenueByMonth: [
      { month: 'Apr', amount: 32000 },
      { month: 'May', amount: 36000 },
      { month: 'Jun', amount: 38000 },
      { month: 'Jul', amount: 42000 },
      { month: 'Aug', amount: 45600 },
    ],
    tutorRatings: [
      { rating: 5, count: 45 },
      { rating: 4, count: 65 },
      { rating: 3, count: 25 },
      { rating: 2, count: 10 },
      { rating: 1, count: 5 },
    ],
  });

  // TODO: Implement API call to fetch analytics data
  useEffect(() => {
    // Fetch data based on timeRange
  }, [timeRange]);

  const StatCard = ({ title, value, subtitle, trend }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="flex items-baseline mt-4">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <span className={`ml-2 text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </span>
        )}
      </div>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">System Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Users"
          value={data.activeUsers}
          subtitle={`${Math.round((data.activeUsers / data.totalUsers) * 100)}% of total users`}
        />
        <StatCard
          title="Total Sessions"
          value={data.totalSessions}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Revenue"
          value={`$${data.revenue.toLocaleString()}`}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions by Subject */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Sessions by Subject</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sessionsBySubject}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tutor Ratings Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tutor Ratings Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.tutorRatings}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {data.tutorRatings.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
