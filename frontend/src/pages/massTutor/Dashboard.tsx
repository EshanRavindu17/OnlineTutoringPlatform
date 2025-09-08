import React from 'react';
import { Users, BookOpen, Calendar, DollarSign, MessageCircle, TrendingUp } from 'lucide-react';

export default function MassTutorDashboard() {
  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Active Classes', value: '8', icon: BookOpen, color: 'bg-green-50 text-green-600' },
    { title: 'Upcoming Sessions', value: '15', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
    { title: 'Monthly Revenue', value: '$12,450', icon: DollarSign, color: 'bg-yellow-50 text-yellow-600' },
  ];

  const sessions = [
    { id: 1, title: 'Combined Maths — Grade 12', time: '10:00 AM', students: 45, status: 'upcoming' },
    { id: 2, title: 'Physics — Grade 13', time: '2:00 PM', students: 32, status: 'live' },
    { id: 3, title: 'Chemistry Basics', time: '4:00 PM', students: 28, status: 'upcoming' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-gray-500 mt-1">Today at a glance</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
          <MessageCircle className="w-4 h-4 mr-2" /> Messages
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-3">{s.title}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sessions</h3>
        <div className="divide-y">
          {sessions.map((x) => (
            <div key={x.id} className="py-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{x.title}</div>
                <div className="text-sm text-gray-500">{x.time} • {x.students} students</div>
              </div>
              <button className={`px-4 py-2 rounded-xl text-sm font-medium ${
                x.status === 'live' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}>{x.status === 'live' ? 'Join Live' : 'Join'}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
