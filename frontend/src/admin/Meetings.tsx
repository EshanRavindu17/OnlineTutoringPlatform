import { useState, useEffect } from 'react';
import { adminApi } from './api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  fullId: string;
  name: string;
  email: string;
  role: string;
  photo_url: string | null;
}

interface AdminSession {
  id: string;
  name: string;
  description: string | null;
  host_url: string;
  join_url: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'canceled';
  receiver_email: string | null;
  receiver: {
    name: string;
    email: string;
    role: string;
  } | null;
  created_by: {
    name: string;
    email: string;
  };
  created_at: string;
}

export default function Meetings() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Meeting Form
  const [meetingForm, setMeetingForm] = useState({
    name: '',
    description: '',
    topic: '',
    startTime: '',
    duration: 60,
  });

  // Email Form
  const [emailForm, setEmailForm] = useState({
    sessionId: '',
    recipientEmail: '',
    recipientName: '',
    subject: '',
    message: '',
    meetingUrl: '',
  });

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<any>(null);

  useEffect(() => {
    if (activeTab === 'create') {
      loadUsers();
    } else {
      loadSessions();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response.users);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAdminSessions(false);
      setSessions(response.sessions);
    } catch (error: any) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meetingForm.name || !meetingForm.topic || !meetingForm.startTime || !meetingForm.duration) {
      toast.error('Please fill all required fields');
      return;
    }

    const loadingToast = toast.loading('Creating Zoom meeting...');
    try {
      const response = await adminApi.createAdminMeeting(meetingForm);
      toast.success('Meeting created successfully!', { id: loadingToast });
      setCreatedMeeting(response.meeting);
      
      // Reset form
      setMeetingForm({
        name: '',
        description: '',
        topic: '',
        startTime: '',
        duration: 60,
      });

      toast.success('Now you can send the meeting link via email!');
    } catch (error: any) {
      console.error('Failed to create meeting:', error);
      toast.error(error.message || 'Failed to create meeting', { id: loadingToast });
    }
  };

  const handleSendEmail = (user: User) => {
    if (!createdMeeting) {
      toast.error('Please create a meeting first');
      return;
    }

    setEmailForm({
      sessionId: createdMeeting.session_id,
      recipientEmail: user.email,
      recipientName: user.name,
      subject: meetingForm.topic || 'Meeting Invitation',
      message: `You are invited to join a meeting.\n\nMeeting: ${meetingForm.name}\n${meetingForm.description ? `Description: ${meetingForm.description}\n` : ''}\nPlease join at the scheduled time.`,
      meetingUrl: createdMeeting.join_url,
    });
    setShowEmailModal(true);
  };

  const handleSendEmailSubmit = async () => {
    if (!emailForm.subject || !emailForm.message) {
      toast.error('Please fill subject and message');
      return;
    }

    const loadingToast = toast.loading('Sending email...');
    try {
      await adminApi.sendMeetingEmail(emailForm);
      toast.success(`Email sent to ${emailForm.recipientName}!`, { id: loadingToast });
      setShowEmailModal(false);
      setEmailForm({
        sessionId: '',
        recipientEmail: '',
        recipientName: '',
        subject: '',
        message: '',
        meetingUrl: '',
      });
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toast.error(error.message || 'Failed to send email', { id: loadingToast });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      await adminApi.deleteAdminSession(sessionId);
      toast.success('Session deleted');
      loadSessions();
    } catch (error: any) {
      console.error('Failed to delete session:', error);
      toast.error(error.message || 'Failed to delete session');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      canceled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Student: 'bg-blue-50 text-blue-700',
      Individual: 'bg-green-50 text-green-700',
      Mass: 'bg-purple-50 text-purple-700',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[role] || 'bg-gray-50 text-gray-700'}`}>
        {role}
      </span>
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create & Send Meetings</h1>
        <p className="text-gray-600 mt-1">Create Zoom meetings and email them to users</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Meeting
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Meeting History ({sessions.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'create' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Meeting Form */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">1. Create Zoom Meeting</h2>
                <form onSubmit={handleCreateMeeting} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={meetingForm.name}
                      onChange={(e) => setMeetingForm({ ...meetingForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Weekly Team Meeting"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zoom Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={meetingForm.topic}
                      onChange={(e) => setMeetingForm({ ...meetingForm, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Meeting topic for Zoom"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={meetingForm.description}
                      onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Optional description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={meetingForm.startTime}
                      onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={meetingForm.duration}
                      onChange={(e) => setMeetingForm({ ...meetingForm, duration: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="15"
                      max="300"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    🎥 Create Zoom Meeting
                  </button>
                </form>

                {createdMeeting && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Meeting Created!</h3>
                    <div className="space-y-1 text-sm text-green-800">
                      <p><strong>Name:</strong> {createdMeeting.name}</p>
                      <p><strong>Host URL:</strong> <a href={createdMeeting.host_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">{createdMeeting.host_url}</a></p>
                      <p><strong>Join URL:</strong> <a href={createdMeeting.join_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block">{createdMeeting.join_url}</a></p>
                    </div>
                  </div>
                )}
              </div>

              {/* Select Recipients */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">2. Send to Users</h2>
                
                {!createdMeeting && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">Create a meeting first to send invitations</p>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.fullId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">{user.name}</p>
                              {getRoleBadge(user.role)}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            <p className="text-xs text-gray-400">ID: {user.id}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSendEmail(user)}
                          disabled={!createdMeeting}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
                            createdMeeting
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          📧 Send Email
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Meeting History */
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No meetings created yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{session.name}</h3>
                            {getStatusBadge(session.status)}
                          </div>
                          {session.description && (
                            <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                          )}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Created by:</p>
                              <p className="font-medium">{session.created_by.name}</p>
                            </div>
                            {session.receiver && (
                              <div>
                                <p className="text-gray-500">Sent to:</p>
                                <p className="font-medium">{session.receiver.name} ({session.receiver.role})</p>
                              </div>
                            )}
                            <div>
                              <p className="text-gray-500">Created:</p>
                              <p className="font-medium">{new Date(session.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <a
                              href={session.host_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Host URL
                            </a>
                            <span className="text-gray-300">|</span>
                            <a
                              href={session.join_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Join URL
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2"
                          title="Delete session"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Send Meeting Invitation</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>To:</strong> {emailForm.recipientName} ({emailForm.recipientEmail})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Meeting subject"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={8}
                  placeholder="Your message to the recipient"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Meeting URL (will be included in email):</p>
                <p className="text-sm font-mono text-gray-800 truncate">{emailForm.meetingUrl}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmailSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  📧 Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
