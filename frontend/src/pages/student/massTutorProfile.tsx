import React, { useState } from 'react';
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
  specializations: string[];
  rating: number;
  totalReviews: number;
  experience: string;
  education: string[];
  location: string;
  languages: string[];
  bio: string;
  totalStudents: number;
  activeClasses: number;
  joinedDate: string;
  verified: boolean;
  achievements: string[];
  contactInfo: {
    email?: string;
    phone?: string;
  };
}

export default function MassTutorProfile() {
  const { tutorId } = useParams();
  const navigate = useNavigate();

  // Mock data - this would come from API
  const tutorProfile: TutorProfile = {
    id: "tutor-1",
    name: "Dr. Sarah Johnson",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=300&h=300&fit=crop&crop=center",
    subjects: ["Mathematics", "Physics", "Engineering"],
    specializations: ["Calculus", "Linear Algebra", "Differential Equations", "Quantum Physics"],
    rating: 4.8,
    totalReviews: 124,
    experience: "8+ years",
    education: [
      "Ph.D. in Applied Mathematics - MIT",
      "M.Sc. in Physics - Stanford University",
      "B.Sc. in Engineering - University of California"
    ],
    location: "Colombo, Sri Lanka",
    languages: ["English", "Sinhala", "Tamil"],
    bio: "I'm a passionate educator with over 8 years of experience teaching mathematics and physics to students of all levels. My goal is to make complex concepts simple and engaging. I believe every student can excel with the right guidance and support.",
    totalStudents: 450,
    activeClasses: 5,
    joinedDate: "January 2020",
    verified: true,
    achievements: [
      "Top Rated Instructor 2023",
      "Excellence in Teaching Award",
      "Published 15+ Research Papers",
      "MIT Alumni Achievement Award"
    ],
    contactInfo: {
      email: "sarah.johnson@example.com",
      phone: "+94 77 123 4567"
    }
  };

  const tutorClasses: TutorClass[] = [
    {
      id: "class-1",
      name: "Advanced Mathematics Masterclass",
      subject: "Mathematics",
      duration: "2 hours",
      schedule: "Mon, Wed, Fri - 6:00 PM",
      price: 12000,
      studentsEnrolled: 28,
      description: "Comprehensive calculus and algebra preparation for advanced students",
      startDate: "2025-09-15",
      isActive: true
    },
    {
      id: "class-2",
      name: "Physics Fundamentals",
      subject: "Physics",
      duration: "1.5 hours",
      schedule: "Tue, Thu - 7:00 PM",
      price: 10000,
      studentsEnrolled: 22,
      description: "Interactive physics workshop covering mechanics and thermodynamics",
      startDate: "2025-09-18",
      isActive: true
    },
    {
      id: "class-3",
      name: "Engineering Mathematics",
      subject: "Engineering",
      duration: "2.5 hours",
      schedule: "Saturday - 9:00 AM",
      price: 15000,
      studentsEnrolled: 15,
      description: "Advanced mathematical concepts for engineering students",
      startDate: "2025-09-20",
      isActive: true
    }
  ];

  const reviews: Review[] = [
    {
      id: "rev-1",
      studentName: "Alex Chen",
      studentAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=center",
      rating: 5,
      comment: "Dr. Sarah is an exceptional teacher! Her explanations are crystal clear and she makes complex mathematical concepts easy to understand. The classes are well-structured and engaging.",
      date: "2025-08-15",
      className: "Advanced Mathematics Masterclass",
      helpful: 12,
      notHelpful: 1
    },
    {
      id: "rev-2",
      studentName: "Priya Sharma",
      studentAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=center",
      rating: 5,
      comment: "Amazing physics classes! Dr. Johnson uses real-world examples that make the subject fascinating. Her teaching methodology is top-notch.",
      date: "2025-08-10",
      className: "Physics Fundamentals",
      helpful: 8,
      notHelpful: 0
    },
    {
      id: "rev-3",
      studentName: "Michael Brown",
      studentAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=center",
      rating: 4,
      comment: "Great instructor with deep knowledge. Sometimes the pace is a bit fast, but overall excellent learning experience. Highly recommended!",
      date: "2025-08-05",
      className: "Engineering Mathematics",
      helpful: 6,
      notHelpful: 2
    },
    {
      id: "rev-4",
      studentName: "Emma Wilson",
      studentAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=center",
      rating: 5,
      comment: "Dr. Sarah's classes transformed my understanding of mathematics. Her patience and dedication to student success is remarkable. Best tutor I've had!",
      date: "2025-07-28",
      className: "Advanced Mathematics Masterclass",
      helpful: 15,
      notHelpful: 0
    }
  ];

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
        tutorId: tutorProfile.id,
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

                {/* Education & Experience */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Award className="w-6 h-6 mr-2 text-purple-500" />
                      Education
                    </h3>
                    <div className="space-y-3">
                      {tutorProfile.education.map((edu, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-600">{edu}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Clock className="w-6 h-6 mr-2 text-purple-500" />
                      Experience & Achievements
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <p className="text-gray-600">{tutorProfile.experience} of teaching experience</p>
                      </div>
                      {tutorProfile.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-600">{achievement}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specializations & Languages */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {tutorProfile.specializations.map(spec => (
                        <span
                          key={spec}
                          className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-lg"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {tutorProfile.languages.map(lang => (
                        <span
                          key={lang}
                          className="bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded-lg"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
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
                          <button
                            onClick={() => navigate(`/join-class/${tutorClass.id}`)}
                            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                          >
                            Enroll Now
                          </button>
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
                      <div className="text-4xl font-bold text-gray-900 mb-2">{calculateAverageRating()}</div>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {renderStars(Math.round(Number(calculateAverageRating())))}
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Student Reviews</h2>
                <div className="space-y-6">
                  {reviews.map(review => (
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
                  ))}
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
                  <p className="text-xs text-gray-500">{tutorProfile.experience} • {tutorProfile.totalStudents} students</p>
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
