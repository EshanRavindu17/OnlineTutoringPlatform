import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  CalendarDays, UploadCloud, Users2, FileText, Loader2, Plus, 
  Video, ExternalLink, Clock, Check, BookOpen
} from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

interface ClassSlot {
  cslot_id: string;
  dateTime: string;
  duration: number;
  materials: string[];
  meetingURLs: string[];
  announcement: string | null;
  recording: string | null;
  status: 'upcoming' | 'completed';
}

interface ClassDetail {
  class_id: string;
  title: string;
  subject: string;
  day: string;
  time: string;
  description?: string;
  Enrolment: Array<{
    Student: {
      User: {
        name: string;
        email: string;
      };
    };
  }>;
}

export default function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const [loading, setLoading] = useState(true);
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
      fetchSlots();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const data = await massTutorAPI.getClassById(classId!);
      setClassDetail(data);
    } catch (error) {
      console.error('Error fetching class details:', error);
      toast.error('Failed to fetch class details');
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = await massTutorAPI.getClassSlots(classId!);
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (slotId: string, file: File, type: 'material' | 'recording', customName?: string) => {
    try {
      setUploading(slotId);
      
      let result;
      if (type === 'material') {
        result = await massTutorAPI.uploadMaterial(file);
      } else {
        result = await massTutorAPI.uploadRecording(file);
      }

      // Update slot with the new URL
      const slot = slots.find(s => s.cslot_id === slotId);
      if (slot) {
        if (type === 'material') {
          // Store as JSON string with name and URL
          const materialData = JSON.stringify({
            name: customName || file.name,
            url: result.url
          });
          await massTutorAPI.updateClassSlot(slotId, {
            materials: [...slot.materials, materialData],
          });
        } else {
          // For recording, store as JSON string with name and URL
          const recordingData = JSON.stringify({
            name: customName || file.name,
            url: result.url
          });
          await massTutorAPI.updateClassSlot(slotId, {
            recording: recordingData,
          });
        }
      }

      toast.success(`${type === 'material' ? 'Material' : 'Recording'} uploaded successfully`);
      fetchSlots();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(null);
    }
  };

  const handleJoinZoom = async (meetingURLs: string[]) => {
    if (meetingURLs.length === 0) {
      toast.error('No meeting URL available');
      return;
    }

    try {
      // First URL is host URL
      const oldHostUrl = meetingURLs[0];
      
      // Get updated URL with fresh ZAK token
      const result = await massTutorAPI.getZoomHostUrl(oldHostUrl);
      
      // Open in new tab
      window.open(result.newHostUrl, '_blank');
    } catch (error: any) {
      console.error('Error joining Zoom:', error);
      toast.error('Failed to join Zoom meeting');
    }
  };

  const groupSlotsByDate = () => {
    const grouped: Record<string, ClassSlot[]> = {};
    
    slots.forEach(slot => {
      const date = new Date(slot.dateTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    return grouped;
  };

  const groupedSlots = groupSlotsByDate();
  const upcomingSlots = slots
    .filter(s => s.status === 'upcoming' && new Date(s.dateTime) > new Date())
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  const pastSlots = slots.filter(s => s.status === 'completed' || new Date(s.dateTime) <= new Date());

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 relative" />
        </div>
        <p className="mt-4 text-gray-500 font-medium">Loading class details...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{classDetail?.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{classDetail?.subject}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-700 rounded text-sm">
                <CalendarDays className="w-3.5 h-3.5" />
                <span>{classDetail?.day}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-700 rounded text-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>{classDetail?.time}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-xl font-bold text-gray-900 mb-0.5">{upcomingSlots.length}</div>
            <div className="text-xs text-gray-600">Upcoming</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="text-xl font-bold text-gray-900 mb-0.5">{pastSlots.length}</div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-xl font-bold text-gray-900 mb-0.5">{classDetail?.Enrolment.length || 0}</div>
            <div className="text-xs text-gray-600">Students</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Section */}
        <section className="lg:col-span-2 space-y-5">
          {/* Upcoming Sessions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Upcoming Sessions</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {upcomingSlots.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              {upcomingSlots.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                    <CalendarDays className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">No upcoming sessions</p>
                  <p className="text-xs text-gray-500 mt-1">Schedule a new session to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSlots.map((slot) => (
                    <SessionCard 
                      key={slot.cslot_id} 
                      slot={slot} 
                      onJoinZoom={handleJoinZoom}
                      onFileUpload={handleFileUpload}
                      uploading={uploading === slot.cslot_id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Past Sessions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Completed Sessions</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                    {pastSlots.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-5">
              {pastSlots.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                    <Check className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">No past sessions yet</p>
                  <p className="text-xs text-gray-500 mt-1">Completed sessions will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastSlots.map((slot) => (
                    <SessionCard 
                      key={slot.cslot_id} 
                      slot={slot} 
                      onJoinZoom={handleJoinZoom}
                      onFileUpload={handleFileUpload}
                      uploading={uploading === slot.cslot_id}
                      isPast
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Students Section */}
        <section className="lg:sticky lg:top-6 h-fit">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Students</h3>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {classDetail?.Enrolment.length || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5">
              {classDetail?.Enrolment.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-3">
                    <Users2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">No students yet</p>
                  <p className="text-xs text-gray-500 mt-1">Students will appear here</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {classDetail?.Enrolment.map((enrollment, index) => (
                    <li key={index} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-semibold text-sm">
                        {enrollment.Student.User.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {enrollment.Student.User.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {enrollment.Student.User.email}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>

      {showScheduleModal && (
        <ScheduleSessionModal 
          classId={classId!}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            setShowScheduleModal(false);
            fetchSlots();
          }}
        />
      )}
    </div>
  );
}

function SessionCard({ 
  slot, 
  onJoinZoom, 
  onFileUpload, 
  uploading,
  isPast = false 
}: { 
  slot: ClassSlot; 
  onJoinZoom: (urls: string[]) => void;
  onFileUpload: (slotId: string, file: File, type: 'material' | 'recording', customName?: string) => void;
  uploading: boolean;
  isPast?: boolean;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const recordingInputRef = React.useRef<HTMLInputElement>(null);
  const [showMaterialModal, setShowMaterialModal] = React.useState(false);
  const [showRecordingModal, setShowRecordingModal] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState('');

  const handleMaterialClick = () => {
    fileInputRef.current?.click();
  };

  const handleRecordingClick = () => {
    recordingInputRef.current?.click();
  };

  const handleMaterialFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
      setShowMaterialModal(true);
    }
    e.target.value = ''; // Reset input
  };

  const handleRecordingFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
      setShowRecordingModal(true);
    }
    e.target.value = ''; // Reset input
  };

  const handleMaterialUpload = async () => {
    if (selectedFile && fileName.trim()) {
      setShowMaterialModal(false);
      
      try {
        onFileUpload(slot.cslot_id, selectedFile, 'material', fileName.trim());
      } finally {
        setSelectedFile(null);
        setFileName('');
      }
    }
  };

  const handleRecordingUpload = async () => {
    if (selectedFile && fileName.trim()) {
      setShowRecordingModal(false);
      
      try {
        onFileUpload(slot.cslot_id, selectedFile, 'recording', fileName.trim());
      } finally {
        setSelectedFile(null);
        setFileName('');
      }
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {new Date(slot.dateTime).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-600">
                {new Date(slot.dateTime).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true
                })} • {slot.duration}h
              </div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            isPast 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isPast ? 'Completed' : 'Upcoming'}
          </span>
        </div>

        {/* Announcement */}
        {slot.announcement && (
          <div className="mb-3 p-2.5 bg-blue-50 rounded border-l-2 border-blue-500">
            <p className="text-xs text-gray-700">{slot.announcement}</p>
          </div>
        )}

        {/* Materials */}
        {slot.materials.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-600 mb-1.5">Materials ({slot.materials.length})</div>
            <div className="space-y-1.5">
              {slot.materials.map((materialData, i) => {
                // Try to parse as JSON, fallback to treating as URL string
                let materialName = `Material ${i + 1}`;
                let materialUrl = materialData;
                
                try {
                  const parsed = JSON.parse(materialData);
                  if (parsed.name && parsed.url) {
                    materialName = parsed.name;
                    materialUrl = parsed.url;
                  }
                } catch {
                  // If not JSON, extract filename from URL
                  materialName = decodeURIComponent(materialData.split('/').pop() || `Material ${i + 1}`);
                }
                
                return (
                  <a 
                    key={i}
                    href={materialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors text-xs"
                    title={materialName}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-gray-700 truncate">{materialName}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 ml-2" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Recording */}
        {slot.recording && (() => {
          // Try to parse as JSON, fallback to treating as URL string
          let recordingName = 'Session Recording';
          let recordingUrl = slot.recording;
          
          try {
            const parsed = JSON.parse(slot.recording);
            if (parsed.name && parsed.url) {
              recordingName = parsed.name;
              recordingUrl = parsed.url;
            }
          } catch {
            // If not JSON, use default name
            recordingName = 'Session Recording';
          }
          
          return (
            <a 
              href={recordingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 mb-3 bg-purple-50 border border-purple-200 rounded hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Video className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <div className="text-xs flex-1 min-w-0">
                  <div className="font-semibold text-purple-900 truncate">{recordingName}</div>
                  <div className="text-purple-600">Click to watch</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-purple-500 flex-shrink-0 ml-2" />
            </a>
          );
        })()}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
          {!isPast && slot.meetingURLs.length > 0 && (
            <button 
              onClick={() => onJoinZoom(slot.meetingURLs)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
            >
              <Video className="w-4 h-4" />
              Join Session
            </button>
          )}

          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={handleMaterialFileSelect}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
          />
          <button 
            onClick={handleMaterialClick}
            disabled={uploading}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {uploading ? 'Uploading...' : 'Add Material'}
          </button>

          {isPast && !slot.recording && (
            <>
              <input 
                ref={recordingInputRef} 
                type="file" 
                className="hidden" 
                onChange={handleRecordingFileSelect}
                accept="video/*"
              />
              <button 
                onClick={handleRecordingClick}
                disabled={uploading}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-purple-300 hover:border-purple-400 hover:bg-purple-50 text-purple-700 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Recording'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Material Name Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Name Your Material</h3>
              <p className="text-sm text-gray-600 mt-0.5">Give this material a descriptive name</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Material Name *
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g., Chapter 5 Notes, Practice Problems"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && fileName.trim()) {
                    handleMaterialUpload();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Original: {selectedFile?.name}
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  setSelectedFile(null);
                  setFileName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMaterialUpload}
                disabled={!fileName.trim()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recording Name Modal */}
      {showRecordingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Name Your Recording</h3>
              <p className="text-sm text-gray-600 mt-0.5">Give this recording a descriptive name</p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Recording Name *
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g., Full Session Recording, Lecture Part 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && fileName.trim()) {
                    handleRecordingUpload();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Original: {selectedFile?.name}
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowRecordingModal(false);
                  setSelectedFile(null);
                  setFileName('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordingUpload}
                disabled={!fileName.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScheduleSessionModal({ 
  classId, 
  onClose, 
  onSuccess 
}: { 
  classId: string;
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    dateTime: '',
    duration: 1,
    announcement: '',
    createZoom: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dateTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      setSubmitting(true);

      // Create the slot first
      const slotResult = await massTutorAPI.createClassSlot(classId, {
        dateTime: formData.dateTime,
        duration: formData.duration,
        announcement: formData.announcement || undefined,
      });

      // Create Zoom meeting if requested
      if (formData.createZoom) {
        await massTutorAPI.createZoomMeeting(classId, {
          slotId: slotResult.slot.cslot_id,
          topic: 'Class Session',
          startTime: formData.dateTime,
          duration: formData.duration * 60, // Convert to minutes
        });
      }

      toast.success('Session scheduled successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error scheduling session:', error);
      toast.error(error.response?.data?.error || 'Failed to schedule session');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Schedule New Session</h3>
          <p className="text-sm text-gray-600 mt-0.5">Set up your next class meeting</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Duration (hours) *
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Announcement <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <textarea
              value={formData.announcement}
              onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
              placeholder="Any special instructions..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="createZoom"
                checked={formData.createZoom}
                onChange={(e) => setFormData({ ...formData, createZoom: e.target.checked })}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="createZoom" className="flex-1 cursor-pointer">
                <div className="font-medium text-gray-900 text-sm">Create Zoom Meeting Automatically</div>
                <p className="text-xs text-gray-600 mt-0.5">Generate a Zoom meeting link for this session</p>
              </label>
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
              {submitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
