import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  BookOpen, 
  Users, 
  Clock, 
  ArrowLeft,
  MessageCircle,
  Award,
  CheckCircle,
  Heart,
  Share2,
  Bookmark,
  Flag
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getIndividualTutorById, getReviewsByIndividualTutorId } from '../../api/Student';

interface Review {
  id: string;
  studentName: string;
  studentImageUrl: string; // <-- new field for student image URL
  rating: number;
  comment: string;
  date: string;
  subject: string;
}

interface TutorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location: string;
  profilePicture: string;
  subjects: string[];
  titles: string[];
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  type: 'Individual' | 'Mass';
  description: string;
  bio: string;
  verified: boolean;
  experience: string;
  education: string[];
  languages: string[];
  availability: string;
  totalStudents: number;
  completedSessions: number;
  responseTime: string;
  reviews: Review[];
  achievements: string[];
}

// Mock data for demonstration
const mockTutorProfile: TutorProfile = {
  id: '1',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@tutorly.com',
  phone: '+94 74 096 5618',
  location: 'New York, NY',
  profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b05b?w=150&h=150&fit=crop&crop=face',
  subjects: ['Mathematics', 'Physics', 'Chemistry'],
  titles: ['Algebra', 'Real Analysis', 'Calculus', 'Linear Algebra', 'Differential Equations'],
  rating: 4.9,
  reviewsCount: 127,
  hourlyRate: 65,
  type: 'Individual',
  description: 'Experienced mathematics and physics tutor with over 8 years of teaching experience.',
  bio: 'I am a passionate educator with a PhD in Mathematics and extensive experience in tutoring students from high school to university level. My teaching approach focuses on building strong foundational concepts while making learning engaging and fun.',
  verified: true,
  experience: '8+ years',
  education: [
    'PhD in Mathematics - MIT (2015)',
    'Masters in Physics - Stanford University (2012)',
    'Bachelor of Science in Mathematics - Harvard University (2010)'
  ],
  languages: ['English (Native)', 'Spanish (Fluent)', 'French (Intermediate)'],
  availability: 'Mon-Fri: 9 AM - 6 PM, Sat: 10 AM - 4 PM',
  totalStudents: 156,
  completedSessions: 1247,
  responseTime: '< 2 hours',
  achievements: [
    'Top Rated Tutor 2024',
    'Excellence in Teaching Award',
    'Student Choice Award',
    '1000+ Sessions Completed'
  ],
  reviews: [
    {
      id: '1',
      studentName: 'Alex Thompson',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 5,
      comment: 'Dr. Johnson is an amazing tutor! She helped me understand calculus concepts that I was struggling with for months. Her teaching style is clear and patient.',
      date: '2024-08-15',
      subject: 'Mathematics'
    },
    {
      id: '2',
      studentName: 'Maria Garcia',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/2.jpg',
      rating: 5,
      comment: 'Excellent physics tutor. She makes complex topics easy to understand and always provides practical examples.',
      date: '2024-08-10',
      subject: 'Physics'
    },
    {
      id: '3',
      studentName: 'John Davis',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: 4,
      comment: 'Very knowledgeable and professional. Helped me improve my grades significantly in chemistry.',
      date: '2024-07-28',
      subject: 'Chemistry'
    },
    {
      id: '4',
      studentName: 'Emma Wilson',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/4.jpg',
      rating: 5,
      comment: 'Dr. Johnson is patient and explains everything clearly. I highly recommend her for mathematics tutoring.',
      date: '2024-07-20',
      subject: 'Mathematics'
    },
    {
      id: '5',
      studentName: 'Michael Brown',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/5.jpg',
      rating: 5,
      comment: 'Outstanding tutor! Her teaching methods are innovative and effective. Saw improvement in just a few sessions.',
      date: '2024-07-15',
      subject: 'Physics'
    },
    {
      id: '6',
      studentName: 'Sophie Chen',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/6.jpg',
      rating: 4,
      comment: 'Great chemistry tutor. She helped me understand organic chemistry concepts that seemed impossible before.',
      date: '2024-07-10',
      subject: 'Chemistry'
    },
    {
      id: '7',
      studentName: 'David Rodriguez',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/7.jpg',
      rating: 5,
      comment: 'Excellent mathematics tutor! She made calculus and algebra much easier to understand. Highly recommended.',
      date: '2024-06-25',
      subject: 'Mathematics'
    },
    {
      id: '8',
      studentName: 'Lisa Anderson',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/8.jpg',
      rating: 5,
      comment: 'Dr. Johnson is fantastic! She is very patient and explains physics concepts in a way that makes sense.',
      date: '2024-06-20',
      subject: 'Physics'
    },
    {
      id: '9',
      studentName: 'James Miller',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/9.jpg',
      rating: 4,
      comment: 'Very helpful tutor. She helped me prepare for my chemistry exam and I got an A! Thank you so much.',
      date: '2024-06-15',
      subject: 'Chemistry'
    },
    {
      id: '10',
      studentName: 'Rachel Green',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
      rating: 5,
      comment: 'Amazing tutor! She makes learning fun and engaging. My understanding of mathematics has improved dramatically.',
      date: '2024-06-10',
      subject: 'Mathematics'
    },
    {
      id: '11',
      studentName: 'Kevin Wang',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
      rating: 5,
      comment: 'Excellent physics tutor. She uses real-world examples that make concepts stick. Highly recommend!',
      date: '2024-06-05',
      subject: 'Physics'
    },
    {
      id: '12',
      studentName: 'Amanda Foster',
      studentImageUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
      rating: 4,
      comment: 'Very knowledgeable and professional. She helped me understand complex chemistry problems step by step.',
      date: '2024-05-30',
      subject: 'Chemistry'
    }
  ]
};

export default function TutorProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchTutorData = async () => {
      if (!tutorId) {
        console.error('No tutor ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching tutor data for ID:', tutorId);
        
        // Fetch tutor data and reviews in parallel
        const [apiResponse, reviewsResponse] = await Promise.all([
          getIndividualTutorById(tutorId),
          getReviewsByIndividualTutorId(tutorId).catch(err => {
            console.warn('Failed to fetch reviews:', err);
            return []; // Return empty array if reviews fail
          })
        ]);
        
        console.log('API Response:', apiResponse);
        console.log('Reviews Response:', reviewsResponse);
        
        // Transform reviews data
        const transformedReviews: Review[] = Array.isArray(reviewsResponse) 
          ? reviewsResponse.map((review: any, index: number) => ({
              id: review.review_id || `review_${index}`,
              studentName: review.Student?.User?.name || review.Student?.name || 'Anonymous Student',
              studentImageUrl: review.Student?.User?.photo_url || 'https://via.placeholder.com/50?text=No+Image',
              rating: Number(review.rating) || 0,
              comment: review.review || review.comment || 'No comment provided',
              date: review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              subject: review.Session?.Individual_Tutor?.Course?.course_name || 'General'
            }))
          : [];
        
        // Map the API response to our TutorProfile interface
        const mappedTutor: TutorProfile = {
          id: apiResponse.i_tutor_id,
          name: apiResponse.User?.name || 'Unknown Tutor',
          email: apiResponse.User?.email || 'No email provided',
          phone: apiResponse.phone_number || undefined,
          location: apiResponse.location || 'Location not specified',
          profilePicture: apiResponse.User?.photo_url || 'https://via.placeholder.com/150?text=No+Image',
          subjects: apiResponse.subjects || [],
          titles: apiResponse.titles || [],
          rating: apiResponse.rating || 0,
          reviewsCount: transformedReviews.length || 0,
          hourlyRate: apiResponse.hourly_rate || 0,
          type: 'Individual',
          description: apiResponse.heading || 'No description available',
          bio: apiResponse.description || 'No bio available',
          verified: true,
          experience: `${Math.floor(Math.random() * 5) + 3}+ years`, // Generate random experience
          education: apiResponse.qualifications || [],
          languages: ['English'], // Default language
          availability: 'Mon-Fri: 9 AM - 6 PM', // Default availability
          totalStudents: apiResponse.uniqueStudentsCount || Math.floor(Math.random() * 200) + 50,
          completedSessions: apiResponse.completedSessionsCount || 0,
          responseTime: '< 2 hours', // Default response time
          achievements: [
            'Top Rated Tutor 2024',
            'Excellence in Teaching Award',
            `${Math.floor(Math.random() * 500) + 100}+ Sessions Completed`
          ],
          reviews: transformedReviews
        };
        
        setTutor(mappedTutor);
      } catch (error) {
        console.error('Failed to fetch tutor data:', error);
        
        // Fallback to mock data if API fails
        setTutor(mockTutorProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [tutorId]);

  const handleBookSession = () => {
    // Navigate to booking page
    navigate(`/book-session/${tutorId}`);
  };

  const handleReportTutor = () => {
    // Navigate to report page
    navigate(`/report-tutor/${tutorId}`);
  };

  const handleWhatsAppContact = () => {
    if (tutor?.phone) {
      const message = `Hi ${tutor.name}! I'm interested in your tutoring services. Could we discuss the details?`;
      // Clean phone number - remove all non-digits
      let cleanPhone = tutor.phone.replace(/[^\d]/g, '');
      
      // Ensure proper country code format
      if (cleanPhone.startsWith('0')) {
        // Remove leading 0 and add Sri Lankan country code
        cleanPhone = '94' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('94') && cleanPhone.length === 10) {
        // Add Sri Lankan country code for 10-digit numbers
        cleanPhone = '94' + cleanPhone;
      }
      
      // Try multiple WhatsApp URL formats for better compatibility
      const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      const whatsappApiUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      
      console.log('Cleaned phone:', cleanPhone);
      console.log('WhatsApp URL:', whatsappApiUrl);
      
      // Try to open WhatsApp
      const newWindow = window.open(whatsappApiUrl, '_blank');
      
      // Fallback: if popup was blocked or failed, try web version
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = whatsappWebUrl;
      }
    }
  };

  const refreshReviews = async () => {
    if (!tutorId || !tutor) return;
    
    try {
      setReviewsLoading(true);
      const reviewsResponse = await getReviewsByIndividualTutorId(tutorId);
      
      // Transform reviews data
      const transformedReviews: Review[] = Array.isArray(reviewsResponse) 
        ? reviewsResponse.map((review: any, index: number) => ({
            id: review.review_id || `review_${index}`,
            studentName: review.Student?.User?.name || review.Student?.name || 'Anonymous Student',
            studentImageUrl: review.Student?.User?.photo_url || 'https://via.placeholder.com/50?text=No+Image',
            rating: Number(review.rating) || 0,
            comment: review.review || review.comment || 'No comment provided',
            date: review.created_at ? new Date(review.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            subject: review.Session?.Individual_Tutor?.Course?.course_name || 'General'
          }))
        : [];
      
      // Update tutor with new reviews
      setTutor(prev => prev ? {
        ...prev,
        reviews: transformedReviews,
        reviewsCount: transformedReviews.length
      } : prev);
      
    } catch (error) {
      console.error('Failed to refresh reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleTabChange = (tab: 'overview' | 'reviews') => {
    setActiveTab(tab);
    if (tab === 'reviews' && tutor && tutor.reviews.length === 0) {
      refreshReviews();
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Tutor Not Found</h1>
            <button 
              onClick={() => navigate('/find-tutors')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Find Tutors
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <div className="relative">
                <img 
                  src={tutor.profilePicture} 
                  alt={tutor.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                {tutor.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{tutor.name}</h1>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center">
                        {renderStars(tutor.rating, 'lg')}
                        <span className="ml-2 text-lg font-semibold">{tutor.rating}</span>
                        <span className="ml-1 text-blue-100">({tutor.reviewsCount} reviews)</span>
                      </div>
                      <div className="flex items-center text-blue-100">
                        <MapPin className="w-4 h-4 mr-1" />
                        {tutor.location}
                      </div>
                    </div>
                    <p className="text-blue-100 text-lg">{tutor.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4 lg:mt-0">
                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className={`p-3 rounded-full border-2 border-white transition-colors ${
                        isSaved ? 'bg-white text-blue-600' : 'text-white hover:bg-white hover:text-blue-600'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="p-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-8 border-b">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">Rs.{tutor.hourlyRate}</div>
                <div className="text-gray-600">Per Hour</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{tutor.totalStudents}+</div>
                <div className="text-gray-600">Students Taught</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{tutor.completedSessions}</div>
                <div className="text-gray-600">Sessions Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{tutor.responseTime}</div>
                <div className="text-gray-600">Response Time</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleBookSession}
                className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Session
              </button>
              <button 
                onClick={handleWhatsAppContact}
                className="flex-1 bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-colors font-semibold text-lg flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp
              </button>
              {tutor.phone && (
                <button 
                  onClick={() => window.location.href = `tel:${tutor.phone}`}
                  className="bg-gray-600 text-white px-6 py-4 rounded-xl hover:bg-gray-700 transition-colors font-semibold flex items-center justify-center"
                >
                  <Phone className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* About Section */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h2 className="text-2xl font-bold mb-6">About</h2>
                  <p className="text-gray-700 leading-relaxed mb-6">{tutor.bio}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Experience</h3>
                      <p className="text-gray-600">{tutor.experience}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.languages.map((lang, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h2 className="text-2xl font-bold mb-6">Education</h2>
                  <div className="space-y-4">
                    {tutor.education.map((edu, index) => (
                      <div key={index} className="flex items-start">
                        <Award className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Reviews ({tutor.reviewsCount})</h2>
                  <div className="flex items-center">
                    {renderStars(tutor.rating, 'lg')}
                    <span className="ml-2 text-xl font-bold">{tutor.rating}</span>
                  </div>
                </div>

                {/* Reviews Container with Scroll */}
                <div className="max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <div className="space-y-6">
                    {tutor.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                        {/* <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-800">{review.studentName}</h4>
                            <div className="flex items-center mt-1">
                              {renderStars(review.rating, 'sm')}
                              <span className="ml-2 text-sm text-gray-600">{review.subject}</span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                        </div> */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center">
                              {/* Student image */}
                              <img
                                src={review.studentImageUrl} // <-- make sure your backend sends this field
                                alt={review.studentName}
                                className="w-8 h-8 rounded-full mr-2 object-cover"
                              />
                              <h4 className="font-semibold text-gray-800">{review.studentName}</h4>
                            </div>

                            <div className="flex items-center mt-1">
                              {renderStars(review.rating, 'sm')}
                              <span className="ml-2 text-sm text-gray-600">{review.subject}</span>
                            </div>
                          </div>

                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <a href={`mailto:${tutor.email}`} className="text-blue-600 hover:underline">
                    {tutor.email}
                  </a>
                </div>
                {tutor.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <a href={`tel:${tutor.phone}`} className="text-blue-600 hover:underline">
                      {tutor.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{tutor.location}</span>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Titles */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Teaching Subjects</h3>
              <div className="space-y-2">
                {tutor.titles.map((title, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Ready to Start Learning?</h3>
              <p className="text-blue-100 mb-4">Book your first session and start your learning journey!</p>
              <button 
                onClick={handleBookSession}
                className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Book Now
              </button>
            </div>

            {/* Report Tutor */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Having Issues?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you've experienced any inappropriate behavior or have concerns about this tutor, please let us know.
              </p>
              <button 
                onClick={handleReportTutor}
                className="flex items-center justify-center w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report this Tutor
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                All reports are reviewed confidentially
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
