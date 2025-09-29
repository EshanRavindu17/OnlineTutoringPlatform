import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {User,Calendar,DollarSign,Star,BookOpen,Clock,TrendingUp,Award,Users,Edit3,Save,X,Plus, 
  ChevronRight,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  FileText,
  Video,
  Settings,
  Bell,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Calendar as CalendarIcon,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Upload,
  VideoIcon,
  Camera,
  Search
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/authContext';
import { Subject, Title, tutorService } from '../../api/TutorService';
import { ScheduleService } from '../../api/ScheduleService';
import { sessionService } from '../../api/SessionService';
import { SessionWithDetails, SessionStatistics } from '../../types/session';
import { NotificationCenter } from './NotificationCenter';
import { STANDARD_QUALIFICATIONS } from '../../constants/qualifications';
import { EarningsService, EarningsDashboard, EarningsStatistics, RecentPayment } from '../../api/EarningsService';
import { ReviewsService, ReviewData, ReviewStatistics, ReviewAnalytics } from '../../api/ReviewsService';

interface LocalTutorProfile {
  name: string;
  description: string;
  phone: string;
  heading?: string;  // Added heading field
  subjects: string[];      // Subject names instead of IDs
  titles: string[];       // Title names instead of IDs
  titlesGroupedBySubject?: { [subjectName: string]: string[] }; // Grouped titles for display
  qualifications: string[];  // Changed from alQualifications and degree to array
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalEarnings: number;
  adminCommission: number;
  profit: number;
  photo_url?: string | null;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  studentName: string | null;
}

interface SubjectWithTitles {
  subject: string;
  titles: string[];
}

interface Session {
  id: number;
  studentName: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  amount: number;
  materials?: string[];
  rating?: number;
  review?: string;
  reason?: string;
  refunded?: boolean;
  meeting_urls?: string[];
}

interface Review {
  id: number;
  studentName: string;
  rating: number;
  date: string;
  comment: string;
  subject: string;
}

interface Notification {
  id: number;
  type: 'booking' | 'cancellation' | 'reschedule' | 'payment' | 'review';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  sessionId?: number;
  studentName?: string;
}

const TutorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showImageEditModal, setShowImageEditModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState({
    basic: false,
    contact: false,
    qualifications: false,
    subjects: false,
    pricing: false
  });

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'booking',
      title: 'New Session Booked',
      message: 'John Doe has booked a Mathematics session for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: false,
      sessionId: 123,
      studentName: 'John Doe'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $65 received for your session with Jane Smith',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      studentName: 'Jane Smith'
    },
    {
      id: 3,
      type: 'review',
      title: 'New Review',
      message: 'Mike Johnson left a 5-star review for your Physics session',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
      studentName: 'Mike Johnson'
    },
    {
      id: 4,
      type: 'reschedule',
      title: 'Reschedule Request',
      message: 'Sarah Wilson wants to reschedule tomorrow\'s session to Friday',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      sessionId: 124,
      studentName: 'Sarah Wilson'
    },
    {
      id: 5,
      type: 'cancellation',
      title: 'Session Cancelled',
      message: 'Tom Brown has cancelled the Real Analysis session scheduled for today',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      sessionId: 125,
      studentName: 'Tom Brown'
    }
  ]);

  const { currentUser, userProfile } = useAuth();

  // Predefined qualifications list (imported from shared constants)
  const standardQualifications = STANDARD_QUALIFICATIONS;

  // Qualifications management state
  const [customQualification, setCustomQualification] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('');

  // Tutor Profile State
  const [tutorProfile, setTutorProfile] = useState<LocalTutorProfile>({
    name: userProfile?.name || '',
    description: 'Experienced tutor with passion for teaching mathematics and physics. I help students understand complex concepts through clear explanations and practical examples.',
    photo_url: userProfile?.photo_url || '',
    phone: '(+94) 435-123-4567',
    subjects: [],
    titles: [], 
    qualifications: [],
    hourlyRate: 65,
    rating: 4.9,
    totalReviews: 127,
    totalEarnings: 15240,
    adminCommission: 1524, 
    profit: 13716
  });

  // Real-time stats
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    monthlyEarnings: 0,
    thisWeekEarnings: 0,
    averageRating: 4.9,
    responseRate: 98,
    onTimeRate: 95
  });

  // Subjects and Titles from backend
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [availableTitles, setAvailableTitles] = useState<Title[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTitles, setLoadingTitles] = useState(false);
  
  // State for adding custom subjects and titles
  const [customSubject, setCustomSubject] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [selectedSubjectForCustomTitle, setSelectedSubjectForCustomTitle] = useState('');
  
  // State for filtering/searching
  const [subjectFilter, setSubjectFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');

  // Load subjects when component mounts
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load titles when tutor profile subjects change (for display purposes)
  useEffect(() => {
    if (tutorProfile.subjects.length > 0 && availableSubjects.length > 0) {
      loadTitlesForSubjects(tutorProfile.subjects);
    }
  }, [tutorProfile.subjects, availableSubjects]);

  // Load subjects from API
  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const subjects = await tutorService.getAllSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Load titles when subjects change
  const loadTitlesForSubjects = async (selectedSubjectNames: string[]) => {
    if (selectedSubjectNames.length === 0) {
      setAvailableTitles([]);
      return;
    }

    setLoadingTitles(true);
    try {
      // Convert subject names to IDs for API calls
      const selectedSubjectIds = selectedSubjectNames.map(subjectName => {
        const subject = availableSubjects.find(s => s.name === subjectName);
        return subject?.sub_id;
      }).filter(Boolean) as string[];

      if (selectedSubjectIds.length === 0) {
        console.warn('No matching subject IDs found for names:', selectedSubjectNames);
        setAvailableTitles([]);
        setLoadingTitles(false);
        return;
      }

      // Load titles for all selected subjects
      const allTitles = [];
      for (const subjectId of selectedSubjectIds) {
        const titles = await tutorService.getTitlesBySubject(subjectId);
        allTitles.push(...titles);
      }
      
      // Remove duplicates if any
      const uniqueTitles = allTitles.filter((title, index, self) => 
        index === self.findIndex(t => t.title_id === title.title_id)
      );
      
      console.log('Loaded available titles:', uniqueTitles); // Debug log
      setAvailableTitles(uniqueTitles);
    } catch (error) {
      console.error('Failed to load titles:', error);
    } finally {
      setLoadingTitles(false);
    }
  };

  // Load sessions data
  const loadSessionsData = async () => {
    if (currentUser?.uid) {
      try {
        // Load all sessions
        const allSessions = await sessionService.getAllSessions(currentUser.uid);
        
        // Load session statistics
        const statistics = await sessionService.getSessionStatistics(currentUser.uid);
        setSessionStats(statistics);
        
        // Categorize sessions
        const upcoming = allSessions.filter(session => 
          session.status === 'scheduled' && 
          session.date && 
          new Date(session.date) > new Date()
        );
        
        const previous = allSessions.filter(session => 
          session.status === 'completed'
        );
        
        const cancelled = allSessions.filter(session => 
          session.status === 'canceled'
        );
        
        setSessions({
          upcoming,
          previous,
          cancelled,
          all: allSessions
        });
      } catch (error) {
        console.error('Error loading sessions data:', error);
      }
    }
  };

  // Load earnings data
  const loadEarningsData = async () => {
    if (currentUser?.uid) {
      try {
        setEarningsLoading(true);
        const dashboard = await EarningsService.getEarningsDashboard(currentUser.uid);
        setEarningsData(dashboard.earnings);
        setRecentPayments(dashboard.recentPayments);
        
        // Update tutor profile with real earnings data
        setTutorProfile(prev => ({
          ...prev,
          totalEarnings: dashboard.earnings.totalEarnings,
          adminCommission: dashboard.earnings.adminCommission,
          profit: dashboard.earnings.netEarnings
        }));
      } catch (error) {
        console.error('Error loading earnings data:', error);
      } finally {
        setEarningsLoading(false);
      }
    }
  };

  // Load reviews data
  const loadReviewsData = async () => {
    if (currentUser?.uid) {
      try {
        setReviewsLoading(true);
        const [reviewsDataResult, statisticsResult] = await Promise.all([
          ReviewsService.getTutorReviews(currentUser.uid, { limit: 20 }),
          ReviewsService.getReviewStatistics(currentUser.uid)
        ]);
        
        setReviewsData(reviewsDataResult);
        setReviewStats(statisticsResult);
        
        // Update tutor profile with real reviews data
        setTutorProfile(prev => ({
          ...prev,
          rating: statisticsResult.averageRating,
          totalReviews: statisticsResult.totalReviews
        }));
      } catch (error) {
        console.error('Error loading reviews data:', error);
      } finally {
        setReviewsLoading(false);
      }
    }
  };

  // Load real data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        if (currentUser?.uid) {
          // Load tutor profile from backend
          try {
            const profile = await tutorService.getTutorProfile(currentUser.uid);
            setTutorProfile(prev => ({
              ...prev,
              name: profile.User.name,
              photo_url: profile.User.photo_url || '',
              description: profile.description,
              hourlyRate: profile.hourly_rate,
              rating: profile.rating,
              subjects: profile.subjects,   // Load subjects from backend
              titles: profile.titles,       // Load titles from backend
              titlesGroupedBySubject: profile.titlesGroupedBySubject || {}, // Load grouped titles
              qualifications: profile.qualifications,
              phone: profile.phone_number, // Load phone from backend
              heading: profile.heading,     // Load heading from backend
              // Keep existing mock values for fields not in backend
              totalReviews: prev.totalReviews,
              totalEarnings: prev.totalEarnings,
              adminCommission: prev.adminCommission,
              profit: prev.profit
            }));

            // Load titles for the selected subjects (will be handled by useEffect when availableSubjects loads)
            // Titles will be loaded automatically by the useEffect dependency

            // Load tutor statistics
            const statistics = await tutorService.getTutorStatistics(profile.i_tutor_id);
            setStats(prev => ({
              ...prev,
              completedSessions: statistics.totalSessions,
              monthlyEarnings: statistics.totalEarnings,
              upcomingSessions: statistics.upcomingSessions
            }));

            // Update profile with statistics data
            setTutorProfile(prev => ({
              ...prev,
              // rating: statistics.averageRating,
              totalReviews: statistics.reviewsCount,
              totalEarnings: statistics.totalEarnings
            }));
          } catch (profileError) {
            console.error('Error loading tutor profile:', profileError);
            // Continue with schedule loading even if profile fails
          }

          // Load schedule stats
          const tutorIdResponse = await ScheduleService.getTutorId(currentUser.uid);
          if (tutorIdResponse.success) {
            const slotsResponse = await ScheduleService.getTutorTimeSlots(tutorIdResponse.data.tutorId);
            if (slotsResponse.success) {
              const slots = slotsResponse.data;
              
              // Filter future slots
              const now = new Date();
              const futureSlots = slots.filter(slot => {
                const slotDate = new Date(slot.date);
                return slotDate >= now;
              });
              
              setStats(prev => ({
                ...prev,
                totalSlots: futureSlots.length,
                availableSlots: futureSlots.filter(s => s.status === 'free').length,
                bookedSlots: futureSlots.filter(s => s.status === 'booked').length,
                upcomingSessions: futureSlots.filter(s => s.status === 'booked').length,
                monthlyEarnings: futureSlots.filter(s => s.status === 'booked').length * 65
              }));
            }
          }

          // Load all dashboard data
          await Promise.all([
            loadSessionsData(),
            loadEarningsData(),
            loadReviewsData()
          ]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showImageEditModal) {
          setShowImageEditModal(false);
          setSelectedImage(null);
          setImagePreview(null);
        }
      }
    };

    if (showImageEditModal) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showImageEditModal]);

  // Sessions Data - Real data from backend
  const [sessions, setSessions] = useState({
    upcoming: [] as SessionWithDetails[],
    previous: [] as SessionWithDetails[],
    cancelled: [] as SessionWithDetails[],
    all: [] as SessionWithDetails[]
  });

  // Session statistics
  const [sessionStats, setSessionStats] = useState<SessionStatistics | null>(null);

  // Earnings state
  const [earningsData, setEarningsData] = useState<EarningsStatistics | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [earningsLoading, setEarningsLoading] = useState(false);

  // Reviews state
  const [reviewsData, setReviewsData] = useState<ReviewData[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatistics | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Reviews and Ratings (keep old for backward compatibility)
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      studentName: 'Emily R.',
      rating: 5,
      date: '2025-08-20',
      comment: 'Dr. Martinez helped me improve my calculus grade from a C to an A! Her explanations are clear and she\'s incredibly patient. Highly recommend!',
      subject: 'Mathematics'
    },
    {
      id: 2,
      studentName: 'Michael T.',
      rating: 5,
      date: '2025-08-18',
      comment: 'Amazing tutor! She made physics concepts that seemed impossible actually make sense. My test scores have improved dramatically.',
      subject: 'Physics'
    },
    {
      id: 3,
      studentName: 'Jessica L.',
      rating: 4,
      date: '2025-08-15',
      comment: 'Dr. Martinez is fantastic! She helped me prepare for the SAT math section and I scored a 780. Her teaching methods are excellent.',
      subject: 'Mathematics'
    }
  ]);

  const [newMaterial, setNewMaterial] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Helper function to format session data
  const formatSession = (session: SessionWithDetails) => {
    return {
      id: session.session_id,
      studentName: session.Student?.User?.name || 'Unknown Student',
      subject: session.title || 'No Subject',
      title: session.title || 'No Title',
      date: session.date ? new Date(session.date).toLocaleDateString() : '',
      time: session.start_time && session.end_time 
        ? `${new Date(session.start_time).toLocaleTimeString()} - ${new Date(session.end_time).toLocaleTimeString()}`
        : 'Time not set',
      amount: session.price || 0,
      materials: session.materials || [],
      rating: session.Rating_N_Review_Session?.[0]?.rating || null,
      review: session.Rating_N_Review_Session?.[0]?.review || null,
      status: session.status,
      meeting_urls: session.meeting_urls || [],
      refunded: false, // TODO: Add refund status to backend
      reason: null // TODO: Add cancellation reason to backend
    };
  };

  const toggleEditMode = (section: keyof typeof editMode) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfileChange = (field: keyof LocalTutorProfile, value: any) => {
    setTutorProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Qualification handlers
  const handleQualificationChange = (qualification: string) => {
    const isSelected = tutorProfile.qualifications.includes(qualification);
    let newQualifications;
    
    if (isSelected) {
      // Remove qualification
      newQualifications = tutorProfile.qualifications.filter(q => q !== qualification);
    } else {
      // Add qualification
      newQualifications = [...tutorProfile.qualifications, qualification];
    }
    
    setTutorProfile(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  const handleAddCustomQualification = () => {
    if (customQualification.trim() && !tutorProfile.qualifications.includes(customQualification.trim())) {
      const newQualifications = [...tutorProfile.qualifications, customQualification.trim()];
      setTutorProfile(prev => ({
        ...prev,
        qualifications: newQualifications
      }));
      setCustomQualification('');
    }
  };

  const handleRemoveQualification = (qualification: string) => {
    const newQualifications = tutorProfile.qualifications.filter(q => q !== qualification);
    setTutorProfile(prev => ({
      ...prev,
      qualifications: newQualifications
    }));
  };

  const getFilteredQualifications = () => {
    if (!qualificationFilter.trim()) return standardQualifications;
    return standardQualifications.filter(qualification => 
      qualification.toLowerCase().includes(qualificationFilter.toLowerCase())
    );
  };

  // Subject and Title handlers
  const handleSubjectChange = (subjectName: string) => {
    const isSelected = tutorProfile.subjects.includes(subjectName);
    let newSubjects;
    let newTitlesGrouped = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
    
    if (isSelected) {
      // Remove subject and its titles
      newSubjects = tutorProfile.subjects.filter(name => name !== subjectName);
      // Remove titles associated with this subject
      delete newTitlesGrouped[subjectName];
    } else {
      // Add subject
      newSubjects = [...tutorProfile.subjects, subjectName];
      // Initialize empty titles array for new subject
      newTitlesGrouped[subjectName] = [];
    }
    
    // Update titles array to be flat array of all selected titles
    const flatTitles = Object.values(newTitlesGrouped).flat();
    
    setTutorProfile(prev => ({
      ...prev,
      subjects: newSubjects,
      titles: flatTitles,
      titlesGroupedBySubject: newTitlesGrouped
    }));
    
    // Load titles for the new subject selection (for dropdown options)
    loadTitlesForSubjects(newSubjects);
  };

  const handleTitleChange = (titleName: string, subjectName: string) => {
    const currentGroupedTitles = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
    
    if (!currentGroupedTitles[subjectName]) {
      currentGroupedTitles[subjectName] = [];
    }
    
    const isSelected = currentGroupedTitles[subjectName].includes(titleName);
    
    if (isSelected) {
      // Remove title from subject
      currentGroupedTitles[subjectName] = currentGroupedTitles[subjectName].filter(name => name !== titleName);
    } else {
      // Add title to subject
      currentGroupedTitles[subjectName] = [...currentGroupedTitles[subjectName], titleName];
    }
    
    // Update titles array to be flat array of all selected titles
    const flatTitles = Object.values(currentGroupedTitles).flat();
    
    setTutorProfile(prev => ({
      ...prev,
      titles: flatTitles,
      titlesGroupedBySubject: currentGroupedTitles
    }));
  };

  // Handle adding custom subject
  const handleAddCustomSubject = async () => {
    if (customSubject.trim() && !availableSubjects.some(s => s.name.toLowerCase() === customSubject.trim().toLowerCase())) {
      try {
        const newSubject = await tutorService.createSubject(customSubject.trim());
        setAvailableSubjects(prev => [...prev, newSubject]);
        
        // Automatically select the new subject (use name instead of ID)
        const newSubjects = [...tutorProfile.subjects, newSubject.name];
        const newTitlesGrouped = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
        newTitlesGrouped[newSubject.name] = [];
        
        setTutorProfile(prev => ({
          ...prev,
          subjects: newSubjects,
          titlesGroupedBySubject: newTitlesGrouped
        }));
        
        setCustomSubject('');
        
        // Load titles for the new selection
        loadTitlesForSubjects(newSubjects);
        
        // Show success message
        alert(`✅ Subject "${newSubject.name}" created successfully and added to your profile!`);
      } catch (error: any) {
        console.error('Failed to create subject:', error);
        alert(`❌ Failed to create subject: ${error.message || 'Unknown error'}`);
      }
    } else if (customSubject.trim() && availableSubjects.some(s => s.name.toLowerCase() === customSubject.trim().toLowerCase())) {
      alert('⚠️ This subject already exists. Please choose a different name.');
    }
  };

  // Handle adding custom title
  const handleAddCustomTitle = async () => {
    if (customTitle.trim() && selectedSubjectForCustomTitle && 
        !availableTitles.some(t => t.name.toLowerCase() === customTitle.trim().toLowerCase() && t.sub_id === selectedSubjectForCustomTitle)) {
      try {
        const newTitle = await tutorService.createTitle(customTitle.trim(), selectedSubjectForCustomTitle);
        setAvailableTitles(prev => [...prev, newTitle]);
        
        // Find the subject name for the selected subject ID
        const subjectRecord = availableSubjects.find(s => s.sub_id === selectedSubjectForCustomTitle);
        if (subjectRecord) {
          // Automatically select the new title (use name instead of ID)
          const currentGroupedTitles = tutorProfile.titlesGroupedBySubject ? { ...tutorProfile.titlesGroupedBySubject } : {};
          if (!currentGroupedTitles[subjectRecord.name]) {
            currentGroupedTitles[subjectRecord.name] = [];
          }
          currentGroupedTitles[subjectRecord.name] = [...currentGroupedTitles[subjectRecord.name], newTitle.name];
          
          // Update flat titles array
          const flatTitles = Object.values(currentGroupedTitles).flat();
          
          setTutorProfile(prev => ({
            ...prev,
            titles: flatTitles,
            titlesGroupedBySubject: currentGroupedTitles
          }));
          
          // Show success message
          alert(`✅ Title "${newTitle.name}" created successfully and added to "${subjectRecord.name}"!`);
        }
        
        setCustomTitle('');
        setSelectedSubjectForCustomTitle('');
      } catch (error: any) {
        console.error('Failed to create title:', error);
        alert(`❌ Failed to create title: ${error.message || 'Unknown error'}`);
      }
    } else if (customTitle.trim() && selectedSubjectForCustomTitle && 
               availableTitles.some(t => t.name.toLowerCase() === customTitle.trim().toLowerCase() && t.sub_id === selectedSubjectForCustomTitle)) {
      alert('⚠️ This title already exists for the selected subject. Please choose a different name.');
    } else if (!selectedSubjectForCustomTitle) {
      alert('⚠️ Please select a subject first.');
    }
  };

  // Filter functions
  const getFilteredSubjects = () => {
    if (!subjectFilter.trim()) return availableSubjects;
    return availableSubjects.filter(subject => 
      subject.name.toLowerCase().includes(subjectFilter.toLowerCase())
    );
  };

  const getFilteredTitles = () => {
    // First filter titles to only include those from selected subjects
    const selectedSubjectIds = tutorProfile.subjects.map(subjectName => {
      const subject = availableSubjects.find(s => s.name === subjectName);
      return subject?.sub_id;
    }).filter(Boolean) as string[];
    
    const titlesFromSelectedSubjects = availableTitles.filter(title => 
      selectedSubjectIds.includes(title.sub_id)
    );
    
    // Then filter by search text if provided
    if (!titleFilter.trim()) return titlesFromSelectedSubjects;
    return titlesFromSelectedSubjects.filter(title => 
      title.name.toLowerCase().includes(titleFilter.toLowerCase())
    );
  };

  // Helper function to get subject name by ID
  const getSubjectNameById = (subjectId: string): string => {
    const subject = availableSubjects.find(s => s.sub_id === subjectId);
    return subject ? subject.name : subjectId;
  };

  // Helper function to get title name by ID
  const getTitleNameById = (titleId: string): string => {
    const title = availableTitles.find(t => t.title_id === titleId);
    return title ? title.name : titleId;
  };

  // Save qualifications to backend
  const handleSaveQualifications = async () => {
    if (currentUser?.uid) {
      try {
        await tutorService.updateTutorQualifications(currentUser.uid, tutorProfile.qualifications);
        // Turn off edit mode after successful save
        toggleEditMode('qualifications');
        alert('Qualifications updated successfully!');
      } catch (error) {
        console.error('Error updating qualifications:', error);
        alert('Failed to update qualifications. Please try again.');
      }
    }
  };

  // Save subjects and titles to backend
  const handleSaveSubjectsAndTitles = async () => {
    if (currentUser?.uid) {
      try {
        // Convert the current subjects and titles to grouped format
        const subjectsWithTitles: { [subjectName: string]: string[] } = {};
        
        // Initialize empty arrays for each subject
        tutorProfile.subjects.forEach(subjectName => {
          subjectsWithTitles[subjectName] = [];
        });
        
        // Use grouped titles if available, otherwise try to group titles by subjects
        if (tutorProfile.titlesGroupedBySubject) {
          Object.assign(subjectsWithTitles, tutorProfile.titlesGroupedBySubject);
        } else {
          // Fallback: for each title, find its subject using availableTitles
          tutorProfile.titles.forEach(titleName => {
            const titleRecord = availableTitles.find(t => t.name === titleName);
            if (titleRecord) {
              const subjectRecord = availableSubjects.find(s => s.sub_id === titleRecord.sub_id);
              if (subjectRecord && subjectsWithTitles[subjectRecord.name]) {
                subjectsWithTitles[subjectRecord.name].push(titleName);
              }
            }
          });
        }
        
        await tutorService.updateTutorSubjectsAndTitles(currentUser.uid, subjectsWithTitles);
        // Turn off edit mode after successful save
        toggleEditMode('subjects');
        alert('Subjects and titles updated successfully!');
      } catch (error) {
        console.error('Error updating subjects and titles:', error);
        alert('Failed to update subjects and titles. Please try again.');
      }
    }
  };

  // Save hourly rate to backend
  const handleSaveHourlyRate = async () => {
    if (currentUser?.uid) {
      try {
        await tutorService.updateTutorHourlyRate(currentUser.uid, tutorProfile.hourlyRate);
        // Turn off edit mode after successful save
        toggleEditMode('pricing');
        alert('Hourly rate updated successfully!');
      } catch (error) {
        console.error('Error updating hourly rate:', error);
        alert('Failed to update hourly rate. Please try again.');
      }
    }
  };

  // Save personal information to backend
  const handleSavePersonalInfo = async () => {
    if (currentUser?.uid) {
      try {
        const personalData = {
          name: tutorProfile.name,
          description: tutorProfile.description,
          phone_number: tutorProfile.phone,
          heading: tutorProfile.heading || null
        };
        
        await tutorService.updateTutorPersonalInfo(currentUser.uid, personalData);
        // Turn off edit mode after successful save
        toggleEditMode('basic');
        alert('Personal information updated successfully!');
      } catch (error) {
        console.error('Error updating personal information:', error);
        alert('Failed to update personal information. Please try again.');
      }
    }
  };

  // Notification handlers
  const handleMarkAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleDeleteNotification = (notificationId: number) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Image handling functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = async () => {
    if (selectedImage && currentUser?.uid) {
      try {
        // Show loading state
        const saveButton = document.querySelector('[data-save-button]') as HTMLButtonElement;
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.textContent = 'Uploading...';
        }

        // Upload image to backend
        const result = await tutorService.uploadUserPhoto(currentUser.uid, selectedImage);
        
        // Update the tutor profile with the new image URL from server
        setTutorProfile(prev => ({
          ...prev,
          photo_url: result.user.photo_url
        }));
        
        // Close modal and reset state
        setShowImageEditModal(false);
        setSelectedImage(null);
        setImagePreview(null);
        
        // Show success message
        alert('Profile image updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    } else if (!currentUser?.uid) {
      alert('User not authenticated. Please log in and try again.');
    } else {
      alert('No image selected.');
    }
  };

  const handleImageCancel = () => {
    setShowImageEditModal(false);
    setSelectedImage(null);
    setImagePreview(null);
  };


  const addMaterial = async (sessionId: string) => {
    if (newMaterial.trim() && currentUser?.uid) {
      try {
        await sessionService.addSessionMaterial(currentUser.uid, sessionId, newMaterial.trim());
        // Reload sessions to get updated data
        loadSessionsData();
        setNewMaterial('');
        setSelectedSessionId(null);
        alert('Material added successfully!');
      } catch (error) {
        console.error('Error adding material:', error);
        alert('Failed to add material. Please try again.');
      }
    }
  };

  const removeMaterial = async (sessionId: string, materialIndex: number, materialName: string) => {
    if (currentUser?.uid) {
      try {
        // Confirm before removing
        const confirmed = window.confirm(`Are you sure you want to remove "${materialName}"?`);
        
        if (confirmed) {
          await sessionService.removeSessionMaterial(currentUser.uid, sessionId, materialIndex);
          // Reload sessions to get updated data
          loadSessionsData();
          alert('Material removed successfully!');
        }
      } catch (error) {
        console.error('Error removing material:', error);
        alert('Failed to remove material. Please try again.');
      }
    }
  };

  const requestCancellation = async (sessionId: string) => {
    if (currentUser?.uid) {
      try {
        const reason = prompt('Please provide a reason for cancellation (optional):');
        const result = await sessionService.requestCancellation(currentUser.uid, sessionId, reason || undefined);
        if (result.success) {
          alert(result.message);
          // Reload sessions to get updated data
          loadSessionsData();
        } else {
          alert('Failed to cancel session: ' + result.message);
        }
      } catch (error) {
        console.error('Error cancelling session:', error);
        alert('Failed to cancel session. Please try again.');
      }
    }
  };

  const handleZoomMeeting = (sessionId: string, studentName: string, meetingUrls?: string[]) => {
    // Get the Zoom URL from meeting_urls[0] if available
    const zoomLink = meetingUrls && meetingUrls.length > 0 ? meetingUrls[0] : null;
    
    if (zoomLink) {
      // Confirm before opening the meeting
      const confirmed = window.confirm(
        `Join Zoom meeting with ${studentName}?\n\nThis will open the meeting in a new tab.`
      );
      
      if (confirmed) {
        // Open the actual Zoom meeting in a new tab
        window.open(zoomLink, '_blank');
      }
    } else {
      // Fallback if no meeting URL is available
      alert(
        `❌ No Zoom meeting URL found for this session with ${studentName}.\n\n` +
        `Possible reasons:\n` +
        `• The meeting hasn't been set up yet\n` +
        `• The session is scheduled for later\n` +
        `• Technical issue with meeting creation\n\n` +
        `Please contact the student or admin for assistance.`
      );
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'sessions', label: 'Sessions', icon: BookOpen },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const EditButton = ({ section, className = "" }: { section: keyof typeof editMode, className?: string }) => (
    <button
      onClick={() => {
        if (editMode[section] && section === 'basic') {
          // Save personal information when clicking save
          handleSavePersonalInfo();
        } else if (editMode[section] && section === 'qualifications') {
          // Save qualifications when clicking save
          handleSaveQualifications();
        } else if (editMode[section] && section === 'subjects') {
          // Save subjects and titles when clicking save
          handleSaveSubjectsAndTitles();
        } else if (editMode[section] && section === 'pricing') {
          // Save hourly rate when clicking save
          handleSaveHourlyRate();
        } else {
          toggleEditMode(section);
        }
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        editMode[section] 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      } ${className}`}
    >
      {editMode[section] ? (
        <>
          <Save size={16} />
          <span>Save</span>
        </>
      ) : (
        <>
          <Edit3 size={16} />
          <span>Edit</span>
        </>
      )}
    </button>
  );

  // Overview Dashboard Component
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile?.name || 'Tutor'}!</h1>
            <p className="text-blue-100 text-lg">Here's what's happening with your tutoring business today</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
            <div className="text-blue-200">
              {stats.upcomingSessions} sessions today
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600">
                ${EarningsService.formatCurrency(earningsData?.totalEarnings || stats.monthlyEarnings)}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Students</p>
              <p className="text-3xl font-bold text-blue-600">{stats.bookedSlots}</p>
              <p className="text-xs text-gray-500 mt-1">Currently enrolled</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Slots</p>
              <p className="text-3xl font-bold text-orange-600">{stats.availableSlots}</p>
              <p className="text-xs text-gray-500 mt-1">Open for booking</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-3xl font-bold text-yellow-600">{tutorProfile.rating}</p>
              <p className="text-xs text-gray-500 mt-1">Average rating</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="mr-2 text-blue-600" size={20} />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Response Rate</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${stats.responseRate}%`}}
                  ></div>
                </div>
                <span className="font-semibold text-green-600">{stats.responseRate}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">On-Time Rate</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{width: `${stats.onTimeRate}%`}}
                  ></div>
                </div>
                <span className="font-semibold text-blue-600">{stats.onTimeRate}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Session Completion</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{width: '92%'}}
                  ></div>
                </div>
                <span className="font-semibold text-purple-600">92%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-green-600" size={20} />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={16} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Session completed with John D.</p>
                <p className="text-xs text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <CalendarIcon className="text-blue-600" size={16} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">New booking from Sarah M.</p>
                <p className="text-xs text-gray-600">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Star className="text-yellow-600" size={16} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Received 5-star review</p>
                <p className="text-xs text-gray-600">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Settings className="mr-2 text-gray-600" size={20} />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveTab('schedule')}
            className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-blue-600 mb-1 flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Manage Schedule
                </div>
                <div className="text-sm text-gray-600">Add or update availability</div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600" size={16} />
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className="p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-green-600 mb-1 flex items-center">
                  <User className="mr-2" size={16} />
                  Update Profile
                </div>
                <div className="text-sm text-gray-600">Edit your information</div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-green-600" size={16} />
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('earnings')}
            className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-purple-600 mb-1 flex items-center">
                  <BarChart3 className="mr-2" size={16} />
                  View Analytics
                </div>
                <div className="text-sm text-gray-600">Check your performance</div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-purple-600" size={16} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <User className="mr-3 text-blue-600" size={24} />
              Personal Information
            </h2>
            <p className="text-gray-600 mt-1">Manage your basic profile details</p>
          </div>
          <EditButton section="basic" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {editMode.basic ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={tutorProfile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Heading</label>
                  <input
                    type="text"
                    value={tutorProfile.heading || ''}
                    onChange={(e) => handleProfileChange('heading', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Brief title or specialization..."
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <User className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-500">Full Name</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{tutorProfile.name}</p>
                </div>
                {tutorProfile.heading && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-5 h-5 text-gray-500 mr-2" />
                      <span className="text-sm font-semibold text-gray-500">Heading</span>
                    </div>
                    <p className="text-lg font-medium text-gray-800">{tutorProfile.heading}</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="space-y-6">
            {editMode.basic ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={tutorProfile.description}
                    onChange={(e) => handleProfileChange('description', e.target.value)}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Tell students about yourself, your teaching style, and experience..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={tutorProfile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-500">Description</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{tutorProfile.description}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Phone className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-sm font-semibold text-gray-500">Phone Number</span>
                  </div>
                  <p className="text-lg font-medium text-gray-800">{tutorProfile.phone}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Educational Qualifications */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <GraduationCap className="mr-3 text-green-600" size={24} />
              Educational Qualifications
            </h2>
            <p className="text-gray-600 mt-1">Your academic credentials and certifications</p>
          </div>
          <EditButton section="qualifications" />
        </div>
        
        {editMode.qualifications ? (
          <div className="space-y-6">
            {/* Selected Qualifications Display */}
            {tutorProfile.qualifications.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Selected Qualifications:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tutorProfile.qualifications.map((qualification, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                    >
                      {qualification}
                      <button
                        type="button"
                        onClick={() => handleRemoveQualification(qualification)}
                        className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-600 hover:text-green-800 hover:bg-green-200"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Standard Qualifications Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Choose from Standard Qualifications
              </label>
              <div className="border border-gray-300 rounded-xl bg-white">
                {/* Search Filter */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={qualificationFilter}
                      onChange={(e) => setQualificationFilter(e.target.value)}
                      className="pl-9 block w-full py-2 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                      placeholder="Search qualifications..."
                    />
                  </div>
                </div>
                
                {/* Qualifications List */}
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="p-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        {qualificationFilter ? `Results for "${qualificationFilter}"` : 'Available Qualifications'}
                      </p>
                    </div>
                    {getFilteredQualifications().length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm text-center">
                        No qualifications found for "{qualificationFilter}"
                      </div>
                    ) : (
                      getFilteredQualifications().map((qualification, index) => (
                        <label
                          key={index}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={tutorProfile.qualifications.includes(qualification)}
                            onChange={() => handleQualificationChange(qualification)}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">{qualification}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Add Custom Qualification */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Custom Qualification
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={customQualification}
                    onChange={(e) => setCustomQualification(e.target.value)}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                    placeholder="e.g., MSc Data Science, Professional Certificate..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomQualification();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomQualification}
                  disabled={!customQualification.trim()}
                  className="px-4 py-3 border border-green-300 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Search and select from standard qualifications or add your own custom qualification
              </p>
            </div>
          </div>
        ) : (
          <div>
            {tutorProfile.qualifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutorProfile.qualifications.map((qualification, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-800">{qualification}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Qualifications Added</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Click Edit to add your educational qualifications and certifications.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subjects and Titles */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <BookOpen className="mr-3 text-blue-600" size={24} />
              Subjects & Titles
            </h2>
            <p className="text-gray-600 mt-1">Your teaching subjects and areas of expertise</p>
          </div>
          <EditButton section="subjects" />
        </div>
        
        {editMode.subjects ? (
          <div className="space-y-6">
            {/* Subjects Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subjects <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-xl bg-white">
                {/* Search Filter */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="pl-9 block w-full py-2 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                      placeholder="Search subjects..."
                    />
                  </div>
                </div>
                
                {/* Subjects List */}
                <div className="max-h-64 overflow-y-auto">
                  {loadingSubjects ? (
                    <div className="p-4 text-gray-500 text-sm text-center">Loading subjects...</div>
                  ) : getFilteredSubjects().length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm text-center">
                      {subjectFilter ? `No subjects found for "${subjectFilter}"` : 'No subjects available'}
                    </div>
                  ) : (
                    <div className="p-2">
                      {getFilteredSubjects().map((subject) => (
                        <label
                          key={subject.sub_id}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={tutorProfile.subjects.includes(subject.name)}
                            onChange={() => handleSubjectChange(subject.name)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-sm text-gray-700">{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {tutorProfile.subjects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tutorProfile.subjects.map((subjectName) => {
                    return (
                      <span
                        key={subjectName}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {subjectName}
                        <button
                          type="button"
                          onClick={() => handleSubjectChange(subjectName)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Custom Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Add Custom Subject
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    placeholder="e.g., Data Science, Robotics..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSubject();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomSubject}
                  disabled={!customSubject.trim()}
                  className="px-4 py-3 border border-blue-300 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                <strong>📚 Creating Custom Subjects:</strong> Can't find your subject? Add it here and it will be saved to the database permanently and made available for other tutors too!
              </p>
            </div>

            {/* Titles Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titles/Expertise <span className="text-red-500">*</span>
              </label>
              {tutorProfile.subjects.length === 0 ? (
                <div className="border border-gray-300 rounded-xl bg-gray-50 p-4 text-gray-500 text-sm text-center">
                  Please select subjects first to see available titles
                </div>
              ) : (
                <div className="border border-gray-300 rounded-xl bg-white">
                  {/* Search Filter */}
                  <div className="p-3 border-b border-gray-200">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={titleFilter}
                        onChange={(e) => setTitleFilter(e.target.value)}
                        className="pl-9 block w-full py-2 border-0 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
                        placeholder="Search titles..."
                      />
                    </div>
                  </div>
                  
                  {/* Titles List */}
                  <div className="max-h-64 overflow-y-auto">
                    {loadingTitles ? (
                      <div className="p-4 text-gray-500 text-sm text-center">Loading titles...</div>
                    ) : getFilteredTitles().length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm text-center">
                        {titleFilter ? `No titles found for "${titleFilter}"` : 'No titles available for selected subjects'}
                      </div>
                    ) : (
                      <div className="p-2">
                        {getFilteredTitles().map((title) => {
                          const subjectRecord = availableSubjects.find(s => s.sub_id === title.sub_id);
                          const subjectName = subjectRecord?.name || '';
                          const isSelected = tutorProfile.titlesGroupedBySubject?.[subjectName]?.includes(title.name) || false;
                          
                          return (
                            <label
                              key={title.title_id}
                              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTitleChange(title.name, subjectName)}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <span className="ml-3 text-sm text-gray-700">{title.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tutorProfile.titles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tutorProfile.titles.map((titleName) => {
                    // Find the title record to get subject information
                    const titleRecord = availableTitles.find(t => t.name === titleName);
                    const subjectRecord = titleRecord ? availableSubjects.find(s => s.sub_id === titleRecord.sub_id) : null;
                    const subjectName = subjectRecord?.name || '';
                    
                    return titleRecord ? (
                      <span
                        key={titleName}
                        className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200"
                      >
                        {titleName}
                        <button
                          type="button"
                          onClick={() => handleTitleChange(titleName, subjectName)}
                          className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-600 hover:text-green-800 hover:bg-green-200"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Add Custom Title */}
            {tutorProfile.subjects.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Add Custom Title
                </label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <select
                        value={selectedSubjectForCustomTitle}
                        onChange={(e) => setSelectedSubjectForCustomTitle(e.target.value)}
                        className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                      >
                        <option value="">Select subject for new title</option>
                        {tutorProfile.subjects.map(subjectName => {
                          const subject = availableSubjects.find(s => s.name === subjectName);
                          return subject ? (
                            <option key={subject.sub_id} value={subject.sub_id}>
                              {subject.name}
                            </option>
                          ) : null;
                        })}
                      </select>
                    </div>
                  </div>
                  {selectedSubjectForCustomTitle && (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          className="block w-full py-3 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm"
                          placeholder="e.g., Machine Learning, Advanced Calculus..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomTitle();
                            }
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomTitle}
                        disabled={!customTitle.trim()}
                        className="px-4 py-3 border border-green-300 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  <strong>🎯 Creating Custom Titles:</strong> Can't find your area of expertise? First select a subject, then add your custom title. It will be saved to the database and made available for other tutors too!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {tutorProfile.subjects.length > 0 ? (
              <div className="space-y-6">
                {/* Show loading state if subjects/titles are still loading */}
                {(loadingSubjects || loadingTitles) && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                      <p className="text-sm text-blue-700">Loading subjects and titles...</p>
                    </div>
                  </div>
                )}
                
                {/* Display subjects with their titles using names */}
                {tutorProfile.subjects.map((subjectName) => {
                  // Get titles for this subject from grouped titles
                  const subjectTitles = tutorProfile.titlesGroupedBySubject?.[subjectName] || [];
                  
                  return (
                    <div key={subjectName} className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center mb-4">
                        <BookOpen className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
                        <h3 className="font-semibold text-xl text-gray-800">
                          {subjectName}
                        </h3>
                      </div>
                      {subjectTitles.length > 0 ? (

                        <div className="flex flex-wrap gap-2">
                          {subjectTitles.map((titleName) => (
                            <span key={titleName} className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200 shadow-sm">
                              {titleName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 italic">No specific titles selected for this subject</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Subjects Added</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Click Edit to add your teaching subjects and areas of expertise.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Hourly Rate</h2>
          <EditButton section="pricing" />
        </div>
        
        {editMode.pricing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate (Maximum: $300)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-800">$</span>
              <input
                type="number"
                max="300"
                value={tutorProfile.hourlyRate}
                onChange={(e) => handleProfileChange('hourlyRate', Math.min(300, parseInt(e.target.value)))}
                className="text-2xl font-bold p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
              <span className="text-gray-600">per hour</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Admin has set a maximum limit of $300 per hour
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">${tutorProfile.hourlyRate}</div>
            <div className="text-gray-600">per hour</div>
            <div className="flex items-center justify-center mt-2">
              <span className="text-yellow-500 text-xl">★★★★★</span>
              <span className="ml-2 text-gray-600">{tutorProfile.rating}/5 ({tutorProfile.totalReviews} reviews)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSessions = () => {
    return (
      <div className="space-y-6">
        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {sessions.upcoming.map((sessionData) => {
              const session = formatSession(sessionData);
              
              return (
                <div key={session.id} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                      {session.subject} - {session.title}
                      {session.meeting_urls && session.meeting_urls.length > 0 && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center">
                          <Video size={12} className="mr-1" />
                          Meeting Ready
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-600">Student: {session.studentName}</p>
                    <p className="text-gray-600">{session.date} at {session.time}</p>
                    <p className="text-green-600 font-medium">${session.amount}</p>
                    {session.meeting_urls && session.meeting_urls.length > 0 && (
                      <p className="text-blue-600 text-sm flex items-center mt-1">
                        <ExternalLink size={14} className="mr-1" />
                        Zoom meeting available
                      </p>
                    )}
                    </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleZoomMeeting(session.id, session.studentName, session.meeting_urls)}
                      className="bg-blue-500 text-white px-3 py-2 rounded text-sm flex items-center space-x-1 hover:bg-blue-600 transition-colors"
                      title="Start Zoom Meeting"
                    >
                      <Video size={16} />
                      <span>Zoom</span>
                    </button>
                    <button
                      onClick={() => requestCancellation(session.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      title="Cancel session"
                    >
                      Cancel
                    </button>
                    </div>
                  </div>
                  
                  {/* Meeting Information Section */}
                  {session.meeting_urls && session.meeting_urls.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Meeting Information
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-blue-700">
                          Zoom meeting is ready for this session
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(session.meeting_urls![0]);
                            alert('Meeting URL copied to clipboard!');
                          }}
                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                          title="Copy meeting URL"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Materials Section */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Session Materials</h4>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {session.materials?.map((material, index) => (
                        <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-2 group">
                          <span>{material}</span>
                          <button
                            onClick={() => removeMaterial(session.id, index, material)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            title="Remove material"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {selectedSessionId === session.id ? (
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                          placeholder="Add material"
                          className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
                        />
                        <button
                          onClick={() => addMaterial(session.id)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setSelectedSessionId(null)}
                          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSessionId(session.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Add Material
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Previous Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Previous Sessions</h2>
          <div className="space-y-4">
            {sessions.previous.map((sessionData) => {
              const session = formatSession(sessionData);
              return (
                <div key={session.id} className="border border-gray-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {session.subject} - {session.title}
                      </h3>
                      <p className="text-gray-600">Student: {session.studentName}</p>
                      <p className="text-gray-600">{session.date} at {session.time}</p>
                      <p className="text-green-600 font-medium">${session.amount}</p>
                    </div>
                    <div className="text-right">
                      {session.rating && (
                        <div className="flex items-center justify-end mb-1">
                          <span className="text-yellow-500">{'★'.repeat(session.rating)}</span>
                          <span className="text-gray-400">{'★'.repeat(5 - session.rating)}</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                  </div>
                  {session.review && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-gray-700 text-sm">"{session.review}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cancelled Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cancelled Sessions</h2>
          <div className="space-y-4">
            {sessions.cancelled.map((sessionData) => {
              const session = formatSession(sessionData);
              return (
                <div key={session.id} className="border border-red-200 p-4 rounded-lg bg-red-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {session.subject} - {session.title}
                      </h3>
                      <p className="text-gray-600">Student: {session.studentName}</p>
                      <p className="text-gray-600">{session.date} at {session.time}</p>
                      <p className="text-red-600 font-medium">
                        ${session.amount} {session.refunded ? '(Refunded)' : '(Pending Refund)'}
                      </p>
                    </div>
                    <span className="text-sm text-red-600 font-medium">Cancelled</span>
                  </div>
                  {session.reason && (
                    <div className="mt-3">
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Reason:</span> {session.reason}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderEarnings = () => (
    <div className="space-y-6">
      {earningsLoading && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Loading earnings data...</p>
          </div>
        </div>
      )}

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
              <p className="text-3xl font-bold text-green-600">
                ${EarningsService.formatCurrency(earningsData?.totalEarnings || tutorProfile.totalEarnings)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Gross revenue</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Admin Commission</h3>
              <p className="text-3xl font-bold text-red-600">
                ${EarningsService.formatCurrency(earningsData?.adminCommission || tutorProfile.adminCommission)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Platform fee</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">Net Earnings</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${EarningsService.formatCurrency(earningsData?.netEarnings || tutorProfile.profit)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Your profit</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600">This Month</h3>
              <p className="text-3xl font-bold text-purple-600">
                ${EarningsService.formatCurrency(earningsData?.thisMonthEarnings || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Current month</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BarChart3 className="mr-2 text-green-600" size={20} />
            Earnings Breakdown
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Sessions Completed
              </span>
              <span className="font-semibold">{earningsData?.completedSessions || sessions.previous.length}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                Average Session Value
              </span>
              <span className="font-semibold text-green-600">
                ${EarningsService.formatCurrency(earningsData?.averageSessionValue || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-700 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-red-600" />
                Platform Commission
              </span>
              <span className="font-semibold text-red-600">
                -${EarningsService.formatCurrency(earningsData?.adminCommission || tutorProfile.adminCommission)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 text-lg font-bold border-t border-gray-300 pt-4">
              <span className="text-gray-800 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Net Earnings
              </span>
              <span className="text-blue-600">
                ${EarningsService.formatCurrency(earningsData?.netEarnings || tutorProfile.profit)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Clock className="mr-2 text-blue-600" size={20} />
            Recent Performance
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">This Week</span>
              <span className="font-semibold text-blue-600">
                ${EarningsService.formatCurrency(earningsData?.thisWeekEarnings || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">Today</span>
              <span className="font-semibold text-green-600">
                ${EarningsService.formatCurrency(earningsData?.todayEarnings || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">Pending Payments</span>
              <span className="font-semibold text-orange-600">
                {earningsData?.pendingPayments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700">Paid Sessions</span>
              <span className="font-semibold text-green-600">
                {earningsData?.paidPayments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="mr-2 text-purple-600" size={20} />
          Recent Payments
        </h2>
        {recentPayments.length > 0 ? (
          <div className="space-y-3">
            {recentPayments.slice(0, 8).map((payment) => (
              <div key={payment.session_id} className="flex justify-between items-center py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors rounded-lg px-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{payment.student_name}</p>
                  <p className="text-sm text-gray-600">{payment.subject} - {new Date(payment.date).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">Status: {payment.payment_status}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${EarningsService.formatCurrency(payment.amount)}</p>
                  <p className="text-sm text-gray-600">Commission: ${EarningsService.formatCurrency(payment.commission)}</p>
                  <p className="text-sm font-medium text-blue-600">Net: ${EarningsService.formatCurrency(payment.net_amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-400">No payments yet</p>
            <p className="text-sm text-gray-400">Payments will appear here once you complete sessions</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-6">
      {reviewsLoading && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Loading reviews data...</p>
          </div>
        </div>
      )}

      {/* Rating Overview */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Star className="mr-3 text-yellow-500" size={24} />
          Reviews & Ratings Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Average Rating */}
          <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
            <div className="text-5xl font-bold text-yellow-600 mb-3">
              {reviewStats?.averageRating?.toFixed(1) || tutorProfile.rating}
            </div>
            <div className="flex justify-center items-center mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={`${
                      star <= (reviewStats?.averageRating || tutorProfile.rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 font-medium">
              Based on {reviewStats?.totalReviews || tutorProfile.totalReviews} reviews
            </p>
          </div>

          {/* Response Rate */}
          <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="text-5xl font-bold text-blue-600 mb-3">
              {reviewStats?.responseRate?.toFixed(0) || 0}%
            </div>
            <div className="flex justify-center mb-3">
              <MessageSquare className="text-blue-500" size={24} />
            </div>
            <p className="text-gray-700 font-medium">Response Rate</p>
          </div>

          {/* Monthly Reviews */}
          <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <div className="text-5xl font-bold text-green-600 mb-3">
              {reviewStats?.recentReviews?.length || 0}
            </div>
            <div className="flex justify-center mb-3">
              <TrendingUp className="text-green-500" size={24} />
            </div>
            <p className="text-gray-700 font-medium">Recent Reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        {reviewStats && (
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewStats.ratingDistribution[stars as keyof typeof reviewStats.ratingDistribution] || 0;
                const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center space-x-4">
                    <div className="flex items-center w-12">
                      <span className="text-sm font-medium text-gray-600">{stars}</span>
                      <Star size={14} className="text-yellow-500 ml-1" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300" 
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">{count}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">{percentage.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Subject Ratings */}
      {reviewStats?.subjectRatings && Object.keys(reviewStats.subjectRatings).length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <BookOpen className="mr-2 text-blue-600" size={20} />
            Subject-wise Ratings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reviewStats.subjectRatings).map(([subject, data]) => (
              <div key={subject} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2">{subject}</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    <span className="font-bold text-lg">{data.average.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-600">({data.count} reviews)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Reviews */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <MessageSquare className="mr-2 text-purple-600" size={20} />
          Recent Reviews
        </h3>
        {reviewsData.length > 0 ? (
          <div className="space-y-4">
            {reviewsData.slice(0, 10).map((review) => (
              <div key={review.review_id} className="border border-gray-200 p-6 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.student_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-800">{review.student_name}</p>
                      <p className="text-sm text-gray-600 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        {review.subject}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {ReviewsService.formatReviewDate(review.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={`${
                            star <= review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {review.isVerified && (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
                {review.review && (
                  <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-700 italic">"{review.review}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Star className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No Reviews Yet</h3>
            <p className="text-sm text-gray-400">
              Reviews from students will appear here after completed sessions
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const navigate = useNavigate();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderProfile();
      case 'schedule':
        navigate('/manageSchedule');
        return null; 
      case 'sessions':
        return renderSessions();
      case 'earnings':
        return renderEarnings();
      case 'reviews':
        return renderReviews();
      case 'analytics':
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };


  // Add Analytics Component
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="mr-3 text-purple-600" size={24} />
          Performance Analytics
        </h2>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">{stats.monthlyEarnings}</div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
            <div className="text-xs text-green-600 mt-1">↗ +12% from last month</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">{stats.completedSessions}</div>
            <div className="text-sm text-gray-600">Sessions Completed</div>
            <div className="text-xs text-blue-600 mt-1">↗ +8% from last month</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 mb-2">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
            <div className="text-xs text-yellow-600 mt-1">→ Same as last month</div>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">{stats.responseRate}%</div>
            <div className="text-sm text-gray-600">Response Rate</div>
            <div className="text-xs text-purple-600 mt-1">↗ +3% from last month</div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                <p>Earnings chart will be displayed here</p>
              </div>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Distribution</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart size={48} className="mx-auto mb-2 opacity-50" />
                <p>Session distribution chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative group">
                <img 
                  src={tutorProfile.photo_url || '/default-profile.png'} 
                  alt={tutorProfile.name}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                
                {/* Image Edit Button */}
                <button
                  onClick={() => setShowImageEditModal(true)}
                  className="absolute inset-0 w-20 h-20 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{tutorProfile.name}</h1>
                <p className="text-blue-100 text-lg mb-2">Individual Tutor</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-300 mr-1" />
                    <span className="font-semibold">{tutorProfile.rating}</span>
                    <span className="text-blue-200 ml-1">({tutorProfile.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-300 mr-1" />
                    <span className="font-semibold">${tutorProfile.hourlyRate}/hour</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-2">
              <div className="flex items-center space-x-4">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onDeleteNotification={handleDeleteNotification}
                  buttonClassName="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center relative"
                  iconColor="text-white"
                />
                {/* <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button> */}
              </div>
              <div className="text-sm text-blue-200">
                Last login: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-0 overflow-x-auto">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 py-4 px-6 border-b-2 whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-700">Loading Dashboard...</h3>
              <p className="text-gray-500">Please wait while we fetch your data</p>
            </div>
          </div>
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Image Edit Modal */}
      {showImageEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={handleImageCancel}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Camera className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">Update Profile Image</h3>
              </div>
              <button
                onClick={handleImageCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {/* Current Image */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={imagePreview || tutorProfile.photo_url || '/default-profile.png'}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover mx-auto"
                  />
                  {imagePreview && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  {imagePreview ? 'New image selected' : 'Current profile image'}
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose New Image
                  </label>
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Supported formats: JPG, PNG, GIF. Maximum size: 5MB
                  </p>
                </div>

                {selectedImage && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                      <Upload className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800 font-medium">
                        {selectedImage.name}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Size: {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <Camera className="w-4 h-4 inline mr-1" />
                Update your profile image
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleImageCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImageSave}
                  disabled={!selectedImage || !imagePreview}
                  data-save-button
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    selectedImage && imagePreview
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Update Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorDashboard;
