import React from 'react';
import { CalendarDays, Paperclip, UploadCloud } from 'lucide-react';

export default function MaterialsPage() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900">Materials</h2>
      <p className="text-gray-500 mt-1">Attach materials per date for each class</p>

      <div className="mt-6 rounded-2xl border border-gray-100 p-5 bg-white">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="rounded-xl border-gray-200 md:col-span-2">
            <option>Choose Class</option>
            <option>Combined Maths — Grade 12</option>
            <option>Combined Maths — Grade 13</option>
            <option>Physics — Grade 13</option>
          </select>
          <input type="date" className="rounded-xl border-gray-200" />
          <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl md:col-span-1">
            <UploadCloud className="w-4 h-4 mr-2" />Add Files
          </button>
        </form>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-600">Date</th>
              <th className="text-left p-4 font-semibold text-gray-600">Class</th>
              <th className="text-left p-4 font-semibold text-gray-600">Files</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i} className="border-t">
                <td className="p-4">
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />2025-09-0{i}
                  </div>
                </td>
                <td className="p-4">Combined Maths — Grade 12</td>
                <td className="p-4">
                  <div className="inline-flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-400" />Notes.pdf, Worksheet.pdf
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="px-3 py-2 rounded-lg border hover:bg-gray-50">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
