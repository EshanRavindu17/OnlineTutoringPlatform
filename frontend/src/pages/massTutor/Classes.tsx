import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CalendarDays, Loader2 } from 'lucide-react';
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
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
          <p className="text-gray-500 mt-1">Create and manage your classes</p>
        </div>
        <button 
          onClick={() => {
            setEditingClass(null);
            setOpen(true);
          }} 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" /> New Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No classes yet</h3>
          <p className="text-gray-500 mb-6">Create your first class to start teaching</p>
          <button 
            onClick={() => setOpen(true)} 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" /> Create Your First Class
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((c) => (
            <div key={c.class_id} className="rounded-2xl border border-gray-100 p-5 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Subject: {c.subject} • {c.studentCount} students
                    {c.avgRating && ` • ⭐ ${c.avgRating}`}
                  </p>
                  <div className="mt-2 inline-flex items-center text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {c.day} • {formatTime(c.time)}
                  </div>
                  {c.upcomingSlots > 0 && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {c.upcomingSlots} upcoming {c.upcomingSlots === 1 ? 'class' : 'classes'}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(c)}
                    className="px-3 py-2 rounded-lg border hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(c.class_id)}
                    className="px-3 py-2 rounded-lg border hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <NavLinkBtn to={`/mass-tutor/class/${c.class_id}`} label="Open" />
                <NavLinkBtn to={`/mass-tutor/materials?classId=${c.class_id}`} label="Materials" variant="ghost" />
                <NavLinkBtn to={`/mass-tutor/recordings?classId=${c.class_id}`} label="Recordings" variant="ghost" />
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
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-5 text-white">
          <h3 className="text-lg font-semibold">{editData ? 'Edit Class' : 'Create New Class'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField 
            label="Class Title *" 
            placeholder="e.g., Combined Maths — Grade 12" 
            value={formData.title}
            onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <TextField 
            label="Subject *" 
            placeholder="e.g., Mathematics" 
            value={formData.subject}
            onChange={(e: any) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
          <TextField 
            label="Day *" 
            placeholder="e.g., Monday & Thursday" 
            value={formData.day}
            onChange={(e: any) => setFormData({ ...formData, day: e.target.value })}
            required
          />
          <TextField 
            label="Time (HH:MM:SS) *" 
            placeholder="e.g., 18:00:00" 
            value={formData.time}
            onChange={(e: any) => setFormData({ ...formData, time: e.target.value })}
            required
          />
          <div className="md:col-span-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your class..."
                rows={3}
                className="mt-1 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </label>
          </div>
          <TextField 
            label="Stripe Product ID" 
            placeholder="prod_..." 
            value={formData.product_id}
            onChange={(e: any) => setFormData({ ...formData, product_id: e.target.value })}
          />
          <TextField 
            label="Stripe Price ID" 
            placeholder="price_..." 
            value={formData.price_id}
            onChange={(e: any) => setFormData({ ...formData, price_id: e.target.value })}
          />
          <div className="md:col-span-2 flex justify-end gap-3 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={submitting}
              className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 inline-flex items-center"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, className = '', ...rest }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input {...rest} className="mt-1 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
    </label>
  );
}
