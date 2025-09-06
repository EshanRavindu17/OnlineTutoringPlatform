import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'tutors';
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
    targetAudience: 'all',
    priority: 'normal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // TODO: Implement API call to send broadcast
      const mockNewMessage: BroadcastMessage = {
        id: Date.now().toString(),
        ...newMessage,
        createdAt: new Date().toISOString(),
        status: 'sent'
      } as BroadcastMessage;

      setMessages([mockNewMessage, ...messages]);
      setNewMessage({
        title: '',
        content: '',
        targetAudience: 'all',
        priority: 'normal'
      });
      toast.success('Broadcast message sent successfully!');
    } catch (error) {
      toast.error('Failed to send broadcast message');
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Compose New Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Compose New Broadcast</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={newMessage.title}
              onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Message Content
            </label>
            <textarea
              id="content"
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <select
                id="targetAudience"
                value={newMessage.targetAudience}
                onChange={(e) => setNewMessage({ ...newMessage, targetAudience: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="tutors">Tutors Only</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={newMessage.priority}
                onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value as any })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send Broadcast
          </button>
        </form>
      </div>

      {/* Message History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Broadcast History</h2>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{message.title}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      message.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      message.priority === 'high' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {message.targetAudience === 'all' ? 'All Users' :
                       message.targetAudience === 'students' ? 'Students' : 'Tutors'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{message.content}</p>
                <div className="text-sm text-gray-500">
                  Sent on {new Date(message.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
