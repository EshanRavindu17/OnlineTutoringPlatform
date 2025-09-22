import React from 'react';

export default function MassTutorProfile() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
      <p className="text-gray-500 mt-1">Update your details (rate capped at $3/month by admin)</p>

      <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name" placeholder="Full name" />
        <Field label="Email" type="email" placeholder="email@example.com" />
        <Field label="Age" type="number" min={18} />
        <Field label="Date of birth" type="date" />
        <Field label="Educational Qualifications" placeholder="A/L, Degree" className="md:col-span-2" />
        <Field label="CV (link)" placeholder="Drive/URL" className="md:col-span-2" />
        <Field label="Sample lecture video (link)" placeholder="Drive/YouTube URL" className="md:col-span-2" />
        <Field label="Subjects" placeholder="Maths, Physics" className="md:col-span-2" />
        <Field label="Monthly rate (max $3)" type="number" min={0} max={3} step="0.5" />
        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
          <button type="button" className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50">Cancel</button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Save Changes</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, className = '', ...rest }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input {...rest} className="mt-1 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
    </label>
  );
}
