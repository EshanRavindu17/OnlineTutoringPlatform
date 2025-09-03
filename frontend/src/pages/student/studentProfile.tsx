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
  Eye
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/authContext';
import { updateStudentProfile } from '../../api/Student';
import { useToast } from '../../components/Toast';

const StudentProfile: React.FC = () => {
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { showToast, ToastContainer } = useToast();

  const [image, setImage] = useState<File | null>(null);

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

  // Individual Tutors Data - Students he has paid for sessions
  const [individualTutors] = useState([
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      subject: "Advanced Mathematics",
      specialization: "Calculus & Algebra",
      rating: 4.9,
      hourlyRate: 65,
      totalSessionsPaid: 10,
      sessionsUsed: 6,
      profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      nextSession: "Tomorrow 3:00 PM",
      status: "Active",
      amountPaid: 650
    },
    {
      id: 2,
      name: "Prof. Michael Chen", 
      subject: "Physics",
      specialization: "Quantum Mechanics",
      rating: 4.8,
      hourlyRate: 70,
      totalSessionsPaid: 8,
      sessionsUsed: 5,
      profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      nextSession: "Thursday 2:00 PM",
      status: "Active",
      amountPaid: 560
    }
  ]);

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

  // Sessions Data
  const [upcomingSessions] = useState([
    {
      id: 1,
      subject: "Advanced Mathematics",
      tutor: "Dr. Sarah Wilson",
      date: "2025-08-16",
      time: "3:00 PM",
      duration: "1.5 hours",
      type: "Individual",
      location: "Online - Zoom",
      status: "Confirmed",
      meetingLink: "https://zoom.us/j/123456789"
    },
    {
      id: 2,
      subject: "Physics",
      tutor: "Prof. Michael Chen",
      date: "2025-08-17",
      time: "2:00 PM", 
      duration: "2 hours",
      type: "Individual",
      location: "Online - Zoom",
      status: "Confirmed",
      meetingLink: "https://zoom.us/j/987654321"
    },
    {
      id: 3,
      subject: "SAT Preparation",
      tutor: "Dr. Robert Smith",
      date: "2025-08-19",
      time: "6:00 PM",
      duration: "2 hours", 
      type: "Group",
      location: "Online - Google Meet",
      status: "Confirmed",
      meetingLink: "https://meet.google.com/abc-defg-hij"
    }
  ]);

  const [previousSessions] = useState([
    {
      id: 1,
      subject: "Advanced Mathematics",
      tutor: "Dr. Sarah Wilson",
      date: "2025-08-08",
      time: "3:00 PM",
      duration: "1.5 hours",
      type: "Individual",
      location: "Online - Zoom",
      status: "Completed",
      rating: 5,
      feedback: "Excellent session! Dr. Wilson explained calculus concepts very clearly."
    },
    {
      id: 2,
      subject: "Physics",
      tutor: "Prof. Michael Chen",
      date: "2025-08-05",
      time: "2:00 PM",
      duration: "2 hours", 
      type: "Individual",
      location: "Online - Zoom",
      status: "Completed",
      rating: 4,
      feedback: "Good session, would like more practice problems next time."
    },
    {
      id: 3,
      subject: "SAT Preparation",
      tutor: "Dr. Robert Smith",
      date: "2025-08-01",
      time: "6:00 PM",
      duration: "2 hours",
      type: "Group", 
      location: "Online - Google Meet",
      status: "Completed",
      rating: 5,
      feedback: "Great group session with lots of practice tests."
    }
  ]);

  const [cancelledSessions] = useState([
    {
      id: 1,
      subject: "Physics",
      tutor: "Prof. Michael Chen",
      date: "2025-08-10",
      time: "2:00 PM",
      duration: "2 hours",
      type: "Individual", 
      location: "Online - Zoom",
      status: "Cancelled",
      reason: "Tutor was sick",
      cancelledBy: "Tutor",
      refunded: true
    }
  ]);

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

  // Individual Tutors Section
  const IndividualTutorsSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-2 sm:mr-3" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Individual Tutors</h2>
      </div>
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
                <div className="text-base sm:text-lg font-bold text-blue-600">{tutor.sessionsUsed}/{tutor.totalSessionsPaid}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Sessions Used</div>
              </div>
              <div className="bg-white rounded-lg p-2 sm:p-3 text-center">
                <div className="text-base sm:text-lg font-bold text-green-600">${tutor.amountPaid}</div>
                <div className="text-gray-600 text-xs sm:text-sm">Total Paid</div>
              </div>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-gray-600">Hourly Rate:</span>
                <span className="font-semibold text-gray-800">${tutor.hourlyRate}/hr</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                <span className="text-gray-600">Next Session:</span>
                <span className="font-semibold text-blue-600">{tutor.nextSession}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
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
        {title}
      </h3>
      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 text-lg">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session: any) => (
            <div key={session.id} className={`border-l-4 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 ${
              session.type === 'Individual' 
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-25' 
                : 'border-purple-500 bg-gradient-to-r from-purple-50 to-purple-25'
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    session.type === 'Individual' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <h4 className="text-base sm:text-lg font-bold text-gray-800">{session.subject}</h4>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                    session.type === 'Individual' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {session.type}
                  </span>
                </div>
                <span className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold ${
                  session.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                  session.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  session.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
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
                  <p className="font-semibold text-gray-800">{session.tutor}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Date & Time</span>
                  </div>
                  <p className="font-semibold text-gray-800">{new Date(session.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">{session.time}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Duration</span>
                  </div>
                  <p className="font-semibold text-gray-800">{session.duration}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">Location</span>
                  </div>
                  <p className="font-semibold text-gray-800 break-words">{session.location}</p>
                </div>
              </div>

              {session.meetingLink && session.status === 'Confirmed' && (
                <div className="mb-4">
                  <a 
                    href={session.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Meeting
                  </a>
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
            <div className="space-y-8">
              <SessionsSection 
                sessions={upcomingSessions} 
                title="Upcoming Sessions" 
                emptyMessage="No upcoming sessions scheduled"
                type="upcoming"
              />
              <SessionsSection 
                sessions={previousSessions} 
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
      <Footer />
    </div>
  );
};

export default StudentProfile;
