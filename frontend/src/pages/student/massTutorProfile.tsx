import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  MapPin,
  Clock,
  Users,
  BookOpen,
  Award,
  Calendar,
  DollarSign,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  ChevronLeft,
  User,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ArrowLeft,
  X
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getMassTutorById, MassTutor, ClassInfo, RatingReview } from '../../api/Student';

interface Review {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  date: string;
  className: string;
  helpful: number;
  notHelpful: number;
}

interface TutorClass {
  id: string;
  name: string;
  subject: string;
  duration: string;
  schedule: string;
  price: number;
  studentsEnrolled: number;
  description: string;
  startDate: string;
  isActive: boolean;
}

interface TutorProfile {
  id: string;
  name: string;
  profilePicture: string;
  subjects: string[];
  rating: number;
  totalReviews: number;
  location: string;
  bio: string;
  totalStudents: number;
  activeClasses: number;
  verified: boolean;
  heading: string;
  status: string;
  phone_number: string;
  qualifications: string[];
  monthlyRate: string;
  Class?: ClassInfo[];
}

export default function MassTutorProfile() {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  // State for tutor data
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tutor data from API
  useEffect(() => {
    const fetchTutorData = async () => {
      if (!tutorId) {
        setError('Tutor ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getMassTutorById(tutorId);
        
        // Calculate total reviews from all classes
        const totalReviews = data.Class?.reduce((total, classInfo) => {
          return total + (classInfo.Rating_N_Review_Class?.length || 0);
        }, 0) || 0;

        // Calculate total students from all class enrollments
        const totalStudents = data.Class?.reduce((total, classInfo) => {
          return total + (classInfo._count?.Enrolment || 0);
        }, 0) || 0;

        // Transform API response to match our TutorProfile interface
        const transformedData: TutorProfile = {
          id: data.m_tutor_id,
          name: data.User.name,
          profilePicture: data.User.photo_url || 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=300&h=300&fit=crop&crop=center',
          subjects: data.subjects,
          rating: parseFloat(data.rating),
          totalReviews: totalReviews,
          location: data.location,
          bio: data.description,
          totalStudents: totalStudents,
          activeClasses: data.Class?.length || 0,
          verified: data.status === 'active',
          heading: data.heading,
          status: data.status,
          phone_number: data.phone_number,
          qualifications: data.qualifications,
          monthlyRate: data.prices,
          Class: data.Class
        };

        console.log('Raw API Response:', data);
        console.log('Transformed tutor data:', transformedData);
        console.log('Classes with reviews:');
        data.Class?.forEach((cls, index) => {
          console.log(`Class ${index + 1}: ${cls.title}`);
          console.log(`- Reviews count: ${cls.Rating_N_Review_Class?.length || 0}`);
          console.log(`- Enrollments: ${cls._count?.Enrolment || 0}`);
          cls.Rating_N_Review_Class?.forEach((review, reviewIndex) => {
            console.log(`  Review ${reviewIndex + 1}:`, {
              rating: review.rating,
              comment: review.review,
              student: review.Student?.User?.name
            });
          });
        });

        setTutorProfile(transformedData);
      } catch (err) {
        console.error('Error fetching tutor data:', err);
        setError('Failed to load tutor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [tutorId]);

  // Transform class data from API response
  const tutorClasses: TutorClass[] = tutorProfile?.Class?.map(classInfo => {
    const time = new Date(classInfo.time);
    const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return {
      // id: `class-${classInfo.subject}-${classInfo.day}`,
      id: classInfo.class_id,
      name: classInfo.title,
      subject: classInfo.subject,
      duration: "2 hours", // Default duration, as it's not in the API response
      schedule: `${classInfo.day} - ${formattedTime}`,
      price: parseFloat(tutorProfile.monthlyRate),
      studentsEnrolled: classInfo._count.Enrolment,
      // description: tutorProfile.bio || `${classInfo.subject} class taught by ${tutorProfile.name}`,
      description: classInfo.description,
      startDate: new Date().toISOString().split('T')[0], // Current date as start date
      isActive: tutorProfile.status === 'active'
    };
  }) || [];


  // Map reviews from all classes to the Review interface
  const reviews: Review[] = React.useMemo(() => {
    if (!tutorProfile?.Class) {
      console.log('No classes found for tutor, returning empty reviews array.');
      return [];
    }

    return tutorProfile.Class.flatMap((classInfo, classIndex) => {
      if (!classInfo.Rating_N_Review_Class || !Array.isArray(classInfo.Rating_N_Review_Class)) {
        console.log(`Class ${classInfo.title} has no reviews or invalid review data`);
        return [];
      }
      
      return classInfo.Rating_N_Review_Class.map((review, reviewIndex) => {
        if (!review || typeof review.rating !== 'number' || typeof review.review !== 'string') {
          console.warn(`Invalid review data at class ${classIndex}, review ${reviewIndex}:`, review);
          return null;
        }
        
        return {
          id: `rev-${classIndex}-${reviewIndex}`, // unique id per review
          studentName: review.Student?.User?.name || 'Anonymous',
          studentAvatar: review.Student?.User?.photo_url || 
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=center',
          rating: review.rating,
          comment: review.review,
          date: new Date().toISOString().split('T')[0], // Current date as fallback
          className: classInfo.title,
          helpful: 0, // Default values since API doesn't provide these
          notHelpful: 0, // Default values since API doesn't provide these
        };
      }).filter((review): review is Review => review !== null); // Type-safe filter
    });
  }, [tutorProfile?.Class]);

  console.log('Transformed reviews:', reviews);
  console.log('Tutor profile class data:', tutorProfile?.Class);
  console.log('Total reviews found:', reviews.length);
  
  // Debug each class and its reviews
  tutorProfile?.Class?.forEach((classInfo, index) => {
    console.log(`Class ${index}:`, classInfo.title);
    console.log(`Reviews in class ${index}:`, classInfo.Rating_N_Review_Class?.length || 0);
    console.log(`Class reviews data:`, classInfo.Rating_N_Review_Class);
  });
  //     className: "Physics Fundamentals",
  //     helpful: 8,
  //     notHelpful: 0
  //   },
  //   {
  //     id: "rev-3",
  //     studentName: "Michael Brown",
  //     studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=center",
  //     rating: 4,
  //     comment: "Great instructor with deep knowledge. Sometimes the pace is a bit fast, but overall excellent learning experience. Highly recommended!",
  //     date: "2025-08-05",
  //     className: "Engineering Mathematics",
  //     helpful: 6,
  //     notHelpful: 2
  //   },
  //   {
  //     id: "rev-4",
  //     studentName: "Emma Wilson",
  //     studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=center",
  //     rating: 5,
  //     comment: "Dr. Sarah's classes transformed my understanding of mathematics. Her patience and dedication to student success is remarkable. Best tutor I've had!",
  //     date: "2025-07-28",
  //     className: "Advanced Mathematics Masterclass",
  //     helpful: 15,
  //     notHelpful: 0
  //   }
  // ];

  const [selectedTab, setSelectedTab] = useState<'overview' | 'classes' | 'reviews'>('overview');
  const [savedClasses, setSavedClasses] = useState<string[]>([]);
  const [hasRatedTutor, setHasRatedTutor] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const toggleSaveClass = (classId: string) => {
    setSavedClasses(prev => {
      if (prev.includes(classId)) {
        return prev.filter(id => id !== classId);
      } else {
        return [...prev, classId];
      }
    });
  };

  const handleRateTutor = () => {
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    if (selectedRating > 0) {
      setHasRatedTutor(true);
      setShowRatingModal(false);
      // Here you would typically send the rating to the backend
      console.log('Rating submitted:', {
        tutorId: tutorProfile?.id,
        rating: selectedRating
      });
      // Reset form
      setSelectedRating(0);
    }
  };

  const handleCloseModal = () => {
    setShowRatingModal(false);
    setSelectedRating(0);
    setHoverRating(0);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculateAverageRating = () => {
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };


  

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tutor profile...</p>
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
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

  // Null check
  if (!tutorProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Tutor Not Found</h2>
              <p className="text-gray-600 mb-4">The requested tutor profile could not be found.</p>
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
      
      <div className="container mx-auto px-4 py-8">
         <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </button>
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <img
                src={tutorProfile.profilePicture}
                alt={tutorProfile.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{tutorProfile.name}</h1>
                {tutorProfile.verified && (
                  <div className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full font-semibold">
                    Verified Tutor
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-1 mb-4">
                {renderStars(tutorProfile.rating)}
                <span className="text-lg font-semibold text-gray-700 ml-2">
                  {tutorProfile.rating} ({tutorProfile.totalReviews} reviews)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  <span>{tutorProfile.totalStudents}+ Students Taught</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-5 h-5 mr-2 text-purple-500" />
                  <span>{tutorProfile.activeClasses} Active Classes</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                  <span>{tutorProfile.location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {tutorProfile.subjects.map(subject => (
                  <span
                    key={subject}
                    className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-col space-y-3 lg:w-48">
              <button
                onClick={handleRateTutor}
                className={`px-6 py-3 rounded-lg transition-colors font-semibold text-center flex items-center justify-center ${
                  hasRatedTutor
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                <Star className={`w-4 h-4 mr-2 ${hasRatedTutor ? 'fill-current' : ''}`} />
                {hasRatedTutor ? 'Rated' : 'Rate Tutor'}
              </button>
              <button className="bg-purple-100 text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-center flex items-center justify-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'overview', label: 'Overview', icon: User },
              { key: 'classes', label: 'Classes', icon: BookOpen },
              { key: 'reviews', label: 'Reviews', icon: Star }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-semibold transition-colors ${
                  selectedTab === key
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {selectedTab === 'overview' && (
              <div className="space-y-8">
                {/* Bio */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
                  <p className="text-gray-600 leading-relaxed">{tutorProfile.bio}</p>
                </div>

                {/* Qualifications */}
                {tutorProfile.qualifications && tutorProfile.qualifications.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-purple-500" />
                      Qualifications
                    </h3>
                    <div className="space-y-3">
                      {tutorProfile.qualifications.map((qualification, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-600">{qualification}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                {tutorProfile.phone_number && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Phone className="w-6 h-6 mr-2 text-purple-500" />
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{tutorProfile.phone_number}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'classes' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Classes</h2>
                <div className="space-y-6">
                  {tutorClasses.map(tutorClass => (
                    <div key={tutorClass.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{tutorClass.name}</h3>
                            {tutorClass.isActive && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                              <span className="font-semibold text-purple-700">{tutorClass.subject}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2 text-purple-500" />
                              <span>{tutorClass.duration} • {tutorClass.schedule}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-purple-500" />
                              <span>{tutorClass.studentsEnrolled} Students</span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-3">{tutorClass.description}</p>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                              <span>Starts: {new Date(tutorClass.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:text-right lg:w-48">
                          <div className="text-2xl font-bold text-purple-600 mb-2">
                            Rs. {tutorClass.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 mb-4">per month</div>
                          <div className="space-y-3">
                            <button
                              onClick={() => toggleSaveClass(tutorClass.id)}
                              className={`w-full px-6 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center ${
                                savedClasses.includes(tutorClass.id)
                                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <Bookmark className={`w-4 h-4 mr-2 ${savedClasses.includes(tutorClass.id) ? 'fill-current' : ''}`} />
                              {savedClasses.includes(tutorClass.id) ? 'Saved' : 'Save Class'}
                            </button>
                            <button
                              onClick={() => navigate(`/mass-class/${tutorClass.id}`)}
                              className="w-full mb-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                              View Class
                            </button>
                          </div>
                          {/* <button
                            onClick={() => navigate(`/join-class/${tutorClass.id}`)}
                            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                          >
                            Enroll Now
                          </button> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div>
                {/* Rating Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
                    <div className="text-center mb-6 lg:mb-0">
                      <div className="text-4xl font-bold text-gray-900 mb-2">{tutorProfile.rating}</div>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {renderStars(tutorProfile.rating)}
                      </div>
                      <div className="text-gray-600">{reviews.length} reviews</div>
                    </div>

                    <div className="flex-1">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(rating => {
                          const distribution = getRatingDistribution();
                          const count = distribution[rating as keyof typeof distribution];
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center space-x-3">
                              <span className="text-sm text-gray-600 w-3">{rating}</span>
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Student Reviews {tutorProfile.totalReviews > 0 && `(${tutorProfile.totalReviews})`}
                </h2>
                <div className="space-y-6">
                  {reviews.length > 0 ? reviews.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={review.studentAvatar}
                          alt={review.studentName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.studentName}</h4>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-purple-600 mb-2">{review.className}</div>
                          <p className="text-gray-600 mb-4">{review.comment}</p>
                          
                          {/* <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                              <ThumbsUp className="w-4 h-4" />
                              <span>Helpful ({review.helpful})</span>
                            </button>
                            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                              <ThumbsDown className="w-4 h-4" />
                              <span>Not Helpful ({review.notHelpful})</span>
                            </button>
                          </div> */}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-4">
                        <MessageCircle className="w-16 h-16 mx-auto mb-3" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-500">Be the first to leave a review for this tutor!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal - Enhanced Popup */}
      {showRatingModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl relative transform transition-all duration-300 ease-out scale-100">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-3xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">Rate Your Tutor</h3>
                  <p className="text-yellow-100">How was your experience?</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-yellow-200 transition-colors bg-white bg-opacity-20 rounded-full p-2 hover:bg-opacity-30"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Tutor Info Card */}
              <div className="flex items-center gap-4 mb-8 p-4 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-2xl border border-yellow-200">
                <div className="relative">
                  <img
                    src={tutorProfile.profilePicture}
                    alt={tutorProfile.name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                    <Star className="w-4 h-4 text-white fill-current" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{tutorProfile.name}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" />
                      <span className="font-medium text-yellow-700">{tutorProfile.rating}</span>
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium text-xs">
                      {tutorProfile.subjects[0]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{tutorProfile.heading} • {tutorProfile.totalStudents} students</p>
                </div>
              </div>

              {/* Rating Stars Section */}
              <div className="mb-10 text-center">
                <label className="block text-lg font-bold text-gray-800 mb-6">
                  How would you rate this tutor?
                </label>
                
                {/* Large Interactive Stars */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-all duration-200 hover:scale-125 focus:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-14 h-14 transition-all duration-200 ${
                          star <= (hoverRating || selectedRating)
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                {/* Rating Description */}
                <div className="h-8">
                  {(hoverRating || selectedRating) > 0 && (
                    <div className="transition-all duration-300 ease-in-out">
                      <span className="inline-flex items-center px-6 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold text-lg">
                        {(hoverRating || selectedRating) === 1 && '⭐ Poor'}
                        {(hoverRating || selectedRating) === 2 && '⭐⭐ Fair'}
                        {(hoverRating || selectedRating) === 3 && '⭐⭐⭐ Good'}
                        {(hoverRating || selectedRating) === 4 && '⭐⭐⭐⭐ Very Good'}
                        {(hoverRating || selectedRating) === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={selectedRating === 0}
                  className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 ${
                    selectedRating > 0
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl focus:ring-yellow-300 transform hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {selectedRating > 0 ? (
                    <span className="flex items-center justify-center">
                      <Star className="w-4 h-4 mr-2 fill-current" />
                      Submit Rating
                    </span>
                  ) : (
                    'Select a Rating'
                  )}
                </button>
              </div>

              {/* Success Message Preview */}
              {selectedRating > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-800 text-sm font-medium text-center">
                    🎉 Your {selectedRating}-star rating will help other students!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
