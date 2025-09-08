import React from 'react';
import { CalendarDays, UploadCloud, Users2, FileText } from 'lucide-react';

export default function ClassDetailPage() {
  const materials = [
    { date: '2025-09-01', items: [{ name: 'Notes — Vectors.pdf' }, { name: 'Worksheet 1.pdf' }] },
    { date: '2025-09-08', items: [{ name: 'Assignment — Trigonometry.docx' }] },
  ];
  const students = [
    { id: 's1', name: 'A. Perera', paid: true },
    { id: 's2', name: 'N. Fernando', paid: true },
    { id: 's3', name: 'D. Silva', paid: false },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Class Details</h2>
          <p className="text-gray-500 mt-1">Manage schedule, materials & students</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Schedule Session</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <section className="lg:col-span-2 rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><FileText className="w-5 h-5 text-gray-400" /><h3 className="font-semibold">Materials by Date</h3></div>
          <div className="space-y-4">
            {materials.map((m) => (
              <div key={m.date} className="rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4" />{new Date(m.date).toDateString()}
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-gray-700">
                  {m.items.map((it, i) => (<li key={i}>{it.name}</li>))}
                </ul>
                <div className="mt-3">
                  <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50">
                    <UploadCloud className="w-4 h-4" />Upload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4"><Users2 className="w-5 h-5 text-gray-400" /><h3 className="font-semibold">Students</h3></div>
          <ul className="space-y-3">
            {students.map(s => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="text-gray-800">{s.name}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${s.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {s.paid ? 'Paid' : 'Unpaid'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
