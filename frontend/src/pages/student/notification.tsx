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
  FileText
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Notification {
  id: string;
  type: 'class_reminder' | 'class_cancelled' | 'class_rescheduled' | 'new_material' | 'assignment_due' | 'message' | 'rating_request' | 'announcement' | 'payment_reminder';
  title: string;
  message: string;
  tutorName: string;
  tutorAvatar: string;
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
      timestamp: '2025-09-07T17:30:00Z',
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
      timestamp: '2025-09-07T14:20:00Z',
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
      timestamp: '2025-09-07T10:15:00Z',
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
      timestamp: '2025-09-06T09:00:00Z',
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
      timestamp: '2025-09-06T16:45:00Z',
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
      timestamp: '2025-09-06T08:00:00Z',
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
      timestamp: '2025-09-05T12:00:00Z',
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

  const unreadCount = notifications.filter(notif => !notif.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600">Stay updated with your learning journey</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  {unreadCount} unread
                </div>
              )}
              <button
                onClick={markAllAsRead}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Categories */}
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'All Notifications', count: notifications.length },
                  { key: 'unread', label: 'Unread', count: unreadCount },
                  { key: 'important', label: 'Important', count: notifications.filter(n => n.isImportant).length },
                  { key: 'today', label: 'Today', count: notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedFilter(filter.key as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedFilter === filter.key
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className="text-sm text-gray-500">{filter.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1">
            {/* Actions Bar */}
            {selectedNotifications.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-purple-700 font-medium">
                    {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={deleteSelectedNotifications}
                      className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedNotifications([])}
                      className="text-gray-600 hover:text-gray-700 font-medium text-sm"
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
                <div className="bg-white rounded-xl p-8 text-center border">
                  <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md ${
                      !notification.isRead ? 'border-l-4 border-l-purple-500' : ''
                    } ${
                      selectedNotifications.includes(notification.id) ? 'ring-2 ring-purple-300' : ''
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleNotificationSelection(notification.id)}
                          className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />

                        {/* Tutor Avatar */}
                        <img
                          src={notification.tutorAvatar}
                          alt={notification.tutorName}
                          className="w-12 h-12 rounded-full object-cover"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 mb-1">
                              {getNotificationIcon(notification.type)}
                              <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {notification.isImportant && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                                  Important
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">{formatTimestamp(notification.timestamp)}</span>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className={`text-sm mb-2 ${!notification.isRead ? 'text-gray-700' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>From: {notification.tutorName}</span>
                              {notification.className && (
                                <>
                                  <span>•</span>
                                  <span>{notification.className}</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                                >
                                  Mark as read
                                </button>
                              )}
                              {notification.actionUrl && (
                                <button
                                  onClick={() => {
                                    markAsRead(notification.id);
                                    navigate(notification.actionUrl!);
                                  }}
                                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                                >
                                  {notification.actionLabel}
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

            {/* Load More Button (if needed) */}
            {filteredNotifications.length >= 10 && (
              <div className="text-center mt-8">
                <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Load More Notifications
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
