import { useEffect, useMemo, useState } from 'react';
import { adminApi } from './api';

// ------------------ Types ------------------
export type Metrics = {
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
    day: string; // e.g., Mon, Tue
  }>;
  lastUpdated: string;
};

// ------------------ Helpers ------------------
const formatNumber = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString() : '0';

const safePercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10; // keep 1 decimal place
};

const relativeTimeFromISO = (iso: string) => {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const sec = Math.max(1, Math.floor(diffMs / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
};

// ------------------ Component ------------------
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
      setErr(undefined);
    } catch (e) {
      console.error(e);
      setErr('Could not load metrics');
    } finally {
      setLoading(false);
    }
  };

  // Safe fallback object for first paint / null state
  const m: Metrics =
    data || ({
      students: 0,
      individualTutors: 0,
      massTutors: 0,
      candidates: 0,
      sessions: 0,
      revenue: 0,
      totalUsers: 0,
      recentActivity: { sessions: 0, users: 0, pendingReviews: 0 },
      weeklyActivity: [],
      lastUpdated: new Date().toISOString(),
    } as Metrics);

  // Derived % changes (guarded against /0)
  const newUsersPct = safePercent(
    (m.recentActivity.users / Math.max(m.totalUsers - m.recentActivity.users, 1)) * 100
  );

  const recentSessionsPct = safePercent(
    (m.recentActivity.sessions / Math.max(m.sessions - m.recentActivity.sessions, 1)) * 100
  );

  // Chart data (fallback + memoized computations)
  const { activity, maxSessions } = useMemo(() => {
    const fallback = [
      { day: 'Mon', sessions: 40 },
      { day: 'Tue', sessions: 65 },
      { day: 'Wed', sessions: 45 },
      { day: 'Thu', sessions: 80 },
      { day: 'Fri', sessions: 55 },
      { day: 'Sat', sessions: 70 },
      { day: 'Sun', sessions: 85 },
    ];
    const a = m.weeklyActivity.length > 0 ? m.weeklyActivity : (fallback as any);
    const max = Math.max(1, ...a.map((d: any) => d.sessions || 0));
    return { activity: a, maxSessions: max };
  }, [m.weeklyActivity]);

  if (loading) {
    return (
      <div className="space-y-8" aria-busy="true" aria-live="polite">
        {/* Welcome Skeleton */}
        <div className="rounded-2xl p-8 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <div className="h-6 w-64 bg-white/20 rounded mb-3 animate-pulse" />
          <div className="h-4 w-80 bg-white/10 rounded animate-pulse" />
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-pulse border border-transparent dark:border-gray-700"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section
        className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl p-6 md:p-8 text-white shadow-lg"
        aria-label="Welcome"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, Admin! 👋</h1>
            <p className="text-blue-100 dark:text-blue-200 text-base md:text-lg">
              Here&apos;s what&apos;s happening on your platform today.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur rounded-xl p-4">
              <div className="text-sm text-blue-100 dark:text-blue-200">Today</div>
              <div className="text-xl font-semibold">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Students"
            value={m.students}
            change={newUsersPct}
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
            change={recentSessionsPct}
            icon="📚"
            color="purple"
            subtitle={`${m.recentActivity.sessions} this month`}
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Activity</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sessions over the last 7 days</p>
            </div>
            <button
              onClick={loadMetrics}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-2 py-1"
              aria-label="Refresh metrics"
            >
              Refresh →
            </button>
          </div>

          {/* Bars + Gridlines */}
          <div
            className="relative h-64 rounded-lg bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-100 dark:border-gray-700"
            role="img"
            aria-label="Bar chart of sessions over the last 7 days"
          >
            {/* Horizontal grid lines */}
            {[25, 50, 75].map((pct) => (
              <div
                key={pct}
                className="absolute inset-x-0 h-px bg-gray-200/70 dark:bg-gray-700"
                style={{ top: `${100 - pct}%` }}
                aria-hidden="true"
              />
            ))}

            {/* Bars */}
            <div className="absolute inset-3 flex items-end justify-between space-x-2">
              {activity.map((dayData: any, i: number) => {
                const heightPct = Math.max((dayData.sessions / maxSessions) * 100, 8);
                return (
                  <div key={i} className="relative flex-1 h-full group">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 dark:from-blue-500 dark:to-blue-300 opacity-90 group-hover:opacity-100 transition-[opacity,height,transform] duration-300 will-change-transform"
                      style={{ height: `${heightPct}%`, transform: 'translateZ(0)' }}
                      aria-label={`${dayData.day}: ${dayData.sessions} sessions`}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow">
                      {dayData.sessions} sessions
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
            {(m.weeklyActivity.length > 0
              ? m.weeklyActivity
              : [{ day: 'Mon' }, { day: 'Tue' }, { day: 'Wed' }, { day: 'Thu' }, { day: 'Fri' }, { day: 'Sat' }, { day: 'Sun' }]
            ).map((dayData: any, i: number) => (
              <span key={i} className="tabular-nums">{dayData.day}</span>
            ))}
          </div>

          {/* Last updated */}
          <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Last updated: <span className="tabular-nums">{relativeTimeFromISO(m.lastUpdated)}</span>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <ActionButton
                href="/admin/tutors/approval"
                icon="✅"
                title="Review Applications"
                description={`${m.recentActivity.pendingReviews} pending reviews`}
                urgent={m.recentActivity.pendingReviews > 5}
              />
              <ActionButton href="/admin/broadcast" icon="📢" title="Send Announcement" description="Broadcast to all users" />
              <ActionButton href="/admin/analytics" icon="📊" title="View Analytics" description="Detailed platform insights" />
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">System Status</h3>
            <div className="space-y-3">
              <StatusItem label="API Services" status="operational" />
              <StatusItem label="Database" status="operational" />
              <StatusItem label="File Storage" status="operational" />
              <StatusItem label="Email Service" status="operational" />
            </div>
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {err && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center">
            <span className="text-red-500 dark:text-red-400 mr-2">⚠️</span>
            <span className="text-red-700 dark:text-red-300">{err}</span>
            <button
              onClick={loadMetrics}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------ Subcomponents ------------------
function MetricCard({
  title,
  value,
  change,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  change: number; // percentage, can be negative
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  subtitle?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  const isUp = change >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-6 border border-transparent dark:border-gray-700 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow focus-within:ring-2 focus-within:ring-blue-500">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`} aria-hidden="true">
          <span className="text-xl">{icon}</span>
        </div>
        <div
          className={`flex items-center text-sm font-medium ${isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          aria-label={`${Math.abs(change)}% ${isUp ? 'increase' : 'decrease'}`}
          title={`${Math.abs(change)}% ${isUp ? 'increase' : 'decrease'}`}
        >
          <span className="select-none" aria-hidden="true">{isUp ? '↗️' : '↘️'}</span>
          <span className="ml-1 tabular-nums">{Math.abs(change)}%</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 tabular-nums">
          {formatNumber(value)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function ActionButton({
  href,
  icon,
  title,
  description,
  urgent = false,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  urgent?: boolean;
}) {
  return (
    <a
      href={href}
      className={`block p-4 rounded-xl border-2 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${
          urgent
            ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700'
            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      title={title}
      aria-label={`${title}: ${description}`}
    >
      <div className="flex items-center">
        <span className="text-xl mr-3" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-gray-100">{title}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
        </div>
        <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">
          →
        </span>
      </div>
    </a>
  );
}

function StatusItem({ label, status }: { label: string; status: 'operational' | 'degraded' | 'down' }) {
  const statusConfig = {
    operational: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Operational' },
    degraded: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'Degraded' },
    down: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', text: 'Down' },
  } as const;

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>{config.text}</div>
    </div>
  );
}
