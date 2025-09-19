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
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/authContext';
import { getAllSessionsByStudentId, getEnrolledClassesByStudentId, getStudentIDByUserID, Session, EnrolledClass, cancelSession } from '../../api/Student';

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
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'canceled';
  meetingLink?: string;
  description?: string;
  color: string;
  createdAt: Date; // Added to track when the session was created
}

export default function MyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'class'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  const { userProfile } = useAuth();

  // Fetch sessions and classes data
  useEffect(() => {
    fetchCalendarData();
  }, [userProfile]);

  const fetchCalendarData = async () => {
    if (!userProfile?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Get student ID from user ID
      const studentId = await getStudentIDByUserID(userProfile.id);
      
      if (!studentId) {
        console.log('No student_id found for user:', userProfile.id);
        setEvents([]);
        setLoading(false);
        return;
      }

      // Fetch both individual sessions and enrolled classes
      const [sessionsData, classesData] = await Promise.all([
        getAllSessionsByStudentId(studentId).catch(err => {
          console.error('Failed to fetch sessions:', err);
          return [];
        }),
        getEnrolledClassesByStudentId(studentId).catch(err => {
          console.error('Failed to fetch enrolled classes:', err);
          return [];
        })
      ]);

      console.log('Fetched sessions:', sessionsData);

      // Transform sessions and classes to CalendarEvent format
      const transformedEvents = [
        ...transformSessionsToEvents(sessionsData),
        ...transformClassesToEvents(classesData)
      ];

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  // Transform individual sessions to calendar events
  const transformSessionsToEvents = (sessions: Session[]): CalendarEvent[] => {
    return sessions.map(session => ({
      id: session.session_id,
      title: session.title || `${session.Individual_Tutor?.Course?.course_name || 'Session'} with ${session.Individual_Tutor?.User?.name}`,
      type: 'individual' as const,
      date: new Date(session.date),
      startTime: session.slots[0] ? new Date(session.slots[0]).toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false, 
        timeZone:'UTC'
      }) : '00:00',
      // endTime: session.slots[session.slots.length - 1] ? new Date(session.slots[session.slots.length - 1]).toLocaleTimeString('en-US', {
      //   hour: '2-digit', 
      //   minute: '2-digit', 
      //   hour12: false 
      // }) : '01:00',
      endTime: session.slots[session.slots.length - 1] ? new Date(new Date(session.slots[0]).getTime() + session.slots.length * 60 * 60 * 1000).toLocaleTimeString('en-US', {
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false,
        timeZone:'UTC'
      }) : '01:00',
      subject: session.Individual_Tutor?.Course?.course_name || 'Individual Session',
      tutor: session.Individual_Tutor?.User?.name || 'Tutor',
      status: session.status === 'canceled' ? 'cancelled' : session.status, // Fix status mapping
      meetingLink: session.meeting_urls?.[0] || undefined,
      description: `Individual tutoring session for ${session.Individual_Tutor?.Course?.course_name || 'subject'}`,
      color: 'bg-blue-500',
      createdAt: new Date(session.created_at)
    }));
  };

  // Transform enrolled classes to calendar events  
  const transformClassesToEvents = (classes: EnrolledClass[]): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    
    classes.forEach(classItem => {
      // For enrolled classes, we need to generate recurring events based on schedule
      // This is a simplified approach - you might need more complex scheduling logic
      const startDate = new Date(classItem.start_date);
      const endDate = new Date(classItem.end_date);
      
      // Generate weekly events (assuming weekly schedule)
      let currentDate = new Date(startDate);
      let eventCounter = 0;
      
      while (currentDate <= endDate && eventCounter < 20) { // Limit to 20 events to prevent infinite loop
        events.push({
          id: `${classItem.class_id}-${eventCounter}`,
          title: classItem.class_name,
          type: 'class' as const,
          date: new Date(currentDate),
          startTime: '10:00', // Default time - you might need to parse this from schedule
          endTime: '12:00',   // Default duration based on classItem.duration
          subject: classItem.subject,
          tutor: 'Class Instructor', // You might need to get this from another API
          status: 'scheduled' as const,
          meetingLink: classItem.meeting_link,
          description: classItem.description,
          color: 'bg-purple-500',
          createdAt: new Date(classItem.enrollment_date)
        });
        
        // Move to next week (simplified weekly schedule)
        currentDate.setDate(currentDate.getDate() + 7);
        eventCounter++;
      }
    });
    
    return events;
  };

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

  // Handle session cancellation
  const handleCancelSession = async (sessionId: string) => {
    try {
      // You can add the cancel session API call here
      await cancelSession(sessionId);
      
      // For now, just update the local state
      setEvents(prev => prev.map(event => 
        event.id === sessionId 
          ? { ...event, status: 'cancelled' as const }
          : event
      ));
      
      // Update selected event if it's the one being cancelled
      if (selectedEvent?.id === sessionId) {
        setSelectedEvent({ ...selectedEvent, status: 'cancelled' });
      }
      
      alert('Session cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel session:', error);
      alert('Failed to cancel session. Please try again.');
    }
  };

  // Refresh calendar data
  const handleRefresh = () => {
    fetchCalendarData();
  };

  // Check if individual session can be cancelled (within 1 hour of creation)
  const canCancelSession = (event: CalendarEvent) => {
    if (event.type !== 'individual' || event.status !== 'scheduled') return false;
    const now = new Date();
    const createdAt = new Date(event.createdAt);
    const timeDiff = now.getTime() - createdAt.getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    return timeDiff <= oneHour;
  };

  // Check if meeting link should be visible (15 minutes before session starts)
  const canJoinMeeting = (event: CalendarEvent) => {
    if (!event.meetingLink || event.status === 'cancelled' || event.status === 'completed' ) return false;
    if(event.status === 'canceled') return false; // handle typo case
    
    const now = new Date();
    const sessionDate = new Date(event.date);

    const today = new Date().getDate();
    console.log("Today's Date:", now);
    console.log("Session Date:", sessionDate);

    if(now < sessionDate){
      console.log("Session is in the future");
      return false;
    }

    
    // Parse start time and create full datetime
    const [hours, minutes] = event.startTime.split(':').map(Number);
    const sessionDateTime = new Date(sessionDate);
    sessionDateTime.setHours(hours, minutes, 0, 0);
    
    
    // Check if current time is within 15 minutes before session start or after session has started
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    console.log("15 minutes:", fifteenMinutes);
    const timeDiff = sessionDateTime.getTime() - now.getTime();
    console.log("Time Difference:", timeDiff);

    
    // Show link if less than 15 minutes before start time or session has already started
    return timeDiff <= fifteenMinutes;
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
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
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
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Meeting Ready</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Can Cancel</span>
                  </div>
                </div>
              </div>
            </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mr-4"></div>
              <span className="text-gray-600">Loading your sessions...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">{error}</p>
              </div>
              <button 
                onClick={fetchCalendarData}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
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
                        className={`text-xs p-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity relative ${event.color}`}
                      >
                        <div className="flex items-center space-x-1">
                          {event.type === 'individual' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <BookOpen className="w-3 h-3" />
                          )}
                          <span className="truncate">{event.title}</span>
                          <div className="ml-auto flex items-center space-x-1 flex-shrink-0">
                            {/* Show indicator for cancellable individual sessions */}
                            {event.type === 'individual' && canCancelSession(event) && (
                              <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Can be cancelled"></div>
                            )}
                            {/* Show indicator when meeting is available to join */}
                            {event.meetingLink && canJoinMeeting(event) && (
                              <div className="w-2 h-2 bg-green-400 rounded-full" title="Meeting available"></div>
                            )}
                          </div>
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
          )}
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
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-800">{event.title}</h4>
                      {/* Show indicator for cancellable individual sessions */}
                      {event.type === 'individual' && canCancelSession(event) && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Can be cancelled"></div>
                      )}
                      {/* Show indicator when meeting is available to join */}
                      {event.meetingLink && canJoinMeeting(event) && (
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="Meeting available"></div>
                      )}
                    </div>
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
                        {canJoinMeeting(selectedEvent) ? (
                          <a
                            href={selectedEvent.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Meeting</span>
                          </a>
                        ) : (
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Video className="w-4 h-4" />
                            <span>Available 15 min before session</span>
                          </div>
                        )}
                      </div>
                      {!canJoinMeeting(selectedEvent) && (
                        <div className="mt-2 text-xs text-gray-500">
                          Meeting link will be available 15 minutes before the session starts
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 mt-6">
                  {selectedEvent.type === 'individual' ? (
                    // Individual Session Buttons
                    <>
                      {canCancelSession(selectedEvent) ? (
                        <button 
                          onClick={() => handleCancelSession(selectedEvent.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Cancel Session</span>
                        </button>
                      ) : (
                        <div className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed">
                          <span>Cannot cancel (created over 1 hour ago)</span>
                        </div>
                      )}
                    </>
                  ) : (
                    // Mass Class Buttons
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>View Class</span>
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