import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { broadcastApi } from './api';
import { Send, History, Users, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';

interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'tutors' | 'individual_tutors' | 'mass_tutors';
  priority: 'normal' | 'high' | 'urgent';
  createdAt: string;
  status: 'draft' | 'sent';
}

export default function Broadcast() {
  const [messages, setMessages] = useState<BroadcastMessage[]>([
    {
      id: '1',
      title: 'System Maintenance Notice',
      content: 'The platform will undergo scheduled maintenance...',
      targetAudience: 'all',
      priority: 'high',
      createdAt: '2025-09-06T10:00:00Z',
      status: 'sent'
    }
  ]);

  const [newMessage, setNewMessage] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as 'all' | 'students' | 'tutors' | 'individual_tutors' | 'mass_tutors',
    priority: 'normal' as 'normal' | 'high' | 'urgent'
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSending(true);
      
      // Call the real API
      const result = await broadcastApi.send({
        title: newMessage.title,
        content: newMessage.content,
        targetAudience: newMessage.targetAudience,
        priority: newMessage.priority,
      });

      // Update the local messages list
      const mockNewMessage: BroadcastMessage = {
        id: Date.now().toString(),
        ...newMessage,
        createdAt: new Date().toISOString(),
        status: 'sent'
      };

      setMessages([mockNewMessage, ...messages]);
      
      // Reset form
      setNewMessage({
        title: '',
        content: '',
        targetAudience: 'all',
        priority: 'normal'
      });
      
      toast.success(`Broadcast sent successfully! ${result.sent}/${result.total} recipients`);
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Failed to send broadcast message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📢 Broadcast Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Send announcements to users across the platform</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 text-center">
            <div className="text-lg font-bold text-blue-800 dark:text-blue-400">{messages.length}</div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Total Sent</div>
          </div>
        </div>
      </div>

      {/* Compose New Message */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Send className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Compose New Broadcast</h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={newMessage.title}
              onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-colors"
              placeholder="Enter broadcast title..."
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              rows={5}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-colors resize-none"
              placeholder="Enter your message..."
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This message will be sent to all selected recipients via email
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Target Audience
                </div>
              </label>
              <select
                id="targetAudience"
                value={newMessage.targetAudience}
                onChange={(e) => setNewMessage({ ...newMessage, targetAudience: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-colors"
              >
                <option value="all">👥 All Users</option>
                <option value="students">🎓 Students Only</option>
                <option value="tutors">👨‍🏫 All Tutors</option>
                <option value="individual_tutors">👤 Individual Tutors Only</option>
                <option value="mass_tutors">👥 Mass Tutors Only</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Priority Level
                </div>
              </label>
              <select
                id="priority"
                value={newMessage.priority}
                onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-colors"
              >
                <option value="normal">📢 Normal</option>
                <option value="high">⚠️ High Priority</option>
                <option value="urgent">🚨 Urgent</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-blue-500/30 dark:shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-500/40 dark:hover:shadow-blue-900/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Broadcast...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Broadcast Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Message History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <History className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Broadcast History</h2>
          </div>
        </div>

        <div className="p-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <History className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No broadcasts sent yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your broadcast history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md dark:hover:shadow-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 bg-gray-50 dark:bg-gray-900/50"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{message.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                        message.priority === 'urgent' 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800' :
                        message.priority === 'high' 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
                      }`}>
                        {message.priority === 'urgent' && '🚨'}
                        {message.priority === 'high' && '⚠️'}
                        {message.priority === 'normal' && '📢'}
                        {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <Users className="w-3 h-3" />
                        {message.targetAudience === 'all' ? 'All Users' :
                         message.targetAudience === 'students' ? 'Students' :
                         message.targetAudience === 'tutors' ? 'All Tutors' :
                         message.targetAudience === 'individual_tutors' ? 'Individual Tutors' :
                         'Mass Tutors'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                        <CheckCircle2 className="w-3 h-3" />
                        {message.status === 'sent' ? 'Sent' : 'Draft'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Sent on {new Date(message.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
