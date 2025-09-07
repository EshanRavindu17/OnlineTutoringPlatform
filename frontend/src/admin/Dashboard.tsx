import { useEffect, useState } from 'react';

type Metrics = {
  students: number;
  individualTutors: number;
  massTutors: number;
  candidates: number;
  sessions: number;
  revenue?: number;
};

export default function Dashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        // Try your existing endpoint first; fallback to /Admin/overview
        let res = await fetch('/Admin/metrics', { credentials: 'include' });
        if (res.status === 404) res = await fetch('/Admin/overview', { credentials: 'include' });
        if (!res.ok) throw new Error(await res.text());
        setData(await res.json());
      } catch (e: any) {
        setErr('Could not load metrics');
        console.error(e);
      }
    })();
  }, []);

  const m = data || { students: 0, individualTutors: 0, massTutors: 0, candidates: 0, sessions: 0, revenue: 0 };

  return (
    <div className="space-y-6">
      {/* Top quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <Stat title="Students" value={m.students} />
        <Stat title="Tutors (Ind)" value={m.individualTutors} />
        <Stat title="Tutors (Mass)" value={m.massTutors} />
        <Stat title="Pending Tutors" value={m.candidates} />
        <Stat title="Sessions" value={m.sessions} />
        <Stat title="Revenue (LKR)" value={m.revenue ?? 0} />
      </div>

      {/* Bookings trend + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="admin-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Bookings per week</h3>
            <span className="text-xs text-gray-500">mock data</span>
          </div>
          {/* tiny sparkline */}
          <svg viewBox="0 0 300 80" className="w-full h-28">
            <polyline
              fill="none"
              stroke="url(#g)"
              strokeWidth="3"
              points="5,60 35,55 65,58 95,50 125,52 155,47 185,49 215,45 245,42 275,38"
            />
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--brand-400)" />
                <stop offset="100%" stopColor="var(--brand-600)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="admin-card p-5">
          <h3 className="font-semibold mb-3">Quick actions</h3>
          <div className="flex flex-col gap-2">
            <a href="/admin/tutors/approve" className="admin-btn admin-btn-ghost">Approve pending tutors</a>
            <a href="/admin/broadcast" className="admin-btn admin-btn-ghost">Broadcast a message</a>
            <a href="/admin/policies" className="admin-btn admin-btn-ghost">Update system policies</a>
          </div>
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="admin-card p-4">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  );
}
