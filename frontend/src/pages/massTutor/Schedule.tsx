import React, { useState, useEffect } from 'react';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, Users2, BookOpen,
  Video, MapPin, Loader2, Plus, Filter, Search
} from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ClassSlot {
  cslot_id: string;
  dateTime: string;
  duration: number;
  announcement: string | null;
  meetingURLs: string[];
  status: 'upcoming' | 'completed';
  Class: {
    class_id: string;
    title: string;
    subject: string;
  };
  _count: {
    Enrolment: number;
  };
}

interface DaySlots {
  date: Date;
  slots: ClassSlot[];
  isToday: boolean;
  isCurrentMonth: boolean;
}

export default function SchedulePage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allSlots, setAllSlots] = useState<ClassSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    fetchAllSlots();
  }, []);

  const fetchAllSlots = async () => {
    try {
      setLoading(true);
      // Get all classes first
      const classes = await massTutorAPI.getClasses();
      
      // Fetch slots for each class
      const allSlotsPromises = classes.map((cls: any) => 
        massTutorAPI.getClassSlots(cls.class_id)
          .then(slots => slots.map((slot: any) => ({
            ...slot,
            Class: {
              class_id: cls.class_id,
              title: cls.title,
              subject: cls.subject,
            },
            _count: {
              Enrolment: cls.studentCount || 0
            }
          })))
      );
      
      const slotsArrays = await Promise.all(allSlotsPromises);
      const flatSlots = slotsArrays.flat();
      
      setAllSlots(flatSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): DaySlots[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: DaySlots[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        slots: getSlotsForDate(date),
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      
      days.push({
        date,
        slots: getSlotsForDate(date),
        isToday: dateOnly.getTime() === today.getTime(),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        slots: getSlotsForDate(date),
        isToday: false,
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getSlotsForDate = (date: Date): ClassSlot[] => {
    const dateStr = date.toDateString();
    return allSlots.filter(slot => {
      const slotDate = new Date(slot.dateTime);
      const matchesDate = slotDate.toDateString() === dateStr;
      const matchesSearch = searchTerm === '' || 
        slot.Class.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.Class.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || slot.status === filterStatus;
      
      return matchesDate && matchesSearch && matchesFilter;
    });
  };

  const getUpcomingSlots = (): ClassSlot[] => {
    const now = new Date();
    return allSlots
      .filter(slot => {
        const slotDate = new Date(slot.dateTime);
        const matchesSearch = searchTerm === '' || 
          slot.Class.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slot.Class.subject.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || slot.status === filterStatus;
        return slotDate > now && matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, 5);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleJoinZoom = async (meetingURLs: string[]) => {
    if (meetingURLs.length === 0) {
      toast.error('No meeting URL available');
      return;
    }

    try {
      const oldHostUrl = meetingURLs[0];
      const result = await massTutorAPI.getZoomHostUrl(oldHostUrl);
      window.open(result.newHostUrl, '_blank');
    } catch (error: any) {
      console.error('Error joining Zoom:', error);
      toast.error('Failed to join Zoom meeting');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-600 font-medium">Loading schedule...</p>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const upcomingSlots = getUpcomingSlots();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule</h2>
          <p className="text-sm text-gray-600 mt-1">View and manage all your class sessions</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigate('/mass-tutor/classes')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Sessions</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView('month')}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          {/* Calendar Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 rounded-lg border transition-all ${
                    day.isToday
                      ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                      : day.isCurrentMonth
                      ? 'bg-white border-gray-200 hover:border-gray-300'
                      : 'bg-gray-50 border-gray-100'
                  } ${day.slots.length > 0 ? 'cursor-pointer hover:shadow-md' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    day.isToday
                      ? 'text-blue-600'
                      : day.isCurrentMonth
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                    {day.date.getDate()}
                  </div>
                  
                  {day.slots.length > 0 && (
                    <div className="space-y-1">
                      {day.slots.slice(0, 2).map((slot, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate(`/mass-tutor/classes/${slot.Class.class_id}`)}
                          className={`text-[10px] px-1.5 py-1 rounded ${
                            slot.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          } truncate cursor-pointer hover:shadow-sm`}
                          title={`${slot.Class.title} - ${new Date(slot.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                        >
                          {new Date(slot.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      ))}
                      {day.slots.length > 2 && (
                        <div className="text-[10px] text-gray-600 px-1.5">
                          +{day.slots.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Sessions Sidebar */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h3>
          </div>

          <div className="p-5">
            {upcomingSlots.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No upcoming sessions</p>
                <p className="text-xs text-gray-500 mt-1">Schedule sessions from your classes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSlots.map((slot) => (
                  <div
                    key={slot.cslot_id}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                          {slot.Class.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1">
                          <BookOpen className="w-3 h-3" />
                          {slot.Class.subject}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Upcoming
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(slot.dateTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(slot.dateTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })} ({slot.duration}h)
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users2 className="w-3 h-3" />
                        {slot._count.Enrolment} students
                      </div>
                    </div>

                    {slot.announcement && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-gray-700 border-l-2 border-blue-500">
                        {slot.announcement}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {slot.meetingURLs.length > 0 && (
                        <button
                          onClick={() => handleJoinZoom(slot.meetingURLs)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                        >
                          <Video className="w-3 h-3" />
                          Join
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/mass-tutor/classes/${slot.Class.class_id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-medium transition-colors"
                      >
                        View Class
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allSlots.filter(s => s.status === 'upcoming' && new Date(s.dateTime) > new Date()).length}
              </div>
              <div className="text-xs text-gray-600">Upcoming Sessions</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allSlots.filter(s => s.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Completed Sessions</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(allSlots.map(s => s.Class.class_id)).size}
              </div>
              <div className="text-xs text-gray-600">Active Classes</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {allSlots.reduce((sum, s) => sum + s._count.Enrolment, 0)}
              </div>
              <div className="text-xs text-gray-600">Total Enrollments</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
