import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, 
  Video, 
  X, 
  Plus,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import NavBar from '../components/Navbar';

interface VideoFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
}

interface VideoFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  price: string;
  tags: string[];
  isPublic: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

interface Notification {
  type: 'success' | 'error' | '';
  message: string;
  isVisible: boolean;
}

export default function TutorVideoUpload() {
  const [uploadedVideos, setUploadedVideos] = useState<VideoFile[]>([]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notification, setNotification] = useState<Notification>({
    type: '',
    message: '',
    isVisible: false
  });

  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    duration: '',
    price: '',
    tags: [],
    isPublic: true
  });

  const videoCategories: string[] = [
    'Mathematics', 'Science', 'English', 'History', 'Computer Science', 
    'Languages', 'Test Prep', 'Arts', 'Business', 'Engineering'
  ];

  const difficultyLevels: string[] = ['Beginner', 'Intermediate', 'Advanced'];

  const showNotification = (type: 'success' | 'error', message: string): void => {
    setNotification({ type, message, isVisible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  };

  const handleDrag = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList): void => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('video/')) {
        const videoId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newVideo: VideoFile = {
          id: videoId,
          file,
          progress: 0,
          status: 'uploading'
        };
        
        setUploadedVideos(prev => [...prev, newVideo]);
        uploadVideo(newVideo);
      } else {
        showNotification('error', 'Please select only video files');
      }
    });
  };

  const uploadVideo = async (video: VideoFile): Promise<void> => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('video', video.file);
    formData.append('tutorId', '686242b9a59b76567df790a4');

    try {
      const response = await axios.post('http://localhost:8000/api/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            
            setUploadedVideos(prev => prev.map(v => 
              v.id === video.id ? { ...v, progress: percentCompleted } : v
            ));
          }
        }
      });

      setUploadedVideos(prev => prev.map(v => 
        v.id === video.id 
          ? { ...v, status: 'completed', url: response.data.videoUrl }
          : v
      ));
      
      showNotification('success', 'Video uploaded successfully!');
    } catch (error) {
      setUploadedVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, status: 'error' } : v
      ));
      showNotification('error', 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const removeVideo = (videoId: string): void => {
    setUploadedVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const addTag = (): void => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string): void => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (field: keyof VideoFormData, value: any): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.duration.trim()) errors.duration = 'Duration is required';
    if (!formData.price.trim()) errors.price = 'Price is required';
    if (uploadedVideos.length === 0) errors.video = 'Please upload at least one video';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      showNotification('error', 'Please fill in all required fields');
      return;
    }

    try {
      const courseData = {
        ...formData,
        tags: [...tags],
        videos: uploadedVideos.filter(v => v.status === 'completed').map(v => ({
          id: v.id,
          filename: v.file.name,
          url: v.url
        }))
      };

      await axios.post('http://localhost:8000/api/create-course', courseData);
      showNotification('success', 'Course created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'Beginner',
        duration: '',
        price: '',
        tags: [],
        isPublic: true
      });
      setTags([]);
      setUploadedVideos([]);
    } catch (error) {
      showNotification('error', 'Failed to create course');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Notification */}
      {notification.isVisible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="px-8 py-6 border-b">
            <h1 className="text-3xl font-bold text-gray-800">Upload New Course</h1>
            <p className="text-gray-600 mt-2">Create and upload a new course for your students</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Video Upload */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Videos</h2>
                
                {/* Drag and Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop videos here
                  </p>
                  <p className="text-gray-500 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Upload className="inline w-4 h-4 mr-2" />
                    Choose Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Videos List */}
                {uploadedVideos.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Uploaded Videos</h3>
                    <div className="space-y-3">
                      {uploadedVideos.map(video => (
                        <div key={video.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium truncate">{video.file.name}</span>
                            <button
                              onClick={() => removeVideo(video.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {video.status === 'uploading' && (
                              <>
                                <Loader className="animate-spin w-4 h-4 text-blue-500" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-500 h-2 rounded-full transition-all"
                                    style={{ width: `${video.progress}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-500">{video.progress}%</span>
                              </>
                            )}
                            
                            {video.status === 'completed' && (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600">Upload complete</span>
                              </>
                            )}
                            
                            {video.status === 'error' && (
                              <>
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-red-600">Upload failed</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Course Details */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Course Details</h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter course title"
                    />
                    {validationErrors.title && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Describe your course..."
                    />
                    {validationErrors.description && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {videoCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {validationErrors.category && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.category}</p>
                    )}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {difficultyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration and Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.duration ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 2 hours"
                      />
                      {validationErrors.duration && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.duration}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          validationErrors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0.00"
                      />
                      {validationErrors.price && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a tag"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Public/Private */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                        className="mr-2"
                      />
                      Make this course public
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-end space-x-4">
                <Link
                  to="/tutor/courses"
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isUploading ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
