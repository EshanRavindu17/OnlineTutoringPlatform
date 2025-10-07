import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
import ScheduleManager from './ScheduleManager';
import { useAuth } from '../../context/authContext';
import { ScheduleService, TimeSlot } from '../../api/ScheduleService';
import { normalizeTimeSlot, isSlotInFuture, commonStyles } from '../../utils/timeSlotUtils';

const ScheduleMeeting: React.FC = () => {
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0
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
        const now = new Date();

        const futureSlots = timeSlots.filter((slot: TimeSlot) => {
          try {
            const normalized = normalizeTimeSlot({
              date: slot.date,
              start_time: slot.start_time
            });
            return isSlotInFuture(normalized.date, normalized.startTime);
          } catch (error) {
            return false;
          }
        });

        const totalSlots = futureSlots.length;
        const availableSlots = futureSlots.filter((slot: TimeSlot) => slot.status === 'free').length;
        const bookedSlots = futureSlots.filter((slot: TimeSlot) => slot.status === 'booked').length;

        setStats({
          totalSlots,
          availableSlots,
          bookedSlots
        });
      }
    } catch (err) {
      // Error loading stats
    }
  };

  // Refresh stats function to be called from ScheduleManager
  const refreshStats = () => {
    if (tutorId) {
      loadStats(tutorId);
    }
  };


  if (loading) {
    return (
      <>
        <Navbar />
        <div className={`${commonStyles.gradient} flex items-center justify-center`}>
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
              className={commonStyles.button}
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
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          </div>

          {/* Schedule Manager Component */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-200 overflow-hidden">
            <ScheduleManager tutorId={tutorId} onScheduleChange={refreshStats} />
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

            <div className={commonStyles.card}>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="mr-2 text-blue-600" size={20} />
                Performance Tips
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Maintain consistent weekly availability for better student retention</li>
                <li>• Consider peak hours (evenings, weekends) for maximum bookings</li>
                <li>• Review your booking patterns to optimize your schedule</li>
                <li>• Keep at least 3-5 time slots available per day for flexibility</li>
                <li>• Update your availability regularly to avoid missed opportunities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ScheduleMeeting;