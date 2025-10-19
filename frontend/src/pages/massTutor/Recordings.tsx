import React, { useEffect, useState } from 'react';
import { CalendarDays, Video, Trash2, Loader2, ExternalLink, Play } from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface Recording {
  recording_id: string;
  name: string;
  url: string;
  slot_id: string;
  class_id: string;
  class_title: string;
  class_subject: string;
  slot_date: Date;
  uploaded_at: Date;
}

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await massTutorAPI.getAllRecordings();
      setRecordings(data);
    } catch (error: any) {
      console.error('Error fetching recordings:', error);
      toast.error('Failed to fetch recordings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recording: Recording) => {
    if (!window.confirm(`Are you sure you want to delete "${recording.name}"?`)) {
      return;
    }

    try {
      setDeleting(recording.recording_id);
      await massTutorAPI.deleteRecording(recording.slot_id);
      toast.success('Recording deleted successfully');
      fetchRecordings();
    } catch (error: any) {
      console.error('Error deleting recording:', error);
      toast.error(error.response?.data?.error || 'Failed to delete recording');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRecordings = recordings.filter(
    (recording) =>
      recording.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.class_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recording.class_subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recordings</h2>
        <p className="text-gray-500 mt-1">View and manage all uploaded session recordings</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search recordings by name, class, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading recordings...</p>
          </div>
        </div>
      ) : filteredRecordings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-1">
            {searchQuery ? 'No recordings found' : 'No recordings uploaded yet'}
          </p>
          <p className="text-gray-500">
            {searchQuery
              ? 'Try a different search term'
              : 'Recordings you upload to class sessions will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recording</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Session Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecordings.map((recording) => (
                  <tr key={recording.recording_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Play className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{recording.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recording.class_title}</p>
                        <p className="text-xs text-gray-500">{recording.class_subject}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {formatDate(recording.slot_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{formatDate(recording.uploaded_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a href={recording.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                          <ExternalLink className="w-4 h-4" />Watch
                        </a>
                        <button onClick={() => handleDelete(recording)} disabled={deleting === recording.recording_id} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          {deleting === recording.recording_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && recordings.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center"><Video className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-purple-700 font-medium">Total Recordings</p><p className="text-2xl font-bold text-purple-900">{recordings.length}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center"><Play className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-blue-700 font-medium">Unique Classes</p><p className="text-2xl font-bold text-blue-900">{new Set(recordings.map(r => r.class_id)).size}</p></div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center"><CalendarDays className="w-6 h-6 text-white" /></div>
              <div><p className="text-sm text-green-700 font-medium">Sessions Recorded</p><p className="text-2xl font-bold text-green-900">{new Set(recordings.map(r => r.slot_id)).size}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
