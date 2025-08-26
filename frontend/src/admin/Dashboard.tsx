import { useMemo } from 'react';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white border p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function TinyLineChart({ data }: { data: number[] }) {
  const path = useMemo(() => {
    const w = 260,
      h = 60;
    const max = Math.max(...data),
      min = Math.min(...data);
    const scaleX = (i: number) => (i / (data.length - 1)) * w;
    const scaleY = (v: number) => h - ((v - min) / Math.max(1, max - min)) * h;
    return data.map((v, i) => `${i === 0 ? 'M' : 'L'}${scaleX(i)},${scaleY(v)}`).join(' ');
  }, [data]);

  return (
    <svg viewBox="0 0 260 60" className="w-full h-16">
      <path d={path} fill="none" stroke="currentColor" className="text-gray-900" strokeWidth={2} />
    </svg>
  );
}

export default function Dashboard() {
  const chartData = [8, 10, 7, 12, 14, 13, 18, 16, 20, 19, 23, 25];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="text-xs text-gray-500">Last 30 days</div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Students" value={1243} />
        <StatCard label="Tutors (Ind)" value={218} />
        <StatCard label="Tutors (Mass)" value={37} />
        <StatCard label="Pending Tutors" value={12} />
        <StatCard label="Open Reports" value={5} />
        <StatCard label="Revenue (LKR)" value={'1.2M'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white border p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="font-medium">Bookings per week</div>
            <div className="text-xs text-gray-500">mock data</div>
          </div>
          <TinyLineChart data={chartData} />
        </div>

        <div className="rounded-2xl bg-white border p-4 space-y-3">
          <div className="font-medium">Quick actions</div>
          <button className="w-full text-left px-3 py-2 rounded-xl border hover:bg-gray-50">
            Approve pending tutors
          </button>
          <button className="w-full text-left px-3 py-2 rounded-xl border hover:bg-gray-50">Broadcast a message</button>
          <button className="w-full text-left px-3 py-2 rounded-xl border hover:bg-gray-50">
            Update system policies
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white border p-4">
        <div className="font-medium mb-3">Recent activity</div>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span>Jane Admin approved 2 tutors</span>
            <span className="text-gray-500">2h ago</span>
          </li>
          <li className="flex items-center justify-between">
            <span>System policy updated</span>
            <span className="text-gray-500">1d ago</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Broadcast sent to all tutors</span>
            <span className="text-gray-500">3d ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
