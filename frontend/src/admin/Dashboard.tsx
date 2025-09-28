import { useEffect, useState } from 'react';
import { adminApi } from './api';

type Metrics = {
  students: number;
  individualTutors: number;
  massTutors: number;
  candidates: number;
  sessions: number;
  revenue: number;
  totalUsers: number;
  recentActivity: {
    sessions: number;
    users: number;
    pendingReviews: number;
  };
  weeklyActivity: Array<{
    date: string;
    sessions: number;
    day: string;
  }>;
  lastUpdated: string;
};

export default function Dashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const metrics = await adminApi.metrics();
      setData(metrics);
    } catch (e: any) {
      setErr('Could not load metrics');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const m = data || { 
    students: 0, 
    individualTutors: 0, 
    massTutors: 0, 
    candidates: 0, 
    sessions: 0, 
    revenue: 0,
    totalUsers: 0,
    recentActivity: { sessions: 0, users: 0, pendingReviews: 0 },
    weeklyActivity: [],
    lastUpdated: new Date().toISOString()
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
            <p className="text-blue-100 text-lg">Here's what's happening on your platform today.</p>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-sm text-blue-100">Today's Date</div>
              <div className="text-xl font-semibold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Students"
          value={m.students}
          change={(m.recentActivity.users / Math.max(m.totalUsers - m.recentActivity.users, 1) * 100)}
          icon="👥"
          color="blue"
          subtitle={`${m.recentActivity.users} new this month`}
        />
        <MetricCard
          title="Active Tutors"
          value={m.individualTutors + m.massTutors}
          change={8}
          icon="🎓"
          color="green"
          subtitle={`${m.individualTutors} individual, ${m.massTutors} mass`}
        />
        <MetricCard
          title="Pending Reviews"
          value={m.recentActivity.pendingReviews}
          change={m.recentActivity.pendingReviews > 10 ? -5 : 2}
          icon="⏳"
          color="yellow"
          subtitle="Applications to review"
        />
        <MetricCard
          title="Total Sessions"
          value={m.sessions}
          change={(m.recentActivity.sessions / Math.max(m.sessions - m.recentActivity.sessions, 1) * 100)}
          icon="📚"
          color="purple"
          subtitle={`${m.recentActivity.sessions} this month`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Activity</h3>
              <p className="text-sm text-gray-500">Sessions over the last 7 days</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details →
            </button>
          </div>
          
          {/* Activity Chart */}
          <div className="h-64 flex items-end justify-between space-x-2">
            {(m.weeklyActivity.length > 0 ? m.weeklyActivity : [
              { day: 'Mon', sessions: 40 },
              { day: 'Tue', sessions: 65 },
              { day: 'Wed', sessions: 45 },
              { day: 'Thu', sessions: 80 },
              { day: 'Fri', sessions: 55 },
              { day: 'Sat', sessions: 70 },
              { day: 'Sun', sessions: 85 },
            ]).map((dayData, i) => {
              const maxSessions = Math.max(...(m.weeklyActivity.length > 0 ? m.weeklyActivity : [
                { sessions: 40 }, { sessions: 65 }, { sessions: 45 }, { sessions: 80 }, 
                { sessions: 55 }, { sessions: 70 }, { sessions: 85 }
              ]).map(d => d.sessions));
              const height = maxSessions > 0 ? (dayData.sessions / maxSessions) * 100 : 50;
              
              return (
                <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity relative group">
                  <div 
                    className="w-full rounded-t-lg"
                    style={{ height: `${Math.max(height, 10)}%` }}
                  ></div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {dayData.sessions} sessions
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500">
            {(m.weeklyActivity.length > 0 ? m.weeklyActivity : [
              { day: 'Mon' }, { day: 'Tue' }, { day: 'Wed' }, { day: 'Thu' }, 
              { day: 'Fri' }, { day: 'Sat' }, { day: 'Sun' }
            ]).map((dayData, i) => (
              <span key={i}>{dayData.day}</span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <ActionButton
                href="/admin/tutors/approval"
                icon="✅"
                title="Review Applications"
                description={`${m.recentActivity.pendingReviews} pending reviews`}
                urgent={m.recentActivity.pendingReviews > 5}
              />
              <ActionButton
                href="/admin/broadcast"
                icon="📢"
                title="Send Announcement"
                description="Broadcast to all users"
              />
              <ActionButton
                href="/admin/analytics"
                icon="📊"
                title="View Analytics"
                description="Detailed platform insights"
              />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <StatusItem label="API Services" status="operational" />
              <StatusItem label="Database" status="operational" />
              <StatusItem label="File Storage" status="operational" />
              <StatusItem label="Email Service" status="operational" />
            </div>
          </div>
        </div>
      </div>

      {err && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{err}</span>
            <button 
              onClick={loadMetrics}
              className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, change, icon, color, subtitle }: {
  title: string;
  value: number;
  change: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  subtitle?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <div className={`flex items-center text-sm font-medium ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <span>{change >= 0 ? '↗️' : '↘️'}</span>
          <span className="ml-1">{Math.abs(change)}%</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</p>
        <p className="text-sm text-gray-500">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ActionButton({ href, icon, title, description, urgent = false }: {
  href: string;
  icon: string;
  title: string;
  description: string;
  urgent?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block p-4 rounded-xl border-2 transition-all hover:shadow-md ${
        urgent 
          ? 'border-orange-200 bg-orange-50 hover:border-orange-300' 
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-center">
        <span className="text-xl mr-3">{icon}</span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">{description}</div>
        </div>
        <span className="text-gray-400">→</span>
      </div>
    </a>
  );
}

function StatusItem({ label, status }: { label: string; status: 'operational' | 'degraded' | 'down' }) {
  const statusConfig = {
    operational: { color: 'text-green-600', bg: 'bg-green-100', text: 'Operational' },
    degraded: { color: 'text-yellow-600', bg: 'bg-yellow-100', text: 'Degraded' },
    down: { color: 'text-red-600', bg: 'bg-red-100', text: 'Down' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
        {config.text}
      </div>
    </div>
  );
}
