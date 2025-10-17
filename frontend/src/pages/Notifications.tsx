import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Clock,
  User,
  BookOpen,
  Calendar,
  Video,
  MessageCircle,
  Star,
  CheckCircle,
  X,
  Filter,
  Search,
  Trash2,
  MoreVertical,
  AlertCircle,
  Users,
  Award,
  FileText,
  ChevronRight,
  Check,
  Sparkles
} from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/authContext';

interface Notification {
  id: string;
  type: 'class_reminder' | 'class_cancelled' | 'class_rescheduled' | 'new_material' | 'assignment_due' | 'message' | 'rating_request' | 'announcement' | 'payment_reminder';
  title: string;
  message: string;
  tutorName: string;
  tutorAvatar?: string;
  tutorId: string;
  className?: string;
  classId?: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export default function NotificationPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  // State management
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'important' | 'today'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);

  // Mock data - this would come from API
  const mockNotifications: Notification[] = [
    {
      id: 'notif-1',
      type: 'class_reminder',
      title: 'Class Starting Soon',
      message: 'Your Advanced Mathematics class starts in 30 minutes. Don\'t forget to join!',
      tutorName: 'Dr. Sarah Johnson',
      tutorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center',
      tutorId: 'tutor-1',
      className: 'Advanced Mathematics Masterclass',
      classId: 'class-1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
      isImportant: true,
      actionUrl: '/student/join-class/class-1',
      actionLabel: 'Join Class'
    },
    {
      id: 'notif-2',
      type: 'new_material',
      title: 'New Study Material Uploaded',
      message: 'Dr. Johnson has uploaded new practice problems for today\'s calculus session.',
      tutorName: 'Dr. Sarah Johnson',
      tutorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center',
      tutorId: 'tutor-1',
      className: 'Advanced Mathematics Masterclass',
      classId: 'class-1',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isImportant: false,
      actionUrl: '/student/class-materials/class-1',
      actionLabel: 'View Materials'
    },
    {
      id: 'notif-3',
      type: 'class_cancelled',
      title: 'Class Cancelled',
      message: 'Unfortunately, today\'s Physics class has been cancelled due to technical issues. It will be rescheduled.',
      tutorName: 'Prof. Michael Chen',
      tutorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=center',
      tutorId: 'tutor-2',
      className: 'Physics Fundamentals',
      classId: 'class-2',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isImportant: true,
      actionUrl: '/student/reschedule/class-2',
      actionLabel: 'Reschedule'
    },
    {
      id: 'notif-4',
      type: 'assignment_due',
      title: 'Assignment Due Tomorrow',
      message: 'Reminder: Your calculus assignment is due tomorrow at 11:59 PM.',
      tutorName: 'Dr. Sarah Johnson',
      tutorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center',
      tutorId: 'tutor-1',
      className: 'Advanced Mathematics Masterclass',
      classId: 'class-1',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isImportant: false,
      actionUrl: '/student/assignments/assignment-1',
      actionLabel: 'Submit Assignment'
    },
    {
      id: 'notif-5',
      type: 'message',
      title: 'New Message',
      message: 'You have a new message regarding your progress in the chemistry class.',
      tutorName: 'Dr. Emily Watson',
      tutorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=center',
      tutorId: 'tutor-3',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isImportant: false,
      actionUrl: '/student/messages/tutor-3',
      actionLabel: 'Read Message'
    },
    {
      id: 'notif-6',
      type: 'rating_request',
      title: 'Rate Your Recent Class',
      message: 'How was your experience in yesterday\'s Advanced Mathematics class? Your feedback helps us improve.',
      tutorName: 'Dr. Sarah Johnson',
      tutorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center',
      tutorId: 'tutor-1',
      className: 'Advanced Mathematics Masterclass',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      isImportant: false,
      actionUrl: '/student/rate-class/class-1',
      actionLabel: 'Rate Class'
    },
    {
      id: 'notif-7',
      type: 'announcement',
      title: 'Important Announcement',
      message: 'New study groups have been formed for the upcoming midterm exams. Join now to study with your peers!',
      tutorName: 'Academic Coordinator',
      tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center',
      tutorId: 'admin-1',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      isImportant: true,
      actionUrl: '/student/study-groups',
      actionLabel: 'View Study Groups'
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
  }, []);

  // Filter notifications
  useEffect(() => {
    let filtered = notifications;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(notif =>
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.tutorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(notif => !notif.isRead);
        break;
      case 'important':
        filtered = filtered.filter(notif => notif.isImportant);
        break;
      case 'today':
        const today = new Date().toDateString();
        filtered = filtered.filter(notif => new Date(notif.timestamp).toDateString() === today);
        break;
      default:
        break;
    }

    setFilteredNotifications(filtered);
  }, [notifications, selectedFilter, searchQuery]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'class_reminder':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'class_cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      case 'class_rescheduled':
        return <Calendar className="w-5 h-5 text-orange-600" />;
      case 'new_material':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'assignment_due':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'rating_request':
        return <Star className="w-5 h-5 text-yellow-600" />;
      case 'announcement':
        return <AlertCircle className="w-5 h-5 text-indigo-600" />;
      case 'payment_reminder':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'class_reminder':
        return 'bg-blue-50';
      case 'class_cancelled':
        return 'bg-red-50';
      case 'class_rescheduled':
        return 'bg-orange-50';
      case 'new_material':
        return 'bg-green-50';
      case 'assignment_due':
        return 'bg-purple-50';
      case 'message':
        return 'bg-blue-50';
      case 'rating_request':
        return 'bg-yellow-50';
      case 'announcement':
        return 'bg-indigo-50';
      case 'payment_reminder':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return notifTime.toLocaleDateString();
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
  };

  const deleteSelectedNotifications = () => {
    setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
    setSelectedNotifications([]);
    setShowActions(false);
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <NavBar />
      
      {/* Hero Header - Matching Welcome Page Style */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-400/20 rounded-full blur-lg animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              {unreadCount > 0 && (
                <>
                  <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                  <span className="text-sm font-medium">{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</span>
                </>
              )}
              {unreadCount === 0 && (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">All caught up!</span>
                </>
              )}
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Bell className="w-12 h-12 md:w-16 md:h-16" />
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Notifications
                </h1>
              </div>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                Stay updated with your learning journey and never miss important updates
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <div className="text-2xl font-bold">{notifications.length}</div>
                <div className="text-sm text-blue-100">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <div className="text-2xl font-bold">{unreadCount}</div>
                <div className="text-sm text-blue-100">Unread</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <div className="text-2xl font-bold">{notifications.filter(n => n.isImportant).length}</div>
                <div className="text-sm text-blue-100">Important</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/40 shadow-lg sticky top-8">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Filters
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all"
                  />
                </div>
              </div>

              {/* Filter Categories */}
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'All Notifications', count: notifications.length, icon: Bell },
                  { key: 'unread', label: 'Unread', count: unreadCount, icon: Sparkles },
                  { key: 'important', label: 'Important', count: notifications.filter(n => n.isImportant).length, icon: AlertCircle },
                  { key: 'today', label: 'Today', count: notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length, icon: Clock }
                ].map((filter) => {
                  const IconComponent = filter.icon;
                  return (
                    <button
                      key={filter.key}
                      onClick={() => setSelectedFilter(filter.key as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group ${
                        selectedFilter === filter.key
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-4 h-4 ${selectedFilter === filter.key ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'}`} />
                        <span className="font-medium">{filter.label}</span>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        selectedFilter === filter.key 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark All as Read
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1">
            {/* Actions Bar */}
            {selectedNotifications.length > 0 && (
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-2xl p-4 mb-6 shadow-lg animate-in slide-in-from-top">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={toggleSelectAll}
                      className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-purple-800 font-semibold">
                      {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={deleteSelectedNotifications}
                      className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedNotifications([])}
                      className="text-gray-600 hover:text-gray-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/40 shadow-lg">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No notifications found</h3>
                  <p className="text-gray-600 text-lg mb-6">
                    {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up! Check back later for updates.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`group bg-white/80 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                      !notification.isRead 
                        ? 'border-l-8 border-l-purple-500 shadow-lg' 
                        : 'border-gray-200 hover:border-purple-200'
                    } ${
                      selectedNotifications.includes(notification.id) ? 'ring-4 ring-purple-300 shadow-xl' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleNotificationSelection(notification.id)}
                          className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5 cursor-pointer"
                        />

                        {/* Icon with Background */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${getNotificationBgColor(notification.type)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`font-bold text-lg ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {notification.isImportant && (
                                <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-md">
                                  <Sparkles className="w-3 h-3" />
                                  Important
                                </span>
                              )}
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg"
                                title="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className={`text-sm mb-3 ${!notification.isRead ? 'text-gray-700 font-medium' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                              {/* Tutor Avatar */}
                              {notification.tutorAvatar && (
                                <img
                                  src={notification.tutorAvatar}
                                  alt={notification.tutorName}
                                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                                />
                              )}
                              <div className="text-sm">
                                <span className="text-gray-600">From: </span>
                                <span className="font-semibold text-gray-900">{notification.tutorName}</span>
                                {notification.className && (
                                  <>
                                    <span className="text-gray-400 mx-2">•</span>
                                    <span className="text-purple-600 font-medium">{notification.className}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-purple-600 hover:text-purple-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-4 h-4" />
                                  Mark as read
                                </button>
                              )}
                              {notification.actionUrl && (
                                <button
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    navigate(notification.actionUrl!);
                                  }}
                                  className="group/btn bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                  {notification.actionLabel}
                                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Load More Button */}
            {filteredNotifications.length >= 10 && (
              <div className="text-center mt-8">
                <button className="group bg-white/80 backdrop-blur-sm border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl hover:bg-white hover:border-purple-300 hover:shadow-lg transition-all duration-300 font-semibold flex items-center gap-2 mx-auto transform hover:scale-105">
                  Load More Notifications
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
