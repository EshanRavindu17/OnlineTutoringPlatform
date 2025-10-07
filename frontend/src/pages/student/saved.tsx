import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Star,
  MapPin,
  Clock,
  Users,
  BookOpen,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Grid3X3,
  List,
  Trash2,
  Heart,
  User,
  GraduationCap,
  Award,
  CheckCircle,
  X
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface SavedTutor {
  id: string;
  name: string;
  profilePicture: string;
  subjects: string[];
  specializations: string[]; // Changed from titles to specializations - sub-areas within subjects
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  location: string;
  experience: string;
  verified: boolean;
  totalStudents: number;
  savedDate: string;
}

interface SavedMassClass {
  id: string;
  name: string;
  subject: string;
  tutor: {
    id: string;
    name: string;
    profilePicture: string;
    rating: number;
  };
  description: string;
  price: number;
  duration: string;
  schedule: string;
  studentsEnrolled: number;
  maxStudents: number;
  startDate: string;
  endDate: string;
  verified: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  savedDate: string;
}

export default function SavedPage() {
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState<'tutors' | 'classes'>('tutors');
  const [savedTutors, setSavedTutors] = useState<SavedTutor[]>([]);
  const [savedClasses, setSavedClasses] = useState<SavedMassClass[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'rating'>('recent');

  // Mock data - this would come from API
  const mockSavedTutors: SavedTutor[] = [
    {
      id: 'tutor-1',
      name: 'Dr. Sarah Johnson',
      profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=300&h=300&fit=crop&crop=center',
      subjects: ['Mathematics', 'Physics'],
      specializations: ['Calculus', 'Real Analysis', 'Linear Algebra', 'Quantum Mechanics', 'Classical Mechanics'],
      rating: 4.8,
      totalReviews: 124,
      hourlyRate: 5000,
      location: 'Colombo, Sri Lanka',
      experience: '8+ years',
      verified: true,
      totalStudents: 450,
      savedDate: '2025-09-07T10:30:00Z'
    },
    {
      id: 'tutor-2',
      name: 'Prof. Michael Chen',
      profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=center',
      subjects: ['Computer Science', 'Programming'],
      specializations: ['Data Structures', 'Algorithms', 'Machine Learning', 'Web Development', 'Python Programming'],
      rating: 4.9,
      totalReviews: 98,
      hourlyRate: 6000,
      location: 'Kandy, Sri Lanka',
      experience: '12+ years',
      verified: true,
      totalStudents: 320,
      savedDate: '2025-09-06T15:20:00Z'
    },
    {
      id: 'tutor-3',
      name: 'Dr. Emily Watson',
      profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=center',
      subjects: ['Chemistry', 'Biology'],
      specializations: ['Organic Chemistry', 'Biochemistry', 'Molecular Biology', 'Cell Biology', 'Genetics'],
      rating: 4.7,
      totalReviews: 156,
      hourlyRate: 4500,
      location: 'Galle, Sri Lanka',
      experience: '6+ years',
      verified: true,
      totalStudents: 280,
      savedDate: '2025-09-05T09:15:00Z'
    },
    {
      id: 'tutor-4',
      name: 'Prof. David Kumar',
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=center',
      subjects: ['English', 'History'],
      specializations: ['Literature', 'Creative Writing', 'World History', 'Essay Writing', 'Ancient History'],
      rating: 4.6,
      totalReviews: 89,
      hourlyRate: 4000,
      location: 'Gampaha, Sri Lanka',
      experience: '5+ years',
      verified: true,
      totalStudents: 190,
      savedDate: '2025-09-04T12:15:00Z'
    }
  ];

  const mockSavedClasses: SavedMassClass[] = [
    {
      id: 'class-1',
      name: 'Advanced Mathematics Masterclass',
      subject: 'Mathematics',
      tutor: {
        id: 'tutor-1',
        name: 'Dr. Sarah Johnson',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center',
        rating: 4.8
      },
      description: 'Comprehensive calculus and linear algebra preparation for advanced students',
      price: 12000,
      duration: '2 hours',
      schedule: 'Every Sunday at 6:00 PM',
      studentsEnrolled: 28,
      maxStudents: 50,
      startDate: '2025-09-15',
      endDate: '2025-12-15',
      verified: true,
      level: 'Advanced',
      savedDate: '2025-09-07T14:45:00Z'
    },
    {
      id: 'class-2',
      name: 'Python Programming Bootcamp',
      subject: 'Programming',
      tutor: {
        id: 'tutor-2',
        name: 'Prof. Michael Chen',
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=center',
        rating: 4.9
      },
      description: 'Complete Python programming course from basics to advanced web development',
      price: 15000,
      duration: '3 hours',
      schedule: 'Tuesdays & Thursdays at 7:00 PM',
      studentsEnrolled: 35,
      maxStudents: 40,
      startDate: '2025-09-20',
      endDate: '2025-11-30',
      verified: true,
      level: 'Intermediate',
      savedDate: '2025-09-06T11:20:00Z'
    },
    {
      id: 'class-3',
      name: 'Organic Chemistry Deep Dive',
      subject: 'Chemistry',
      tutor: {
        id: 'tutor-3',
        name: 'Dr. Emily Watson',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=center',
        rating: 4.7
      },
      description: 'Intensive organic chemistry course covering all major reaction mechanisms and biochemistry',
      price: 10000,
      duration: '2.5 hours',
      schedule: 'Saturdays at 10:00 AM',
      studentsEnrolled: 22,
      maxStudents: 30,
      startDate: '2025-09-18',
      endDate: '2025-12-10',
      verified: true,
      level: 'Advanced',
      savedDate: '2025-09-05T16:30:00Z'
    },
    {
      id: 'class-4',
      name: 'English Literature & Creative Writing',
      subject: 'English',
      tutor: {
        id: 'tutor-4',
        name: 'Prof. David Kumar',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center',
        rating: 4.6
      },
      description: 'Explore classic literature while developing creative writing and essay composition skills',
      price: 8000,
      duration: '2 hours',
      schedule: 'Fridays at 5:00 PM',
      studentsEnrolled: 18,
      maxStudents: 25,
      startDate: '2025-09-22',
      endDate: '2025-12-22',
      verified: true,
      level: 'Intermediate',
      savedDate: '2025-09-04T09:45:00Z'
    }
  ];

  // Mock data for subjects and their related titles/specializations
  const subjectTitleMap = {
    'Mathematics': [
      'Calculus',
      'Real Analysis',
      'Linear Algebra', 
      'Differential Equations',
      'Abstract Algebra',
      'Number Theory',
      'Statistics',
      'Probability Theory',
      'Discrete Mathematics',
      'Geometry'
    ],
    'Physics': [
      'Quantum Mechanics',
      'Classical Mechanics',
      'Electromagnetism',
      'Thermodynamics',
      'Optics',
      'Nuclear Physics',
      'Particle Physics',
      'Astrophysics',
      'Condensed Matter Physics',
      'Relativity'
    ],
    'Computer Science': [
      'Data Structures',
      'Algorithms',
      'Machine Learning',
      'Artificial Intelligence',
      'Database Systems',
      'Operating Systems',
      'Computer Networks',
      'Software Engineering',
      'Computer Graphics',
      'Cybersecurity'
    ],
    'Programming': [
      'Web Development',
      'Mobile App Development',
      'Python Programming',
      'Java Programming',
      'JavaScript',
      'C++ Programming',
      'Data Science',
      'Backend Development',
      'Frontend Development',
      'DevOps'
    ],
    'Chemistry': [
      'Organic Chemistry',
      'Inorganic Chemistry',
      'Physical Chemistry',
      'Analytical Chemistry',
      'Biochemistry',
      'Environmental Chemistry',
      'Medicinal Chemistry',
      'Polymer Chemistry',
      'Electrochemistry',
      'Quantum Chemistry'
    ],
    'Biology': [
      'Molecular Biology',
      'Cell Biology',
      'Genetics',
      'Ecology',
      'Evolution',
      'Microbiology',
      'Botany',
      'Zoology',
      'Anatomy',
      'Physiology'
    ],
    'English': [
      'Literature',
      'Creative Writing',
      'Grammar',
      'Essay Writing',
      'Poetry',
      'Linguistics',
      'Public Speaking',
      'Business English',
      'Academic Writing',
      'English Composition'
    ],
    'History': [
      'World History',
      'Ancient History',
      'Modern History',
      'Sri Lankan History',
      'European History',
      'Asian History',
      'Military History',
      'Cultural History',
      'Political History',
      'Economic History'
    ]
  };

  // All available subjects
  const allSubjects = Object.keys(subjectTitleMap);

  useEffect(() => {
    setSavedTutors(mockSavedTutors);
    setSavedClasses(mockSavedClasses);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowSubjectDropdown(false);
        setShowSpecializationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear specializations that are no longer available when subjects change
  useEffect(() => {
    const currentAvailableTitles = getAvailableTitles();
    setSelectedSpecializations(prev => 
      prev.filter(spec => currentAvailableTitles.includes(spec))
    );
  }, [selectedSubjects]);

  // Get titles/specializations based on selected subjects
  const getAvailableTitles = () => {
    if (selectedSubjects.length === 0) {
      // If no subjects selected, return all titles
      return Object.values(subjectTitleMap).flat();
    }
    // Return titles only for selected subjects
    return selectedSubjects.flatMap(subject => subjectTitleMap[subject as keyof typeof subjectTitleMap] || []);
  };

  const availableTitles = getAvailableTitles();

  // Filter and sort functions
  const filteredTutors = savedTutors
    .filter(tutor => 
      (searchQuery === '' || 
       tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       tutor.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
       tutor.specializations.some(specialization => specialization.toLowerCase().includes(searchQuery.toLowerCase()))) &&
      (selectedSubjects.length === 0 || 
       tutor.subjects.some(subject => selectedSubjects.includes(subject))) &&
      (selectedSpecializations.length === 0 || 
       tutor.specializations.some(specialization => selectedSpecializations.includes(specialization)))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
        default:
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      }
    });

  const filteredClasses = savedClasses
    .filter(cls => 
      (searchQuery === '' || 
       cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       cls.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
       cls.tutor.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedSubjects.length === 0 || selectedSubjects.includes(cls.subject))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.tutor.rating - a.tutor.rating;
        case 'recent':
        default:
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      }
    });

  const removeSavedTutor = (tutorId: string) => {
    setSavedTutors(prev => prev.filter(tutor => tutor.id !== tutorId));
  };

  const removeSavedClass = (classId: string) => {
    setSavedClasses(prev => prev.filter(cls => cls.id !== classId));
  };

  const formatSavedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Saved Items</h1>
              <p className="text-gray-600">Your bookmarked tutors and classes</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => setActiveTab('tutors')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'tutors'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Individual Tutors ({savedTutors.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'classes'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mass Classes ({savedClasses.length})
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-xl p-6 mb-8 border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab === 'tutors' ? 'tutors' : 'classes'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="lg:w-64 relative dropdown-container">
              <button
                onClick={() => {
                  setShowSubjectDropdown(!showSubjectDropdown);
                  setShowSpecializationDropdown(false);
                }}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white"
              >
                <span className="text-gray-700">
                  {selectedSubjects.length === 0 
                    ? 'All Subjects' 
                    : `${selectedSubjects.length} subject${selectedSubjects.length > 1 ? 's' : ''} selected`
                  }
                </span>
                <Filter className="w-4 h-4 text-gray-400" />
              </button>
              
              {showSubjectDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    {allSubjects.map(subject => (
                      <label key={subject} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjects(prev => [...prev, subject]);
                            } else {
                              setSelectedSubjects(prev => prev.filter(s => s !== subject));
                            }
                          }}
                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Specialization Filter - Only show for tutors tab */}
            {activeTab === 'tutors' && (
              <div className="lg:w-64 relative dropdown-container">
                <button
                  onClick={() => {
                    setShowSpecializationDropdown(!showSpecializationDropdown);
                    setShowSubjectDropdown(false);
                  }}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white"
                >
                  <span className="text-gray-700">
                    {selectedSpecializations.length === 0 
                      ? selectedSubjects.length === 0 
                        ? 'Select subjects first' 
                        : 'All Specializations' 
                      : `${selectedSpecializations.length} specialization${selectedSpecializations.length > 1 ? 's' : ''} selected`
                    }
                  </span>
                  <Award className="w-4 h-4 text-gray-400" />
                </button>
                
                {showSpecializationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {availableTitles.length === 0 ? (
                        <div className="p-2 text-gray-500 text-sm">
                          {selectedSubjects.length === 0 ? 'Select a subject first' : 'No specializations available'}
                        </div>
                      ) : (
                        availableTitles.map(title => (
                          <label key={title} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSpecializations.includes(title)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSpecializations(prev => [...prev, title]);
                                } else {
                                  setSelectedSpecializations(prev => prev.filter(t => t !== title));
                                }
                              }}
                              className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{title}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Recently Saved</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedSubjects.length > 0 || selectedSpecializations.length > 0) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              
              {/* Subject filters */}
              {selectedSubjects.map(subject => (
                <span
                  key={`subject-${subject}`}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {subject}
                  <button
                    onClick={() => setSelectedSubjects(prev => prev.filter(s => s !== subject))}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              
              {/* Specialization filters */}
              {selectedSpecializations.map(specialization => (
                <span
                  key={`specialization-${specialization}`}
                  className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  {specialization}
                  <button
                    onClick={() => setSelectedSpecializations(prev => prev.filter(t => t !== specialization))}
                    className="hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              
              <button
                onClick={() => {
                  setSelectedSubjects([]);
                  setSelectedSpecializations([]);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'tutors' ? (
          /* Saved Tutors */
          <div>
            {filteredTutors.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No saved tutors found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedSubjects.length > 0 
                    ? 'Try adjusting your search or filters'
                    : 'Start saving your favorite tutors to see them here'}
                </p>
                <button
                  onClick={() => navigate('/student/find-tutors')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Find Tutors
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className={`bg-white rounded-xl border hover:shadow-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'p-6' : 'p-6 flex items-center gap-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      /* Grid View */
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <img
                            src={tutor.profilePicture}
                            alt={tutor.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <button
                            onClick={() => removeSavedTutor(tutor.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-gray-900">{tutor.name}</h3>
                            {tutor.verified && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{tutor.rating}</span>
                            <span className="text-gray-500">({tutor.totalReviews} reviews)</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tutor.subjects.map((subject) => (
                              <button
                                key={subject}
                                onClick={() => {
                                  if (selectedSubjects.includes(subject)) {
                                    setSelectedSubjects(prev => prev.filter(s => s !== subject));
                                  } else {
                                    setSelectedSubjects(prev => [...prev, subject]);
                                  }
                                }}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  selectedSubjects.includes(subject)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}
                              >
                                {subject}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tutor.specializations.map((specialization) => (
                              <button
                                key={specialization}
                                onClick={() => {
                                  if (selectedSpecializations.includes(specialization)) {
                                    setSelectedSpecializations(prev => prev.filter(t => t !== specialization));
                                  } else {
                                    setSelectedSpecializations(prev => [...prev, specialization]);
                                  }
                                }}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  selectedSpecializations.includes(specialization)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {specialization}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {tutor.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <GraduationCap className="w-4 h-4" />
                            {tutor.experience}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {tutor.totalStudents} students taught
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Saved {formatSavedDate(tutor.savedDate)}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              Rs. {tutor.hourlyRate.toLocaleString()}/hr
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/student/tutor-profile/${tutor.id}`)}
                          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          View Profile
                        </button>
                      </>
                    ) : (
                      /* List View */
                      <>
                        <img
                          src={tutor.profilePicture}
                          alt={tutor.name}
                          className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-xl text-gray-900">{tutor.name}</h3>
                            {tutor.verified && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{tutor.rating}</span>
                              <span className="text-gray-500">({tutor.totalReviews})</span>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600">{tutor.experience}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-600">{tutor.totalStudents} students</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tutor.subjects.map((subject) => (
                              <button
                                key={subject}
                                onClick={() => {
                                  if (selectedSubjects.includes(subject)) {
                                    setSelectedSubjects(prev => prev.filter(s => s !== subject));
                                  } else {
                                    setSelectedSubjects(prev => [...prev, subject]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                  selectedSubjects.includes(subject)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                }`}
                              >
                                {subject}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {tutor.specializations.map((specialization) => (
                              <button
                                key={specialization}
                                onClick={() => {
                                  if (selectedSpecializations.includes(specialization)) {
                                    setSelectedSpecializations(prev => prev.filter(t => t !== specialization));
                                  } else {
                                    setSelectedSpecializations(prev => [...prev, specialization]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                  selectedSpecializations.includes(specialization)
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              >
                                {specialization}
                              </button>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500">
                            Saved {formatSavedDate(tutor.savedDate)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              Rs. {tutor.hourlyRate.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">per hour</div>
                          </div>
                          <button
                            onClick={() => navigate(`/student/tutor-profile/${tutor.id}`)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => removeSavedTutor(tutor.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Saved Mass Classes */
          <div>
            {filteredClasses.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No saved classes found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedSubjects.length > 0 
                    ? 'Try adjusting your search or filters'
                    : 'Start saving your favorite classes to see them here'}
                </p>
                <button
                  onClick={() => navigate('/student/find-tutors')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Find Classes
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {filteredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className={`bg-white rounded-xl border hover:shadow-lg transition-all duration-200 ${
                      viewMode === 'grid' ? 'p-6' : 'p-6 flex items-center gap-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      /* Grid View */
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={classItem.tutor.profilePicture}
                              alt={classItem.tutor.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <button
                                onClick={() => {
                                  if (selectedSubjects.includes(classItem.subject)) {
                                    setSelectedSubjects(prev => prev.filter(s => s !== classItem.subject));
                                  } else {
                                    setSelectedSubjects(prev => [...prev, classItem.subject]);
                                  }
                                }}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                                  selectedSubjects.includes(classItem.subject)
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                }`}
                              >
                                {classItem.subject}
                              </button>
                              <div className="text-sm text-gray-600 mt-1">
                                by {classItem.tutor.name}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSavedClass(classItem.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{classItem.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{classItem.description}</p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{classItem.tutor.rating}</span>
                            {classItem.verified && (
                              <CheckCircle className="w-4 h-4 text-purple-600 ml-1" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {classItem.duration}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {classItem.schedule}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            {classItem.studentsEnrolled}/{classItem.maxStudents} students
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              classItem.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                              classItem.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {classItem.level}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="text-sm text-gray-500">
                            Saved {formatSavedDate(classItem.savedDate)}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">
                              Rs. {classItem.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">per month</div>
                          </div>
                        </div>

                        <button
                          onClick={() => navigate(`/student/mass-class/${classItem.id}`)}
                          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                        >
                          View Class
                        </button>
                      </>
                    ) : (
                      /* List View */
                      <>
                        <div className="flex items-center gap-4">
                          <img
                            src={classItem.tutor.profilePicture}
                            alt={classItem.tutor.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => {
                                if (selectedSubjects.includes(classItem.subject)) {
                                  setSelectedSubjects(prev => prev.filter(s => s !== classItem.subject));
                                } else {
                                  setSelectedSubjects(prev => [...prev, classItem.subject]);
                                }
                              }}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                selectedSubjects.includes(classItem.subject)
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              }`}
                            >
                              {classItem.subject}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xl text-gray-900 mb-1">{classItem.name}</h3>
                          <p className="text-gray-600 mb-2">{classItem.description}</p>
                          
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-gray-600">by {classItem.tutor.name}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{classItem.tutor.rating}</span>
                            </div>
                            {classItem.verified && (
                              <CheckCircle className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{classItem.schedule}</span>
                            <span>•</span>
                            <span>{classItem.studentsEnrolled}/{classItem.maxStudents} students</span>
                            <span>•</span>
                            <span>Saved {formatSavedDate(classItem.savedDate)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              Rs. {classItem.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">per month</div>
                          </div>
                          <button
                            onClick={() => navigate(`/student/mass-class/${classItem.id}`)}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                          >
                            View Class
                          </button>
                          <button
                            onClick={() => removeSavedClass(classItem.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
