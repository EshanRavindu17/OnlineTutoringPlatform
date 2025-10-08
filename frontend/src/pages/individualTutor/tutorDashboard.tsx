import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {User,Calendar,DollarSign,Star,BookOpen,Clock,TrendingUp,Award,Users,Edit3,Save,X,Plus, 
  ChevronRight,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  FileText,
  Video,
  Settings,
  Bell,
  BarChart3,
  PieChart,
  Target,
  Calendar as CalendarIcon,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Upload,
  VideoIcon,
  Camera,
  Search,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import Navbar from '../../components/Navbar';
import LoadingState from '../../components/dashboard/LoadingState';
import { useAuth } from '../../context/authContext';
import { Subject, Title, tutorService } from '../../api/TutorService';
import { ScheduleService } from '../../api/ScheduleService';
import { sessionService } from '../../api/SessionService';
import { SessionWithDetails, SessionStatistics, Material } from '../../types/session';
import { NotificationCenter } from './NotificationCenter';
import { STANDARD_QUALIFICATIONS } from '../../constants/qualifications';
import { EarningsService, EarningsDashboard, EarningsStatistics, RecentPayment } from '../../api/EarningsService';
import { ReviewsService, ReviewData, ReviewStatistics, ReviewAnalytics } from '../../api/ReviewsService';
// import EnhancedMaterialModal from '../../components/EnhancedMaterialModal';
import SessionActions from './SessionActions';

interface LocalTutorProfile {
  name: string;
  description: string;
  phone: string;
  heading?: string;  // Added heading field
  subjects: string[];      // Subject names instead of IDs
  titles: string[];       // Title names instead of IDs
  titlesGroupedBySubject?: { [subjectName: string]: string[] }; // Grouped titles for display
  qualifications: string[];  // Changed from alQualifications and degree to array
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalEarnings: number;
  adminCommission: number;
  profit: number;
  photo_url?: string | null;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  studentName: string | null;
}

interface SubjectWithTitles {
  subject: string;
  titles: string[];
}

interface Session {
  id: string; // Changed from number to string to match backend UUID
  studentName: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  amount: number;
  materials?: (string | Material)[]; // Support both formats for backward compatibility
  rating?: number;
  review?: string;
  reason?: string;
  refunded?: boolean;
  meeting_urls?: string[];
  status?: string; // Added status field
}

interface Review {
  id: number;
  studentName: string;
  rating: number;
  date: string;
  comment: string;
  subject: string;
}

interface Notification {
  id: number;
  type: 'booking' | 'cancellation' | 'reschedule' | 'payment' | 'review';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  sessionId?: number;
  studentName?: string;
}

// Enhanced Material Add Modal Component
interface MaterialAddModalProps {
  sessionId: string;
  onClose: () => void;
  onAdd: (material: Omit<Material, 'id' | 'uploadDate'>) => void;
}

const MaterialAddModal: React.FC<MaterialAddModalProps> = ({ sessionId, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    type: 'document' as Material['type'],
    url: '',
    content: '',
    description: '',
    isPublic: false,
    file: null as File | null
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      // For now, we'll create a mock URL - in production, this would upload to server/cloud storage
      const mockUrl = URL.createObjectURL(file);
      
      setForm(prev => ({
        ...prev,
        name: prev.name || file.name,
        url: mockUrl,
        type: getFileType(file.type),
        file: file
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to process file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (mimeType: string): Material['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('presentation')) return 'presentation';
    return 'document';
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      alert('Please enter a material name');
      return;
    }

    if (form.type === 'link' && !form.url.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    if (form.type === 'text' && !form.content.trim()) {
      alert('Please enter text content');
      return;
    }

    onAdd({
      name: form.name,
      type: form.type,
      url: form.url,
      content: form.content,
      description: form.description,
      isPublic: false, // Always set to false since the toggle is removed
      size: form.file?.size,
      mimeType: form.file?.type
    });

    setForm({
      name: '',
      type: 'document',
      url: '',
      content: '',
      description: '',
      isPublic: false, // Always set to false
      file: null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Plus className="mr-2 text-blue-600" size={20} />
            Add Session Material
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Material Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Material Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'document', icon: '📄', label: 'Document' },
                { type: 'video', icon: '🎥', label: 'Video' },
                { type: 'link', icon: '🔗', label: 'URL Link' },
                { type: 'image', icon: '🖼️', label: 'Image' },
                { type: 'text', icon: '📝', label: 'Text Note' },
                { type: 'presentation', icon: '📊', label: 'Presentation' }
              ].map(({ type, icon, label }) => (
                <button
                  key={type}
                  onClick={() => setForm(prev => ({ ...prev, type: type as Material['type'] }))}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    form.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-sm font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a descriptive name for this material"
            />
          </div>

          {/* Conditional Fields Based on Type */}
          {form.type === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/resource"
              />
            </div>
          )}

          {form.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your text content, notes, or instructions..."
              />
            </div>
          )}

          {(['document', 'video', 'image', 'presentation'].includes(form.type)) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-sm text-gray-600">Processing...</p>
                  </div>
                ) : form.file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800">{form.file.name}</p>
                    <p className="text-xs text-gray-500">{(form.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drag and drop or click to upload</p>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm hover:bg-blue-100"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Maximum file size: 50MB. Supported formats: PDF, DOC, PPT, MP4, JPG, PNG
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes or context about this material..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            Materials will be available to students during the session
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? 'Processing...' : 'Add Material'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Material Uploader Component
interface EnhancedMaterialUploaderProps {
  sessionId: string;
  firebaseUid: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const EnhancedMaterialUploader: React.FC<EnhancedMaterialUploaderProps> = ({
  sessionId,
  firebaseUid,
  onSuccess,
  onCancel,
}) => {
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');
  const [textMaterial, setTextMaterial] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Get file type icon
  const getFileTypeIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Camera className="w-5 h-5 text-blue-600" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-red-600" />;
    if (type === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('presentation') || type.includes('powerpoint')) return <VideoIcon className="w-5 h-5 text-orange-600" />;
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Upload files
  const handleUpload = async () => {
    if (uploadMode === 'text' && textMaterial.trim()) {
      // Handle text material
      try {
        setUploading(true);
        await sessionService.addSessionMaterial(firebaseUid, sessionId, textMaterial);
        onSuccess();
      } catch (error) {
        console.error('Error adding text material:', error);
        alert('Failed to add text material. Please try again.');
      } finally {
        setUploading(false);
      }
    } else if (uploadMode === 'file' && selectedFiles.length > 0) {
      // Handle file uploads
      try {
        setUploading(true);
        const uploadPromises = selectedFiles.map(async (file, index) => {
          try {
            const fileKey = `${file.name}_${index}`;
            const result = await sessionService.uploadMaterialFile(
              firebaseUid,
              sessionId,
              file,
              (progress) => {
                setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
              }
            );
            
            // Add the uploaded file as a material
            const materialData = JSON.stringify({
              id: result.fileId,
              name: file.name,
              type: file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('video/') ? 'video' :
                    file.type === 'application/pdf' ? 'document' :
                    file.type.includes('presentation') ? 'presentation' : 'document',
              url: result.url,
              uploadDate: new Date().toISOString(),
              size: file.size,
              mimeType: file.type,
              isPublic: false
            });

            await sessionService.addSessionMaterial(firebaseUid, sessionId, `ENHANCED_MATERIAL:${materialData}`);
            
            return result;
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            throw error;
          }
        });

        await Promise.all(uploadPromises);
        onSuccess();
      } catch (error) {
        console.error('Error uploading files:', error);
        alert('Some files failed to upload. Please try again.');
      } finally {
        setUploading(false);
        setUploadProgress({});
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setUploadMode('text')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === 'text'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Text/Link
        </button>
        <button
          onClick={() => setUploadMode('file')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            uploadMode === 'file'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Upload className="w-4 h-4 inline mr-2" />
          File Upload
        </button>
      </div>

      {/* Content based on mode */}
      {uploadMode === 'text' ? (
        <div>
          <input
            type="text"
            value={textMaterial}
            onChange={(e) => setTextMaterial(e.target.value)}
            placeholder="Enter material name, URL, or description..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ) : (
        <div>
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop files here, or{' '}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                browse
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">
              Supports: PDF, DOC, PPT, Images, Videos (Max 10MB per file)
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => {
                  const fileKey = `${file.name}_${index}`;
                  const progress = uploadProgress[fileKey] || 0;
                  
                  return (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getFileTypeIcon(file)}
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploading && progress > 0 && (
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                        {!uploading && (
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          disabled={uploading}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading || (uploadMode === 'text' && !textMaterial.trim()) || (uploadMode === 'file' && selectedFiles.length === 0)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Add Material</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const TutorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState({
    basic: false,
    contact: false,
    qualifications: false,
    subjects: false,
    pricing: false
  });

  // Session tab states
  const [activeSessionTab, setActiveSessionTab] = useState('upcoming');
  const [sessionFilter, setSessionFilter] = useState('');


  const { currentUser, userProfile } = useAuth();

  // Predefined qualifications list (imported from shared constants)
  const standardQualifications = STANDARD_QUALIFICATIONS;

  // Qualifications management state
  const [customQualification, setCustomQualification] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');

  // Tutor Profile State
  const [tutorProfile, setTutorProfile] = useState<LocalTutorProfile>({
    name: userProfile?.name || '',
    description: 'Experienced tutor with passion for teaching mathematics and physics. I help students understand complex concepts through clear explanations and practical examples.',
    photo_url: userProfile?.photo_url || '',
    phone: '(+94) 435-123-4567',
    subjects: [],
    titles: [], 
    qualifications: [],
    hourlyRate: 65,
    rating: 4.9,
    totalReviews: 127,
    totalEarnings: 15240,
    adminCommission: 1524, 
    profit: 13716
  });

  // Real-time stats
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    monthlyEarnings: 0,
    thisWeekEarnings: 0,
    averageRating: 4.9,
    responseRate: 98,
    onTimeRate: 95
  });

  // Subjects and Titles from backend
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableTitles, setAvailableTitles] = useState<Title[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTitles, setLoadingTitles] = useState(false);
  
  // State for adding custom subjects and titles
  const [customSubject, setCustomSubject] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedSubjectForCustomTitle, setSelectedSubjectForCustomTitle] = useState('');
  
  // State for filtering/searching
  const [subjectFilter, setSubjectFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');

  // Load subjects when component mounts
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load titles when tutor profile subjects change (for display purposes)
  useEffect(() => {
    if (tutorProfile.subjects.length > 0 && availableSubjects.length > 0) {
      loadTitlesForSubjects(tutorProfile.subjects);
    }
  }, [tutorProfile.subjects, availableSubjects]);

  // Load subjects from API
  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const subjects = await tutorService.getAllSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Load titles when subjects change
  const loadTitlesForSubjects = async (selectedSubjectNames: string[]) => {
    if (selectedSubjectNames.length === 0) {
      setAvailableTitles([]);
      return;
    }

    setLoadingTitles(true);
    try {
      // Convert subject names to IDs for API calls
      const selectedSubjectIds = selectedSubjectNames.map(subjectName => {
        const subject = availableSubjects.find(s => s.name === subjectName);
        return subject?.sub_id;
      }).filter(Boolean) as string[];

      if (selectedSubjectIds.length === 0) {
        console.warn('No matching subject IDs found for names:', selectedSubjectNames);
        setAvailableTitles([]);
        setLoadingTitles(false);
        return;
      }

      // Load titles for all selected subjects
      const allTitles = [];
      for (const subjectId of selectedSubjectIds) {
        const titles = await tutorService.getTitlesBySubject(subjectId);
        allTitles.push(...titles);
      }
      
      // Remove duplicates if any
      const uniqueTitles = allTitles.filter((title, index, self) => 
        index === self.findIndex(t => t.title_id === title.title_id)
      );
      
      console.log('Loaded available titles:', uniqueTitles); // Debug log
      setAvailableTitles(uniqueTitles);
    } catch (error) {
      console.error('Failed to load titles:', error);
    } finally {
      setLoadingTitles(false);
    }
  };

  // Helper function to get session start time for sorting
  const getSessionStartTime = (session: SessionWithDetails): number => {
    // Try to get time from slots first
    if (session.slots && session.slots.length > 0) {
      const sessionDate = new Date(session.date!);
      const firstSlot = new Date(session.slots[0]);
      
      // Combine session date with slot time
      const combinedDateTime = new Date(sessionDate);
      combinedDateTime.setHours(firstSlot.getHours(), firstSlot.getMinutes(), 0, 0);
      
      return combinedDateTime.getTime();
    }
    
    // Fallback to start_time
    if (session.start_time) {
      return new Date(session.start_time).getTime();
    }
    
    // Fallback to date only
    if (session.date) {
      return new Date(session.date).getTime();
    }
    
    return 0;
  };

  // Helper function to get time until session
  const getTimeUntilSession = (session: SessionWithDetails): string => {
    const now = new Date();
    const sessionStart = getSessionStartTime(session);
    const timeDiff = sessionStart - now.getTime();
    
    if (timeDiff <= 0) return 'Now';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours}h ${minutes}m`;
    if (minutes > 0) return `in ${minutes} minutes`;
    return 'Now';
  };

  // Helper function to get urgency color for time indicator
  const getUrgencyColor = (session: SessionWithDetails): string => {
    const timeUntil = getTimeUntilSession(session);
    
    if (timeUntil === 'Now' || timeUntil.includes('minutes')) {
      return 'bg-red-100 text-red-700 border-red-200';
    } else if (timeUntil.includes('h ') || timeUntil.includes('1 day')) {
      return 'bg-orange-100 text-orange-700 border-orange-200';
    } else {
      return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // Load sessions data
  const loadSessionsData = async () => {
    if (currentUser?.uid) {
      try {
        console.log('Loading sessions data for user:', currentUser.uid);
        
        // Use dedicated endpoints for better performance and accuracy
        const [allSessions, upcomingSessions, ongoingSessions, completedSessions, cancelledSessions, statistics] = await Promise.all([
          sessionService.getAllSessions(currentUser.uid),
          sessionService.getUpcomingSessions(currentUser.uid),
          sessionService.getSessionsByStatus(currentUser.uid, 'ongoing'),
          sessionService.getSessionsByStatus(currentUser.uid, 'completed'),
          sessionService.getSessionsByStatus(currentUser.uid, 'canceled'), // Get only latest canceled sessions
          sessionService.getSessionStatistics(currentUser.uid)
        ]);

        console.log('Received sessions:', {
          total: allSessions.length,
          upcoming: upcomingSessions.length,
          ongoing: ongoingSessions.length,
          completed: completedSessions.length,
          cancelled: cancelledSessions.length
        });

        setSessionStats(statistics);
        
        // Sort upcoming sessions by start time (nearest first) - backend should already sort, but ensure it
        const sortedUpcoming = upcomingSessions.sort((a, b) => getSessionStartTime(a) - getSessionStartTime(b));
        
        // Sort ongoing sessions by start time (earliest first)
        const sortedOngoing = ongoingSessions.sort((a, b) => getSessionStartTime(a) - getSessionStartTime(b));
        
        // Sort previous sessions by date (most recent first) - backend should already sort, but ensure it
        const sortedCompleted = completedSessions.sort((a, b) => getSessionStartTime(b) - getSessionStartTime(a));
        
        // Cancelled sessions are already limited and sorted by the backend (latest 10)
        const sortedCancelled = cancelledSessions;
        
        setSessions({
          upcoming: sortedUpcoming,
          ongoing: sortedOngoing,
          previous: sortedCompleted,
          cancelled: sortedCancelled,
          all: allSessions
        });

        console.log('Sessions updated in state:', {
          upcoming: sortedUpcoming.length,
          ongoing: sortedOngoing.length,
          previous: sortedCompleted.length,
          cancelled: sortedCancelled.length
        });

      } catch (error) {
        console.error('Error loading sessions data:', error);
        // Set empty arrays on error to prevent undefined state
        setSessions({
          upcoming: [],
          ongoing: [],
          previous: [],
          cancelled: [],
          all: []
        });
      }
    }
  };

  // Load earnings data
  const loadEarningsData = async () => {
    if (currentUser?.uid) {
      try {
        setEarningsLoading(true);
        const dashboard = await EarningsService.getEarningsDashboard(currentUser.uid);
        setEarningsData(dashboard.earnings);
        setRecentPayments(dashboard.recentPayments);
        
        // Update tutor profile with real earnings data
        setTutorProfile(prev => ({
          ...prev,
          totalEarnings: dashboard.earnings.totalEarnings,
          adminCommission: dashboard.earnings.adminCommission,
          profit: dashboard.earnings.netEarnings
        }));
      } catch (error) {
        console.error('Error loading earnings data:', error);
      } finally {
        setEarningsLoading(false);
      }
    }
  };

  // Load reviews data
  const loadReviewsData = async () => {
    if (currentUser?.uid) {
      try {
        setReviewsLoading(true);
        const [reviewsDataResult, statisticsResult] = await Promise.all([
          ReviewsService.getTutorReviews(currentUser.uid, { limit: 20 }),
          ReviewsService.getReviewStatistics(currentUser.uid)
        ]);
        
        setReviewsData(reviewsDataResult);
        setReviewStats(statisticsResult);
        
        // Update tutor profile with real reviews data
        setTutorProfile(prev => ({
          ...prev,
          rating: statisticsResult.averageRating,
          totalReviews: statisticsResult.totalReviews
        }));
      } catch (error) {
        console.error('Error loading reviews data:', error);
      } finally {
        setReviewsLoading(false);
      }
    }
  };

  // Load real data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (currentUser?.uid) {
          // Load tutor profile from backend
          try {
            const profile = await tutorService.getTutorProfile(currentUser.uid);
            setTutorProfile(prev => ({
              ...prev,
              name: profile.User.name,
              photo_url: profile.User.photo_url || '',
              description: profile.description,
              hourlyRate: profile.hourly_rate,
              rating: profile.rating,
              subjects: profile.subjects,   // Load subjects from backend
              titles: profile.titles,       // Load titles from backend
              titlesGroupedBySubject: profile.titlesGroupedBySubject || {}, // Load grouped titles
              qualifications: profile.qualifications,
              phone: profile.phone_number, // Load phone from backend
              heading: profile.heading,     // Load heading from backend
              // Keep existing mock values for fields not in backend
              totalReviews: prev.totalReviews,
              totalEarnings: prev.totalEarnings,
              adminCommission: prev.adminCommission,
              profit: prev.profit
            }));

            // Load titles for the selected subjects (will be handled by useEffect when availableSubjects loads)
            // Titles will be loaded automatically by the useEffect dependency

            // Load tutor statistics
            const statistics = await tutorService.getTutorStatistics(profile.i_tutor_id);
            setStats(prev => ({
              ...prev,
              completedSessions: statistics.totalSessions,
              monthlyEarnings: statistics.totalEarnings,
              upcomingSessions: statistics.upcomingSessions
            }));

            // Update profile with statistics data
            setTutorProfile(prev => ({
              ...prev,
              // rating: statistics.averageRating,
              totalReviews: statistics.reviewsCount,
              totalEarnings: statistics.totalEarnings
            }));
          } catch (profileError) {
            console.error('Error loading tutor profile:', profileError);
            // Continue with schedule loading even if profile fails
          }

          // Load schedule stats
          const tutorIdResponse = await ScheduleService.getTutorId(currentUser.uid);
          if (tutorIdResponse.success) {
            const slotsResponse = await ScheduleService.getTutorTimeSlots(tutorIdResponse.data.tutorId);
            if (slotsResponse.success) {
              const slots = slotsResponse.data;
              
              // Filter future slots
              const now = new Date();
              const futureSlots = slots.filter(slot => {
                const slotDate = new Date(slot.date);
                return slotDate >= now;
              });
              
              setStats(prev => ({
                ...prev,
                totalSlots: futureSlots.length,
                availableSlots: futureSlots.filter(s => s.status === 'free').length,
                bookedSlots: futureSlots.filter(s => s.status === 'booked').length,
                upcomingSessions: futureSlots.filter(s => s.status === 'booked').length,
                monthlyEarnings: futureSlots.filter(s => s.status === 'booked').length * 65
              }));
            }
          }

          // Load all dashboard data
          await Promise.all([
            loadSessionsData(),
            loadEarningsData(),
            loadReviewsData()
          ]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showImageEditModal) {
          setShowImageEditModal(false);
          setSelectedImage(null);
          setImagePreview(null);
        }
      }
    };

    if (showImageEditModal) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showImageEditModal]);

  // Sessions Data - Real data from backend
  const [sessions, setSessions] = useState({
    upcoming: [] as SessionWithDetails[],
    ongoing: [] as SessionWithDetails[],
    previous: [] as SessionWithDetails[],
    cancelled: [] as SessionWithDetails[],
    all: [] as SessionWithDetails[]
  });

  // Session statistics
  const [sessionStats, setSessionStats] = useState<SessionStatistics | null>(null);

  // Earnings state
  const [earningsData, setEarningsData] = useState<EarningsStatistics | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);

  // Reviews state
  const [reviewsData, setReviewsData] = useState<ReviewData[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatistics | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Reviews and Ratings (keep old for backward compatibility)
  // const [reviews, setReviews] = useState<Review[]>([
  //   {
  //     id: 1,
  //     studentName: 'Emily R.',
  //     rating: 5,
  //     date: '2025-08-20',
  //     comment: 'Dr. Martinez helped me improve my calculus grade from a C to an A! Her explanations are clear and she\'s incredibly patient. Highly recommend!',
  //     subject: 'Mathematics'
  //   },
  //   {
  //     id: 2,
  //     studentName: 'Michael T.',
  //     rating: 5,
  //     date: '2025-08-18',
  //     comment: 'Amazing tutor! She made physics concepts that seemed impossible actually make sense. My test scores have improved dramatically.',
  //     subject: 'Physics'
  //   },
  //   {
  //     id: 3,
  //     studentName: 'Jessica L.',
  //     rating: 4,
  //     date: '2025-08-15',
  //     comment: 'Dr. Martinez is fantastic! She helped me prepare for the SAT math section and I scored a 780. Her teaching methods are excellent.',
  //     subject: 'Mathematics'
  //   }
  // ]);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Enhanced Material Management State
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedSessionForMaterial, setSelectedSessionForMaterial] = useState<string | null>(null);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    type: 'document' as Material['type'],
    url: '',
    content: '',
    description: '',
    isPublic: false,
    file: null as File | null
  });

  // Session Actions Modal State
  const [showSessionActions, setShowSessionActions] = useState(false);
  const [selectedSessionForActions, setSelectedSessionForActions] = useState<Session | null>(null);

  // Auto-switching logic for ongoing sessions
  useEffect(() => {
    if (sessions.ongoing.length > 0 && activeSessionTab === 'upcoming') {
      const shouldSwitch = window.confirm(
        `You have ${sessions.ongoing.length} ongoing session${sessions.ongoing.length > 1 ? 's' : ''}! Would you like to switch to the Ongoing tab?`
      );
      if (shouldSwitch) {
        setActiveSessionTab('ongoing');
      }
    }
  }, [sessions.ongoing.length, activeSessionTab]);

  // Periodic check for session state changes and button availability
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser?.uid) {
        // Force re-render to update button visibility based on current time
        setStats(prev => ({ ...prev })); // Trigger re-render
        // Also refresh session data to catch any backend updates
        loadSessionsData();
      }
    }, 60000); // Check every 60 seconds (1 minute) for button availability

    return () => clearInterval(interval);
  }, [currentUser]);

  // More frequent check specifically for button state updates (every 30 seconds)
  useEffect(() => {
    const quickInterval = setInterval(() => {
      // Just trigger a state update to refresh button visibility
      if (activeSessionTab === 'upcoming') {
        setStats(prev => ({ ...prev })); // Force re-render without API call
      }
    }, 30000); // Check every 30 seconds for button state

    return () => clearInterval(quickInterval);
  }, [activeSessionTab]);

  // Helper function to extract time from slot format (using UTC to avoid timezone issues)
  const extractTimeFromSlot = (slot: string | Date): string => {
    const date = new Date(slot);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper function to check if session start time has arrived
  const isSessionTimeArrived = (session: SessionWithDetails): boolean => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!session.date || !session.slots || session.slots.length === 0) {
      return true; // If no time info, allow starting (fallback behavior)
    }
    
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    
    // If session is not today, don't show button
    if (sessionDate.getTime() !== today.getTime()) {
      return sessionDate.getTime() < today.getTime(); // Show if session date has passed
    }
    
    // If session is today, check if the start time has arrived
    const firstSlot: any = session.slots[0];
    let sessionHour: number;
    let sessionMinute: number;
    
    if (firstSlot instanceof Date) {
      sessionHour = firstSlot.getUTCHours();
      sessionMinute = firstSlot.getUTCMinutes();
    } else {
      const timeStr = String(firstSlot);
      if (timeStr.includes('T')) {
        // ISO format like "1970-01-01T12:00:00.000Z"
        const timePart = timeStr.split('T')[1];
        const [hours, minutes] = timePart.split(':').map(Number);
        sessionHour = hours;
        sessionMinute = minutes || 0;
      } else if (timeStr.includes(':')) {
        // Direct time format like "12:00"
        const [hours, minutes] = timeStr.split(':').map(Number);
        sessionHour = hours;
        sessionMinute = minutes || 0;
      } else {
        // If we can't parse the time, allow starting
        return true;
      }
    }
    
    // Create session start time for today
    const sessionStartTime = new Date();
    sessionStartTime.setHours(sessionHour, sessionMinute, 0, 0);
    
    // Allow starting from the session time onwards
    return now.getTime() >= sessionStartTime.getTime();
  };

  // Helper function to get time remaining until session can be started
  const getTimeUntilCanStart = (session: SessionWithDetails): string => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!session.date || !session.slots || session.slots.length === 0) {
      return '';
    }
    
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    
    // If not today, return empty (button should not show)
    if (sessionDate.getTime() !== today.getTime()) {
      return '';
    }
    
    // Calculate session start time
    const firstSlot: any = session.slots[0];
    let sessionHour: number;
    let sessionMinute: number;
    
    if (firstSlot instanceof Date) {
      sessionHour = firstSlot.getUTCHours();
      sessionMinute = firstSlot.getUTCMinutes();
    } else {
      const timeStr = String(firstSlot);
      if (timeStr.includes('T')) {
        const timePart = timeStr.split('T')[1];
        const [hours, minutes] = timePart.split(':').map(Number);
        sessionHour = hours;
        sessionMinute = minutes || 0;
      } else if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        sessionHour = hours;
        sessionMinute = minutes || 0;
      } else {
        return '';
      }
    }
    
    const sessionStartTime = new Date();
    sessionStartTime.setHours(sessionHour, sessionMinute, 0, 0);
    
    const timeDiff = sessionStartTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) return '';
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Helper function to calculate session time range from slots
  const getSessionTimeRange = (slots: (string | Date)[]): string => {
    if (!slots || slots.length === 0) return 'Time not set';
    
    // Sort slots to ensure proper order
    const sortedSlots = slots.map(slot => new Date(slot)).sort((a, b) => a.getTime() - b.getTime());
    
    const startTime = extractTimeFromSlot(sortedSlots[0]);
    
    // Calculate end time: start time + number of slots (each slot = 1 hour)
    const endDate = new Date(sortedSlots[0]);
    endDate.setUTCHours(endDate.getUTCHours() + slots.length);
    const endTime = extractTimeFromSlot(endDate);
    
    return `${startTime} - ${endTime}`;
  };

  // Helper function to format session data
  const formatSession = (session: SessionWithDetails) => {
    return {
      id: session.session_id,
      studentName: session.Student?.User?.name || 'Unknown Student',
      subject: session.subject || 'No Subject',  // Use the actual subject column
      title: session.title || 'No Title',       // Keep title separate
      date: session.date ? new Date(session.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }) : 'Date not set',
      time: session.slots && session.slots.length > 0 
        ? getSessionTimeRange(session.slots)
        : session.start_time && session.end_time 
        ? `${new Date(session.start_time).toLocaleTimeString()} - ${new Date(session.end_time).toLocaleTimeString()}`
        : 'Time not set',
      amount: session.price || 0,
      materials: session.materials || [],
      rating: session.Rating_N_Review_Session?.[0]?.rating ? Number(session.Rating_N_Review_Session[0].rating) : undefined,
      review: session.Rating_N_Review_Session?.[0]?.review || undefined,
      status: session.status || undefined,
      meeting_urls: session.meeting_urls || [],
      refunded: false,
      reason: undefined // TODO: Add cancellation reason to backend
    };
  };

  const toggleEditMode = (section: keyof typeof editMode) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfileChange = (field: keyof LocalTutorProfile, value: any) => {
    setTutorProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Qualification handlers
  const handleQualificationChange = (qualification: string) => {
    const isSelected = tutorProfile.qualifications.includes(qualification);
    let newQualifications;
    
    if (isSelected) {
      // Remove qualification
      newQualifications = tutorProfile.qualifications.filter(q => q !== qualification);
    } else {
      // Add qualification
      newQualifications = [...tutorProfile.qualifications, qualification];
    }
    
    setTutorProfile(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  const handleAddCustomQualification = () => {
    if (customQualification.trim() && !tutorProfile.qualifications.includes(customQualification.trim())) {
      const newQualifications = [...tutorProfile.qualifications, customQualification.trim()];
      setTutorProfile(prev => ({
        ...prev,
        qualifications: newQualifications
      }));
      setCustomQualification('');
    }
  };

  const handleRemoveQualification = (qualification: string) => {
    const newQualifications = tutorProfile.qualifications.filter(q => q !== qualification);
    setTutorProfile(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  const getFilteredQualifications = () => {
    if (!qualificationFilter.trim()) return standardQualifications;
    return standardQualifications.filter(qualification => 
      qualification.toLowerCase().includes(qualificationFilter.toLowerCase())
    );
  };

  // Subject and Title handlers
  const handleSubjectChange = (subjectName: string) => {
    const isSelected = tutorProfile.subjects.includes(subjectName);
    let newSubjects;
    let newTitlesGrouped = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
    
    if (isSelected) {
      // Remove subject and its titles
      newSubjects = tutorProfile.subjects.filter(name => name !== subjectName);
      // Remove titles associated with this subject
      delete newTitlesGrouped[subjectName];
    } else {
      // Add subject
      newSubjects = [...tutorProfile.subjects, subjectName];
      // Initialize empty titles array for new subject
      newTitlesGrouped[subjectName] = [];
    }
    
    // Update titles array to be flat array of all selected titles
    const flatTitles = Object.values(newTitlesGrouped).flat();
    
    setTutorProfile(prev => ({
      ...prev,
      subjects: newSubjects,
      titles: flatTitles,
      titlesGroupedBySubject: newTitlesGrouped
    }));
    
    // Load titles for the new subject selection (for dropdown options)
    loadTitlesForSubjects(newSubjects);
  };

  const handleTitleChange = (titleName: string, subjectName: string) => {
    const currentGroupedTitles = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
    
    if (!currentGroupedTitles[subjectName]) {
      currentGroupedTitles[subjectName] = [];
    }
    
    const isSelected = currentGroupedTitles[subjectName].includes(titleName);
    
    if (isSelected) {
      // Remove title from subject
      currentGroupedTitles[subjectName] = currentGroupedTitles[subjectName].filter(name => name !== titleName);
    } else {
      // Add title to subject
      currentGroupedTitles[subjectName] = [...currentGroupedTitles[subjectName], titleName];
    }
    
    // Update titles array to be flat array of all selected titles
    const flatTitles = Object.values(currentGroupedTitles).flat();
    
    setTutorProfile(prev => ({
      ...prev,
      titles: flatTitles,
      titlesGroupedBySubject: currentGroupedTitles
    }));
  };

  // Handle adding custom subject
  const handleAddCustomSubject = async () => {
    if (customSubject.trim() && !availableSubjects.some(s => s.name.toLowerCase() === customSubject.trim().toLowerCase())) {
      try {
        const newSubject = await tutorService.createSubject(customSubject.trim());
        setAvailableSubjects(prev => [...prev, newSubject]);
        
        // Automatically select the new subject (use name instead of ID)
        const newSubjects = [...tutorProfile.subjects, newSubject.name];
        const newTitlesGrouped = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
        newTitlesGrouped[newSubject.name] = [];
        
        setTutorProfile(prev => ({
          ...prev,
          subjects: newSubjects,
          titlesGroupedBySubject: newTitlesGrouped
        }));
        
        setCustomSubject('');
        
        // Load titles for the new selection
        loadTitlesForSubjects(newSubjects);
        
        // Show success message
        alert(`✅ Subject "${newSubject.name}" created successfully and added to your profile!`);
      } catch (error: any) {
        console.error('Failed to create subject:', error);
        alert(`❌ Failed to create subject: ${error.message || 'Unknown error'}`);
      }
    } else if (customSubject.trim() && availableSubjects.some(s => s.name.toLowerCase() === customSubject.trim().toLowerCase())) {
      alert('⚠️ This subject already exists. Please choose a different name.');
    }
  };

  // Handle adding custom title
  const handleAddCustomTitle = async () => {
    if (customTitle.trim() && selectedSubjectForCustomTitle && 
        !availableTitles.some(t => t.name.toLowerCase() === customTitle.trim().toLowerCase() && t.sub_id === selectedSubjectForCustomTitle)) {
      try {
        const newTitle = await tutorService.createTitle(customTitle.trim(), selectedSubjectForCustomTitle);
        setAvailableTitles(prev => [...prev, newTitle]);
        
        // Find the subject name for the selected subject ID
        const subjectRecord = availableSubjects.find(s => s.sub_id === selectedSubjectForCustomTitle);
        if (subjectRecord) {
          // Automatically select the new title (use name instead of ID)
          const currentGroupedTitles = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
          if (!currentGroupedTitles[subjectRecord.name]) {
            currentGroupedTitles[subjectRecord.name] = [];
          }
          currentGroupedTitles[subjectRecord.name] = [...currentGroupedTitles[subjectRecord.name], newTitle.name];
          
          // Update flat titles array
          const flatTitles = Object.values(currentGroupedTitles).flat();
          
          setTutorProfile(prev => ({
            ...prev,
            titles: flatTitles,
            titlesGroupedBySubject: currentGroupedTitles
          }));
          
          // Show success message
          alert(`✅ Title "${newTitle.name}" created successfully and added to "${subjectRecord.name}"!`);
        }
        
        setCustomTitle('');
        setSelectedSubjectForCustomTitle('');
      } catch (error: any) {
        console.error('Failed to create title:', error);
        alert(`❌ Failed to create title: ${error.message || 'Unknown error'}`);
      }
    } else if (customTitle.trim() && selectedSubjectForCustomTitle && 
               availableTitles.some(t => t.name.toLowerCase() === customTitle.trim().toLowerCase() && t.sub_id === selectedSubjectForCustomTitle)) {
      alert('⚠️ This title already exists for the selected subject. Please choose a different name.');
    } else if (!selectedSubjectForCustomTitle) {
      alert('⚠️ Please select a subject first.');
    }
  };

  // Filter functions
  const getFilteredSubjects = () => {
    if (!subjectFilter.trim()) return availableSubjects;
    return availableSubjects.filter(subject => 
      subject.name.toLowerCase().includes(subjectFilter.toLowerCase())
    );
  };

  const getFilteredTitles = () => {
    // First filter titles to only include those from selected subjects
    const selectedSubjectIds = tutorProfile.subjects.map(subjectName => {
      const subject = availableSubjects.find(s => s.name === subjectName);
      return subject?.sub_id;
    }).filter(Boolean) as string[];
    
    const titlesFromSelectedSubjects = availableTitles.filter(title => 
      selectedSubjectIds.includes(title.sub_id)
    );
    
    // Then filter by search text if provided
    if (!titleFilter.trim()) return titlesFromSelectedSubjects;
    return titlesFromSelectedSubjects.filter(title => 
      title.name.toLowerCase().includes(titleFilter.toLowerCase())
    );
  };

  // Helper function to get subject name by ID
  const getSubjectNameById = (subjectId: string): string => {
    const subject = availableSubjects.find(s => s.sub_id === subjectId);
    return subject ? subject.name : subjectId;
  };

  // Helper function to get title name by ID
  const getTitleNameById = (titleId: string): string => {
    const title = availableTitles.find(t => t.title_id === titleId);
    return title ? title.name : titleId;
  };

  // Save qualifications to backend
  const handleSaveQualifications = async () => {
    if (currentUser?.uid) {
      try {
        await tutorService.updateTutorQualifications(currentUser.uid, tutorProfile.qualifications);
        // Turn off edit mode after successful save
        toggleEditMode('qualifications');
        alert('Qualifications updated successfully!');
      } catch (error) {
        console.error('Error updating qualifications:', error);
        alert('Failed to update qualifications. Please try again.');
      }
    }
  };

  // Save subjects and titles to backend
  const handleSaveSubjectsAndTitles = async () => {
    if (currentUser?.uid) {
      try {
        // Convert the current subjects and titles to grouped format
        const subjectsWithTitles: { [subjectName: string]: string[] } = {};
        
        // Initialize empty arrays for each subject
        tutorProfile.subjects.forEach(subjectName => {
          subjectsWithTitles[subjectName] = [];
        });
        
        // Use grouped titles if available, otherwise try to group titles by subjects
        if (tutorProfile.titlesGroupedBySubject) {
          Object.assign(subjectsWithTitles, tutorProfile.titlesGroupedBySubject);
        } else {
          // Fallback: for each title, find its subject using availableTitles
          tutorProfile.titles.forEach(titleName => {
            const titleRecord = availableTitles.find(t => t.name === titleName);
            if (titleRecord) {
              const subjectRecord = availableSubjects.find(s => s.sub_id === titleRecord.sub_id);
              if (subjectRecord && subjectsWithTitles[subjectRecord.name]) {
                subjectsWithTitles[subjectRecord.name].push(titleName);
              }
            }
          });
        }
        
        await tutorService.updateTutorSubjectsAndTitles(currentUser.uid, subjectsWithTitles);
        // Turn off edit mode after successful save
        toggleEditMode('subjects');
        alert('Subjects and titles updated successfully!');
      } catch (error) {
        console.error('Error updating subjects and titles:', error);
        alert('Failed to update subjects and titles. Please try again.');
      }
    }
  };

  // Save hourly rate to backend
  const handleSaveHourlyRate = async () => {
    if (currentUser?.uid) {
      try {
        await tutorService.updateTutorHourlyRate(currentUser.uid, tutorProfile.hourlyRate);
        // Turn off edit mode after successful save
        toggleEditMode('pricing');
        alert('Hourly rate updated successfully!');
      } catch (error) {
        console.error('Error updating hourly rate:', error);
        alert('Failed to update hourly rate. Please try again.');
      }
    }
  };

  // Save personal information to backend
  const handleSavePersonalInfo = async () => {
    if (currentUser?.uid) {
      try {
        const personalData = {
          name: tutorProfile.name,
          description: tutorProfile.description,
          phone_number: tutorProfile.phone,
          heading: tutorProfile.heading || null
        };
        
        await tutorService.updateTutorPersonalInfo(currentUser.uid, personalData);
        // Turn off edit mode after successful save
        toggleEditMode('basic');
        alert('Personal information updated successfully!');
      } catch (error) {
        console.error('Error updating personal information:', error);
        alert('Failed to update personal information. Please try again.');
      }
    }
  };

  // Image handling functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = async () => {
    if (selectedImage && currentUser?.uid) {
      try {
        // Show loading state
        const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement;
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.textContent = 'Uploading...';
        }

        // Upload image to backend
        const result = await tutorService.uploadUserPhoto(currentUser.uid, selectedImage);
        
        // Update the tutor profile with the new image URL from server
        setTutorProfile(prev => ({
          ...prev,
          photo_url: result.user.photo_url
        }));
        
        // Close modal and reset state
        setShowImageEditModal(false);
        setSelectedImage(null);
        setImagePreview(null);
        
        // Show success message
        alert('Profile image updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    } else if (!currentUser?.uid) {
      alert('User not authenticated. Please log in and try again.');
    } else {
      alert('No image selected.');
    }
  };

  const handleImageCancel = () => {
    setShowImageEditModal(false);
    setSelectedImage(null);
    setImagePreview(null);
  };


  // Note: addMaterial functionality moved to EnhancedMaterialUploader component

  // Enhanced material management functions
  // const addEnhancedMaterial = async (materialData: Omit<Material, 'id' | 'uploadDate'>) => {
  //   if (!selectedSessionForMaterial || !currentUser?.uid) return;
    
  //   try {
  //     await sessionService.addEnhancedSessionMaterial(
  //       currentUser.uid, 
  //       selectedSessionForMaterial, 
  //       materialData
  //     );
      
  //     // Reload sessions to get updated data
  //     loadSessionsData();
  //     setShowMaterialModal(false);
  //     setSelectedSessionForMaterial(null);
  //     alert('Enhanced material added successfully!');
  //   } catch (error) {
  //     console.error('Error adding enhanced material:', error);
  //     alert('Failed to add enhanced material. Please try again.');
  //   }
  // };

  const openMaterialModal = (sessionId: string) => {
    setSelectedSessionForMaterial(sessionId);
    setShowMaterialModal(true);
  };

  const removeMaterial = async (sessionId: string, materialIndex: number, materialName: string) => {
    if (currentUser?.uid) {
      try {
        // Confirm before removing
        const confirmed = window.confirm(`Are you sure you want to remove "${materialName}"?`);
        
        if (confirmed) {
          await sessionService.removeSessionMaterial(currentUser.uid, sessionId, materialIndex);
          // Reload sessions to get updated data
          loadSessionsData();
          alert('Material removed successfully!');
        }
      } catch (error) {
        console.error('Error removing material:', error);
        alert('Failed to remove material. Please try again.');
      }
    }
  };

  const requestCancellation = async (sessionId: string) => {
    if (currentUser?.uid) {
      try {
        const reason = prompt('Please provide a reason for cancellation (optional):');
        const result = await sessionService.requestCancellation(currentUser.uid, sessionId, reason || undefined);
        if (result.success) {
          alert(result.message);
          // Reload sessions to get updated data
          loadSessionsData();
        } else {
          alert('Failed to cancel session: ' + result.message);
        }
      } catch (error) {
        console.error('Error cancelling session:', error);
        alert('Failed to cancel session. Please try again.');
      }
    }
  };

  // Session Actions handlers
  const openSessionActions = (sessionData: SessionWithDetails) => {
    const session = formatSession(sessionData);
    setSelectedSessionForActions(session);
    setShowSessionActions(true);
  };

  const closeSessionActions = () => {
    setShowSessionActions(false);
    setSelectedSessionForActions(null);
  };

  const handleSessionCancel = async (sessionId: string, reason: string) => {
    if (currentUser?.uid) {
      try {
        const result = await sessionService.requestCancellation(currentUser.uid, sessionId, reason);
        if (result.success) {
          alert(result.message);
          // Reload sessions to get updated data
          loadSessionsData();
          closeSessionActions();
        } else {
          alert('Failed to cancel session: ' + result.message);
        }
      } catch (error) {
        console.error('Error cancelling session:', error);
        alert('Failed to cancel session. Please try again.');
      }
    }
  };

  const handleSessionReschedule = async (sessionId: string, newDate: string, newTime: string, reason: string) => {
    // TODO: Implement reschedule functionality when backend endpoint is available
    alert(`Reschedule functionality will be implemented soon.\n\nSession: ${sessionId}\nNew Date: ${newDate}\nNew Time: ${newTime}\nReason: ${reason}`);
    closeSessionActions();
  };

  const completeSession = async (sessionId: string, studentName: string) => {
    try {
      if (!currentUser?.uid) {
        alert('Please log in to complete the session');
        return;
      }

      // Confirm completion
      const confirmed = window.confirm(
        `Are you sure you want to complete the session with ${studentName}?\n\n` +
        `This action cannot be undone.`
      );

      if (!confirmed) return;

      await sessionService.completeSession(currentUser.uid, sessionId);
      
      // Show success message
      const tempMessage = document.createElement('div');
      tempMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      tempMessage.textContent = `Session with ${studentName} completed successfully!`;
      document.body.appendChild(tempMessage);
      
      setTimeout(() => {
        document.body.removeChild(tempMessage);
      }, 3000);

      // Reload sessions to show updated status
      await loadSessionsData();
    } catch (error) {
      console.error('Error completing session:', error);
      alert(`Failed to complete session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Legacy method for backward compatibility
  const finishSession = async (sessionId: string) => {
    if (currentUser?.uid) {
      try {
        const confirmed = window.confirm('Are you sure you want to mark this session as completed?');
        
        if (confirmed) {
          const result = await sessionService.finishSession(currentUser.uid, sessionId);
          if (result.success) {
            alert(result.message);
            // Reload sessions to get updated data
            loadSessionsData();
          } else {
            alert('Failed to finish session: ' + result.message);
          }
        }
      } catch (error) {
        console.error('Error finishing session:', error);
        alert('Failed to finish session. Please try again.');
      }
    }
  };

  const handleZoomMeeting = async (sessionId: string, studentName: string, meetingUrls?: string[]) => {
    try {
      // First, start the session (change status from scheduled to ongoing)
      if (currentUser?.uid) {
        await sessionService.startSession(currentUser.uid, sessionId);
        
        // Reload sessions to reflect the status change
        await loadSessionsData();
        
        // Show success message briefly
        const tempMessage = document.createElement('div');
        tempMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        tempMessage.textContent = `Session with ${studentName} has been started!`;
        document.body.appendChild(tempMessage);
        
        setTimeout(() => {
          document.body.removeChild(tempMessage);
        }, 3000);
      }

      // Then open Zoom link
      const zoomLink = meetingUrls && meetingUrls.length > 0 ? meetingUrls[0] : null;
      
      if (zoomLink) {
        // Confirm before opening the meeting
        const confirmed = window.confirm(
          `Join Zoom meeting with ${studentName}?\n\nThis will open the meeting in a new tab and mark the session as ongoing.`
        );
        
        if (confirmed) {
          // Open the actual Zoom meeting in a new tab
          window.open(zoomLink, '_blank');
        }
      } else {
        // No zoom link available - provide options to add one
        const addUrl = window.confirm(
          `Session started successfully!\n\n` +
          `❌ No Zoom meeting URL found for this session with ${studentName}.\n\n` +
          `Would you like to add a meeting URL now?`
        );
        
        if (addUrl) {
          const meetingUrl = prompt('Please enter the meeting URL:');
          if (meetingUrl && meetingUrl.trim() && currentUser?.uid) {
            try {
              await sessionService.addMeetingUrl(currentUser.uid, sessionId, meetingUrl.trim());
              
              // Show success and reload sessions
              alert(`Meeting URL added successfully!\n\nURL: ${meetingUrl}`);
              await loadSessionsData();
              
              // Offer to open the newly added URL
              if (window.confirm('Would you like to open the meeting now?')) {
                window.open(meetingUrl.trim(), '_blank');
              }
            } catch (error) {
              console.error('Error adding meeting URL:', error);
              alert('Failed to add meeting URL. Please try again.');
            }
          }
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert(`Failed to start session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };



  const EditButton = ({ section, className = "" }: { section: keyof typeof editMode, className?: string }) => (
    <button
      onClick={() => {
        if (editMode[section] && section === 'basic') {
          // Save personal information when clicking save
          handleSavePersonalInfo();
        } else if (editMode[section] && section === 'qualifications') {
          // Save qualifications when clicking save
          handleSaveQualifications();
        } else if (editMode[section] && section === 'subjects') {
          // Save subjects and titles when clicking save
          handleSaveSubjectsAndTitles();
        } else if (editMode[section] && section === 'pricing') {
          // Save hourly rate when clicking save
          handleSaveHourlyRate();
        } else {
          toggleEditMode(section);
        }
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        editMode[section] 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      } ${className}`}
    >
      {editMode[section] ? (
        <>
          <Save size={16} />
          <span>Save</span>
        </>
      ) : (
        <>
          <Edit3 size={16} />
          <span>Edit</span>
        </>
      )}
    </button>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <User className="mr-3 text-blue-600" size={24} />
              Personal Information
            </h2>
            <p className="text-gray-600 mt-1">Manage your basic profile details</p>
          </div>
          <EditButton section="basic" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {editMode.basic ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={tutorProfile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Heading</label>
                  <input
                    type="text"
                    value={tutorProfile.heading || ''}
                    onChange={(e) => handleProfileChange('heading', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Brief title or specialization..."
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-500">Full Name</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{tutorProfile.name}</p>
                </div>
                {tutorProfile.heading && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-sm font-semibold text-gray-500">Heading</span>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{tutorProfile.heading}</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="space-y-6">
            {editMode.basic ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={tutorProfile.description}
                    onChange={(e) => handleProfileChange('description', e.target.value)}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Tell students about yourself, your teaching style, and experience..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={tutorProfile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-500">Description</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{tutorProfile.description}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Phone className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-500">Phone Number</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{tutorProfile.phone}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Educational Qualifications */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <GraduationCap className="mr-3 text-green-600" size={24} />
              Educational Qualifications
            </h2>
            <p className="text-gray-600 mt-1">Your academic credentials and certifications</p>
          </div>
          <EditButton section="qualifications" />
        </div>
        
        {editMode.qualifications ? (
          <div className="space-y-6">
            {/* Selected Qualifications Display */}
            {tutorProfile.qualifications.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Selected Qualifications:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tutorProfile.qualifications.map((qualification, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                      {qualification}
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(qualification)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-600 hover:text-green-800 hover:bg-green-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Qualifications Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose from Standard Qualifications
              </label>
              <div className="border border-gray-300 rounded-xl bg-white">
                {/* Search Filter */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={qualificationFilter}
                      onChange={(e) => setQualificationFilter(e.target.value)}
                      className="pl-9 block w-full py-2 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                      placeholder="Search qualifications..."
                    />
                  </div>
                </div>
                
                {/* Qualifications List */}
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        {qualificationFilter ? `Results for "${qualificationFilter}"` : 'Available Qualifications'}
                      </p>
                    </div>
                    {getFilteredQualifications().length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm text-center">
                        No qualifications found for "{qualificationFilter}"
                      </div>
                    ) : (
                      getFilteredQualifications().map((qualification, index) => (
                        <label
                          key={index}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={tutorProfile.qualifications.includes(qualification)}
                            onChange={() => handleQualificationChange(qualification)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">{qualification}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Custom Qualification */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Custom Qualification
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={customQualification}
                    onChange={(e) => setCustomQualification(e.target.value)}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                    placeholder="e.g., MSc Data Science, Professional Certificate..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomQualification();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomQualification}
                  disabled={!customQualification.trim()}
                  className="px-4 py-3 border border-green-300 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Search and select from standard qualifications or add your own custom qualification
              </p>
            </div>
          </div>
        ) : (
          <div>
            {tutorProfile.qualifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorProfile.qualifications.map((qualification, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-800">{qualification}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Qualifications Added</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Click Edit to add your educational qualifications and certifications.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subjects and Titles */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BookOpen className="mr-3 text-blue-600" size={24} />
              Subjects & Titles
            </h2>
            <p className="text-gray-600 mt-1">Your teaching subjects and areas of expertise</p>
          </div>
          <EditButton section="subjects" />
        </div>
        
        {editMode.subjects ? (
          <div className="space-y-6">
            {/* Subjects Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subjects <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-xl bg-white">
                {/* Search Filter */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="pl-9 block w-full py-2 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      placeholder="Search subjects..."
                    />
                  </div>
                </div>
                
                {/* Subjects List */}
                <div className="max-h-64 overflow-y-auto">
                  {loadingSubjects ? (
                    <div className="p-4 text-gray-500 text-sm text-center">Loading subjects...</div>
                  ) : getFilteredSubjects().length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm text-center">
                      {subjectFilter ? `No subjects found for "${subjectFilter}"` : 'No subjects available'}
                    </div>
                  ) : (
                    <div className="p-2">
                      {getFilteredSubjects().map((subject) => (
                        <label
                          key={subject.sub_id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={tutorProfile.subjects.includes(subject.name)}
                            onChange={() => handleSubjectChange(subject.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {tutorProfile.subjects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tutorProfile.subjects.map((subjectName) => {
                    return (
                      <span
                        key={subjectName}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {subjectName}
                        <button
                          type="button"
                          onClick={() => handleSubjectChange(subjectName)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Custom Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Custom Subject
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    placeholder="e.g., Data Science, Robotics..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  disabled={!customSubject.trim()}
                  className="px-4 py-3 border border-blue-300 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                <strong>📚 Creating Custom Subjects:</strong> Can't find your subject? Add it here and it will be saved to the database permanently and made available for other tutors too!
              </p>
            </div>

            {/* Titles Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titles/Expertise <span className="text-red-500">*</span>
              </label>
              {tutorProfile.subjects.length === 0 ? (
                <div className="border border-gray-300 rounded-xl bg-gray-50 p-4 text-gray-500 text-sm text-center">
                  Please select subjects first to see available titles
                </div>
              ) : (
                <div className="border border-gray-300 rounded-xl bg-white">
                  {/* Search Filter */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                        className="pl-9 block w-full py-2 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                        placeholder="Search titles..."
                      />
                    </div>
                  </div>
                  
                  {/* Titles List */}
                  <div className="max-h-64 overflow-y-auto">
                    {loadingTitles ? (
                      <div className="p-4 text-gray-500 text-sm text-center">Loading titles...</div>
                    ) : getFilteredTitles().length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm text-center">
                        {titleFilter ? `No titles found for "${titleFilter}"` : 'No titles available for selected subjects'}
                      </div>
                    ) : (
                      <div className="p-2">
                        {getFilteredTitles().map((title) => {
                          const subjectRecord = availableSubjects.find(s => s.sub_id === title.sub_id);
                          const subjectName = subjectRecord?.name || '';
                          const isSelected = tutorProfile.titlesGroupedBySubject?.[subjectName]?.includes(title.name) || false;
                          
                          return (
                            <label
                              key={title.title_id}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTitleChange(title.name, subjectName)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm text-gray-700">{title.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tutorProfile.titles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tutorProfile.titles.map((titleName) => {
                    // Find the title record to get subject information
                    const titleRecord = availableTitles.find(t => t.name === titleName);
                    const subjectRecord = titleRecord ? availableSubjects.find(s => s.sub_id === titleRecord.sub_id) : null;
                    const subjectName = subjectRecord?.name || '';
                    
                    return titleRecord ? (
                      <span
                        key={titleName}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                      >
                        {titleName}
                        <button
                          type="button"
                          onClick={() => handleTitleChange(titleName, subjectName)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-600 hover:text-green-800 hover:bg-green-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Add Custom Title */}
            {tutorProfile.subjects.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Custom Title
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <select
                        value={selectedSubjectForCustomTitle}
                        onChange={(e) => setSelectedSubjectForCustomTitle(e.target.value)}
                        className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                      >
                        <option value="">Select subject for new title</option>
                        {tutorProfile.subjects.map(subjectName => {
                          const subject = availableSubjects.find(s => s.name === subjectName);
                          return subject ? (
                            <option key={subject.sub_id} value={subject.sub_id}>
                              {subject.name}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>
                  </div>
                  {selectedSubjectForCustomTitle && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                          placeholder="e.g., Machine Learning, Advanced Calculus..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomTitle();
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomTitle}
                        disabled={!customTitle.trim()}
                        className="px-4 py-3 border border-green-300 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  <strong>🎯 Creating Custom Titles:</strong> Can't find your area of expertise? First select a subject, then add your custom title. It will be saved to the database and made available for other tutors too!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {tutorProfile.subjects.length > 0 ? (
              <div className="space-y-6">
                {/* Show loading state if subjects/titles are still loading */}
                {(loadingSubjects || loadingTitles) && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                      <p className="text-sm text-blue-700">Loading subjects and titles...</p>
                    </div>
                  </div>
                )}
                
                {/* Display subjects with their titles using names */}
                {tutorProfile.subjects.map((subjectName) => {
                  // Get titles for this subject from grouped titles
                  const subjectTitles = tutorProfile.titlesGroupedBySubject?.[subjectName] || [];
                  
                  return (
                    <div key={subjectName} className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center mb-4">
                        <BookOpen className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                        <h3 className="font-semibold text-xl text-gray-800">
                          {subjectName}
                        </h3>
                      </div>
                      {subjectTitles.length > 0 ? (

                        <div className="flex flex-wrap gap-2">
                          {subjectTitles.map((titleName) => (
                            <span key={titleName} className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
                              {titleName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 italic">No specific titles selected for this subject</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Subjects Added</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Click Edit to add your teaching subjects and areas of expertise.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Hourly Rate</h2>
          <EditButton section="pricing" />
        </div>
        
        {editMode.pricing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate (Maximum: LKR 300)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">LKR</span>
              <input
                type="number"
                max="300"
                value={tutorProfile.hourlyRate}
                onChange={(e) => handleProfileChange('hourlyRate', Math.min(300, parseInt(e.target.value)))}
                className="text-2xl font-bold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
              <span className="text-gray-600">per hour</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Admin has set a maximum limit of $300 per hour
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">LKR {tutorProfile.hourlyRate}</div>
            <div className="text-gray-600">per hour</div>
            <div className="flex items-center justify-center mt-2">
              <span className="text-yellow-500 text-xl">★★★★★</span>
              <span className="ml-2 text-gray-600">{tutorProfile.rating}/5 ({tutorProfile.totalReviews} reviews)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSessions = () => {
    // Filter sessions based on current tab and search
    const getFilteredSessions = () => {
      let sessionList = [];
      switch (activeSessionTab) {
        case 'upcoming':
          sessionList = sessions.upcoming;
          break;
        case 'ongoing':
          sessionList = sessions.ongoing;
          break;
        case 'previous':
          sessionList = sessions.previous;
          break;
        case 'cancelled':
          sessionList = sessions.cancelled;
          break;
        default:
          sessionList = sessions.all;
      }
      
      // Apply search filter
      if (sessionFilter) {
        sessionList = sessionList.filter(sessionData => {
          const session = formatSession(sessionData);
          return session.studentName.toLowerCase().includes(sessionFilter.toLowerCase()) ||
                 session.subject.toLowerCase().includes(sessionFilter.toLowerCase()) ||
                 session.title.toLowerCase().includes(sessionFilter.toLowerCase());
        });
      }
      
      return sessionList;
    };

    const sessionTabs = [
      { id: 'upcoming', label: 'Upcoming', count: sessions.upcoming.length, color: 'blue', icon: Calendar },
      { id: 'ongoing', label: 'Ongoing', count: sessions.ongoing.length, color: 'orange', icon: Clock },
      { id: 'previous', label: 'Completed', count: sessions.previous.length, color: 'green', icon: CheckCircle },
      { id: 'cancelled', label: 'Cancelled', count: sessions.cancelled.length, color: 'red', icon: X }
    ];

    return (
      <div className="space-y-6">
        {/* Sessions Header with Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <BookOpen className="mr-3 text-blue-600" size={24} />
                Session Management
              </h2>
              <p className="text-gray-600 mt-1">Manage your tutoring sessions and materials</p>
            </div>
            {/* <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.completedSessions}</div>
                <div className="text-blue-200 text-sm">Total Completed</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.upcomingSessions}</div>
                <div className="text-blue-200 text-sm">Upcoming</div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Sessions Tabs and Content */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {sessionTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSessionTab(tab.id)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                      activeSessionTab === tab.id
                        ? tab.id === 'upcoming' 
                          ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-600'
                          : tab.id === 'previous'
                          ? 'text-green-700 bg-green-50 border-b-2 border-green-600'
                          : tab.id === 'cancelled'
                          ? 'text-red-700 bg-red-50 border-b-2 border-red-600'
                          : 'text-gray-700 bg-gray-50 border-b-2 border-gray-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center justify-center space-x-2">
                      <IconComponent className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activeSessionTab === tab.id
                          ? tab.id === 'upcoming' 
                            ? 'bg-blue-100 text-blue-700'
                            : tab.id === 'previous'
                            ? 'bg-green-100 text-green-700'
                            : tab.id === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by student name, subject, or title..."
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sessions Content */}
          <div className="p-6">
            {/* Info note for cancelled sessions */}
            {activeSessionTab === 'cancelled' && sessions.cancelled.length > 0 && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-amber-600 mr-2" />
                  <p className="text-sm text-amber-700">
                    Showing the latest 10 cancelled sessions. Older cancellations are archived to keep the interface clean.
                  </p>
                </div>
              </div>
            )}
            
            {getFilteredSessions().length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                  <BookOpen className="w-full h-full" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {sessionFilter ? 'No matching sessions found' : `No ${activeSessionTab} sessions`}
                </h3>
                <p className="text-gray-500">
                  {sessionFilter 
                    ? 'Try adjusting your search terms' 
                    : activeSessionTab === 'ongoing'
                      ? 'No sessions are currently active'
                      : activeSessionTab === 'cancelled'
                      ? 'You have no recent cancelled sessions'
                      : `You don't have any ${activeSessionTab} sessions yet`
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {getFilteredSessions().map((sessionData) => {
                  const session = formatSession(sessionData);
                  return (
                    <div 
                      key={session.id} 
                      className={`bg-white border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-lg ${
                        activeSessionTab === 'upcoming' 
                          ? 'border-blue-200 hover:border-blue-300' 
                          : activeSessionTab === 'ongoing'
                          ? 'border-orange-200 hover:border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50'
                          : activeSessionTab === 'previous' 
                          ? 'border-green-200 hover:border-green-300' 
                          : 'border-red-200 hover:border-red-300'
                      }`}
                    >
                      {/* Session Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            activeSessionTab === 'upcoming' 
                              ? 'bg-blue-500' 
                              : activeSessionTab === 'ongoing'
                              ? 'bg-orange-500'
                              : activeSessionTab === 'previous' 
                              ? 'bg-green-500' 
                              : 'bg-red-500'
                          }`}>
                            {session.studentName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                              {session.studentName}
                              {activeSessionTab === 'ongoing' && (
                                <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full flex items-center animate-pulse">
                                  <Clock size={12} className="mr-1" />
                                  Live Session
                                </span>
                              )}
                              {session.meeting_urls && session.meeting_urls.length > 0 && activeSessionTab === 'upcoming' && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center">
                                  <Video size={12} className="mr-1" />
                                  Meeting Ready
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-600 font-medium">{session.subject}</p>
                            <p className="text-sm text-gray-500">{session.title}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">LKR {session.amount}</div>
                          {session.rating && activeSessionTab === 'previous' && (
                            <div className="flex items-center justify-end mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (session.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-600">({session.rating}/5)</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center text-gray-700">
                            <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                            <div>
                              <span className="text-sm text-gray-500">Date</span>
                              <div className="font-semibold">{session.date}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-700">
                            <Clock className="w-5 h-5 mr-3 text-green-600" />
                            <div>
                              <span className="text-sm text-gray-500">Time</span>
                              <div className="font-semibold font-mono">{session.time}</div>
                              {/* Show time status for upcoming sessions */}
                              {activeSessionTab === 'upcoming' && (() => {
                                const originalSession = getFilteredSessions().find(s => s.session_id === session.id);
                                if (originalSession) {
                                  const canStart = isSessionTimeArrived(originalSession);
                                  const timeUntilStart = getTimeUntilCanStart(originalSession);
                                  
                                  if (canStart) {
                                    return (
                                      <div className="text-xs text-green-600 font-medium flex items-center mt-1">
                                        <CheckCircle size={12} className="mr-1" />
                                        Ready to start
                                      </div>
                                    );
                                  } else if (timeUntilStart) {
                                    return (
                                      <div className="text-xs text-orange-600 font-medium flex items-center mt-1">
                                        <Clock size={12} className="mr-1" />
                                        Starts in {timeUntilStart}
                                      </div>
                                    );
                                  }
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        </div>
                        
                        {activeSessionTab === 'cancelled' && session.reason && (
                          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                            <p className="text-sm font-medium text-red-800 mb-1">Cancellation Reason:</p>
                            <p className="text-sm text-red-600">{session.reason}</p>
                          </div>
                        )}
                      </div>

                      {/* Review Section for Previous Sessions */}
                      {session.review && activeSessionTab === 'previous' && (
                        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Student Review
                          </h4>
                          <p className="text-yellow-700 italic">"{session.review}"</p>
                        </div>
                      )}

                      {/* Materials Section for Upcoming Sessions */}
                      {activeSessionTab === 'upcoming' && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-800 flex items-center">
                              <FileText className="w-4 h-4 mr-2" />
                              Session Materials
                            </h4>
                          </div>
                          
                          {session.materials && session.materials.length > 0 ? (
                            <div className="space-y-2 mb-4">
                              {session.materials.map((material, index) => {
                                // Enhanced material handling for both string and Material object formats
                                let materialData: any = {};
                                let isEnhanced = false;
                                
                                if (typeof material === 'string') {
                                  if (material.startsWith('ENHANCED_MATERIAL:')) {
                                    // Parse enhanced material
                                    try {
                                      materialData = JSON.parse(material.replace('ENHANCED_MATERIAL:', ''));
                                      isEnhanced = true;
                                    } catch (e) {
                                      // Fallback to simple string
                                      materialData = { name: material, type: 'text' };
                                    }
                                  } else {
                                    // Simple string material
                                    materialData = { name: material, type: 'text' };
                                  }
                                } else {
                                  // Already an object
                                  materialData = material;
                                  isEnhanced = true;
                                }
                                
                                const materialName = materialData.name || 'Unnamed Material';
                                const materialType = materialData.type || 'text';
                                const materialUrl = materialData.url;
                                const materialSize = materialData.size;
                                
                                return (
                                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className="flex-shrink-0">
                                        {materialType === 'document' && <FileText className="w-5 h-5 text-red-500" />}
                                        {materialType === 'video' && <Video className="w-5 h-5 text-red-600" />}
                                        {materialType === 'link' && <ExternalLink className="w-5 h-5 text-green-600" />}
                                        {materialType === 'image' && <Camera className="w-5 h-5 text-blue-600" />}
                                        {materialType === 'text' && <MessageSquare className="w-5 h-5 text-gray-600" />}
                                        {materialType === 'presentation' && <VideoIcon className="w-5 h-5 text-orange-600" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium text-gray-700 truncate">{materialName}</span>
                                          {isEnhanced && materialUrl && (
                                            <a
                                              href={materialUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 transition-colors"
                                              title="Open file"
                                            >
                                              <ExternalLink size={14} />
                                            </a>
                                          )}
                                        </div>
                                        {materialSize && (
                                          <p className="text-xs text-gray-500">
                                            {materialSize > 0 ? `${(materialSize / 1024 / 1024).toFixed(2)} MB` : 'Size unknown'}
                                          </p>
                                        )}
                                        {!isEnhanced && materialUrl && (
                                          <p className="text-xs text-blue-600 truncate">{materialUrl}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {isEnhanced && materialUrl && (
                                        <button
                                          onClick={() => window.open(materialUrl, '_blank')}
                                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                                          title="Open file"
                                        >
                                          <Download size={16} />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => removeMaterial(session.id, index, materialName)}
                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                        title="Remove material"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic mb-4">No materials added yet</p>
                          )}
                          
                          {/* Add material form */}
                          {selectedSessionId === session.id ? (
                            <EnhancedMaterialUploader
                              sessionId={session.id}
                              onSuccess={() => {
                                setSelectedSessionId(null);
                                loadSessionsData(); // Reload sessions to show new materials
                              }}
                              onCancel={() => setSelectedSessionId(null)}
                              firebaseUid={currentUser?.uid || ''}
                            />
                          ) : (
                            <div className="flex space-x-3">
                              <button
                                onClick={() => setSelectedSessionId(session.id)}
                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Materials
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {activeSessionTab === 'upcoming' && (
                        <div className="flex flex-wrap gap-3">
                          {/* Check if session time has arrived */}
                          {(() => {
                            const originalSession = getFilteredSessions().find(s => s.session_id === session.id);
                            const canStart = originalSession ? isSessionTimeArrived(originalSession) : false;
                            const timeUntilStart = originalSession ? getTimeUntilCanStart(originalSession) : '';
                            
                            if (canStart) {
                              return (
                                <button
                                  onClick={() => handleZoomMeeting(session.id, session.studentName, session.meeting_urls)}
                                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                  <Video className="mr-2" size={18} />
                                  {session.meeting_urls && session.meeting_urls.length > 0 ? 'Start Session & Join Meeting' : 'Start Session'}
                                </button>
                              );
                            } else {
                              return (
                                <div className="flex items-center px-6 py-3 bg-gray-100 text-gray-500 rounded-lg border-2 border-dashed border-gray-300">
                                  <Clock className="mr-2" size={18} />
                                  {timeUntilStart ? `Available in ${timeUntilStart}` : 'Session not ready'}
                                </div>
                              );
                            }
                          })()}
                          
                          <button
                            onClick={() => {
                              // Find the original session data to pass to SessionActions
                              const originalSession = getFilteredSessions().find(s => s.session_id === session.id);
                              if (originalSession) {
                                openSessionActions(originalSession);
                              }
                            }}
                            className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                          >
                            <X className="mr-2" size={18} />
                            Cancel Session
                          </button>
                        </div>
                      )}

                      {/* Ongoing Session Actions */}
                      {activeSessionTab === 'ongoing' && (
                        <div className="flex flex-wrap gap-3">
                          {session.meeting_urls && session.meeting_urls.length > 0 && (
                            <button
                              onClick={() => {
                                // For ongoing sessions, just open the meeting without changing status
                                const zoomLink = session.meeting_urls && session.meeting_urls.length > 0 ? session.meeting_urls[0] : null;
                                if (zoomLink) {
                                  window.open(zoomLink, '_blank');
                                } else {
                                  alert('No meeting URL available for this session');
                                }
                              }}
                              className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                            >
                              <Video className="mr-2" size={18} />
                              Join Meeting
                            </button>
                          )}
                          
                          <button
                            onClick={() => completeSession(session.id, session.studentName)}
                            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            <CheckCircle className="mr-2" size={18} />
                            Complete Session
                          </button>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="flex justify-end mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          activeSessionTab === 'upcoming' 
                            ? 'bg-blue-100 text-blue-800' 
                            : activeSessionTab === 'ongoing'
                            ? 'bg-orange-100 text-orange-800'
                            : activeSessionTab === 'previous' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {activeSessionTab === 'upcoming' ? 'Scheduled' : 
                           activeSessionTab === 'ongoing' ? 'In Progress' :
                           activeSessionTab === 'previous' ? 'Completed' : 
                           session.refunded ? 'Refunded' : 'Cancelled'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };




  const renderEarnings = () => (
    <div className="space-y-6">
      {/* Earnings Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <DollarSign className="mr-3 text-green-600" size={24} />
          Earnings Dashboard
        </h2>
        <p className="text-gray-600 mt-1">Track your earnings and financial performance</p>
      </div>

      {earningsLoading && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Loading earnings data...</p>
          </div>
        </div>
      )}

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
              <p className="text-3xl font-bold text-green-600">
                LKR {EarningsService.formatCurrency(earningsData?.totalEarnings || tutorProfile.totalEarnings)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Gross revenue</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Admin Commission</h3>
              <p className="text-3xl font-bold text-red-600">
                LKR {EarningsService.formatCurrency(earningsData?.adminCommission || tutorProfile.adminCommission)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Platform fee</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Net Earnings</h3>
              <p className="text-3xl font-bold text-blue-600">
                LKR {EarningsService.formatCurrency(earningsData?.netEarnings || tutorProfile.profit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Your profit</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
              <p className="text-3xl font-bold text-purple-600">
                LKR {EarningsService.formatCurrency(earningsData?.thisMonthEarnings || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Current month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-green-600" size={20} />
            Earnings Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Sessions Completed
              </span>
              <span className="font-semibold">{earningsData?.completedSessions || sessions.previous.length}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                Average Session Value
              </span>
              <span className="font-semibold text-green-600">
                LKR {EarningsService.formatCurrency(earningsData?.averageSessionValue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-red-600" />
                Platform Commission
              </span>
              <span className="font-semibold text-red-600">
                -LKR {EarningsService.formatCurrency(earningsData?.adminCommission || tutorProfile.adminCommission)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 text-lg font-bold border-t border-gray-300 pt-4">
              <span className="text-gray-800 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Net Earnings
              </span>
              <span className="text-blue-600">
                LKR {EarningsService.formatCurrency(earningsData?.netEarnings || tutorProfile.profit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-600" size={20} />
            Recent Performance
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">This Week</span>
              <span className="font-semibold text-blue-600">
                LKR {EarningsService.formatCurrency(earningsData?.thisWeekEarnings || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">Today</span>
              <span className="font-semibold text-green-600">
                LKR {EarningsService.formatCurrency(earningsData?.todayEarnings || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">Pending Payments</span>
              <span className="font-semibold text-orange-600">
                {earningsData?.pendingPayments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">Paid Sessions</span>
              <span className="font-semibold text-green-600">
                {earningsData?.paidPayments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="mr-2 text-purple-600" size={20} />
          Recent Payments
        </h2>
        {recentPayments.length > 0 ? (
          <div className="space-y-3">
            {recentPayments.slice(0, 6).map((payment) => (
              <div key={payment.session_id} className="flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors rounded-lg px-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{payment.student_name}</p>
                  <p className="text-sm text-gray-600">{payment.subject} - {new Date(payment.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Status: {payment.payment_status}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">LKR {EarningsService.formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-gray-600">Commission: LKR {EarningsService.formatCurrency(payment.commission)}</p>
                  <p className="text-sm font-medium text-blue-600">Net: LKR {EarningsService.formatCurrency(payment.net_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-400">No payments yet</p>
            <p className="text-sm text-gray-400">Payments will appear here once you complete sessions</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      {reviewsLoading && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Loading reviews data...</p>
          </div>
        </div>
      )}

      {/* Rating Overview */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Star className="mr-3 text-yellow-500" size={24} />
          Reviews & Ratings Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating */}
          <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
            <div className="text-5xl font-bold text-yellow-600 mb-3">
              {reviewStats?.averageRating?.toFixed(1) || tutorProfile.rating}
            </div>
            <div className="flex justify-center items-center mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={`${
                      star <= (reviewStats?.averageRating || tutorProfile.rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 font-medium">
              Based on {reviewStats?.totalReviews || tutorProfile.totalReviews} reviews
            </p>
          </div>

          {/* Response Rate */}
          <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="text-5xl font-bold text-blue-600 mb-3">
              {reviewStats?.responseRate?.toFixed(0) || 0}%
            </div>
            <div className="flex justify-center mb-3">
              <MessageSquare className="text-blue-500" size={24} />
            </div>
            <p className="text-gray-700 font-medium">Response Rate</p>
          </div>

          {/* Monthly Reviews */}
          <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="text-5xl font-bold text-green-600 mb-3">
              {reviewStats?.recentReviews?.length || 0}
            </div>
            <div className="flex justify-center mb-3">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className="text-gray-700 font-medium">Recent Reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        {reviewStats && (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewStats.ratingDistribution[stars as keyof typeof reviewStats.ratingDistribution] || 0;
                const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center space-x-4">
                    <div className="flex items-center w-12">
                      <span className="text-sm font-medium text-gray-600">{stars}</span>
                      <Star size={14} className="text-yellow-500 ml-1" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300" 
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">{count}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Subject Ratings */}
      {reviewStats?.subjectRatings && Object.keys(reviewStats.subjectRatings).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={20} />
            Subject-wise Ratings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reviewStats.subjectRatings).map(([subject, data]) => (
              <div key={subject} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2">{subject}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    <span className="font-bold text-lg">{data.average.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-600">({data.count} reviews)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <MessageSquare className="mr-2 text-purple-600" size={20} />
          Recent Reviews
        </h3>
        {reviewsData.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.slice(0, 10).map((review) => (
              <div key={review.review_id} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{review.student_name}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {review.subject}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {ReviewsService.formatReviewDate(review.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {review.isVerified && (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
                {review.review && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 italic">"{review.review}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Star className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Reviews Yet</h3>
            <p className="text-sm text-gray-400">
              Reviews from students will appear here after completed sessions
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const navigate = useNavigate();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfile();
      case 'schedule':
        navigate('/manageSchedule');
        return null; 
      case 'sessions':
        return renderSessions();
      case 'earnings':
        return renderEarnings();
      case 'reviews':
        return renderReviews();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderProfile();
    }
  };


  // Add Analytics Component
  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
            <p className="text-purple-100 text-lg">Comprehensive insights into your tutoring performance</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <BarChart3 className="w-12 h-12 text-white" />
          </div>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Earnings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            LKR {earningsData ? EarningsService.formatCurrency(earningsData.netEarnings) : '0'}
          </div>
          <div className="text-sm text-gray-600">Net Earnings</div>
          <div className="text-xs text-green-600 mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {earningsData ? `${earningsData.paidPayments} payments` : 'No payments yet'}
          </div>
        </div>

        {/* This Month Earnings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            LKR {earningsData ? EarningsService.formatCurrency(earningsData.thisMonthEarnings) : '0'}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
          <div className="text-xs text-blue-600 mt-2 flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            {sessionStats ? `${sessionStats.completedSessions} completed` : 'No sessions yet'}
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-yellow-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Rating</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
            {reviewStats ? reviewStats.averageRating.toFixed(1) : '0.0'}
            <Star className="w-5 h-5 text-yellow-400 ml-1 fill-current" />
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
          <div className="text-xs text-yellow-600 mt-2 flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {reviewStats ? `${reviewStats.totalReviews} reviews` : 'No reviews yet'}
          </div>
        </div>

        {/* Session Completion Rate */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-purple-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Success</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {sessionStats && sessionStats.totalSessions > 0 
              ? Math.round((sessionStats.completedSessions / sessionStats.totalSessions) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-600">Completion Rate</div>
          <div className="text-xs text-purple-600 mt-2 flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            {sessionStats ? `${sessionStats.completedSessions}/${sessionStats.totalSessions} sessions` : 'No data'}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={20} />
            Monthly Earnings Trend
          </h3>
          {earningsData?.monthlyBreakdown && earningsData.monthlyBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={earningsData.monthlyBreakdown.slice(-6).map(month => ({
                  month: `${month.month.slice(0, 3)} ${month.year}`,
                  gross: month.grossEarnings,
                  net: month.netEarnings,
                  sessions: month.sessions
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `LKR ${value}`}
                />
                <Tooltip 
                  formatter={(value, name) => [
                    `LKR ${EarningsService.formatCurrency(Number(value))}`, 
                    name === 'gross' ? 'Gross Earnings' : name === 'net' ? 'Net Earnings' : 'Sessions'
                  ]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="gross" 
                  stackId="1" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="net" 
                  stackId="2" 
                  stroke="#059669" 
                  fill="#059669" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-2 opacity-50" />
                <p>No earnings data available</p>
              </div>
            </div>
          )}
        </div>

        {/* Session Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <PieChart className="mr-2 text-blue-600" size={20} />
            Session Distribution
          </h3>
          {sessionStats && sessionStats.totalSessions > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: sessionStats.completedSessions, color: '#10b981' },
                    { name: 'Upcoming', value: sessionStats.upcomingSessions, color: '#3b82f6' },
                    { name: 'Ongoing', value: sessionStats.ongoingSessions, color: '#f59e0b' },
                    { name: 'Cancelled', value: sessionStats.cancelledSessions, color: '#ef4444' }
                  ].filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {[
                    { name: 'Completed', value: sessionStats.completedSessions, color: '#10b981' },
                    { name: 'Upcoming', value: sessionStats.upcomingSessions, color: '#3b82f6' },
                    { name: 'Ongoing', value: sessionStats.ongoingSessions, color: '#f59e0b' },
                    { name: 'Cancelled', value: sessionStats.cancelledSessions, color: '#ef4444' }
                  ].filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} sessions`, 'Count']} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                <p>No session data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Distribution Chart */}
      {reviewStats && reviewStats.totalReviews > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Star className="mr-2 text-yellow-600" size={20} />
            Rating Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(reviewStats.ratingDistribution)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([rating, count]) => ({
                  rating: `${rating} Star${rating !== '1' ? 's' : ''}`,
                  count: count,
                  percentage: reviewStats.totalReviews > 0 ? ((count / reviewStats.totalReviews) * 100).toFixed(1) : '0'
                }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="rating" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'Number of Reviews', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} reviews (${props.payload.percentage}%)`, 
                  'Count'
                ]}
                labelFormatter={(label) => label}
              />
              <Bar 
                dataKey="count" 
                fill="#fbbf24"
                radius={[4, 4, 0, 0]}
              >
                {Object.entries(reviewStats.ratingDistribution).map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(${45 + index * 15}, 70%, ${60 - index * 5}%)`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject Performance Chart */}
      {reviewStats?.subjectRatings && Object.keys(reviewStats.subjectRatings).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={20} />
            Subject Performance Analysis
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject Ratings Chart */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-4">Average Ratings by Subject</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={Object.entries(reviewStats.subjectRatings).map(([subject, data]) => ({
                    subject: subject.length > 15 ? subject.substring(0, 15) + '...' : subject,
                    fullSubject: subject,
                    rating: data.average,
                    count: data.count
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    domain={[0, 5]}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${Number(value).toFixed(1)}/5.0 (${props.payload.count} reviews)`, 
                      'Average Rating'
                    ]}
                    labelFormatter={(label, payload) => 
                      payload && payload[0] ? payload[0].payload.fullSubject : label
                    }
                  />
                  <Bar 
                    dataKey="rating" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  >
                    {Object.entries(reviewStats.subjectRatings).map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={`hsl(${200 + index * 20}, 70%, ${50 + index * 5}%)`} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Review Count Chart */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-4">Review Volume by Subject</h4>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Pie
                    data={Object.entries(reviewStats.subjectRatings).map(([subject, data]) => ({
                      name: subject,
                      value: data.count,
                      percentage: ((data.count / reviewStats.totalReviews) * 100).toFixed(1)
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {Object.entries(reviewStats.subjectRatings).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} reviews (${props.payload.percentage}%)`, 
                      'Count'
                    ]}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Timeline Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="mr-2 text-green-600" size={18} />
            Recent Payment Trend
          </h3>
          {recentPayments && recentPayments.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={recentPayments.slice().reverse().map((payment, index) => ({
                    index: index + 1,
                    amount: payment.net_amount,
                    date: new Date(payment.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    }),
                    student: payment.student_name
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => `LKR ${value}`}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `LKR ${EarningsService.formatCurrency(Number(value))}`, 
                      'Net Payment'
                    ]}
                    labelFormatter={(label, payload) => 
                      payload && payload[0] 
                        ? `${payload[0].payload.date} - ${payload[0].payload.student}`
                        : label
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Recent Payment List */}
              <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                {recentPayments.slice(0, 3).map((payment) => (
                  <div key={payment.session_id} className="flex items-center justify-between py-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{payment.student_name}</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      +LKR {EarningsService.formatCurrency(payment.net_amount)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent payments</p>
            </div>
          )}
        </div>

        {/* Enhanced Session Statistics with Mini Charts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-purple-600" size={18} />
            Session Performance
          </h3>
          {sessionStats && sessionStats.totalSessions > 0 ? (
            <div className="space-y-4">
              {/* Mini Donut Chart */}
              <ResponsiveContainer width="100%" height={150}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: sessionStats.completedSessions, color: '#10b981' },
                      { name: 'Upcoming', value: sessionStats.upcomingSessions, color: '#3b82f6' },
                      { name: 'Ongoing', value: sessionStats.ongoingSessions, color: '#f59e0b' },
                      { name: 'Cancelled', value: sessionStats.cancelledSessions, color: '#ef4444' }
                    ].filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {[
                      { name: 'Completed', value: sessionStats.completedSessions, color: '#10b981' },
                      { name: 'Upcoming', value: sessionStats.upcomingSessions, color: '#3b82f6' },
                      { name: 'Ongoing', value: sessionStats.ongoingSessions, color: '#f59e0b' },
                      { name: 'Cancelled', value: sessionStats.cancelledSessions, color: '#ef4444' }
                    ].filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} sessions`, 'Count']} />
                </RechartsPieChart>
              </ResponsiveContainer>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="text-sm font-bold text-green-600">{sessionStats.completedSessions}</div>
                  <div className="text-xs text-green-700">Completed</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-sm font-bold text-blue-600">{sessionStats.upcomingSessions}</div>
                  <div className="text-xs text-blue-700">Upcoming</div>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <div className="text-sm font-bold text-orange-600">{sessionStats.ongoingSessions}</div>
                  <div className="text-xs text-orange-700">Ongoing</div>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <div className="text-sm font-bold text-red-600">{sessionStats.cancelledSessions}</div>
                  <div className="text-xs text-red-700">Cancelled</div>
                </div>
              </div>
              
              {/* Success Rate */}
              <div className="pt-3 border-t border-gray-200 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {sessionStats.totalSessions > 0 
                    ? `${Math.round((sessionStats.completedSessions / sessionStats.totalSessions) * 100)}%`
                    : '0%'}
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${sessionStats.totalSessions > 0 
                        ? (sessionStats.completedSessions / sessionStats.totalSessions) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No session data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Yearly Earnings Overview */}
      {earningsData?.yearlyEarnings && Object.keys(earningsData.yearlyEarnings).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <CalendarIcon className="mr-2 text-purple-600" size={20} />
            Yearly Earnings Overview ({new Date().getFullYear()})
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={Object.entries(earningsData.yearlyEarnings).map(([month, earnings]) => ({
                month,
                earnings: Number(earnings),
                netEarnings: Number(earnings) * 0.9, // After 10% commission
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `LKR ${value}`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `LKR ${EarningsService.formatCurrency(Number(value))}`, 
                  name === 'earnings' ? 'Gross Earnings' : 'Net Earnings'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="earnings" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#earningsGradient)" 
              />
              <Line 
                type="monotone" 
                dataKey="netEarnings" 
                stroke="#7c3aed" 
                strokeWidth={2}
                dot={{ fill: '#7c3aed' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Enhanced Performance Insights with Visual Indicators */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="mr-2 text-indigo-600" size={18} />
          Performance Insights & Recommendations
        </h3>
        
        {/* Overall Performance Score */}
        <div className="mb-6 p-4 bg-white rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-semibold text-gray-800">Overall Performance Score</span>
            <div className="flex items-center space-x-2">
              {(() => {
                const ratingScore = reviewStats ? (reviewStats.averageRating / 5) * 30 : 0;
                const sessionScore = sessionStats ? (sessionStats.completedSessions / Math.max(sessionStats.totalSessions, 1)) * 30 : 0;
                const earningsScore = earningsData && earningsData.thisMonthEarnings > 0 ? Math.min((earningsData.thisMonthEarnings / 5000) * 40, 40) : 0;
                const totalScore = ratingScore + sessionScore + earningsScore;
                
                return (
                  <>
                    <span className="text-2xl font-bold text-indigo-600">{Math.round(totalScore)}/100</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${totalScore}%` }}
                      ></div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-yellow-600 font-semibold">
                {reviewStats ? Math.round((reviewStats.averageRating / 5) * 100) : 0}%
              </div>
              <div className="text-gray-600">Rating Score</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 font-semibold">
                {sessionStats ? Math.round((sessionStats.completedSessions / Math.max(sessionStats.totalSessions, 1)) * 100) : 0}%
              </div>
              <div className="text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-green-600 font-semibold">
                {earningsData && earningsData.thisMonthEarnings > 0 ? Math.min(Math.round((earningsData.thisMonthEarnings / 5000) * 100), 100) : 0}%
              </div>
              <div className="text-gray-600">Earnings Target</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center space-x-2 mb-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-medium text-gray-800">Top Strength</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {reviewStats && reviewStats.averageRating >= 4.5 
                  ? "🌟 Excellent student satisfaction ratings"
                  : reviewStats && reviewStats.averageRating >= 4.0
                  ? "⭐ Strong teaching performance"
                  : "📈 Focus on improving student experience"}
              </p>
              {reviewStats && reviewStats.averageRating >= 4.0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-xs text-yellow-700 font-medium">
                    {reviewStats.averageRating.toFixed(1)}/5.0 average rating
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-800">Growth Opportunity</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {sessionStats && sessionStats.totalSessions < 10
                  ? "🎯 Build more teaching experience"
                  : earningsData && earningsData.thisMonthEarnings < 1000
                  ? "📈 Increase session frequency"
                  : "🚀 Expand subject offerings"}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-xs text-blue-700 font-medium">
                  {sessionStats ? `${sessionStats.totalSessions} total sessions` : 'No sessions yet'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-green-400">
            <div className="flex items-center space-x-2 mb-3">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-800">Activity Level</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {sessionStats && sessionStats.upcomingSessions > 5
                  ? "🔥 High activity - great engagement!"
                  : sessionStats && sessionStats.upcomingSessions > 2
                  ? "⚡ Moderate activity level"
                  : "💡 Consider scheduling more sessions"}
              </p>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-700 font-medium">
                  {sessionStats ? `${sessionStats.upcomingSessions} upcoming sessions` : 'No upcoming sessions'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Recommendations */}
        <div className="mt-6 p-4 bg-white rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-purple-600" />
            Recommended Actions
          </h4>
          <div className="space-y-2 text-sm">
            {(!reviewStats || reviewStats.averageRating < 4.0) && (
              <div className="flex items-center space-x-2 text-orange-700">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Focus on collecting more positive reviews from students</span>
              </div>
            )}
            {sessionStats && sessionStats.upcomingSessions < 3 && (
              <div className="flex items-center space-x-2 text-blue-700">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Schedule more sessions to increase your visibility</span>
              </div>
            )}
            {earningsData && earningsData.thisMonthEarnings < 2000 && (
              <div className="flex items-center space-x-2 text-green-700">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Consider raising your hourly rate or offering more sessions</span>
              </div>
            )}
            {(!reviewStats || reviewStats.totalReviews < 10) && (
              <div className="flex items-center space-x-2 text-purple-700">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Encourage students to leave reviews after sessions</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      
      {/* Enhanced Professional Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-8 mb-8 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative flex-shrink-0">
              <img 
                src={tutorProfile.photo_url || '/default-profile.png'} 
                alt={tutorProfile.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              {/* Image Edit Button */}
              <button
                onClick={() => setShowImageEditModal(true)}
                className="absolute inset-0 w-32 h-32 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-4xl font-bold mb-2">{tutorProfile.name}</h1>
              <p className="text-blue-100 text-lg mb-3">Individual Tutor • Expert Educator</p>
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
                  <Star className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="font-semibold text-gray-800">{tutorProfile.rating}</span>
                  <span className="text-gray-600 ml-1">({tutorProfile.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center bg-white bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full border border-white border-opacity-30">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-800">LKR {tutorProfile.hourlyRate}/hour</span>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 text-center border border-white border-opacity-30">
                  <div className="text-2xl font-bold text-gray-800">{sessionStats?.completedSessions || 0}</div>
                  <div className="text-gray-600 text-sm font-bold">Sessions Completed</div>
                </div>
                <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 text-center border border-white border-opacity-30">
                  <div className="text-2xl font-bold text-gray-800">LKR {earningsData ? (earningsData.netEarnings / 1000).toFixed(1) : '0'}K</div>
                  <div className="text-gray-600 text-sm font-bold">Total Earnings</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'sessions', label: 'Sessions', icon: BookOpen },
              { id: 'earnings', label: 'Earnings', icon: DollarSign },
              { id: 'reviews', label: 'Reviews', icon: Star },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 font-semibold text-lg transition-all duration-300 whitespace-nowrap flex items-center ${
                    activeTab === tab.id
                      ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content with Professional Spacing */}
        <div className="min-h-[600px]">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <LoadingState />
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>

      {/* Image Edit Modal */}
      {showImageEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleImageCancel}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Camera className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">Update Profile Image</h3>
              </div>
              <button
                onClick={handleImageCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {/* Current Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={imagePreview || tutorProfile.photo_url || '/default-profile.png'}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover mx-auto"
                  />
                  {imagePreview && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {imagePreview ? 'New image selected' : 'Current profile image'}
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose New Image
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Maximum size: 5MB
                  </p>
                </div>

                {selectedImage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Upload className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800 font-medium">
                        {selectedImage.name}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <Camera className="w-4 h-4 inline mr-1" />
                Update your profile image
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleImageCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageSave}
                  disabled={!selectedImage || !imagePreview}
                  data-save-button
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedImage && imagePreview
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Update Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Material Modal */}
      {/* {showMaterialModal && selectedSessionForMaterial && (
        <EnhancedMaterialModal
          sessionId={selectedSessionForMaterial}
          onClose={() => {
            setShowMaterialModal(false);
            setSelectedSessionForMaterial(null);
          }}
          onAdd={addEnhancedMaterial}
        />
      )} */}

      {/* Session Actions Modal */}
      {showSessionActions && selectedSessionForActions && (
        <SessionActions
          session={{
            sessionId: selectedSessionForActions.id,
            studentName: selectedSessionForActions.studentName,
            subject: selectedSessionForActions.subject,
            title: selectedSessionForActions.title,
            date: selectedSessionForActions.date,
            time: selectedSessionForActions.time,
            amount: selectedSessionForActions.amount,
            status: selectedSessionForActions.status
          }}
          onCancel={handleSessionCancel}
          onClose={closeSessionActions}
        />
      )}
    </div>
  );
};

export default TutorDashboard;
