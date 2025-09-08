import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CalendarDays } from 'lucide-react';

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [classes] = useState([
    { id: 'c1', name: 'Combined Maths — Grade 12', subject: 'Maths', price: 3, students: 120, schedule: 'Mon & Thu, 6–8 PM' },
    { id: 'c2', name: 'Combined Maths — Grade 13', subject: 'Maths', price: 3, students: 95, schedule: 'Tue & Fri, 6–8 PM' },
    { id: 'c3', name: 'Physics — Grade 13', subject: 'Physics', price: 3, students: 80, schedule: 'Sat, 9–11 AM' },
  ]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
          <p className="text-gray-500 mt-1">Create and manage your classes</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> New Class
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map(c => (
          <div key={c.id} className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                <p className="text-sm text-gray-500">Subject: {c.subject} • ${c.price}/month • {c.students} students</p>
                <div className="mt-2 inline-flex items-center text-sm text-gray-600">
                  <CalendarDays className="w-4 h-4 mr-1" />{c.schedule}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-lg border hover:bg-gray-50"><Pencil className="w-4 h-4" /></button>
                <button className="px-3 py-2 rounded-lg border hover:bg-gray-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <NavLinkBtn to={`/mass-tutor/class/${c.id}`} label="Open" />
              <NavLinkBtn to={`/mass-tutor/materials?classId=${c.id}`} label="Materials" variant="ghost" />
              <NavLinkBtn to={`/mass-tutor/recordings?classId=${c.id}`} label="Recordings" variant="ghost" />
            </div>
          </div>
        ))}
      </div>

      {open && <CreateClassModal onClose={() => setOpen(false)} />}
    </div>
  );
}

function NavLinkBtn({ to, label, variant }: { to: string; label: string; variant?: 'ghost' | 'solid' }) {
  return (
    <a href={to} className={`px-4 py-2 rounded-xl text-sm font-medium border ${
      variant === 'ghost' ? 'text-gray-700 hover:bg-gray-50' : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent'
    }`}>{label}</a>
  );
}

function CreateClassModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-5 text-white">
          <h3 className="text-lg font-semibold">Create New Class</h3>
        </div>
        <form className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField label="Class Name" placeholder="e.g., Combined Maths — Grade 12" />
          <TextField label="Subject" placeholder="Maths / Physics" />
          <TextField label="Grade" placeholder="12 / 13" />
          <TextField label="Monthly Rate (max $3)" type="number" min={0} max={3} step="0.5" />
          <TextField label="Schedule" placeholder="Mon & Thu, 6–8 PM" className="md:col-span-2" />
          <TextField label="Drive link (sample video)" placeholder="https://..." className="md:col-span-2" />
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, className = '', ...rest }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input {...rest} className="mt-1 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
    </label>
  );
}
