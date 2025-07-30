import React, { useState } from 'react';
import { Calendar, Clock, Video, Users, X, Plus, PlayCircle, FileText, Star, ChevronRight, Bell, Settings, Search, Filter } from 'lucide-react';

const OnlineMeetingSystem = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data
  const upcomingMeetings = [
    {
      id: 'mtg-1',
      title: 'Calculus Tutoring Session',
      date: '2025-05-22',
      time: '15:30',
      duration: 60,
      studentName: 'Alex Johnson',
      subject: 'Calculus',
      meetingLink: 'https://tutorplatform.zoom.us/j/123456789',
      meetingId: '123 456 789',
      passcode: '123456',
      status: 'confirmed',
      studentAvatar: 'AJ',
      priority: 'high'
    },
    {
      id: 'mtg-2',
      title: 'English Literature Review',
      date: '2025-05-23',
      time: '14:00',
      duration: 45,
      studentName: 'Maria Garcia',
      subject: 'English',
      meetingLink: 'https://tutorplatform.zoom.us/j/987654321',
      meetingId: '987 654 321',
      passcode: '654321',
      status: 'pending',
      studentAvatar: 'MG',
      priority: 'medium'
    }
  ];
  
  const pastMeetings = [
    {
      id: 'mtg-past-1',
      title: 'Physics Problem Solving',
      date: '2025-05-18',
      time: '16:00',
      duration: 60,
      studentName: 'James Wilson',
      subject: 'Physics',
      recording: 'https://tutorplatform.zoom.us/rec/123',
      rating: 5,
      studentAvatar: 'JW',
      completed: true
    },
    {
      id: 'mtg-past-2',
      title: 'SAT Math Prep',
      date: '2025-05-15',
      time: '15:00',
      duration: 90,
      studentName: 'Emma Davis',
      subject: 'SAT/ACT Math',
      recording: 'https://tutorplatform.zoom.us/rec/456',
      rating: 4,
      studentAvatar: 'ED',
      completed: true
    }
  ];
  
  // For the scheduling form
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    studentEmail: '',
    subject: '',
    description: ''
  });
  
  const handleInputChange = (field, value) => {
    setNewMeeting(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const scheduleNewMeeting = () => {
    console.log('New meeting scheduled:', newMeeting);
    alert('Meeting scheduled successfully! Notifications have been sent to the student.');
    setShowScheduleModal(false);
    setNewMeeting({
      title: '',
      date: '',
      time: '',
      duration: 60,
      studentEmail: '',
      subject: '',
      description: ''
    });
  };
  
  const startMeeting = (meetingId) => {
    console.log(`Starting meeting: ${meetingId}`);
    window.open(`https://tutorplatform.zoom.us/j/${meetingId.replace(/\s/g, '')}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };
  
  const renderUpcomingMeetings = () => (
    <div className="space-y-4">
      {upcomingMeetings.map(meeting => (
        <div key={meeting.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${getPriorityColor(meeting.priority)} hover:shadow-md transition-all duration-200 overflow-hidden`}>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {meeting.studentAvatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{meeting.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">with {meeting.studentName}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">
                        {new Date(meeting.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">
                        {meeting.time} - {getEndTime(meeting.time, meeting.duration)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Video className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="font-medium">{meeting.duration} min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-3">
                <button 
                  onClick={() => startMeeting(meeting.meetingId)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Start Session</span>
                </button>
                
                <div className="text-right text-xs text-gray-500 space-y-1">
                  <div>ID: <span className="font-mono">{meeting.meetingId}</span></div>
                  <div>Code: <span className="font-mono">{meeting.passcode}</span></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {meeting.subject}
                </span>
                <span>Meeting ID: {meeting.meetingId}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {upcomingMeetings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
          <p className="text-gray-500 mb-6">Schedule your first session to get started</p>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Schedule Session
          </button>
        </div>
      )}
    </div>
  );
  
  const renderPastMeetings = () => (
    <div className="space-y-4">
      {pastMeetings.map(meeting => (
        <div key={meeting.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {meeting.studentAvatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{meeting.title}</h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < meeting.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">with {meeting.studentName}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">
                        {new Date(meeting.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      <span className="font-medium">
                        {meeting.time} - {getEndTime(meeting.time, meeting.duration)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Video className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="font-medium">{meeting.duration} min</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-3">
                <a 
                  href={meeting.recording} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center space-x-2 shadow-md"
                >
                  <FileText className="h-4 w-4" />
                  <span>View Recording</span>
                </a>
                
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                  Completed
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {meeting.subject}
                </span>
                <span>Session Rating: {meeting.rating}/5</span>
              </div>
              <div className="text-xs text-gray-500">
                Session completed successfully
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {pastMeetings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No past sessions</h3>
          <p className="text-gray-500">Your completed sessions will appear here</p>
        </div>
      )}
    </div>
  );
  
  // Helper function to calculate end time
  const getEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.getHours().toString().padStart(2, '0') + ':' + 
           endDate.getMinutes().toString().padStart(2, '0');
  };
  
  const renderScheduleModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Schedule New Session</h2>
              <p className="text-gray-600 text-sm mt-1">Create a new tutoring session with your student</p>
            </div>
            <button 
              onClick={() => setShowScheduleModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Title *
              </label>
              <input
                type="text"
                value={newMeeting.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Calculus Tutoring Session"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={newMeeting.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={newMeeting.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>
              <select
                value={newMeeting.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={newMeeting.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select a subject</option>
                <option value="Algebra">Algebra</option>
                <option value="Geometry">Geometry</option>
                <option value="Calculus">Calculus</option>
                <option value="Statistics">Statistics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Computer Science">Computer Science</option>
                <option value="SAT/ACT Math">SAT/ACT Math</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Email *
              </label>
              <input
                type="email"
                value={newMeeting.studentEmail}
                onChange={(e) => handleInputChange('studentEmail', e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="student@example.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Session Description
              </label>
              <textarea
                value={newMeeting.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none"
                placeholder="Outline what you'll cover in this session..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={scheduleNewMeeting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Online Sessions</h1>
              <p className="text-gray-600">Manage your tutoring sessions and connect with students</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md"
              >
                <Plus className="h-5 w-5" />
                <span>Schedule Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingMeetings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{pastMeetings.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.5</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Upcoming Sessions</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {upcomingMeetings.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                  activeTab === 'past'
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Past Sessions</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                    {pastMeetings.length}
                  </span>
                </div>
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'upcoming' && renderUpcomingMeetings()}
            {activeTab === 'past' && renderPastMeetings()}
          </div>
        </div>
      </div>
      
      {showScheduleModal && renderScheduleModal()}
    </div>
  );
};

export default OnlineMeetingSystem;