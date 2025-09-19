import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  User, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  BookOpen,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  MapPin,
  Loader2,
  Flag,
  FileText,
  Eye,
  MessageSquare,
  X,
  Send
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/authContext';
import { updateStudentProfile, getAllSessionsByStudentId, getStudentIDByUserID, getEnrolledClassesByStudentId, getTutorsByStudentId, Session, EnrolledClass, cancelSession, IndividualTutorDashboard } from '../../api/Student';
import { useToast } from '../../components/Toast';
import { Navigate, useNavigate } from 'react-router-dom';

interface SessionData {
  session_id: string;
  start_time: string | null;
  end_time: string | null;
  status: 'scheduled' | 'ongoing' | 'canceled' | 'completed';
  materials: string[];
  slots: string[]; // Array of slot times like "1970-01-01T15:00:00.000Z"
  created_at: string; // When the session was created (from backend)
  meeting_urls?: string[] | null; // Meeting URLs for online sessions
  date: string; // Session date
  reason?: string; // Cancellation reason
  cancelledBy?: string; // Who cancelled the session
  refunded?: boolean; // Whether refund was processed
  rating?: number; // Session rating
  feedback?: string; // Session feedback
  Individual_Tutor: {
    User: {
      name: string;
    };
    Course?: {
      course_name: string;
    };
  };
}

interface IndividualTutorDisplay {
  id: string;
  name: string;
  subject: string;
  specialization: string;
  rating: number;
  hourlyRate: number;
  totalSessionsPaid: number;
  sessionsUsed: number;
  profilePicture: string;
  nextSession: string;
  status: string;
  amountPaid: number;
}

const StudentProfile: React.FC = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { showToast, ToastContainer } = useToast();


  //Navigater

  const navigate = useNavigate();
  
  // Sessions state
  const [allSessions, setAllSessions] = useState<SessionData[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  
  // Enrolled classes state
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const [image, setImage] = useState<File | null>(null);

  // Helper function to extract time from slot format
  const extractTimeFromSlot = (slot: string): string => {
    // Format: "1970-01-01T15:00:00.000Z" -> "15:00"
    const timePart = slot.split('T')[1];
    return timePart.split(':').slice(0, 2).join(':');
  };

  // Helper function to calculate duration in hours
  const getDurationFromSlots = (slots: string[]): number => {
    return slots.length; // Each slot represents 1 hour
  };

  // Helper function to get session time range
  const getSessionTimeRange = (slots: string[]): string => {
    if (slots.length === 0) return 'Time not set';
    
    const times = slots.map(slot => extractTimeFromSlot(slot)).sort();
    const startTime = times[0];
    const lastTime = times[times.length - 1];
    const endHour = parseInt(lastTime.split(':')[0]) + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    return `${startTime} - ${endTime}`;
  };

  // Helper function to check if join meeting button should be shown
  const canJoinMeeting = (sessionDate: string, slots: string[]): boolean => {
    if (slots.length === 0) return false;

    try {
      // Get the session start time from the first slot
      const times = slots.map(slot => extractTimeFromSlot(slot)).sort();
      const startTime = times[0]; // e.g., "15:00"
      
      // Parse session date and time
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const sessionDateTime = new Date(sessionDate);
      sessionDateTime.setHours(startHour, startMinute, 0, 0);
      
      // Get current time
      const now = new Date();
      
      // Calculate the difference in minutes
      const diffInMs = sessionDateTime.getTime() - now.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      
      // Show button if current time is within 15 minutes before session start
      // or if session has already started (but not more than 2 hours past start)
      return diffInMinutes <= 15 && diffInMinutes >= -120; // 15 min before to 2 hours after
    } catch (error) {
      console.error('Error calculating meeting join time:', error);
      return false;
    }
  };

  // Helper function to get meeting availability message
  const getMeetingAvailabilityMessage = (sessionDate: string, slots: string[]): string => {
    if (slots.length === 0) return '';

    try {
      const times = slots.map(slot => extractTimeFromSlot(slot)).sort();
      const startTime = times[0];
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const sessionDateTime = new Date(sessionDate);
      sessionDateTime.setHours(startHour, startMinute, 0, 0);
      
      const now = new Date();
      const diffInMs = sessionDateTime.getTime() - now.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      
      if (diffInMinutes > 15) {
        const joinTime = new Date(sessionDateTime.getTime() - (15 * 60 * 1000));
        return `Meeting will be available to join at ${joinTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })} (15 minutes before session)`;
      }
      
      return '';
    } catch (error) {
      console.error('Error calculating meeting availability message:', error);
      return '';
    }
  };

  // Helper function to get session duration
  const getSessionDuration = (slots: string[]): string => {
    const duration = slots.length;
    return duration === 1 ? '1 hour' : `${duration} hours`;
  };

  // Helper function to check if session can be cancelled (within 1 hour of creation)
  const canCancelSession = (session: SessionData): boolean => {
    // Check if session has created_at field from the backend
    if (!session.created_at) {
      return false; // Cannot cancel if no creation time is available
    }
    
    const now = new Date();
    const createdTime = new Date(session.created_at);
    const diffInMs = now.getTime() - createdTime.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    // Can cancel only within 1 hour of creation and only if status is scheduled
    return diffInHours <= 1 && session.status === 'scheduled';
  };

  // Handle session cancellation
  const handleCancelSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this session? This action cannot be undone.')) {
      return;
    }

    try {
      // Here you would typically call an API to cancel the session
      // For now, we'll simulate the API call and update local state
      // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      const session = await cancelSession(sessionId);
      console.log('Session cancelled successfully:', session);
      // Update the session status to cancelled
      setAllSessions(prev => 
        prev.map(session => 
          session.session_id === sessionId 
            ? { 
                ...session, 
                status: 'canceled' as const, 
                reason: 'Cancelled by student',
                cancelledBy: 'Student',
                refunded: true
              }
            : session
        )
      );

      showToast('Session cancelled successfully. Refund will be processed within 24 hours.', 'success');
    } catch (error) {
      console.error('Error cancelling session:', error);
      showToast('Failed to cancel session. Please try again.', 'error');
    }
  };

  // Filter sessions by status
  const upcomingSessions = allSessions.filter(session => 
    session.status === 'scheduled' 
  );
  
  const completedSessions = allSessions.filter(session => 
    session.status === 'completed'
  );
  
  const cancelledSessions = allSessions.filter(session => 
    session.status === 'canceled'
  );

  const ongoingSessions = allSessions.filter(session => 
    session.status === 'ongoing'
  );

  // Helper function to get user's initials
  const getUserInitials = (name: string) => {
    if (!name) return 'U'; // Default to 'U' for User
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to generate a consistent color based on name
  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Profile Image Component
  const ProfileImage = ({ 
    src, 
    alt, 
    name, 
    className = "w-24 h-24", 
    textClassName = "text-2xl",
    showPlaceholder = false 
  }: {
    src?: string;
    alt: string;
    name: string;
    className?: string;
    textClassName?: string;
    showPlaceholder?: boolean;
  }) => {
    const [imageError, setImageError] = useState(false);
    const hasValidImage = src && !imageError;
    
    // If we have a valid image, show it
    if (hasValidImage) {
      return (
        <img
          src={src}
          alt={alt}
          className={`${className} rounded-full object-cover border-4 border-white shadow-lg`}
          onError={() => setImageError(true)}
        />
      );
    }
    
    // If showPlaceholder is true, show placeholder icon instead of initials
    if (showPlaceholder) {
      return (
        <div className={`${className} rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg`}>
          <User className={`${className.includes('w-32') ? 'w-16 h-16' : className.includes('w-24') ? 'w-12 h-12' : 'w-4 h-4'} text-gray-400`} />
        </div>
      );
    }
    
    // Otherwise show initials
    return (
      <div className={`${className} rounded-full ${getInitialsColor(name)} flex items-center justify-center text-white font-bold ${textClassName} border-4 border-white shadow-lg`}>
        {getUserInitials(name)}
      </div>
    );
  };
  
  // Simplified student data with only name and profile picture
  const [studentData, setStudentData] = useState({
    // name: "",
    // profilePicture: "https://t3.ftcdn.net/jpg/06/33/54/78/240_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg"
    firebase_uid: userProfile?.firebase_uid || currentUser?.uid || "",
    name: userProfile?.name || currentUser?.displayName || "",
    email: userProfile?.email || currentUser?.email || "",
    photo_url: userProfile?.photo_url || "",
    role: userProfile?.role || "student"
  });


  //For update Student Profile 
  const updateStudent = async () => {
    console.log('Updating student profile...', studentData);
    
    // Validation
    if (!studentData.name.trim()) {
      showToast('Please enter your name', 'error');
      return;
    }

    setUpdateLoading(true);
    
    try {
      const updatedProfile = await updateStudentProfile({
        firebase_uid: studentData.firebase_uid,
        name: studentData.name,
        email: studentData.email,
        profileImage: image,
        role: studentData.role
      });
      
      console.log('Profile updated successfully:', updatedProfile);
      
      // Update local state with new data if photo was uploaded
      if (image && updatedProfile.photo_url) {
        setStudentData(prev => ({
          ...prev,
          photo_url: updatedProfile.photo_url || ""
        }));
        setImage(null); // Clear the file input
      }
      
      showToast('Profile updated successfully! 🎉', 'success');
      
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Show specific error message or generic fallback
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      showToast(errorMessage, 'error');
      
    } finally {
      setUpdateLoading(false);
    }
  }

  // Individual Tutors state - replaced mock data with dynamic data
  const [individualTutors, setIndividualTutors] = useState<IndividualTutorDisplay[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);

  // Mass Tutors Data - Group classes he has paid for
  const [massTutors] = useState([
    {
      id: 1,
      name: "Cambridge Learning Center",
      instructor: "Dr. Robert Smith",
      subject: "SAT Preparation",
      classSize: 25,
      currentStudents: 18,
      rating: 4.6,
      monthlyFee: 200,
      totalClassesPaid: 12,
      classesAttended: 8,
      profilePicture: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
      nextClass: "Monday 6:00 PM",
      status: "Active",
      amountPaid: 200,
      validUntil: "2025-09-15"
    },
    {
      id: 2,
      name: "Elite Science Academy",
      instructor: "Dr. Lisa Johnson", 
      subject: "Advanced Biology",
      classSize: 20,
      currentStudents: 16,
      rating: 4.8,
      monthlyFee: 250,
      totalClassesPaid: 8,
      classesAttended: 6,
      profilePicture: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150&h=150&fit=crop&crop=center",
      nextClass: "Wednesday 5:00 PM", 
      status: "Active",
      amountPaid: 250,
      validUntil: "2025-10-01"
    }
  ]);

  // Sessions Data - now using API data

  // Rating modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Fetch sessions and enrolled classes on component mount
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!userProfile?.id) {
        setSessionsLoading(false);
        setClassesLoading(false);
        setTutorsLoading(false);
        return;
      }

      try {
        setSessionsLoading(true);
        setClassesLoading(true);
        setTutorsLoading(true);
        console.log('Fetching student_id for user:', userProfile.id);
        
        // First get the student_id using the user_id
        const studentId = await getStudentIDByUserID(userProfile.id);
        
        if (!studentId) {
          console.log('No student_id found for user:', userProfile.id);
          setAllSessions([]);
          setEnrolledClasses([]);
          setIndividualTutors([]);
          setSessionsLoading(false);
          setClassesLoading(false);
          setTutorsLoading(false);
          return;
        }

        console.log('Fetching data for student_id:', studentId);
        
        // Fetch sessions, enrolled classes, and individual tutors in parallel
        const [sessions, classes, tutors] = await Promise.all([
          getAllSessionsByStudentId(studentId),
          getEnrolledClassesByStudentId(studentId),
          getTutorsByStudentId(studentId)
        ]);
        
        setAllSessions(sessions || []);
        setEnrolledClasses(classes || []);
        
        // Convert and set individual tutors data
        if (tutors && tutors.length > 0) {
          const formattedTutors: IndividualTutorDisplay[] = tutors.map((tutor: IndividualTutorDashboard) => ({
            id: tutor.i_tutor_id,
            name: tutor.User?.name || 'Unknown Tutor',
            subject: tutor.subjects.length > 0 ? tutor.subjects[0] : 'General',
            specialization: tutor.titles.length > 0 ? tutor.titles.slice(0, 2).join(' & ') : 'Various Topics',
            rating: Number(tutor.rating) || 0,
            hourlyRate: Number(tutor.hourly_rate) || 0,
            totalSessionsPaid: tutor.sessionCount || 0,
            sessionsUsed: Math.floor((tutor.sessionCount || 0) * 0.7), // Assume 70% sessions used
            profilePicture: tutor.User?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.User?.name || 'Tutor')}&background=random`,
            nextSession: 'To be scheduled',
            status: tutor.sessionCount > 0 ? 'Active' : 'Inactive',
            amountPaid: Number(tutor.totalPaid) || 0
          }));
          setIndividualTutors(formattedTutors);
        } else {
          setIndividualTutors([]);
        }
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        showToast('Failed to load student data', 'error');
        setAllSessions([]);
        setEnrolledClasses([]);
        setIndividualTutors([]);
      } finally {
        setSessionsLoading(false);
        setClassesLoading(false);
        setTutorsLoading(false);
      }
    };

    if (userProfile) {
      fetchStudentData();
    }
  }, [userProfile]);

  // Reports Data - Reports submitted by student
  const [submittedReports] = useState([
    {
      id: 1,
      tutorName: "Dr. Amanda Wilson",
      tutorId: "tutor-123",
      reportReason: "Inappropriate behavior",
      reportDate: "2025-08-20",
      description: "The tutor was consistently late to sessions and showed unprofessional behavior during our mathematics tutoring sessions. They were often distracted and did not provide the quality of instruction expected.",
      status: "Under Review",
      adminResponse: null,
      resolvedDate: null,
      reportId: "RPT-2025-001"
    },
    {
      id: 2,
      tutorName: "Prof. John Smith",
      tutorId: "tutor-456",
      reportReason: "No-show for scheduled sessions",
      reportDate: "2025-07-15",
      description: "The tutor failed to show up for three consecutive scheduled physics sessions without any prior notice or communication. This caused significant disruption to my study schedule.",
      status: "Resolved",
      adminResponse: "We have investigated this matter and taken appropriate action. The tutor has been suspended pending review. You have been refunded for the missed sessions.",
      resolvedDate: "2025-07-25",
      reportId: "RPT-2025-002"
    },
    {
      id: 3,
      tutorName: "Ms. Sarah Davis",
      tutorId: "tutor-789",
      reportReason: "Poor teaching quality",
      reportDate: "2025-06-10",
      description: "The chemistry tutor seemed unprepared for sessions and could not adequately explain basic concepts. The teaching methodology was ineffective and did not help improve my understanding.",
      status: "Closed",
      adminResponse: "Thank you for your feedback. We have provided additional training to the tutor and implemented quality monitoring measures. We appreciate your patience as we work to improve our services.",
      resolvedDate: "2025-06-20",
      reportId: "RPT-2025-003"
    }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  const [activeSessionsTab, setActiveSessionsTab] = useState('individual'); // 'individual' or 'classes'

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
      }
      
      console.log('File selected:', file);
      setImage(file);
      showToast('Image selected. Click Save Changes to upload.', 'info');
    }
  };

  // Load user data when userProfile is available
  useEffect(() => {
    console.log('userProfile:', userProfile);
    if (userProfile && currentUser) {
      setStudentData({
        firebase_uid: userProfile?.firebase_uid || currentUser?.uid || "",
        name: userProfile?.name || currentUser?.displayName || "",
        email: userProfile?.email || currentUser?.email || "",
        photo_url: userProfile?.photo_url || currentUser?.photoURL || "https://t3.ftcdn.net/jpg/06/33/54/78/240_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg",
        role: userProfile?.role || "student"
      });
      setLoading(false);
    }
  }, [userProfile, currentUser]);

  // Helper function to render stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Rating and Review Functions
  const openRatingModal = (session: any) => {
    setSelectedSession(session);
    setRating(0);
    setReview('');
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedSession(null);
    setRating(0);
    setReview('');
  };

  const handleRatingClick = (ratingValue: number) => {
    setRating(ratingValue);
  };

  const submitRating = async () => {
    if (!selectedSession || rating === 0) {
      showToast('Please provide a rating', 'error');
      return;
    }

    if (review.trim().length < 10) {
      showToast('Please provide a review with at least 10 characters', 'error');
      return;
    }

    setSubmittingRating(true);
    
    try {
      // Here you would typically call an API to submit the rating
      // For now, we'll simulate the API call and update the local state
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Update the session with the new rating and review
      setAllSessions(prev => 
        prev.map(session => 
          session.session_id === selectedSession.session_id 
            ? { ...session, rating: rating, feedback: review }
            : session
        )
      );

      showToast('Rating and review submitted successfully!', 'success');
      closeRatingModal();
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('Failed to submit rating. Please try again.', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  // Render interactive stars for rating modal
  const renderInteractiveStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-8 h-8 cursor-pointer transition-colors ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
        }`}
        onClick={() => handleRatingClick(i + 1)}
      />
    ));
  };

  // Individual Tutors Section
  const IndividualTutorsSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Individual Tutors</h2>
      </div>
      
      {tutorsLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading tutors...</span>
        </div>
      ) : individualTutors.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Individual Tutors Yet</h3>
          <p className="text-gray-400 mb-6">You haven't booked any individual tutoring sessions yet.</p>
          <button 
            onClick={() => navigate('/find-tutors')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Find Tutors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {individualTutors.map((tutor) => (
          <div key={tutor.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
              <img
                src={tutor.profilePicture}
                alt={tutor.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{tutor.name}</h3>
                <p className="text-blue-600 font-medium text-sm sm:text-base">{tutor.subject}</p>
                <p className="text-xs sm:text-sm text-gray-600">{tutor.specialization}</p>
              </div>
              <div className="text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-end space-x-1 mb-1">
                  {renderStars(Math.floor(tutor.rating))}
                  <span className="text-xs sm:text-sm text-gray-600">({tutor.rating})</span>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                  tutor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tutor.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-sm">
              <div className="bg-white rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-bold text-blue-600">{tutor.totalSessionsPaid}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Sessions Used</div>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-bold text-green-600">Rs.{tutor.amountPaid}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Total Paid</div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-gray-600">Hourly Rate:</span>
                <span className="font-semibold text-gray-800">Rs.{tutor.hourlyRate}/hr</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-gray-600">Next Session:</span>
                <span className="font-semibold text-blue-600">{tutor.nextSession}</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );

  // Mass Tutors Section
  const MassTutorsSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mr-2 sm:mr-3" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Group Classes</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {massTutors.map((tutor) => (
          <div key={tutor.id} className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
              <img
                src={tutor.profilePicture}
                alt={tutor.instructor}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{tutor.name}</h3>
                <p className="text-purple-600 font-medium text-sm sm:text-base">{tutor.subject}</p>
                <p className="text-xs sm:text-sm text-gray-600">Instructor: {tutor.instructor}</p>
              </div>
              <div className="text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-end space-x-1 mb-1">
                  {renderStars(Math.floor(tutor.rating))}
                  <span className="text-xs sm:text-sm text-gray-600">({tutor.rating})</span>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                  tutor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tutor.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 text-sm">
              <div className="bg-white rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-bold text-purple-600">{tutor.classesAttended}/{tutor.totalClassesPaid}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Classes Attended</div>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-bold text-green-600">${tutor.amountPaid}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Monthly Fee</div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-gray-600">Class Size:</span>
                <span className="font-semibold text-gray-800">{tutor.currentStudents}/{tutor.classSize} students</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-gray-600">Next Class:</span>
                <span className="font-semibold text-purple-600">{tutor.nextClass}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-gray-600">Valid Until:</span>
                <span className="font-semibold text-gray-800">{new Date(tutor.validUntil).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Sessions Section Component
  const SessionsSection = ({ sessions, title, emptyMessage, showRating = false, type = "upcoming" }: any) => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        {type === "upcoming" && <Calendar className="w-5 h-5 mr-2 text-blue-600" />}
        {type === "previous" && <CheckCircle className="w-5 h-5 mr-2 text-green-600" />}
        {type === "cancelled" && <XCircle className="w-5 h-5 mr-2 text-red-600" />}
        {type === "ongoing" && <Clock className="w-5 h-5 mr-2 text-yellow-600" />}
        {title}
      </h3>
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: Session) => (
            <div key={session.session_id} className={`border-l-4 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-25 ${canCancelSession(session) ? 'ring-1 ring-orange-200' : ''}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${canCancelSession(session) ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800">{session.title || 'Individual Session'}</h4>
                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                    Individual
                  </span>
                  {canCancelSession(session) && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                      Cancellable
                    </span>
                  )}
                </div>
                <span className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold ${
                  session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  session.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                  session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {session.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm mb-4">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Tutor</span>
                  </div>
                  <p className="font-semibold text-gray-800">{session.Individual_Tutor?.User?.name || 'Unknown Tutor'}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Date & Time</span>
                  </div>
                  <p className="font-semibold text-gray-800">{new Date(session.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{getSessionTimeRange(session.slots)}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Duration</span>
                  </div>
                  <p className="font-semibold text-gray-800">{getSessionDuration(session.slots)}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Location</span>
                  </div>
                  <p className="font-semibold text-gray-800 break-words">Online</p>
                </div>
              </div>

              {session.meeting_urls && (session.status === 'scheduled' || session.status === 'ongoing') && (
                <div className="mb-4">
                  {(session.status === 'ongoing' || canJoinMeeting(session.date, session.slots)) ? (
                    <a 
                      href={session.meeting_urls[1]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Meeting
                    </a>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        {getMeetingAvailabilityMessage(session.date, session.slots) || 
                         'Meeting link will be available 15 minutes before the session starts'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Cancel Session - Only show for scheduled sessions and if can be cancelled */}
              {session.status === 'scheduled' && canCancelSession(session) && (
                <div className="mb-4">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-sm text-orange-800 font-medium block">
                            Session can be cancelled
                          </span>
                          <span className="text-xs text-orange-700">
                            {(() => {
                              if (!session.created_at) {
                                return "Sessions can only be cancelled within 1 hour of booking";
                              }
                              
                              const now = new Date();
                              const createdTime = new Date(session.created_at);
                              const diffInMs = now.getTime() - createdTime.getTime();
                              const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
                              const remainingMinutes = 60 - diffInMinutes;
                              
                              if (remainingMinutes > 0) {
                                return `${remainingMinutes} minutes remaining to cancel`;
                              }
                              return "Sessions can only be cancelled within 1 hour of booking";
                            })()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelSession(session.session_id)}
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel Session
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Material Links for sessions */}
              {(session.status === 'completed' || session.status === 'scheduled' || session.status === 'ongoing') && session.materials && session.materials.length > 0 && (
                <div className="mb-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <h5 className="font-medium text-green-800 mb-3 flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Session Materials
                    </h5>
                    <div className="space-y-2">
                      {session.materials.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm text-green-700 mr-2 mb-2"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Material {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {showRating && session.rating && (
                <div className="bg-white rounded-lg p-4 border-t">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-700">Your Rating:</span>
                    <div className="flex items-center space-x-1">
                      {renderStars(session.rating)}
                    </div>
                  </div>
                  {session.feedback && (
                    <p className="text-gray-700 italic bg-gray-50 p-3 rounded-lg">"{session.feedback}"</p>
                  )}
                </div>
              )}

              {showRating && !session.rating && session.status === 'completed' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-t border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Share Your Experience</h4>
                      <p className="text-sm text-gray-600">Rate and review this session to help other students</p>
                    </div>
                    <button
                      onClick={() => openRatingModal(session)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate & Review
                    </button>
                  </div>
                </div>
              )}

              {session.reason && (
                <div className="bg-red-50 rounded-lg p-4 border-t border-red-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="font-medium text-red-800">Cancellation Details</span>
                  </div>
                  <p className="text-red-700 mb-1">
                    <span className="font-medium">Reason:</span> {session.reason}
                  </p>
                  <p className="text-red-600 text-sm">Cancelled by: {session.cancelledBy}</p>
                  {session.refunded && (
                    <p className="text-green-600 text-sm font-medium mt-1">✓ Refund processed</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Enrolled Classes Section Component
  const EnrolledClassesSection = () => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'upcoming': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-gray-100 text-gray-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getLevelColor = (level: string) => {
      switch (level) {
        case 'Beginner': return 'bg-green-100 text-green-700';
        case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
        case 'Advanced': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };

    if (classesLoading) {
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-purple-600" />
            Enrolled Classes
          </h3>
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-500">Loading enrolled classes...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Enrolled Classes
        </h3>
        {enrolledClasses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">No enrolled classes found</p>
            <p className="text-gray-400 text-sm mt-2">Browse and enroll in mass classes to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrolledClasses.map((enrolledClass) => (
              <div key={enrolledClass.class_id} className="border-l-4 border-purple-500 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-50 to-purple-25">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <h4 className="text-base sm:text-lg font-bold text-gray-800">{enrolledClass.class_name}</h4>
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      Mass Class
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(enrolledClass.status)}`}>
                      {enrolledClass.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(enrolledClass.level)}`}>
                      {enrolledClass.level}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-600">Tutor</span>
                    </div>
                    <p className="font-semibold text-gray-800">{enrolledClass.tutor.name}</p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="ml-1 text-xs text-gray-600">{enrolledClass.tutor.rating}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-600">Subject</span>
                    </div>
                    <p className="font-semibold text-gray-800">{enrolledClass.subject}</p>
                    <p className="text-gray-600 text-xs">{enrolledClass.duration}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-600">Schedule</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-xs">{enrolledClass.schedule}</p>
                    {enrolledClass.next_session && (
                      <p className="text-blue-600 text-xs mt-1">
                        Next: {new Date(enrolledClass.next_session).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-600">Enrollment</span>
                    </div>
                    <p className="font-semibold text-gray-800">{enrolledClass.students_enrolled}</p>
                    <p className="text-xs text-gray-600">students enrolled</p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{enrolledClass.description}</p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      LKR {enrolledClass.price.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Enrolled: {new Date(enrolledClass.enrollment_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {enrolledClass.status === 'active' && enrolledClass.meeting_link && (
                      <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        <Video className="w-4 h-4 mr-2" />
                        Join Class
                      </button>
                    )}
                    <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      onClick={() => navigate(`/mass-class/${enrolledClass.class_id}`)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Simple ProfileHeader component
  const ProfileHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8 text-white">
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative flex-shrink-0">
          <ProfileImage
            src={studentData.photo_url}
            alt="Profile"
            name={studentData.name || currentUser?.displayName || 'User'}
            className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32"
            textClassName="text-2xl sm:text-3xl lg:text-4xl"
          />
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 sm:border-4 border-white flex items-center justify-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{studentData.name}</h1>
          <p className="text-blue-100 text-sm sm:text-base lg:text-lg mb-3">{currentUser?.email || userProfile?.email}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-black">
              {userProfile?.role || "Student"}
            </span>
            <span className="text-blue-100 text-xs sm:text-sm">
              Member since {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-950">{individualTutors.reduce((acc, tutor) => acc + tutor.sessionsUsed, 0)}</div>
                <div className="text-blue-900 text-xs sm:text-sm font-bold">Sessions Completed</div>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-950">${individualTutors.reduce((acc, tutor) => acc + tutor.amountPaid, 0) + massTutors.reduce((acc, tutor) => acc + tutor.amountPaid, 0)}</div>
              <div className="text-blue-900 text-xs sm:text-sm font-bold">Total Invested</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading state while auth is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if no user
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <p className="text-gray-600">You need to be logged in to access your student profile.</p>
        </div>
      </div>
    );
  }

  // Rating Modal Component
  const RatingModal = () => {
    if (!showRatingModal || !selectedSession) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Rate & Review Session</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedSession.subject} with {selectedSession.tutor}</p>
            </div>
            <button
              onClick={closeRatingModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {/* Session Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date:</span>
                  <div className="font-medium">{new Date(selectedSession.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Duration:</span>
                  <div className="font-medium">{selectedSession.duration}</div>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <div className="font-medium">{selectedSession.type}</div>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <div className="font-medium">{selectedSession.location}</div>
                </div>
              </div>
            </div>

            {/* Rating Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate this session?
              </label>
              <div className="flex items-center justify-center space-x-2 py-4">
                {renderInteractiveStars()}
              </div>
              {rating > 0 && (
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-600">
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </span>
                </div>
              )}
            </div>

            {/* Review Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share your experience (optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell other students about your experience with this tutor. What did you like? What could be improved?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {review.length}/500 characters
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200">
            <button
              onClick={closeRatingModal}
              disabled={submittingRating}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={submitRating}
              disabled={submittingRating || rating === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submittingRating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />
      <ToastContainer />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <ProfileHeader />
        
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 whitespace-nowrap ${
                activeTab === 'sessions'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Flag className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Reports
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Edit Profile</span>
              <span className="sm:hidden">Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <IndividualTutorsSection />
            <MassTutorsSection />
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Sub-navigation for sessions */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveSessionsTab('individual')}
                  className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeSessionsTab === 'individual'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Individual Sessions
                </button>
                <button
                  onClick={() => setActiveSessionsTab('classes')}
                  className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeSessionsTab === 'classes'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Enrolled Classes
                </button>
              </nav>
            </div>

            {/* Content based on active sub-tab */}
            {activeSessionsTab === 'individual' && (
              <div className="space-y-8">
                <SessionsSection 
                  sessions={upcomingSessions} 
                  title="Upcoming Sessions" 
                  emptyMessage="No upcoming sessions scheduled"
                  type="upcoming"
                />
                <SessionsSection 
                  sessions={ongoingSessions} 
                  title="Ongoing Sessions" 
                  emptyMessage="No ongoing sessions"
                  type="ongoing"
                />
                <SessionsSection 
                  sessions={completedSessions} 
                  title="Previous Sessions" 
                  emptyMessage="No previous sessions found"
                  showRating={true}
                  type="previous"
                />
                <SessionsSection 
                  sessions={cancelledSessions} 
                  title="Cancelled Sessions" 
                  emptyMessage="No cancelled sessions"
                  type="cancelled"
                />
              </div>
            )}

            {activeSessionsTab === 'classes' && (
              <EnrolledClassesSection />
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Flag className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">My Reports</h2>
            </div>
            
            {submittedReports.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Flag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No reports submitted</p>
                <p className="text-gray-400 text-sm mt-2">You haven't submitted any tutor reports yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {submittedReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                    {/* Report Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <Flag className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{report.tutorName}</h3>
                          <p className="text-sm text-gray-600">Report ID: {report.reportId}</p>
                          <p className="text-sm text-gray-500">Submitted: {new Date(report.reportDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0">
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          report.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                          report.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    {/* Report Reason */}
                    <div className="mb-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-red-800 mb-2">Report Reason</h4>
                        <p className="text-red-700 font-medium">{report.reportReason}</p>
                      </div>
                    </div>

                    {/* Report Description */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        Description
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 leading-relaxed">{report.description}</p>
                      </div>
                    </div>

                    {/* Admin Response (if available) */}
                    {report.adminResponse && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          Admin Response
                        </h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-blue-800 leading-relaxed">{report.adminResponse}</p>
                          {report.resolvedDate && (
                            <p className="text-blue-600 text-sm mt-2 font-medium">
                              Resolved on: {new Date(report.resolvedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Timeline */}
                    <div className="border-t pt-4">
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          Submitted: {new Date(report.reportDate).toLocaleDateString()}
                        </span>
                        {report.status === 'Under Review' && (
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                            Under Review
                          </span>
                        )}
                        {report.resolvedDate && (
                          <span className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            {report.status}: {new Date(report.resolvedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Report Statistics */}
            {submittedReports.length > 0 && (
              <div className="mt-8 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Report Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">{submittedReports.length}</div>
                    <div className="text-gray-600 text-sm">Total Reports</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {submittedReports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length}
                    </div>
                    <div className="text-gray-600 text-sm">Resolved</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {submittedReports.filter(r => r.status === 'Under Review').length}
                    </div>
                    <div className="text-gray-600 text-sm">Pending</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 flex items-center">
              <User className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
              Edit Profile
            </h2>
            <div className="space-y-6 sm:space-y-8">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={studentData.name}
                  onChange={(e) => setStudentData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-blue-500 text-base sm:text-lg transition-all duration-300"
                  placeholder="Enter your name"
                />
              </div>

              {/* Profile Picture Upload */}
              <div>
                <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                  Profile Picture
                </label>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <ProfileImage
                      src={image ? URL.createObjectURL(image) : studentData.photo_url}
                      alt="Profile"
                      name={studentData.name || currentUser?.displayName || 'User'}
                      className="w-20 h-20 sm:w-24 sm:h-24"
                      textClassName="text-xl sm:text-2xl"
                    />
                    {image && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-upload"
                      disabled={updateLoading}
                    />
                    <label
                      htmlFor="profile-upload"
                      className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border-2 rounded-xl shadow-md text-sm sm:text-lg font-semibold cursor-pointer transition-all duration-300 ${
                        updateLoading 
                          ? 'border-gray-300 text-gray-500 bg-gray-100 cursor-not-allowed' 
                          : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
                      }`}
                    >
                      <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                      {image ? 'Change Photo' : 'Choose Photo'}
                    </label>
                    {image && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {image.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 sm:pt-6">
                <button
                  onClick={() => {
                    updateStudent(); 
                  }}
                  disabled={updateLoading}
                  className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl text-base sm:text-lg font-semibold flex items-center justify-center ${
                    updateLoading 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {updateLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Rating Modal */}
      <RatingModal />
      
      <Footer />
    </div>
  );
};

export default StudentProfile;
