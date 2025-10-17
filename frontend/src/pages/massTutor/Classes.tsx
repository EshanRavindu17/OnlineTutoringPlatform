import React, { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, CalendarDays, Loader2, Users2, Star, 
  Clock, Eye, Video, FileText, BookOpen, BarChart3
} from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface ClassData {
  class_id: string;
  title: string;
  subject: string;
  day: string;
  time: string;
  description?: string;
  product_id?: string;
  price_id?: string;
  created_at: string;
  studentCount: number;
  avgRating: number | null;
  upcomingSlots: number;
}

export default function ClassesPage() {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await massTutorAPI.getClasses();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      await massTutorAPI.deleteClass(classId);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error: any) {
      console.error('Error deleting class:', error);
      toast.error(error.response?.data?.error || 'Failed to delete class');
    }
  };

  const handleEdit = (classData: ClassData) => {
    setEditingClass(classData);
    setOpen(true);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 relative" />
        </div>
        <p className="mt-4 text-gray-500 font-medium">Loading your classes...</p>
      </div>
    );
  }

  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);
  const totalUpcoming = classes.reduce((sum, c) => sum + c.upcomingSlots, 0);
  const avgRating = classes.filter(c => c.avgRating).length > 0
    ? (classes.reduce((sum, c) => sum + (c.avgRating || 0), 0) / classes.filter(c => c.avgRating).length).toFixed(1)
    : null;

  return (
    <div className="p-6 lg:p-8">
      {/* Professional Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">My Classes</h2>
          <p className="text-sm text-gray-600">Manage your teaching schedule and course content</p>
        </div>
        <button 
          onClick={() => {
            setEditingClass(null);
            setOpen(true);
          }} 
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Class
        </button>
      </div>

      {/* Professional Stats */}
      {classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Classes</p>
                <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{totalUpcoming}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{avgRating || '—'}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No classes yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
            Create your first class to start teaching
          </p>
          <button 
            onClick={() => setOpen(true)} 
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div 
              key={c.class_id} 
              className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  {c.avgRating && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 rounded text-xs font-medium text-yellow-800">
                      <Star className="w-3 h-3 fill-yellow-600 text-yellow-600" />
                      {c.avgRating}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(c)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.class_id)}
                    className="p-2 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {c.title}
                </h3>
                
                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                  <span className="font-medium">{c.subject}</span>
                  <div className="flex items-center gap-1">
                    <Users2 className="w-3 h-3" />
                    {c.studentCount}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-700 mb-3 p-2 bg-gray-50 rounded">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  <span>{c.day}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{new Date(c.time.replace('Z', '')).toTimeString().split(' ')[0]}</span>
                </div>

                {c.upcomingSlots > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded mb-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    {c.upcomingSlots} upcoming
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <a 
                    href={`/mass-tutor/class/${c.class_id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Open
                  </a>
                  <a 
                    href={`/mass-tutor/materials?classId=${c.class_id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors"
                    title="Materials"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </a>
                  <a 
                    href={`/mass-tutor/recordings?classId=${c.class_id}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors"
                    title="Recordings"
                  >
                    <Video className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <CreateClassModal 
          onClose={() => {
            setOpen(false);
            setEditingClass(null);
          }}
          onSuccess={fetchClasses}
          editData={editingClass}
        />
      )}
    </div>
  );
}

function NavLinkBtn({ to, label, variant }: { to: string; label: string; variant?: 'ghost' | 'solid' }) {
  return (
    <a href={to} className={`px-4 py-2 rounded-xl text-sm font-medium border ${
      variant === 'ghost' ? 'text-gray-700 hover:bg-gray-50' : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent'
    }`}>{label}</a>
  );
}

interface Subject {
  sub_id: string;
  name: string;
}

function CreateClassModal({ 
  onClose, 
  onSuccess, 
  editData 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
  editData: ClassData | null;
}) {
  const [formData, setFormData] = useState({
    title: editData?.title || '',
    subject: editData?.subject || '',
    day: editData?.day || '',
    time: editData?.time || '',
    description: editData?.description || '',
    product_id: editData?.product_id || '',
    price_id: editData?.price_id || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await massTutorAPI.getAllSubjects();
      setAvailableSubjects(response.subjects || []);
    } catch (error: any) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.day || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      if (editData) {
        await massTutorAPI.updateClass(editData.class_id, formData);
        toast.success('Class updated successfully');
      } else {
        await massTutorAPI.createClass(formData);
        toast.success('Class created successfully');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving class:', error);
      toast.error(error.response?.data?.error || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl overflow-hidden">
        {/* Professional Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editData ? 'Edit Class' : 'Create New Class'}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {editData ? 'Update class information' : 'Enter the details for your new class'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Class Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Combined Maths — Grade 12"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject *
              </label>
              {loadingSubjects ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Loading subjects...</span>
                </div>
              ) : (
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                >
                  <option value="">Select a subject...</option>
                  {availableSubjects.map((subject) => (
                    <option key={subject.sub_id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Day(s) *
              </label>
              <input
                type="text"
                placeholder="e.g., Monday & Thursday"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Time (HH:MM:SS) *
              </label>
              <input
                type="text"
                placeholder="e.g., 18:00:00"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your class..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            />
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Stripe Integration (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product ID
                </label>
                <input
                  type="text"
                  placeholder="prod_..."
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price ID
                </label>
                <input
                  type="text"
                  placeholder="price_..."
                  value={formData.price_id}
                  onChange={(e) => setFormData({ ...formData, price_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
