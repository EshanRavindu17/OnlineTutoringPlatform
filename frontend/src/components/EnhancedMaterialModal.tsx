import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Video, 
  ExternalLink, 
  Camera, 
  MessageSquare, 
  VideoIcon,
  X, 
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Upload as UploadIcon
} from 'lucide-react';
import { Material } from '../types/session';
import { sessionService } from '../api/SessionService';
import { useAuth } from '../context/authContext';

interface EnhancedMaterialModalProps {
  sessionId: string;
  onClose: () => void;
  onAdd: (material: Omit<Material, 'id' | 'uploadDate'>) => void;
}

const EnhancedMaterialModal: React.FC<EnhancedMaterialModalProps> = ({ 
  sessionId, 
  onClose, 
  onAdd 
}) => {
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchMode, setBatchMode] = useState(false);

  const { currentUser } = useAuth();

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    
    try {
      if (!currentUser?.uid) {
        throw new Error('User not authenticated');
      }

      // Use the new enhanced upload method with progress tracking
      const uploadResult = await sessionService.uploadMaterialFile(
        currentUser.uid,
        sessionId,
        file,
        (progress) => setUploadProgress(progress)
      );
      
      setForm(prev => ({
        ...prev,
        name: prev.name || file.name.split('.')[0],
        url: uploadResult.url,
        type: getFileType(file.type),
        file: file
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      if (batchMode) {
        setBatchFiles(prev => [...prev, ...files]);
      } else if (files[0]) {
        handleFileUpload(files[0]);
      }
    }
  };

  const handleBatchUpload = async () => {
    if (!currentUser?.uid || batchFiles.length === 0) return;
    
    setUploading(true);
    try {
      const materials: Array<Omit<Material, 'id' | 'uploadDate'>> = [];
      
      // Process each file
      for (let i = 0; i < batchFiles.length; i++) {
        const file = batchFiles[i];
        setUploadProgress((i / batchFiles.length) * 100);
        
        const uploadResult = await sessionService.uploadMaterialFile(
          currentUser.uid,
          sessionId,
          file
        );
        
        materials.push({
          name: file.name.split('.')[0],
          type: getFileType(file.type),
          url: uploadResult.url,
          description: `Uploaded file: ${file.name}`,
          isPublic: false,
          size: file.size,
          mimeType: file.type
        });
      }
      
      // Batch upload all materials
      await sessionService.batchUploadMaterials(
        currentUser.uid,
        sessionId,
        materials,
        (completed, total) => {
          setUploadProgress(((completed / total) * 100));
        }
      );
      
      alert(`Successfully uploaded ${materials.length} materials!`);
      onClose();
    } catch (error) {
      console.error('Batch upload failed:', error);
      alert('Batch upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileType = (mimeType: string): Material['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('presentation')) return 'presentation';
    return 'document';
  };

  const removeBatchFile = (index: number) => {
    setBatchFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (batchMode) {
      handleBatchUpload();
      return;
    }

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
      isPublic: false,
      size: form.file?.size,
      mimeType: form.file?.type
    });

    setForm({
      name: '',
      type: 'document',
      url: '',
      content: '',
      description: '',
      isPublic: false,
      file: null
    });
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white  max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add Session Materials</h2>
            <p className="text-gray-600">Upload files, add links, or create text materials for your session</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setBatchMode(false)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !batchMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Single Material
            </button>
            <button
              onClick={() => setBatchMode(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                batchMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              Batch Upload
            </button>
          </div>

          {batchMode ? (
            /* Batch Upload Mode */
            <div className="space-y-6">
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Drop Multiple Files Here</h3>
                <p className="text-gray-500 mb-4">Or click to select multiple files</p>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setBatchFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                    }
                  }}
                  className="hidden"
                  id="batch-file-input"
                />
                <label
                  htmlFor="batch-file-input"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  Select Files
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: PDF, DOC, PPT, Images, Videos (Max 10MB each)
                </p>
              </div>

              {/* Selected Files List */}
              {batchFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Selected Files ({batchFiles.length})</h4>
                  {batchFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getFileType(file.type) === 'document' && <FileText className="w-5 h-5 text-blue-600" />}
                          {getFileType(file.type) === 'video' && <Video className="w-5 h-5 text-red-600" />}
                          {getFileType(file.type) === 'image' && <Camera className="w-5 h-5 text-purple-600" />}
                          {getFileType(file.type) === 'presentation' && <VideoIcon className="w-5 h-5 text-orange-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeBatchFile(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Single Material Mode */
            <div className="space-y-6">
              {/* Material Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Chapter 5 Notes, Practice Problems"
                />
              </div>

              {/* Material Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Material Type
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[
                    { type: 'document', icon: FileText, label: 'Document', color: 'blue' },
                    { type: 'video', icon: Video, label: 'Video', color: 'red' },
                    { type: 'link', icon: ExternalLink, label: 'Link', color: 'green' },
                    { type: 'image', icon: Camera, label: 'Image', color: 'purple' },
                    { type: 'text', icon: MessageSquare, label: 'Text', color: 'gray' },
                    { type: 'presentation', icon: VideoIcon, label: 'Slides', color: 'orange' }
                  ].map(({ type, icon: Icon, label, color }) => (
                    <button
                      key={type}
                      onClick={() => setForm(prev => ({ ...prev, type: type as Material['type'] }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        form.type === type
                          ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`mx-auto mb-1 ${form.type === type ? `text-${color}-600` : 'text-gray-400'}`} size={20} />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload or URL/Content based on type */}
              {(form.type === 'document' || form.type === 'image' || form.type === 'video' || form.type === 'presentation') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload File
                  </label>
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
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag & drop file here, or click to select
                    </p>
                    <input
                      type="file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                      id="file-input"
                      accept={
                        form.type === 'image' ? 'image/*' :
                        form.type === 'video' ? 'video/*' :
                        form.type === 'presentation' ? '.ppt,.pptx' :
                        '.pdf,.doc,.docx'
                      }
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm"
                    >
                      Choose File
                    </label>
                    {form.file && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="text-green-600" size={16} />
                          <span className="text-sm text-green-800">{form.file.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {form.type === 'link' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/resource"
                  />
                </div>
              )}

              {form.type === 'text' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Text Content *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    placeholder="Enter your text content here..."
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  placeholder="Add a brief description of this material..."
                />
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700">
                  {batchMode ? 'Processing batch upload...' : 'Uploading file...'}
                </span>
                <span className="text-sm text-blue-600">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {batchMode 
              ? `${batchFiles.length} files selected for upload`
              : 'Materials will be available during the session'
            }
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
              disabled={uploading || (batchMode ? batchFiles.length === 0 : false)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                uploading || (batchMode ? batchFiles.length === 0 : false)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading 
                ? (batchMode ? 'Processing...' : 'Uploading...')
                : (batchMode ? `Upload ${batchFiles.length} Files` : 'Add Material')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMaterialModal;