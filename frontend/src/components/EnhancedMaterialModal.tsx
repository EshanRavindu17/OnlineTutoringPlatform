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
  // Add scrollbar hiding CSS
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/50 scrollbar-hide" style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none'  /* IE and Edge */
      }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/70 bg-gradient-to-r from-slate-50/50 to-white/50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Add Session Materials
            </h2>
            <p className="text-slate-600 mt-1">Upload files, add links, or create text materials for your session</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100/80 rounded-xl transition-all duration-200 hover:scale-105 group"
          >
            <X size={22} className="text-slate-500 group-hover:text-slate-700" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-100/60 rounded-xl p-1.5 w-fit">
            <button
              onClick={() => setBatchMode(false)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                !batchMode 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Single Material
            </button>
            <button
              onClick={() => setBatchMode(true)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                batchMode 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                  : 'text-slate-600 hover:text-slate-800'
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
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]' 
                    : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="relative">
                  <UploadIcon className={`mx-auto h-16 w-16 mb-6 transition-all duration-300 ${
                    dragActive ? 'text-blue-500 scale-110' : 'text-slate-400'
                  }`} />
                  {dragActive && (
                    <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-20" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">Drop Multiple Files Here</h3>
                <p className="text-slate-600 mb-6">Or click to select multiple files</p>
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
                  className="inline-flex items-center px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="mr-2" size={18} />
                  Select Files
                </label>
                <p className="text-sm text-slate-500 mt-4 leading-relaxed">
                  Supports: PDF, DOC, PPT, Images, Videos (Max 10MB each)
                </p>
              </div>

              {/* Selected Files List */}
              {batchFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 text-lg">Selected Files</h4>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                      {batchFiles.length} files
                    </span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-hide" style={{
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none'  /* IE and Edge */
                  }}>
                    {batchFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 p-2 rounded-lg bg-slate-100">
                            {getFileType(file.type) === 'document' && <FileText className="w-6 h-6 text-blue-600" />}
                            {getFileType(file.type) === 'video' && <Video className="w-6 h-6 text-red-600" />}
                            {getFileType(file.type) === 'image' && <Camera className="w-6 h-6 text-purple-600" />}
                            {getFileType(file.type) === 'presentation' && <VideoIcon className="w-6 h-6 text-orange-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 truncate max-w-xs">{file.name}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeBatchFile(index)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single Material Mode */
            <div className="space-y-6">
              {/* Material Name */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Material Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 hover:bg-white"
                  placeholder="e.g., Chapter 5 Notes, Practice Problems"
                />
              </div>

              {/* Material Type */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-800">
                  Material Type
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {[
                    { type: 'document', icon: FileText, label: 'Document', colors: { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500', hover: 'hover:border-blue-400' } },
                    { type: 'video', icon: Video, label: 'Video', colors: { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-500', hover: 'hover:border-red-400' } },
                    { type: 'link', icon: ExternalLink, label: 'Link', colors: { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-500', hover: 'hover:border-emerald-400' } },
                    { type: 'image', icon: Camera, label: 'Image', colors: { bg: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500', hover: 'hover:border-purple-400' } },
                    { type: 'text', icon: MessageSquare, label: 'Text', colors: { bg: 'bg-slate-500', text: 'text-slate-700', border: 'border-slate-500', hover: 'hover:border-slate-400' } },
                    { type: 'presentation', icon: VideoIcon, label: 'Slides', colors: { bg: 'bg-orange-500', text: 'text-orange-700', border: 'border-orange-500', hover: 'hover:border-orange-400' } }
                  ].map(({ type, icon: Icon, label, colors }) => (
                    <button
                      key={type}
                      onClick={() => setForm(prev => ({ ...prev, type: type as Material['type'] }))}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                        form.type === type
                          ? `${colors.border} bg-gradient-to-br from-white to-slate-50 ${colors.text} shadow-md scale-105`
                          : `border-slate-200 ${colors.hover} hover:bg-slate-50 text-slate-600`
                      }`}
                    >
                      <Icon 
                        className={`mx-auto mb-2 transition-colors duration-200 ${
                          form.type === type ? colors.text : 'text-slate-400'
                        }`} 
                        size={24} 
                      />
                      <span className="text-xs font-medium block">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload or URL/Content based on type */}
              {(form.type === 'document' || form.type === 'image' || form.type === 'video' || form.type === 'presentation') && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Upload File
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]' 
                        : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="relative">
                      <Upload className={`mx-auto h-12 w-12 mb-4 transition-all duration-300 ${
                        dragActive ? 'text-blue-500 scale-110' : 'text-slate-400'
                      }`} />
                      {dragActive && (
                        <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-20" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-4 font-medium">
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
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 cursor-pointer transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Upload className="mr-2" size={16} />
                      Choose File
                    </label>
                    {form.file && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center justify-center space-x-3">
                          <CheckCircle className="text-emerald-600" size={20} />
                          <span className="text-sm font-medium text-emerald-800">{form.file.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {form.type === 'link' && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    URL *
                  </label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="url"
                      value={form.url}
                      onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-slate-50/50 hover:bg-white"
                      placeholder="https://example.com/resource"
                    />
                  </div>
                </div>
              )}

              {form.type === 'text' && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Text Content *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-vertical bg-slate-50/50 hover:bg-white"
                    placeholder="Enter your text content here..."
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  Description (Optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-vertical bg-slate-50/50 hover:bg-white"
                  placeholder="Add a brief description of this material..."
                />
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm font-medium text-blue-800">
                    {batchMode ? 'Processing batch upload...' : 'Uploading file...'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-blue-700 px-2 py-1 bg-blue-100 rounded-lg">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full bg-blue-200/60 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200/70 bg-gradient-to-r from-slate-50/80 to-white/80">
          <div className="text-sm text-slate-600 font-medium">
            {batchMode 
              ? `${batchFiles.length} files selected for upload`
              : 'Materials will be available during the session'
            }
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 hover:text-slate-800 font-medium rounded-xl hover:bg-slate-100/80 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || (batchMode ? batchFiles.length === 0 : false)}
              className={`px-8 py-2.5 rounded-xl font-medium transition-all duration-200 transform ${
                uploading || (batchMode ? batchFiles.length === 0 : false)
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {uploading 
                ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>{batchMode ? 'Processing...' : 'Uploading...'}</span>
                  </div>
                )
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