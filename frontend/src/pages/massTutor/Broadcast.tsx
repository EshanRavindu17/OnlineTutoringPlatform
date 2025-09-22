import React from 'react';
import { Megaphone, Send } from 'lucide-react';

export default function BroadcastPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3"><Megaphone className="w-6 h-6 text-gray-400" /><h2 className="text-2xl font-bold text-gray-900">Broadcast Messages</h2></div>
      <p className="text-gray-500 mt-1">Send announcements to all students or a single student via email.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <form className="rounded-2xl border border-gray-100 p-5 bg-white">
          <h3 className="font-semibold mb-2">Broadcast to Class</h3>
          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">Class</span>
            <select className="mt-1 w-full rounded-xl border-gray-200">
              <option>Combined Maths — Grade 12</option>
              <option>Combined Maths — Grade 13</option>
              <option>Physics — Grade 13</option>
            </select>
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">Subject</span>
            <input className="mt-1 w-full rounded-xl border-gray-200" placeholder="Announcement subject" />
          </label>
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Message</span>
            <textarea className="mt-1 w-full rounded-xl border-gray-200" rows={6} placeholder="Write your announcement..." />
          </label>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Send className="w-4 h-4 mr-2" />Send Broadcast
          </button>
        </form>

        <form className="rounded-2xl border border-gray-100 p-5 bg-white">
          <h3 className="font-semibold mb-2">Message a Student</h3>
          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">Student Email</span>
            <input className="mt-1 w-full rounded-xl border-gray-200" placeholder="student@email.com" />
          </label>
          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-700">Subject</span>
            <input className="mt-1 w-full rounded-xl border-gray-200" placeholder="Subject" />
          </label>
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700">Message</span>
            <textarea className="mt-1 w-full rounded-xl border-gray-200" rows={6} placeholder="Write your message..." />
          </label>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Send className="w-4 h-4 mr-2" />Send Email
          </button>
        </form>
      </div>
    </div>
  );
}
