import React from 'react';
import { Users, BookOpen, Calendar, DollarSign } from 'lucide-react';

const MassTutorDashboard: React.FC = () => {
    const stats = [
        {
            title: 'Total Students',
            value: '1,234',
            icon: Users,
            change: '+12%'
        },
        {
            title: 'Active Courses',
            value: '8',
            icon: BookOpen,
            change: '+2'
        },
        {
            title: 'Upcoming Sessions',
            value: '15',
            icon: Calendar,
            change: 'Today'
        },
        {
            title: 'Monthly Revenue',
            value: '$12,450',
            icon: DollarSign,
            change: '+18%'
        }
    ];

    const recentSessions = [
        { id: 1, course: 'Mathematics 101', time: '10:00 AM', students: 45 },
        { id: 2, course: 'Physics Advanced', time: '2:00 PM', students: 32 },
        { id: 3, course: 'Chemistry Basics', time: '4:00 PM', students: 28 }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Create New Course
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-lg shadow-md border">
                            <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                                <IconComponent className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="px-6 pb-6">
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-gray-500">{stat.change}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow-md border">
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Today's Sessions</h3>
                </div>
                <div className="px-6 pb-6">
                    <div className="space-y-4">
                        {recentSessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-medium">{session.course}</h3>
                                    <p className="text-sm text-gray-500">{session.time}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{session.students} students</p>
                                    <button className="mt-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                        Join Session
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Course Management</h3>
                    </div>
                    <div className="px-6 pb-6">
                        <div className="space-y-2">
                            <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                Manage Courses
                            </button>
                            <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                Upload Materials
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Student Management</h3>
                    </div>
                    <div className="px-6 pb-6">
                        <div className="space-y-2">
                            <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                View Students
                            </button>
                            <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                Send Messages
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                    </div>
                    <div className="px-6 pb-6">
                        <div className="space-y-2">
                            <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                View Reports
                            </button>
                            <button className="w-full px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                                Performance Metrics
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MassTutorDashboard;