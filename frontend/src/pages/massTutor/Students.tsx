import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function StudentsPage() {
  const rows = [
    { name: 'A. Perera', email: 'a.perera@example.com', className: 'Combined Maths — G12', paid: true },
    { name: 'N. Fernando', email: 'n.fernando@example.com', className: 'Physics — G13', paid: true },
    { name: 'D. Silva', email: 'd.silva@example.com', className: 'Combined Maths — G13', paid: false },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900">Students</h2>
      <p className="text-gray-500 mt-1">View who has paid for each class</p>

      <div className="mt-6 rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">Student</th>
              <th className="text-left p-4 font-semibold text-gray-600">Email</th>
              <th className="text-left p-4 font-semibold text-gray-600">Class</th>
              <th className="text-left p-4 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-4">{r.name}</td>
                <td className="p-4">{r.email}</td>
                <td className="p-4">{r.className}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                    r.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {r.paid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {r.paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
