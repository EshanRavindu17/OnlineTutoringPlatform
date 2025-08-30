import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  BookOpen, 
  Video,
  X,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/authContext';

// Types for calendar events
interface CalendarEvent {
  id: string;
  title: string;
  type: 'individual' | 'class';
  date: Date;
  startTime: string;
  endTime: string;
  subject: string;
  tutor?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  meetingLink?: string;
  description?: string;
  color: string;
}

// Mock data for demonstration
const mockEvents: CalendarEvent[] = [
  // Individual Sessions
  {
    id: '1',
    title: 'Mathematics Tutoring',
    type: 'individual',
    date: new Date(2025, 7, 30), // August 30, 2025
    startTime: '10:00',
    endTime: '11:00',
    subject: 'Mathematics',
    tutor: 'Dr. John Smith',
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/123456789',
    description: 'Algebra and calculus review',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Physics Tutoring',
    type: 'individual',
    date: new Date(2025, 7, 31), // August 31, 2025
    startTime: '14:00',
    endTime: '15:00',
    subject: 'Physics',
    tutor: 'Prof. Sarah Wilson',
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/987654321',
    description: 'Mechanics and thermodynamics',
    color: 'bg-blue-500'
  },
  {
    id: '3',
    title: 'English Literature',
    type: 'individual',
    date: new Date(2025, 8, 1), // September 1, 2025
    startTime: '16:00',
    endTime: '17:00',
    subject: 'English',
    tutor: 'Ms. Emily Davis',
    status: 'scheduled',
    description: 'Shakespeare analysis',
    color: 'bg-blue-500'
  },
  {
    id: '4',
    title: 'Biology Tutoring',
    type: 'individual',
    date: new Date(2025, 8, 1), // September 1, 2025
    startTime: '10:00',
    endTime: '11:00',
    subject: 'Biology',
    tutor: 'Dr. Lisa Chen',
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/456789123',
    description: 'Cell biology and genetics',
    color: 'bg-blue-500'
  },
  {
    id: '5',
    title: 'History Tutoring',
    type: 'individual',
    date: new Date(2025, 8, 2), // September 2, 2025
    startTime: '09:00',
    endTime: '10:00',
    subject: 'History',
    tutor: 'Mr. David Lee',
    status: 'scheduled',
    description: 'World War II and its impact',
    color: 'bg-blue-500'
  },
  {
    id: '6',
    title: 'Computer Science Tutoring',
    type: 'individual',
    date: new Date(2025, 8, 2), // September 2, 2025
    startTime: '15:00',
    endTime: '16:00',
    subject: 'Computer Science',
    tutor: 'Ms. Rachel Kumar',
    status: 'scheduled',
    meetingLink: 'https://zoom.us/j/789123456',
    description: 'Data structures and algorithms',
    color: 'bg-blue-500'
  },
  
  // Class Sessions
  {
    id: '7',
    title: 'Chemistry Lab Session',
    type: 'class',
    date: new Date(2025, 8, 3), // September 3, 2025
    startTime: '09:00',
    endTime: '10:30',
    subject: 'Chemistry',
    tutor: 'Dr. Michael Brown',
    status: 'scheduled',
    description: 'Organic chemistry experiments',
    color: 'bg-orange-500'
  },
  {
    id: '8',
    title: 'Art Workshop',
    type: 'class',
    date: new Date(2025, 8, 3), // September 3, 2025
    startTime: '11:00',
    endTime: '12:30',
    subject: 'Art',
    tutor: 'Ms. Sofia Garcia',
    status: 'scheduled',
    description: 'Watercolor painting techniques',
    color: 'bg-pink-500'
  },
  {
    id: '9',
    title: 'Economics Seminar',
    type: 'class',
    date: new Date(2025, 8, 3), // September 3, 2025
    startTime: '14:00',
    endTime: '15:30',
    subject: 'Economics',
    tutor: 'Dr. Williams',
    status: 'scheduled',
    description: 'Macroeconomics and market analysis',
    color: 'bg-green-500'
  },
  {
    id: '10',
    title: 'Tamil Literature Class',
    type: 'class',
    date: new Date(2025, 8, 4), // September 4, 2025
    startTime: '10:00',
    endTime: '11:30',
    subject: 'Tamil',
    tutor: 'Dr. Perera',
    status: 'scheduled',
    description: 'Classical Tamil poetry and prose',
    color: 'bg-indigo-500'
  },
  {
    id: '11',
    title: 'Music Theory Class',
    type: 'class',
    date: new Date(2025, 8, 4), // September 4, 2025
    startTime: '15:00',
    endTime: '16:30',
    subject: 'Music',
    tutor: 'Mr. Alessandro Rodriguez',
    status: 'scheduled',
    description: 'Introduction to harmony and composition',
    color: 'bg-purple-500'
  },
  {
    id: '12',
    title: 'Science Lab',
    type: 'class',
    date: new Date(2025, 8, 5), // September 5, 2025
    startTime: '13:00',
    endTime: '14:30',
    subject: 'Science',
    tutor: 'Dr. Amanda Foster',
    status: 'scheduled',
    description: 'Laboratory experiments and observations',
    color: 'bg-teal-500'
  }
];

export default function MyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'class'>('all');
  
  const { userProfile } = useAuth();

  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Get days in month with proper week structure
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString() &&
             (filterType === 'all' || event.type === filterType);
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handle day click
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      setShowEventModal(true);
    }
  };

  // Handle event click
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'ongoing': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - Apply blur when modal is open */}
      <div className={`transition-all duration-300 ${showEventModal ? 'blur-sm pointer-events-none' : ''}`}>
        <NavBar />
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">My Calendar</h1>
                <p className="text-blue-100">Manage your sessions and classes</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button
                  onClick={navigateToToday}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  Today
                </button>
                <div className="flex items-center bg-white/20 rounded-lg">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-4 py-2 rounded-l-lg transition-colors ${
                      viewMode === 'month' ? 'bg-white/30' : 'hover:bg-white/10'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-4 py-2 rounded-r-lg transition-colors ${
                      viewMode === 'week' ? 'bg-white/30' : 'hover:bg-white/10'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Calendar Controls */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              {/* Month Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Options */}
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Sessions</option>
                    <option value="individual">Individual</option>
                    <option value="class">Mass Class</option>
                  </select>
                </div>
                
                {/* Legend */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Individual</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Class</span>
                  </div>
                </div>
              </div>
            </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth().map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === day.toDateString();
              const dayEvents = getEventsForDate(day);

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                    !isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'bg-white'
                  } ${isToday ? 'ring-2 ring-blue-500' : ''} ${
                    isSelected ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity ${event.color}`}
                      >
                        <div className="flex items-center space-x-1">
                          {event.type === 'individual' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <BookOpen className="w-3 h-3" />
                          )}
                          <span className="truncate">{event.title}</span>
                        </div>
                        <div className="text-xs opacity-90">{event.startTime}</div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events (if multiple events) */}
        {selectedDate && getEventsForDate(selectedDate).length > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Events for {formatDate(selectedDate)}
            </h3>
            <div className="grid gap-4">
              {getEventsForDate(selectedDate).map(event => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {event.type === 'individual' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      <span>{event.subject}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* End of blurred content */}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 relative">
            <div className="relative">
              {/* Modal Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                    <p className="text-blue-100 text-sm mt-1">{selectedEvent.subject}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </span>
                </div>

                {/* Event Details */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 font-medium">Date & Time</span>
                    </div>
                    <div className="text-gray-800">
                      <div className="font-medium">{formatDate(selectedEvent.date)}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedEvent.startTime} - {selectedEvent.endTime}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Session Type</span>
                      <div className="flex items-center space-x-2">
                        {selectedEvent.type === 'individual' ? (
                          <User className="w-4 h-4 text-blue-500" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-purple-500" />
                        )}
                        <span className="font-medium capitalize">{selectedEvent.type}</span>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.tutor && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Tutor</span>
                        <span className="font-medium">{selectedEvent.tutor}</span>
                      </div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <span className="text-gray-600 font-medium">Description</span>
                      <p className="mt-1 text-gray-800">{selectedEvent.description}</p>
                    </div>
                  )}

                  {selectedEvent.meetingLink && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Meeting Link</span>
                        <a
                          href={selectedEvent.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Meeting</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6">
                  <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                  <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  {selectedEvent.status === 'scheduled' && (
                    <button className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2">
                      <Trash2 className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};