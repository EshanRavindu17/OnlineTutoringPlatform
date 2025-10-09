import React from 'react';
import { UploadCloud, Link2 } from 'lucide-react';

export default function RecordingsPage() {
  const items = [
    { id: 'r1', title: 'Vectors — 2025-09-01', link: 'https://drive.google.com/...'},
    { id: 'r2', title: 'Trigonometry — 2025-09-08', link: 'https://drive.google.com/...'},
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900">Recordings</h2>
      <p className="text-gray-500 mt-1">Upload and manage past session recordings</p>

      <div className="mt-6 rounded-2xl border border-gray-100 p-5">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="rounded-xl border-gray-200" placeholder="Title (e.g., Topic — YYYY-MM-DD)" />
          <input className="rounded-xl border-gray-200" placeholder="Drive link" />
          <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <UploadCloud className="w-4 h-4 mr-2" />Upload
          </button>
        </form>
      </div>

      <ul className="mt-6 space-y-3">
        {items.map(i => (
          <li key={i.id} className="rounded-xl border border-gray-100 p-4 flex items-center justify-between bg-white">
            <span className="text-gray-800">{i.title}</span>
            <a className="inline-flex items-center gap-2 text-blue-600 hover:underline" href={i.link}>
              <Link2 className="w-4 h-4" />Open
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
