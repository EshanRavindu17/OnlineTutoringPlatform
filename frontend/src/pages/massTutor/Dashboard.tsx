// Importing icons from lucide-react for the dashboard
// These icons make the UI more intuitive and visually appealing
import React from 'react';
import { Users, BookOpen, Calendar, DollarSign, MessageCircle, TrendingUp } from 'lucide-react';

export default function MassTutorDashboard() {
  // Stats cards data - each card shows a key metric with an icon
  // Using different colors for each stat to make them visually distinct
  // NOTE: Later need to fetch these values from the backend
  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { title: 'Active Classes', value: '8', icon: BookOpen, color: 'bg-green-50 text-green-600' },
    { title: 'Upcoming Sessions', value: '15', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
    { title: 'Monthly Revenue', value: '$12,450', icon: DollarSign, color: 'bg-yellow-50 text-yellow-600' },
  ];

  // Today's session list
  // status can be 'upcoming' or 'live' - affects the button style
  // TODO: Need to integrate with real-time session data
  const sessions = [
    { id: 1, title: 'Combined Maths — Grade 12', time: '10:00 AM', students: 45, status: 'upcoming' },
    { id: 2, title: 'Physics — Grade 13', time: '2:00 PM', students: 32, status: 'live' },
    { id: 3, title: 'Chemistry Basics', time: '4:00 PM', students: 28, status: 'upcoming' },
  ];

  return (
    // Main dashboard container with padding
    <div className="p-6">
      {/* Header section with title and messages button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
          <p className="text-gray-500 mt-1">Today at a glance</p>
        </div>
        {/* Quick access to messages - might need a badge to show unread count later */}
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
          <MessageCircle className="w-4 h-4 mr-2" /> Messages
        </button>
      </div>

      {/* Stats grid - responsive layout with different columns per breakpoint
          1 column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {/* Map through stats to create metric cards
            Each card has an icon, trend indicator, label and value */}
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              {/* Icon with background tint matching the metric type */}
              <div className={`p-2 rounded-lg ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              {/* Trend indicator - could make this dynamic based on data later */}
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mt-3">{s.title}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sessions list section */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Sessions</h3>
        {/* Using divide-y for nice separators between sessions */}
        <div className="divide-y">
          {/* Map through sessions to show each class with its details */}
          {sessions.map((x) => (
            <div key={x.id} className="py-4 flex items-center justify-between">
              <div>
                {/* Session title and details */}
                <div className="font-medium text-gray-900">{x.title}</div>
                <div className="text-sm text-gray-500">{x.time} • {x.students} students</div>
              </div>
              {/* Join button - red for live sessions, blue for upcoming 
                  Using template literal for conditional styling */}
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
