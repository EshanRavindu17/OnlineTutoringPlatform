import { useState, useEffect } from 'react';
import { adminApi } from './api';
import { toast } from 'react-hot-toast';

interface Session {
  session_id: string;
  title: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'canceled';
  price: number;
  meeting_urls: string[];
  materials: string[];
  student: {
    student_id: string;
    name: string;
    email: string;
  } | null;
  tutor: {
    i_tutor_id: string;
    name: string;
    email: string;
  } | null;
  payment: {
    amount: number;
    status: string;
    payment_date_time: string;
  } | null;
}

interface ClassSlot {
  cslot_id: string;
  dateTime: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled' | 'live';
  meetingURLs: string[];
  materials: string[];
  recording: string;
  announcement: string;
  class: {
    class_id: string;
    title: string;
    subject: string;
    day: string;
    time: string;
    enrollmentCount: number;
  } | null;
  tutor: {
    m_tutor_id: string;
    name: string;
    email: string;
  } | null;
}

export default function Sessions() {
  const [activeTab, setActiveTab] = useState<'individual' | 'mass'>('individual');
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'recent' | 'upcoming'>('all');

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter, searchQuery, startDate, endDate, timeFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calculate time-based filters
      let calculatedStartDate = startDate;
      let calculatedEndDate = endDate;
      
      if (timeFilter === 'recent') {
        // Last 6 hours to now
        const now = new Date();
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        calculatedStartDate = sixHoursAgo.toISOString().split('T')[0];
        calculatedEndDate = now.toISOString().split('T')[0];
      } else if (timeFilter === 'upcoming') {
        // Now to next 6 hours
        const now = new Date();
        const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        calculatedStartDate = now.toISOString().split('T')[0];
        calculatedEndDate = sixHoursLater.toISOString().split('T')[0];
      }
      
      const filters = {
        status: statusFilter,
        search: searchQuery,
        startDate: calculatedStartDate,
        endDate: calculatedEndDate,
      };

      const [statsData, sessionData] = await Promise.all([
        adminApi.getSessionStats(),
        activeTab === 'individual'
          ? adminApi.getIndividualSessions(filters)
          : adminApi.getMassClassSlots(filters),
      ]);

      setStats(statsData.stats);

      if (activeTab === 'individual') {
        setSessions(sessionData.sessions);
      } else {
        setSlots(sessionData.slots);
      }
    } catch (error: any) {
      console.error('Failed to load session data:', error);
      toast.error('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingUrl: string) => {
    const loadingToast = toast.loading('Generating admin host URL...');
    try {
      const response = await adminApi.getAdminHostUrl(meetingUrl);
      window.open(response.hostUrl, '_blank');
      toast.success('Opening meeting as host!', { id: loadingToast });
    } catch (error: any) {
      console.error('Failed to join meeting:', error);
      toast.error('Failed to generate host URL', { id: loadingToast });
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: string,
    type: 'individual' | 'mass'
  ) => {
    try {
      if (type === 'individual') {
        await adminApi.updateSessionStatus(id, newStatus as any);
        toast.success(`Session status updated to ${newStatus}`);
      } else {
        await adminApi.updateClassSlotStatus(id, newStatus as any);
        toast.success(`Class slot status updated to ${newStatus}`);
      }
      loadData();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400',
      ongoing: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
      live: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 animate-pulse',
      completed: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      canceled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
      cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
        }`}
      >
        {status === 'live' && '🔴 '}
        {(status === 'canceled' || status === 'cancelled') && '🚫 '}
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDateTime = (dateStr: string | null, timeStr?: string | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (timeStr) {
      const time = new Date(timeStr);
      return `${date.toLocaleDateString()} ${time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }
    return date.toLocaleString();
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Session Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage all tutoring sessions</p>
        </div>
      </div>

      {/* Statistics Cards - Compact */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg p-4 text-white shadow-lg dark:shadow-blue-900/30">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 dark:bg-white/10 rounded-lg p-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              <div>
                <p className="text-blue-100 dark:text-blue-200 text-xs">Individual</p>
                <p className="text-2xl font-bold">{stats.individual.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg p-4 text-white shadow-lg dark:shadow-purple-900/30">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 dark:bg-white/10 rounded-lg p-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <p className="text-purple-100 dark:text-purple-200 text-xs">Mass Classes</p>
                <p className="text-2xl font-bold">{stats.mass.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg p-4 text-white shadow-lg dark:shadow-green-900/30">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 dark:bg-white/10 rounded-lg p-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-green-100 dark:text-green-200 text-xs">Completed</p>
                <p className="text-2xl font-bold">
                  {stats.individual.completedMonth + stats.mass.completedMonth}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg p-4 text-white shadow-lg dark:shadow-orange-900/30">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 dark:bg-white/10 rounded-lg p-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-orange-100 dark:text-orange-200 text-xs">Active Now</p>
                <p className="text-2xl font-bold">
                  {(stats.individual.byStatus?.ongoing || 0) +
                    (stats.mass.byStatus?.ongoing || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Individual Sessions ({stats?.individual.total || 0})
            </button>
            <button
              onClick={() => setActiveTab('mass')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'mass'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Mass Class Slots ({stats?.mass.total || 0})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            >
              <option value="">All Statuses</option>
              {activeTab === 'individual' ? (
                <>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </>
              ) : (
                <>
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            >
              <option value="all">All Time</option>
              <option value="recent">Recent (Last 6h)</option>
              <option value="upcoming">Upcoming (Next 6h)</option>
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setTimeFilter('all');
              }}
              placeholder="Start Date"
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setTimeFilter('all');
              }}
              placeholder="End Date"
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : activeTab === 'individual' ? (
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No individual sessions found
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.session_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {session.title || 'Untitled Session'}
                          </h3>
                          {getStatusBadge(session.status)}
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Subject</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{session.subject || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Date & Time</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                              {formatDateTime(session.date, session.start_time)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Student</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{session.student?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Tutor</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{session.tutor?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Price</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              LKR {session.price?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Payment</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {session.payment?.status || 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {session.meeting_urls && session.meeting_urls.length > 0 && 
                         session.status !== 'completed' && session.status !== 'canceled' && (
                          <button
                            onClick={() => handleJoinMeeting(session.meeting_urls[0])}
                            className="px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Join
                          </button>
                        )}
                        {session.status !== 'completed' && session.status !== 'canceled' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(session.session_id, 'completed', 'individual')
                            }
                            className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {slots.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No mass class slots found
                </div>
              ) : (
                slots.map((slot) => (
                  <div
                    key={slot.cslot_id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {slot.class?.title || 'Untitled Class'}
                          </h3>
                          {getStatusBadge(slot.status)}
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Subject</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{slot.class?.subject || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Date & Time</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">{formatDateTime(slot.dateTime)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Duration</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{slot.duration || 0} min</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Tutor</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{slot.tutor?.name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Students</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {slot.class?.enrollmentCount || 0} enrolled
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Recording</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                              {slot.recording ? '✓ Available' : '✗ Not available'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {slot.meetingURLs && slot.meetingURLs.length > 0 && 
                         slot.status !== 'completed' && slot.status !== 'cancelled' && (
                          <button
                            onClick={() => handleJoinMeeting(slot.meetingURLs[0])}
                            className="px-3 py-1.5 bg-green-600 dark:bg-green-500 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Join
                          </button>
                        )}
                        {slot.status !== 'completed' && slot.status !== 'cancelled' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(slot.cslot_id, 'completed', 'mass')
                            }
                            className="px-3 py-1.5 bg-blue-600 dark:bg-blue-500 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors whitespace-nowrap"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}