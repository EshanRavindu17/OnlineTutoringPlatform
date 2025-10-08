import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Video, 
  ExternalLink, 
  Camera, 
  MessageSquare, 
  X, 
  CheckCircle
} from 'lucide-react';
import { Material } from '../types/session';
import { sessionService } from '../api/SessionService';
import { useAuth } from '../context/authContext';

interface MaterialModalProps {
  sessionId: string;
  onClose: () => void;
  onAdd: (material: Omit<Material, 'id' | 'uploadDate'>) => void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({ 
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
    file: null as File | null
  });
  
  const [uploading, setUploading] = useState(false);

  const { currentUser } = useAuth();

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      if (!currentUser?.uid) {
        throw new Error('User not authenticated');
      }

      // Use the existing uploadMaterialFile method for all file types
      // The backend will route to appropriate storage based on file type
      const uploadResult = await sessionService.uploadMaterialFile(
        currentUser.uid,
        sessionId,
        file
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
      file: null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Material</h2>
            <p className="text-gray-600 mt-1">Upload files, add links, or create text materials</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Chapter 5 Notes, Practice Problems"
            />
          </div>

          {/* Material Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Material Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { type: 'document', icon: FileText, label: 'Document' },
                { type: 'video', icon: Video, label: 'Video' },
                { type: 'link', icon: ExternalLink, label: 'Link' },
                { type: 'image', icon: Camera, label: 'Image' },
                { type: 'text', icon: MessageSquare, label: 'Text' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setForm(prev => ({ ...prev, type: type as Material['type'] }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    form.type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="mx-auto mb-1" size={20} />
                  <span className="text-xs font-medium block">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          {(form.type === 'document' || form.type === 'image' || form.type === 'video') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-3">
                  Click to select a file to upload
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
                    '.pdf,.doc,.docx,.ppt,.pptx'
                  }
                />
                <label
                  htmlFor="file-input"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm font-medium"
                >
                  <Upload className="mr-2" size={16} />
                  Choose File
                </label>
                {form.file && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="text-green-600" size={18} />
                      <span className="text-sm font-medium text-green-800">{form.file.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* URL Input for link type */}
          {form.type === 'link' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/resource"
              />
            </div>
          )}

          {/* Text Content for text type */}
          {form.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content *
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="Enter your text content here..."
              />
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              placeholder="Add a brief description of this material..."
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm font-medium text-blue-800">
                    Uploading file...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Materials will be available during the session
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploading ? 'Uploading...' : 'Add Material'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialModal;