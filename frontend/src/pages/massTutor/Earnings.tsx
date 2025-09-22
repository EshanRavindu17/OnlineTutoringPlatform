import React from 'react';
import { DollarSign } from 'lucide-react';

export default function EarningsPage() {
  const rows = [
    { month: 'Aug 2025', gross: 12450, commission: 20, payout: 9960 },
    { month: 'Jul 2025', gross: 11400, commission: 20, payout: 9120 },
  ];
  return (
    <div className="p-6">
      <div className="flex items-center gap-3"><DollarSign className="w-6 h-6 text-gray-400" /><h2 className="text-2xl font-bold text-gray-900">Earnings</h2></div>
      <p className="text-gray-500 mt-1">See earnings, admin commission, and profit</p>

      <div className="mt-6 rounded-2xl border border-gray-100 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Month</th>
              <th className="p-4 text-left font-semibold text-gray-600">Gross</th>
              <th className="p-4 text-left font-semibold text-gray-600">Admin %</th>
              <th className="p-4 text-left font-semibold text-gray-600">Payout</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-4">{r.month}</td>
                <td className="p-4">${r.gross.toLocaleString()}</td>
                <td className="p-4">{r.commission}%</td>
                <td className="p-4 font-semibold">${r.payout.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
