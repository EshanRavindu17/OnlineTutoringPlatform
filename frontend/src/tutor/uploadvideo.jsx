import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, 
  Video, 
  X, 
  Play, 
  Pause, 
  Volume2, 
  FileVideo, 
  Check, 
  AlertCircle,
  BookOpen,
  Tag,
  Clock,
  Users,
  Star,
  ChevronDown,
  Plus,
  Trash2,
  Menu,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react';
import NavBar from '../components/Navbar';

export default function TutorVideoUpload() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploadedVideos, setUploadedVideos] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [notification, setNotification] = useState({
  type: '',    // 'success' | 'error'
  message: '',
  isVisible: false
});


  const videoCategories = [
    'Mathematics', 'Science', 'English', 'History', 'Computer Science', 
    'Languages', 'Test Prep', 'Arts', 'Business', 'Engineering'
  ];

  const difficultyLevels = [
    'Beginner', 'Intermediate', 'Advanced', 'Expert'
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFileInput = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
    e.target.value = null;
  };

  // BEFORE UPLOAD: File validation and preparation
  const validateFile = (file) => {
    const errors = [];
    const maxSize = 3000 * 1024 * 1024; // 500MB
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported. Please use MP4, MOV, AVI, or WebM');
    }
    
    if (file.size > maxSize) {
      errors.push('File size exceeds 500MB limit');
    }
    
    if (file.size < 1024) { // Less than 1KB
      errors.push('File appears to be corrupted or empty');
    }
    
    return errors;
  };

  const handleFiles = (files) => {
    files.forEach(file => {
      // BEFORE UPLOAD: Validate file
      const fileErrors = validateFile(file);
      
      if (fileErrors.length > 0) {
        alert(`Error with file ${file.name}:\n${fileErrors.join('\n')}`);
        return;
      }

      if (file.type.startsWith('video/')) {
        const videoId = Date.now() + Math.random();
        const newVideo = {
          id: videoId,
          file: file,
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          title: '',
          description: '',
          category: '',
          difficulty: '',
          duration: '',
          tags: [],
          isPublic: true,
          status: 'pending', // Start with pending status
          uploadedAt: null,
          videoId: null // Will be set after successful upload
        };

        setUploadedVideos(prev => [...prev, newVideo]);
        setCurrentVideo(newVideo);
        
        // BEFORE UPLOAD: Generate thumbnail and get video metadata
        generateVideoMetadata(newVideo);
      }
    });
  };

  // BEFORE UPLOAD: Extract video metadata
  const generateVideoMetadata = (video) => {
    const videoElement = document.createElement('video');
    videoElement.src = video.url;
    
    videoElement.addEventListener('loadedmetadata', () => {
      const durationMinutes = Math.ceil(videoElement.duration / 60);
      updateVideoInfo(video.id, 'duration', durationMinutes.toString());
      
      // Generate a suggested title from filename
      const suggestedTitle = video.name
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
      
      updateVideoInfo(video.id, 'title', suggestedTitle);
    });
  };

  // BEFORE UPLOAD: Validation
  const validateVideoForUpload = (video) => {
    const errors = {};
    
    if (!video.title || video.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long';
    }
    
    if (video.title && video.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    if (!video.category) {
      errors.category = 'Please select a category';
    }
    
    if (video.description && video.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }
    
    if (video.duration && (isNaN(video.duration) || parseInt(video.duration) <= 0)) {
      errors.duration = 'Duration must be a positive number';
    }
    
    return errors;
  };

  const simulateUpload = (videoId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedVideos(prev => 
          prev.map(video => 
            video.id === videoId 
              ? { ...video, status: 'uploaded' }
              : video
          )
        );
      }
      setUploadProgress(prev => ({ ...prev, [videoId]: progress }));
    }, 200);
  };

  const removeVideo = (videoId) => {
    // Clean up object URL to prevent memory leaks
    const videoToRemove = uploadedVideos.find(v => v.id === videoId);
    if (videoToRemove && videoToRemove.url) {
      URL.revokeObjectURL(videoToRemove.url);
    }
    
    setUploadedVideos(prev => prev.filter(video => video.id !== videoId));
    if (currentVideo && currentVideo.id === videoId) {
      setCurrentVideo(null);
    }
    
    // Clear validation errors for this video
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[videoId];
      return newErrors;
    });
  };

  const updateVideoInfo = (videoId, field, value) => {
    setUploadedVideos(prev => 
      prev.map(video => 
        video.id === videoId 
          ? { ...video, [field]: value }
          : video
      )
    );
    if (currentVideo && currentVideo.id === videoId) {
      setCurrentVideo(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear validation error for this field
    if (validationErrors[videoId] && validationErrors[videoId][field]) {
      setValidationErrors(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          [field]: undefined
        }
      }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && currentVideo) {
      const updatedTags = [...currentVideo.tags, newTag.trim()];
      updateVideoInfo(currentVideo.id, 'tags', updatedTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    if (currentVideo) {
      const updatedTags = currentVideo.tags.filter(tag => tag !== tagToRemove);
      updateVideoInfo(currentVideo.id, 'tags', updatedTags);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // BEFORE UPLOAD: Pre-upload preparation
  const prepareForUpload = async (video) => {
    // Validate the video
    const errors = validateVideoForUpload(video);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [video.id]: errors
      }));
      return false;
    }
    
    // Clear any existing errors
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[video.id];
      return newErrors;
    });
    
    return true;
  };




  // AFTER UPLOAD: Post-upload cleanup and success handling
  const handleUploadSuccess = (video, responseData) => {
    // Update video with server response
    updateVideoInfo(video.id, 'videoId', responseData.id);
    updateVideoInfo(video.id, 'uploadedAt', new Date().toISOString());
    updateVideoInfo(video.id, 'status', 'uploaded');
    
    // Clean up the local file URL since we now have the server URL
    if (video.url && video.url.startsWith('blob:')) {
      URL.revokeObjectURL(video.url);
    }
    
    // Update with server URL if provided
    if (responseData.url) {
      updateVideoInfo(video.id, 'url', responseData.url);
    }
    
    // Show success message
    showNotification('success', `"${video.title}" uploaded successfully!`);
    
    // Reset current video selection
    setCurrentVideo(null);
    if (window.history.state && window.history.state.usr?.returnTo) {
  const { returnTo, sectionIndex, lessonIndex, step } = window.history.state.usr;
  window.location.href = `${returnTo}?section=${sectionIndex}&lesson=${lessonIndex}&step=${step || 3}`;
}

  };

  // AFTER UPLOAD: Error handling
  const handleUploadError = (video, error) => {
    updateVideoInfo(video.id, 'status', 'error');
    updateVideoInfo(video.id, 'errorMessage', error.message || 'Upload failed');
    
    showNotification('error', `Upload failed for "${video.title}": ${error.message || 'Unknown error'}`);
  };

  const showNotification = (type, message) => {
  setNotification({ type, message, isVisible: true });
  // hide after 3s
  setTimeout(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, 3000);
};


  const saveVideo = async () => {
    if (!currentVideo) return;

    setIsUploading(true);

    try {
      // BEFORE UPLOAD: Preparation and validation
      const isValid = await prepareForUpload(currentVideo);
      if (!isValid) {
        setIsUploading(false);
        return;
      }

      // Mark as uploading
      updateVideoInfo(currentVideo.id, 'status', 'uploading');

      // Build the form payload
      const form = new FormData();
      form.append('video', currentVideo.file);
      form.append('title', currentVideo.title);
      form.append('description', currentVideo.description);
      form.append('category', currentVideo.category);
      form.append('difficulty', currentVideo.difficulty);
      form.append('duration', currentVideo.duration);
      currentVideo.tags.forEach(tag => form.append('tags[]', tag));
      form.append('isPublic', currentVideo.isPublic);


    await axios.post(
      'http://localhost:8000/api/upload-video/',
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) {
            const percent = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(prev => ({ ...prev, [currentVideo.id]: percent }));
            updateVideoInfo(currentVideo.id, 'status', 'uploading');
          }
        }
      }
    ).then(({ data }) => handleUploadSuccess(currentVideo, data));

    } catch (error) {
      console.error('Upload error:', error);
      // AFTER UPLOAD: Error handling
      handleUploadError(currentVideo, error);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-gray-500" size={16} />;
      case 'uploading':
        return <Loader className="text-blue-500 animate-spin" size={16} />;
      case 'uploaded':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusText = (video) => {
    switch (video.status) {
      case 'pending':
        return 'Ready to upload';
      case 'uploading':
        return `Uploading... ${Math.round(uploadProgress[video.id] || 0)}%`;
      case 'uploaded':
        return `Uploaded ${video.uploadedAt ? new Date(video.uploadedAt).toLocaleDateString() : ''}`;
      case 'error':
        return `Error: ${video.errorMessage || 'Upload failed'}`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {notification.isVisible && (
  <div
    className={`
      fixed top-4 right-4 z-50 px-4 py-2 rounded shadow
      ${notification.type === 'success'
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white'
      }
    `}
  >
    {notification.type === 'success' ? '✅ ' : '❌ '}
    {notification.message}
  </div>
)}

      <NavBar/>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <h1 className="text-3xl font-bold text-white">Upload Video Tutorial</h1>
    <p className="text-blue-200 mt-2">
      Share your knowledge by uploading educational videos for your students
    </p>
  </div>
</header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Area */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="mr-2 text-blue-600" size={20} />
                Upload Videos
              </h2>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <Video className="text-blue-600" size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your video files here, or <span className="text-blue-600">browse</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports MP4, MOV, AVI, WebM up to 500MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Videos List */}
            {uploadedVideos.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <FileVideo className="mr-2 text-blue-600" size={20} />
                  Videos ({uploadedVideos.length})
                </h3>
                
                <div className="space-y-4">
                  {uploadedVideos.map((video) => (
                    <div 
                      key={video.id} 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        currentVideo && currentVideo.id === video.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentVideo(video)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Video className="text-gray-600" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {video.title || video.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(video.size)}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getStatusIcon(video.status)}
                              <p className="text-xs text-gray-500">
                                {getStatusText(video)}
                              </p>
                            </div>
                            {video.status === 'uploading' && (
                               <div className="mt-2">
        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 bg-blue-600"
            style={{ width: `${uploadProgress[video.id] || 0}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {Math.round(uploadProgress[video.id] || 0)}%
        </p>
      </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeVideo(video.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                            disabled={video.status === 'uploading'}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Video Details Panel */}
          <div className="lg:col-span-1">
            {currentVideo ? (
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h3 className="text-lg font-semibold mb-4">Video Details</h3>
                
                {/* Video Preview */}
                <div className="mb-6">
                  <video 
                    src={currentVideo.url} 
                    controls 
                    className="w-full rounded-lg"
                    style={{ maxHeight: '200px' }}
                  />
                </div>

                {/* Validation Errors */}
                {validationErrors[currentVideo.id] && Object.keys(validationErrors[currentVideo.id]).length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="text-red-500 mr-2" size={16} />
                      <span className="text-sm font-medium text-red-800">Please fix the following errors:</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.values(validationErrors[currentVideo.id]).map((error, index) => (
                        error && <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Video Information Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      value={currentVideo.title}
                      onChange={(e) => updateVideoInfo(currentVideo.id, 'title', e.target.value)}
                      placeholder="Enter video title"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors[currentVideo.id]?.title ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={currentVideo.description}
                      onChange={(e) => updateVideoInfo(currentVideo.id, 'description', e.target.value)}
                      placeholder="Describe what students will learn..."
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors[currentVideo.id]?.description ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {currentVideo.description.length}/1000 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={currentVideo.category}
                      onChange={(e) => updateVideoInfo(currentVideo.id, 'category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors[currentVideo.id]?.category ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {videoCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={currentVideo.difficulty}
                      onChange={(e) => updateVideoInfo(currentVideo.id, 'difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select difficulty</option>
                      {difficultyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={currentVideo.duration}
                      onChange={(e) => updateVideoInfo(currentVideo.id, 'duration', e.target.value)}
                      placeholder="e.g., 15"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors[currentVideo.id]?.duration ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <button
                        onClick={addTag}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    {currentVideo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentVideo.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
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
                    )}
                  </div>

                  {/* Privacy Setting */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentVideo.isPublic}
                        onChange={(e) => updateVideoInfo(currentVideo.id, 'isPublic', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Make this video public
                      </span>
                    </label>
                  </div>

                  {/* Upload Status */}
                  {currentVideo.status !== 'pending' && (
                    <div className="p-3 rounded-md bg-gray-50">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(currentVideo.status)}
                        <span className="text-sm font-medium text-gray-700">
                          Status: {getStatusText(currentVideo)}
                        </span>
                      </div>
                      {currentVideo.status === 'uploaded' && currentVideo.videoId && (
                        <p className="text-xs text-gray-500 mt-1">
                          Video ID: {currentVideo.videoId}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={saveVideo}
                      disabled={isUploading || currentVideo.status === 'uploading' || currentVideo.status === 'uploaded'}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isUploading ? (
                        <>
                          <Loader className="animate-spin mr-2" size={16} />
                          UPLOADING...
                        </>
                      ) : currentVideo.status === 'uploaded' ? (
                        <>
                          <CheckCircle className="mr-2" size={16} />
                          UPLOADED
                        </>
                      ) : (
                        'UPLOAD'
                      )}
                    </button>
                    <button
                      onClick={() => setCurrentVideo(null)}
                      disabled={isUploading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentVideo.status === 'uploaded' ? 'Close' : 'Cancel'}
                    </button>
                  </div>

                  {/* Retry button for failed uploads */}
                  {currentVideo.status === 'error' && (
                    <button
                      onClick={() => {
                        updateVideoInfo(currentVideo.id, 'status', 'pending');
                        updateVideoInfo(currentVideo.id, 'errorMessage', '');
                        saveVideo();
                      }}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
                    >
                      <AlertCircle className="mr-2" size={16} />
                      RETRY UPLOAD
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center py-8">
                  <Video className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No video selected
                  </h3>
                  <p className="text-gray-500">
                    Upload or select a video to edit its details
                  </p>
                </div>

                {/* Upload Summary */}
                {uploadedVideos.length > 0 && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Upload Summary</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total videos:</span>
                        <span>{uploadedVideos.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span>{uploadedVideos.filter(v => v.status === 'pending').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploading:</span>
                        <span>{uploadedVideos.filter(v => v.status === 'uploading').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span className="text-green-600 font-medium">
                          {uploadedVideos.filter(v => v.status === 'uploaded').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed:</span>
                        <span className="text-red-600 font-medium">
                          {uploadedVideos.filter(v => v.status === 'error').length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Upload Tips */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={20} />
            Upload Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Before Upload</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure video quality is at least 720p</li>
                <li>• Keep file size under 500MB</li>
                <li>• Use clear, descriptive titles</li>
                <li>• Add relevant tags for discoverability</li>
                <li>• Choose the appropriate difficulty level</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">After Upload</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Videos are processed and optimized</li>
                <li>• You'll receive a confirmation email</li>
                <li>• Students can access videos immediately</li>
                <li>• View analytics in your dashboard</li>
                <li>• Update video details anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm">&copy; 2025 LearnConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
