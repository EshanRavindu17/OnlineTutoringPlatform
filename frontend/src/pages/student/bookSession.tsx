import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function BookSessionPage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Available time slots with last access time tracking
  const [availableSlots, setAvailableSlots] = useState([
    { time: '09:00', lastAccessTime: null as Date | null },
    { time: '10:00', lastAccessTime: new Date(Date.now() - 3 * 60 * 1000) }, // 3 mins ago
    { time: '11:00', lastAccessTime: new Date(Date.now() - 7 * 60 * 1000) }, // 7 mins ago  
    { time: '13:00', lastAccessTime: null },
    { time: '14:00', lastAccessTime: new Date(Date.now() - 2 * 60 * 1000) }, // 2 mins ago
    { time: '15:00', lastAccessTime: null },
    { time: '16:00', lastAccessTime: new Date(Date.now() - 6 * 60 * 1000) }, // 6 mins ago
    { time: '17:00', lastAccessTime: null }
  ]);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  // Update slot access time when selected (keeping for data structure)
  const updateSlotAccess = (timeSlot: string) => {
    setAvailableSlots(prev => 
      prev.map(slot => 
        slot.time === timeSlot 
          ? { ...slot, lastAccessTime: new Date() }
          : slot
      )
    );
  };

  // Check if slots are consecutive
  const areConsecutive = (slots: string[]): boolean => {
    if (slots.length <= 1) return true;
    
    const sortedSlots = [...slots].sort();
    for (let i = 1; i < sortedSlots.length; i++) {
      const prevHour = parseInt(sortedSlots[i - 1].split(':')[0]);
      const currHour = parseInt(sortedSlots[i].split(':')[0]);
      if (currHour - prevHour !== 1) {
        return false;
      }
    }
    return true;
  };

  const handleSlotSelection = (slot: string) => {
    // If slot is already selected, allow unselection
    if (selectedSlots.includes(slot)) {
      const newSelectedSlots = selectedSlots.filter(s => s !== slot);
      setSelectedSlots(newSelectedSlots);
      return;
    }

    // Add slot and update its access time
    const newSelectedSlots = [...selectedSlots, slot];
    updateSlotAccess(slot);
    
    // Check if the new selection maintains consecutive slots
    if (areConsecutive(newSelectedSlots)) {
      setSelectedSlots(newSelectedSlots);
    }
  };

  const getSessionTimeRange = (): string => {
    if (selectedSlots.length === 0) return '';
    
    const sortedSlots = [...selectedSlots].sort();
    const startTime = sortedSlots[0];
    const endHour = parseInt(sortedSlots[sortedSlots.length - 1].split(':')[0]) + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    return `${startTime} - ${endTime}`;
  };

  const getDurationInHours = (): number => {
    return selectedSlots.length;
  };

  const handleBooking = async () => {
    if (!selectedDate || selectedSlots.length === 0 || !subject) {
      setBookingStatus('error');
      return;
    }

    setBookingStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setBookingStatus('success');
      setTimeout(() => {
        navigate('/mycalendar');
      }, 2000);
    }, 2000);
  };

  const calculateCost = () => {
    const hourlyRate = 65; // This would come from the tutor data
    return (hourlyRate * getDurationInHours()).toFixed(2);
  };

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Session Booked Successfully!</h1>
            <p className="text-gray-600 mb-6">Your tutoring session has been confirmed. You'll receive a confirmation email shortly.</p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-green-800 font-semibold">Session Details:</p>
              <p className="text-green-700">Date: {selectedDate}</p>
              <p className="text-green-700">Time: {getSessionTimeRange()}</p>
              <p className="text-green-700">Subject: {subject}</p>
              <p className="text-green-700">Duration: {getDurationInHours()} hour{getDurationInHours() > 1 ? 's' : ''}</p>
            </div>
            <p className="text-sm text-gray-500">Redirecting to your calendar...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Book a Session</h1>
              
              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots (Select consecutive slots - minimum 1 hour)
                  </label>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Selected: {selectedSlots.length > 0 ? getSessionTimeRange() : 'None'} 
                      {selectedSlots.length > 0 && ` (${getDurationInHours()} hour${getDurationInHours() > 1 ? 's' : ''})`}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.time);
                      const isDisabled = !isSelected && selectedSlots.length > 0 && !areConsecutive([...selectedSlots, slot.time]);
                      
                      return (
                        <button
                          key={slot.time}
                          onClick={() => handleSlotSelection(slot.time)}
                          disabled={isDisabled}
                          className={`p-3 border rounded-lg transition-colors relative ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                              : isDisabled
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium">{slot.time}</div>
                            <div className="text-xs opacity-80">1 hour</div>
                          </div>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    <p>• Each slot represents 1 hour (e.g., 9:00 = 9:00-10:00)</p>
                    <p>• You can select multiple consecutive slots for longer sessions</p>
                    <p>• Click a selected slot again to unselect it</p>
                    <p>• Minimum session duration is 1 hour</p>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* Error Message */}
                {bookingStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-red-700">Please fill in all required fields.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Tutor Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tutor Information</h3>
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=60&h=60&fit=crop&crop=face"
                  alt="Dr. Sarah Johnson"
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <p className="font-semibold text-gray-800">Dr. Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Mathematics & Physics</p>
                </div>
              </div>
              <div className="flex items-center text-yellow-500 mb-2">
                <span className="font-semibold">4.9</span>
                <span className="text-gray-500 ml-1">(127 reviews)</span>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedDate || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{getSessionTimeRange() || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{getDurationInHours()} hour{getDurationInHours() > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{subject || 'Not selected'}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Cost:</span>
                    <span className="text-blue-600">${calculateCost()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={bookingStatus === 'loading' || !selectedDate || selectedSlots.length === 0 || !subject}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {bookingStatus === 'loading' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Booking...
                </div>
              ) : (
                'Confirm Booking'
              )}
            </button>

            {/* Note */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can cancel or reschedule your session up to 24 hours before the scheduled time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
