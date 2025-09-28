import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Video,
  Download,
  FileText,
  ChevronRight,
  ArrowLeft,
  User,
  Award,
  CheckCircle,
  PlayCircle,
  Bookmark,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getClassByClassIdAndStudentId, getClassSlotsByClassId, getStudentIDByUserID } from '../../api/Student';
import type { MassClassPage, MassClassSlots } from '../../api/Student';
import { useAuth } from '../../context/authContext';

interface ClassMaterial {
  id: string;
  name: string;
  type: 'video' | 'document' | 'assignment';
  url: string;
  downloadable: boolean;
  uploadDate: string;
}

interface ClassSession {
  id: string;
  date: string;
  dayName: string;
  dayNumber: number;
  isPast: boolean;
  isToday: boolean;
  isUpcoming: boolean;
  materials: ClassMaterial[];
  description: string;
  duration: string;
  startTime: string;
  status: 'completed' | 'upcoming' | 'live' | 'cancelled';
}

interface MassClass {
  id: string;
  name: string;
  subject: string;
  tutor: {
    id: string;
    name: string;
    profilePicture: string;
    rating: number;
    totalStudents: number;
    experience: string;
  };
  description: string;
  longDescription: string;
  price: number;
  duration: string;
  startDate: string;
  endDate: string;
  schedule: string;
  studentsEnrolled: number;
  maxStudents: number;
  verified: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  learningOutcomes: string[];
  totalSessions: number;
  completedSessions: number;
  sessions: ClassSession[];
}

function MassClassPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
  // State management
  const [classData, setClassData] = useState<MassClassPage | null>(null);
  const [classSlots, setClassSlots] = useState<MassClassSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isClassSaved, setIsClassSaved] = useState(false);
  const [monthLoading, setMonthLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Get enrollment status
  const enrollmentStatus = classData?.enrollmentStatus?.status || null;
  
  // Helper functions
  const getCurrentWeek = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    return Math.ceil(dayOfMonth / 7);
  };

  const isFirstWeekOfMonth = () => getCurrentWeek() === 1;

  // Month navigation helpers
  const getMonthName = (month: number) => {
    return new Date(2025, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  const canNavigateToMonth = (month: number, enrollmentStatus: string | null) => {
    const currentMonth = new Date().getMonth() + 1;
    
    if (enrollmentStatus === 'valid') {
      // Valid users can navigate to any month up to current month
      return month <= currentMonth;
    } else if (enrollmentStatus === 'invalid') {
      // Invalid users can navigate to any past month
      return month < currentMonth;
    } else if (enrollmentStatus === null) {
      // Non-enrolled users can only see current month
      return month === currentMonth;
    }
    return false;
  };

  const handlePrevMonth = () => {
    const prevMonth = selectedMonth - 1;
    if (prevMonth >= 1 && canNavigateToMonth(prevMonth, enrollmentStatus)) {
      setMonthLoading(true);
      setSelectedMonth(prevMonth);
      setTimeout(() => setMonthLoading(false), 300); // Brief loading state
    }
  };

  const handleNextMonth = () => {
    const nextMonth = selectedMonth + 1;
    if (nextMonth <= 12 && canNavigateToMonth(nextMonth, enrollmentStatus)) {
      setMonthLoading(true);
      setSelectedMonth(nextMonth);
      setTimeout(() => setMonthLoading(false), 300); // Brief loading state
    }
  };

  // Status helper functions
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          barColor: 'bg-green-500',
          buttonBg: 'bg-green-50 hover:bg-green-100',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'live':
        return {
          label: 'Live Now',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          barColor: 'bg-red-500',
          buttonBg: 'bg-red-50 hover:bg-red-100',
          icon: <PlayCircle className="w-3 h-3" />
        };
      case 'upcoming':
        return {
          label: 'Upcoming',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          barColor: 'bg-blue-500',
          buttonBg: 'bg-blue-50 hover:bg-blue-100',
          icon: <Clock className="w-3 h-3" />
        };
      default:
        return {
          label: 'Unknown',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          barColor: 'bg-gray-500',
          buttonBg: 'bg-gray-50 hover:bg-gray-100',
          icon: <AlertCircle className="w-3 h-3" />
        };
    }
  };
//--------------------------------------------------------------------------------------------
  // Check if class is within 15 minutes of starting
  const isWithin15Minutes = (classDateTime: string) => {
    console.log('Checking if class is within 15 minutes of starting:', classDateTime);
    const classTime = new Date(classDateTime.replace("Z", ""));
    console.log('Class time:', classTime);
    const currentTime = new Date();
    console.log('Current time:', currentTime);
    const timeDifference = classTime.getTime() - currentTime.getTime();
    console.log('Time difference (ms):', timeDifference);
    const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    return timeDifference <= fifteenMinutes && timeDifference > 0;
  };

  // Check if join button should be shown
  const canJoinClass = (status: string, dateTime: string) => {
    if (status === 'live') return true;
    if (status === 'upcoming') return isWithin15Minutes(dateTime);
    return false;
  };

  // Check if the join button just became available (within 2 minutes of becoming available)
  const isJoinButtonRecentlyAvailable = (dateTime: string) => {
    const classTime = new Date(dateTime);
    console.log('Class time for join button check:', classTime);
    const joinTime = new Date(classTime.getTime() - (15 * 60 * 1000)); // 15 minutes before class
    console.log('Join time (15 mins before class):', joinTime);
    const timeSinceJoinAvailable = currentTime.getTime() - joinTime.getTime();
    console.log('Time since join button became available (ms):', timeSinceJoinAvailable);
    
    return timeSinceJoinAvailable >= 0 && timeSinceJoinAvailable <= (2 * 60 * 1000); // Within 2 minutes of becoming available
  };

  // Get time remaining until join button becomes available
  const getTimeUntilJoinAvailable = (classDateTime: string) => {
    const classTime = new Date(classDateTime.replace("Z", ""));
    const joinTime = new Date(classTime.getTime() - (15 * 60 * 1000)); // 15 minutes before class
    const timeDifference = joinTime.getTime() - currentTime.getTime();
    
    if (timeDifference <= 0) return null;
    
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
//----------------------------------------------------------------------------------------
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target && (event.target as HTMLElement).tagName === 'INPUT') return; // Don't interfere with input fields
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevMonth();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNextMonth();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedMonth, enrollmentStatus]);

  // Update current time every minute for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const canViewSlots = (enrollmentStatus: string | null) => {
    const currentMonth = new Date().getMonth() + 1;
    
    if (enrollmentStatus === 'valid') {
      // Valid users can see all months up to current month (including past months)
      return selectedMonth <= currentMonth;
    } else if (enrollmentStatus === 'invalid') {
      // Invalid users can see all past months but NOT current month
      return selectedMonth < currentMonth;
    } else if (enrollmentStatus === null) {
      // Non-enrolled users can only see current month's first week
      return selectedMonth === currentMonth && isFirstWeekOfMonth();
    }
    return false;
  };

  // Fetch class data and slots
  useEffect(() => {
    const fetchClassData = async () => {
      if (!classId || !userProfile?.id) {
        setError('Class ID or user information missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get student ID first
        const studentId = await getStudentIDByUserID(userProfile.id);
        if (!studentId) {
          throw new Error('Student ID not found');
        }

        // Get class details and enrollment status
        const classInfo = await getClassByClassIdAndStudentId(classId, studentId);
        setClassData(classInfo);

        console.log('Class data:', classInfo);
        console.log('Enrollment status:', classInfo.enrollmentStatus?.status);

      } catch (err) {
        console.error('Error fetching class data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load class data');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId, userProfile]);

  // Fetch slots for selected month
  useEffect(() => {
    const fetchSlots = async () => {
      if (!classId || !classData) return;
      
      if (!canViewSlots(enrollmentStatus)) {
        setClassSlots([]);
        return;
      }

      try {
        const slots = await getClassSlotsByClassId(classId, selectedMonth);
        
        // If enrollment is null and it's first week, filter to show only first week slots
        if (enrollmentStatus === null && isFirstWeekOfMonth()) {
          const firstWeekSlots = slots.filter(slot => {
            const slotDate = new Date(slot.dateTime);
            const dayOfMonth = slotDate.getDate();
            return dayOfMonth <= 7;
          });
          setClassSlots(firstWeekSlots);
        } else {
          setClassSlots(slots);
        }
        
        console.log('Fetched slots for month', selectedMonth, ':', slots);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setClassSlots([]);
      }
    };

    fetchSlots();
  }, [classId, selectedMonth, classData]);

  // Helper functions
  const toggleSaveClass = () => {
    setIsClassSaved(!isClassSaved);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  // Use additional course details that supplement the API data
  const massClass = {
    longDescription: classData?.description || "Comprehensive course covering all essential topics with expert guidance.",
    learningOutcomes: [
      "Master key concepts and fundamentals",
      "Apply knowledge to real-world scenarios", 
      "Develop problem-solving skills",
      "Prepare for advanced topics",
      "Build confidence in the subject"
    ],
    prerequisites: [
      "Basic understanding of the subject",
      "Commitment to regular attendance"
    ],
    totalSessions: 24,
    duration: "90 minutes", 
    level: "Intermediate",
    maxStudents: 50
  };

  // Remove duplicate and unused functions - these are handled in the slot-based implementation

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading class details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Class</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No data state
  if (!classData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Class Not Found</h2>
              <p className="text-gray-600 mb-4">The requested class could not be found.</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Class Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{classData.title}</h1>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      {classData.subject}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {classData._count.Enrolment} students enrolled
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {classData.day} at {new Date(classData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{classData.description}</p>
                  
                  {/* Enrollment Status Badge */}
                  <div className="mb-4">
                    {enrollmentStatus === 'valid' && (
                      <div className="bg-green-100 text-green-800 text-sm px-3 py-2 rounded-lg font-semibold flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Enrolled - Full Access
                      </div>
                    )}
                    {enrollmentStatus === 'invalid' && (
                      <div className="bg-red-100 text-red-800 text-sm px-3 py-2 rounded-lg font-semibold flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Enrollment Expired - Limited Access
                      </div>
                    )}
                    {enrollmentStatus === null && (
                      <div className="bg-yellow-100 text-yellow-800 text-sm px-3 py-2 rounded-lg font-semibold flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Not Enrolled - Preview Mode
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={toggleSaveClass}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    isClassSaved
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 mr-2 ${isClassSaved ? 'fill-current' : ''}`} />
                  {isClassSaved ? 'Saved' : 'Save Class'}
                </button>
              </div>

              {/* Progress Bar */}
              {/* <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Course Progress</span>
                  <span className="text-sm text-gray-600">
                    {massClass.completedSessions}/{massClass.totalSessions} sessions completed
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(massClass.completedSessions / massClass.totalSessions) * 100}%` }}
                  ></div>
                </div>
              </div> */}

              {/* Tutor Info */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={classData.Mass_Tutor.User.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
                  alt={classData.Mass_Tutor.User.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <button
                    onClick={() => navigate(`/student/mass-tutor-profile/${classData.Mass_Tutor.m_tutor_id}`)}
                    className="font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    {classData.Mass_Tutor.User.name}
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {parseFloat(classData.Mass_Tutor.rating).toFixed(1)}
                    </div>
                    <span>•</span>
                    <span>Rs. {classData.Mass_Tutor.prices}/month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Schedule Card */}
            <div className="bg-gray-50 rounded-xl p-6 lg:w-80">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  Rs. {parseFloat(classData.Mass_Tutor.prices).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{classData.day} at {new Date(classData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{classData._count.Enrolment} students enrolled</span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{classData.subject}</span>
                </div>
              </div>
              
              <button 
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                disabled={enrollmentStatus === 'valid'}
              >
                {enrollmentStatus === 'valid' ? 'Already Enrolled' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector and Class Sessions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Class Sessions</h2>
          
          {/* Modern Month Selector with Arrows */}
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Month:</span>
            <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 shadow-sm">
              <button
                onClick={handlePrevMonth}
                disabled={selectedMonth <= 1 || !canNavigateToMonth(selectedMonth - 1, enrollmentStatus)}
                className={`p-2 rounded-l-lg transition-all duration-200 ${
                  selectedMonth <= 1 || !canNavigateToMonth(selectedMonth - 1, enrollmentStatus)
                    ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 active:bg-purple-100'
                }`}
                title={selectedMonth <= 1 ? "No previous months" : "Previous month"}
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-6 py-2 min-w-[150px] text-center border-x border-gray-100">
                {monthLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <span className="font-semibold text-gray-900 text-sm">
                    {getMonthName(selectedMonth)} 2025
                  </span>
                )}
              </div>
              
              <button
                onClick={handleNextMonth}
                disabled={selectedMonth >= 12 || !canNavigateToMonth(selectedMonth + 1, enrollmentStatus)}
                className={`p-2 rounded-r-lg transition-all duration-200 ${
                  selectedMonth >= 12 || !canNavigateToMonth(selectedMonth + 1, enrollmentStatus)
                    ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50 active:bg-purple-100'
                }`}
                title={selectedMonth >= 12 ? "No more months" : "Next month"}
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Navigation Hint */}
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              {enrollmentStatus === 'valid' && (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  <span>Navigate through all months up to {getMonthName(new Date().getMonth() + 1)} • Use ← → keys</span>
                </>
              )}
              {enrollmentStatus === 'invalid' && (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></div>
                  <span>Navigate through previous months only • Use ← → keys</span>
                </>
              )}
              {enrollmentStatus === null && (
                <>
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                  <span>Preview mode: {getMonthName(new Date().getMonth() + 1)} only</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Access Information */}
        {enrollmentStatus === 'invalid' && selectedMonth >= new Date().getMonth() + 1 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                Your enrollment has expired. You can only view sessions from previous months. Current month sessions are not available.
              </p>
            </div>
          </div>
        )}
        
        {enrollmentStatus === null && !isFirstWeekOfMonth() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <p className="text-yellow-800 text-sm">
                Preview access is only available during the first week of each month.
              </p>
            </div>
          </div>
        )}
        
        {enrollmentStatus === null && isFirstWeekOfMonth() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-blue-800 text-sm">
                You're viewing preview sessions for the first week. Enroll to access all sessions.
              </p>
            </div>
          </div>
        )}
        
        {/* Class Slots */}
        <div className="grid gap-4">
          {classSlots.length > 0 ? (
            classSlots.map((slot) => {
              const slotDate = new Date(slot.dateTime);
              const slotStatus = slot.status; // Use API-provided status
              const isCompleted = slotStatus === 'completed';
              const isUpcoming = slotStatus === 'upcoming';
              const isLive = slotStatus === 'live';
              const statusDisplay = getStatusDisplay(slotStatus);
              
              return (
                <div key={slot.cslot_id} className="bg-white rounded-xl border overflow-hidden">
                  {/* Session Header Bar */}
                  <button
                    onClick={() => setSelectedSession(selectedSession === slot.cslot_id ? null : slot.cslot_id)}
                    className={`w-full px-6 py-4 text-left transition-colors ${statusDisplay.buttonBg}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded-full ${statusDisplay.barColor}`}></div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {slotDate.toLocaleDateString('en-US', { 
                                weekday: 'long',
                                month: 'long', 
                                day: 'numeric'
                              })}
                            </h3>
                            <div className={`${statusDisplay.bgColor} ${statusDisplay.textColor} text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${
                              isLive ? 'animate-pulse' : ''
                            }`}>
                              {statusDisplay.icon}
                              {statusDisplay.label}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {slotDate.toLocaleDateString()} • {slotDate.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              timeZone: 'UTC'
                            })} • {slot.duration} Hours
                          </div>
                          {slot.announcement && (
                            <div className="text-sm font-medium text-gray-800 mt-1">
                              {slot.announcement}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                        selectedSession === slot.cslot_id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Session Details */}
                  {selectedSession === slot.cslot_id && (
                    <div className="px-6 pb-6 border-t bg-gray-50">
                      <div className="pt-4">
                        {/* Materials Section */}
                        {slot.materials && slot.materials.length > 0 ? (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Class Materials</h4>
                            <div className="grid gap-2">
                              {slot.materials.map((materialUrl: string, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-white p-3 rounded-lg border"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <div className="font-medium text-gray-900">Material {index + 1}</div>
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => window.open(materialUrl, '_blank')}
                                    className="text-purple-600 hover:text-purple-700"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p>
                              {isCompleted 
                                ? "No materials available for this session"
                                : isLive 
                                ? "Materials will be shared during the live class"
                                : "Materials will be available after the class"
                              }
                            </p>
                          </div>
                        )}

                        {/* Join Class Button */}
                        {slot.meetingURLs && slot.meetingURLs.length > 0 && canJoinClass(slotStatus, slot.dateTime) && (
                          <div className="mt-4 pt-4 border-t">
                            <button
                              onClick={() => window.open(slot.meetingURLs[0], '_blank')}
                              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                                isLive
                                  ? 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-lg animate-pulse'
                                  : isUpcoming && isJoinButtonRecentlyAvailable(slot.dateTime)
                                  ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg animate-pulse shadow-md'
                                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                              }`}
                            >
                              <Video className="w-4 h-4 mr-2 inline" />
                              {isLive 
                                ? '🔴 Join Live Class Now!' 
                                : isJoinButtonRecentlyAvailable(slot.dateTime)
                                ? '🟢 Join Class - Just Available!'
                                : '✅ Join Class Now Available!'
                              }
                            </button>
                          </div>
                        )}

                        {/* Join Not Available Message */}
                        {slot.meetingURLs && slot.meetingURLs.length > 0 && isUpcoming && !isWithin15Minutes(slot.dateTime) && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 text-yellow-600 mr-2" />
                                  <p className="text-yellow-800 text-sm">
                                    Join button available 15 min before class
                                  </p>
                                </div>
                                {getTimeUntilJoinAvailable(slot.dateTime) && (
                                  <div className="bg-yellow-200 text-yellow-900 text-xs px-2 py-1 rounded-full font-semibold">
                                    {getTimeUntilJoinAvailable(slot.dateTime)} left
                                  </div>
                                )}
                              </div>
                              <div className="mt-1 text-xs text-yellow-700">
                                Class starts at {new Date(slot.dateTime).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  timeZone: 'UTC'
                                })} • Join available from {new Date(new Date(slot.dateTime).getTime() - (15 * 60 * 1000)).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  timeZone: 'UTC'
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Recording Section */}
                        {slot.recording && isCompleted && (
                          <div className="mt-4 pt-4 border-t">
                            <button
                              onClick={() => slot.recording && window.open(slot.recording, '_blank')}
                              className="w-full py-3 px-4 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                            >
                              <PlayCircle className="w-4 h-4 mr-2 inline" />
                              Watch Recording
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sessions Available</h3>
              <p className="text-gray-500">
                {enrollmentStatus === null 
                  ? "No preview sessions available for this period."
                  : enrollmentStatus === 'invalid'
                  ? "No sessions available for this month. Check previous months."
                  : "No sessions scheduled for this month yet."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Class Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Description */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Description</h3>
              <p className="text-gray-700 mb-6">{massClass.longDescription}</p>

              <h4 className="font-semibold text-gray-900 mb-3">Learning Outcomes</h4>
              <ul className="space-y-2 mb-6">
                {massClass.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </li>
                ))}
              </ul>

              {massClass.prerequisites.length > 0 && (
                <>
                  <h4 className="font-semibold text-gray-900 mb-3">Prerequisites</h4>
                  <ul className="space-y-1">
                    {massClass.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Class Information</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions:</span>
                  <span className="font-medium">{massClass.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{massClass.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">{massClass.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Students:</span>
                  <span className="font-medium">{massClass.maxStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Helper function for ordinal numbers
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

export default MassClassPage;