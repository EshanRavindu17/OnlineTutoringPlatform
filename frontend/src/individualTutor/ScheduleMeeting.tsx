import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import ScheduleManager from './ScheduleManager';
import { useAuth } from '../context/authContext';
import { ScheduleService } from '../api/ScheduleService';

const ScheduleMeeting: React.FC = () => {
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    totalEarnings: 0
  });

  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    const fetchTutorId = async () => {
      if (!currentUser?.uid) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      if (userProfile?.role !== 'Individual') {
        setError('Access denied. Only individual tutors can access this page.');
        setLoading(false);
        return;
      }

      try {
        const response = await ScheduleService.getTutorId(currentUser.uid);
        if (response.success) {
          setTutorId(response.data.tutorId);
          await loadStats(response.data.tutorId);
        } else {
          setError('Failed to get tutor profile');
        }
      } catch (err) {
        console.error('Error fetching tutor ID:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tutor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorId();
  }, [currentUser, userProfile]);

  // Load statistics
  const loadStats = async (tutorIdParam: string) => {
    try {
      const response = await ScheduleService.getTutorTimeSlots(tutorIdParam);
      if (response.success) {
        const timeSlots = response.data;
        
        // Filter out past time slots
        const now = new Date();
        const currentDate = now.getFullYear() + '-' + 
          String(now.getMonth() + 1).padStart(2, '0') + '-' + 
          String(now.getDate()).padStart(2, '0');
        const currentHour = now.getHours();
        
        const futureSlots = timeSlots.filter(slot => {
          // Handle date conversion
          let slotDate: string;
          if (slot.date instanceof Date) {
            slotDate = slot.date.getFullYear() + '-' + 
              String(slot.date.getMonth() + 1).padStart(2, '0') + '-' + 
              String(slot.date.getDate()).padStart(2, '0');
          } else if (typeof slot.date === 'string') {
            slotDate = slot.date.split('T')[0];
          } else {
            slotDate = String(slot.date);
          }
          
          // If slot is in future date, include it
          if (slotDate > currentDate) {
            return true;
          }
          
          // If slot is today, check if time hasn't passed
          if (slotDate === currentDate) {
            // Handle start_time conversion
            let startTimeStr: string;
            if (slot.start_time instanceof Date) {
              const timeStr = slot.start_time.toISOString();
              startTimeStr = timeStr.substr(11, 5);
            } else if (typeof slot.start_time === 'string') {
              if (slot.start_time.includes('T')) {
                startTimeStr = slot.start_time.split('T')[1].slice(0, 5);
              } else if (slot.start_time.includes('1970-01-01T')) {
                startTimeStr = slot.start_time.split('T')[1].slice(0, 5);
              } else {
                startTimeStr = slot.start_time.slice(0, 5);
              }
            } else {
              startTimeStr = String(slot.start_time).slice(0, 5);
            }
            
            const slotHour = parseInt(startTimeStr.split(':')[0]);
            return slotHour > currentHour;
          }
          
          // Past dates are excluded
          return false;
        });
        
        const totalSlots = futureSlots.length;
        const availableSlots = futureSlots.filter(slot => slot.status === 'free').length;
        const bookedSlots = futureSlots.filter(slot => slot.status === 'booked').length;
        const totalEarnings = bookedSlots * 65; // Assuming $65 per hour

        setStats({
          totalSlots,
          availableSlots,
          bookedSlots,
          totalEarnings
        });
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-700">Loading Schedule Management...</h2>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="text-red-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!tutorId) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="text-yellow-600 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Tutor Profile Found</h2>
            <p className="text-gray-600 mb-4">Please complete your tutor profile setup first.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Calendar className="mr-3 text-blue-600" size={32} />
                    Schedule Management
                  </h1>
                  <p className="text-blue-600 font-medium mt-2">
                    Manage your availability for {userProfile?.name || 'Tutor'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Create and manage your time slots for student bookings
                  </p>
                </div>
                <div className="flex space-x-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.totalSlots}</div>
                    <div className="text-sm font-medium text-gray-600">Future Slots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{stats.availableSlots}</div>
                    <div className="text-sm font-medium text-gray-600">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">{stats.bookedSlots}</div>
                    <div className="text-sm font-medium text-gray-600">Booked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Future Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSlots}</p>
                  <p className="text-xs text-gray-500">Upcoming only</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{stats.availableSlots}</p>
                  <p className="text-xs text-gray-500">Open for booking</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Booked</p>
                  <p className="text-2xl font-bold text-red-600">{stats.bookedSlots}</p>
                  <p className="text-xs text-gray-500">By students</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential Earnings</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.totalEarnings}</p>
                  <p className="text-xs text-gray-500">From future bookings</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Manager Component */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden">
            <ScheduleManager tutorId={tutorId} />
          </div>

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="mr-2 text-blue-600" size={20} />
                Quick Tips
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Add time slots for each day you're available to teach</li>
                <li>• Students can only book available time slots</li>
                <li>• You can temporarily disable slots by toggling availability</li>
                <li>• Booked slots cannot be removed until the session is complete</li>
                <li>• Use consistent time slots to build a regular schedule</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Future Time Slots:</span>
                  <span className="font-semibold text-blue-600">{stats.totalSlots}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Available for Booking:</span>
                  <span className="font-semibold text-green-600">{stats.availableSlots}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Currently Booked:</span>
                  <span className="font-semibold text-red-600">{stats.bookedSlots}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Potential Earnings:</span>
                  <span className="font-semibold text-purple-600">${stats.totalEarnings}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ScheduleMeeting;
