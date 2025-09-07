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
  Bookmark
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';

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

export default function MassClassPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isClassSaved, setIsClassSaved] = useState(false);

  // Mock data - this would come from API
  const massClass: MassClass = {
    id: "class-1",
    name: "Advanced Mathematics Masterclass",
    subject: "Mathematics",
    tutor: {
      id: "tutor-1",
      name: "Dr. Sarah Johnson",
      profilePicture: "https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center",
      rating: 4.8,
      totalStudents: 450,
      experience: "8+ years"
    },
    description: "Comprehensive calculus and algebra preparation for advanced students",
    longDescription: "This masterclass covers advanced mathematical concepts including differential and integral calculus, linear algebra, and complex analysis. Perfect for students preparing for university entrance exams or those seeking to strengthen their mathematical foundation. The course is designed with interactive sessions, practical examples, and comprehensive practice materials.",
    price: 12000,
    duration: "2 hours",
    startDate: "2025-09-01",
    endDate: "2025-12-15",
    schedule: "Every Sunday at 6:00 PM",
    studentsEnrolled: 28,
    maxStudents: 50,
    verified: true,
    level: "Advanced",
    prerequisites: ["Basic Calculus", "Algebra Fundamentals"],
    learningOutcomes: [
      "Master advanced calculus concepts",
      "Solve complex mathematical problems",
      "Prepare for university-level mathematics",
      "Develop analytical thinking skills"
    ],
    totalSessions: 16,
    completedSessions: 2,
    sessions: [
      {
        id: "session-1",
        date: "2025-09-01",
        dayName: "Sunday",
        dayNumber: 1,
        isPast: true,
        isToday: false,
        isUpcoming: false,
        status: "completed",
        duration: "2 hours",
        startTime: "6:00 PM",
        description: "Introduction to Advanced Calculus - Limits and Continuity",
        materials: [
          {
            id: "mat-1",
            name: "Lecture Video - Limits and Continuity",
            type: "video",
            url: "#",
            downloadable: false,
            uploadDate: "2025-09-01"
          },
          {
            id: "mat-2",
            name: "Class Notes - Session 1",
            type: "document",
            url: "#",
            downloadable: true,
            uploadDate: "2025-09-01"
          },
          {
            id: "mat-3",
            name: "Practice Problems Set 1",
            type: "assignment",
            url: "#",
            downloadable: true,
            uploadDate: "2025-09-01"
          }
        ]
      },
      {
        id: "session-2",
        date: "2025-09-08",
        dayName: "Sunday",
        dayNumber: 8,
        isPast: true,
        isToday: false,
        isUpcoming: false,
        status: "completed",
        duration: "2 hours",
        startTime: "6:00 PM",
        description: "Differentiation Techniques and Applications",
        materials: [
          {
            id: "mat-4",
            name: "Lecture Video - Differentiation",
            type: "video",
            url: "#",
            downloadable: false,
            uploadDate: "2025-09-08"
          },
          {
            id: "mat-5",
            name: "Class Notes - Session 2",
            type: "document",
            url: "#",
            downloadable: true,
            uploadDate: "2025-09-08"
          }
        ]
      },
      {
        id: "session-3",
        date: "2025-09-15",
        dayName: "Sunday",
        dayNumber: 15,
        isPast: false,
        isToday: true,
        isUpcoming: false,
        status: "live",
        duration: "2 hours",
        startTime: "6:00 PM",
        description: "Integration Methods and Techniques",
        materials: []
      },
      {
        id: "session-4",
        date: "2025-09-22",
        dayName: "Sunday",
        dayNumber: 22,
        isPast: false,
        isToday: false,
        isUpcoming: true,
        status: "upcoming",
        duration: "2 hours",
        startTime: "6:00 PM",
        description: "Advanced Integration Applications",
        materials: []
      },
      {
        id: "session-5",
        date: "2025-09-29",
        dayName: "Sunday",
        dayNumber: 29,
        isPast: false,
        isToday: false,
        isUpcoming: true,
        status: "upcoming",
        duration: "2 hours",
        startTime: "6:00 PM",
        description: "Linear Algebra Fundamentals",
        materials: []
      },
      {
        id: "session-6",
        date: "2025-10-06",
        dayName: "Sunday",
        dayNumber: 6,
        isPast: false,
        isToday: false,
        isUpcoming: true,
        status: "upcoming",
        duration: "2 hours",
        startTime: "6:00 PM",
        description: "Matrix Operations and Determinants",
        materials: []
      }
    ]
  };

  const toggleSaveClass = () => {
    setIsClassSaved(!isClassSaved);
  };

  const handleJoinClass = (sessionId: string) => {
    // Handle joining the live class
    console.log('Joining class session:', sessionId);
    // This would typically open a video conferencing interface
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'live':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
            <PlayCircle className="w-3 h-3 mr-1" />
            Live Now
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Upcoming
          </span>
        );
      default:
        return null;
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

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
                    <h1 className="text-3xl font-bold text-gray-900">{massClass.name}</h1>
                    {massClass.verified && (
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                      {massClass.subject}
                    </span>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                      {massClass.level}
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {massClass.studentsEnrolled}/{massClass.maxStudents} students
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{massClass.description}</p>
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
              <div className="mb-6">
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
              </div>

              {/* Tutor Info */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={massClass.tutor.profilePicture}
                  alt={massClass.tutor.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <button
                    onClick={() => navigate(`/student/mass-tutor-profile/${massClass.tutor.id}`)}
                    className="font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                  >
                    {massClass.tutor.name}
                  </button>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {massClass.tutor.rating}
                    </div>
                    <span>•</span>
                    <span>{massClass.tutor.experience} experience</span>
                    <span>•</span>
                    <span>{massClass.tutor.totalStudents} students taught</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Schedule Card */}
            <div className="bg-gray-50 rounded-xl p-6 lg:w-80">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  Rs. {massClass.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{massClass.duration} per session</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{massClass.schedule}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span>{massClass.studentsEnrolled} students enrolled</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-gray-600 mb-6">
                <div>Start: {new Date(massClass.startDate).toLocaleDateString()}</div>
                <div>End: {new Date(massClass.endDate).toLocaleDateString()}</div>
              </div>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Class Sessions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Class Sessions</h2>
        
        <div className="grid gap-4">
          {massClass.sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl border overflow-hidden">
              {/* Session Header Bar */}
              <button
                onClick={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
                className={`w-full px-6 py-4 text-left transition-colors ${
                  session.isPast
                    ? 'bg-green-50 hover:bg-green-100'
                    : session.isToday
                    ? 'bg-red-50 hover:bg-red-100'
                    : 'bg-blue-50 hover:bg-blue-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-12 rounded-full ${
                      session.isPast
                        ? 'bg-green-500'
                        : session.isToday
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {session.dayNumber}{getOrdinalSuffix(session.dayNumber)} {session.dayName}
                        </h3>
                        {getSessionStatusBadge(session.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(session.date).toLocaleDateString()} • {session.startTime} • {session.duration}
                      </div>
                      <div className="text-sm font-medium text-gray-800 mt-1">
                        {session.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedSession === session.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </button>

              {/* Session Details */}
              {selectedSession === session.id && (
                <div className="px-6 pb-6 border-t bg-gray-50">
                  <div className="pt-4">
                    {/* Materials Section */}
                    {session.materials.length > 0 ? (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Class Materials</h4>
                        <div className="grid gap-2">
                          {session.materials.map((material) => (
                            <div
                              key={material.id}
                              className="flex items-center justify-between bg-white p-3 rounded-lg border"
                            >
                              <div className="flex items-center gap-3">
                                {getMaterialIcon(material.type)}
                                <div>
                                  <div className="font-medium text-gray-900">{material.name}</div>
                                  <div className="text-xs text-gray-500">
                                    Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              {material.downloadable && (
                                <button className="text-purple-600 hover:text-purple-700">
                                  <Download className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>Materials will be available after the class</p>
                      </div>
                    )}

                    {/* Join Class Button (only for upcoming sessions) */}
                    {(session.isToday || session.isUpcoming) && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleJoinClass(session.id)}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            session.isToday
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {session.isToday ? 'Join Live Class' : 'Set Reminder'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
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
