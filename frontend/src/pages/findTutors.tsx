import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Star, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  Bookmark, 
  BookOpen, 
  Users,
  User,
  X,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import { tutorService, TutorProfile, Subject, Title, TitleWithSubject } from '../api/TutorService';

import { useAuth } from '../context/authContext';

interface Tutor {
  id: string;
  name: string;
  subjects: string[];
  titles: string[];
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  profilePicture: string;
  type: 'Individual' | 'Mass';
  description: string;
  verified: boolean;
  totalStudents?: number;
  classSize?: number;
}

interface GroupClass {
  id: string;
  name: string;
  subject: string;
  date: string;
  tutor: {
    id: string;
    name: string;
    profilePicture: string;
    rating: number;
  };
  description: string;
  price: number;
  duration: string;
  studentsEnrolled: number;
  verified: boolean;
}

export default function FindTutorsPage() {
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  // Main filters
  const [tutorType, setTutorType] = useState<'Individual' | 'Mass'>('Individual');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [hourlyRateRange, setHourlyRateRange] = useState<[number, number]>([1000, 8000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'hourly_rate_asc' | 'hourly_rate_desc'>('rating');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedTutors, setSavedTutors] = useState<string[]>([]);
  
  // API states
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [groupClasses, setGroupClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search states for group classes
  const [classNameSearch, setClassNameSearch] = useState('');

  // Mock data for group classes (temporary until backend is built)
  const mockGroupClasses: GroupClass[] = [
    {
      id: "class-1",
      name: "Advanced Mathematics Masterclass",
      subject: "Mathematics",
      date: "2025-09-15",
      tutor: {
        id: "tutor-1",
        name: "Dr. Sarah Johnson",
        profilePicture: "https://images.unsplash.com/photo-1494790108755-2616c18b3d9d?w=150&h=150&fit=crop&crop=center",
        rating: 4.8
      },
      description: "Comprehensive calculus and algebra preparation for advanced students",
      price: 12000,
      duration: "2 hours",
      studentsEnrolled: 18,
      verified: true
    },
    {
      id: "class-2",
      name: "Physics Fundamentals Workshop",
      subject: "Physics",
      date: "2025-09-18",
      tutor: {
        id: "tutor-2",
        name: "Prof. Michael Chen",
        profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=center",
        rating: 4.6
      },
      description: "Interactive physics workshop covering mechanics and thermodynamics",
      price: 10000,
      duration: "1.5 hours",
      studentsEnrolled: 22,
      verified: true
    },
    {
      id: "class-3",
      name: "Chemistry Lab Experience",
      subject: "Chemistry",
      date: "2025-09-20",
      tutor: {
        id: "tutor-3",
        name: "Dr. Emily Rodriguez",
        profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=center",
        rating: 4.7
      },
      description: "Hands-on chemistry experiments and theoretical concepts",
      price: 15000,
      duration: "2.5 hours",
      studentsEnrolled: 15,
      verified: true
    },
    {
      id: "class-4",
      name: "English Literature Circle",
      subject: "English",
      date: "2025-09-22",
      tutor: {
        id: "tutor-4",
        name: "Ms. Amanda Williams",
        profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=center",
        rating: 4.9
      },
      description: "Explore classic and modern literature with interactive discussions",
      price: 8000,
      duration: "1.5 hours",
      studentsEnrolled: 12,
      verified: true
    },
    {
      id: "class-5",
      name: "Biology Deep Dive",
      subject: "Biology",
      date: "2025-09-25",
      tutor: {
        id: "tutor-5",
        name: "Dr. Robert Kumar",
        profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=center",
        rating: 4.5
      },
      description: "Comprehensive biology concepts from cellular to ecosystem level",
      price: 11000,
      duration: "2 hours",
      studentsEnrolled: 20,
      verified: true
    }
  ];
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [tutorsPerPage] = useState(6); // Fixed number of tutors per page
  
  // Data from API
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [titles, setTitles] = useState<TitleWithSubject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingTitles, setLoadingTitles] = useState(false);

  // Get available titles (since we only fetch titles for selected subjects, return all)
  const getAvailableTitles = (): TitleWithSubject[] => {
    return titles;
  };

  // Function to convert backend data to frontend format
  const convertBackendToFrontend = (backendTutors: TutorProfile[]): Tutor[] => {
    return backendTutors.map(tutor => ({
      id: tutor.i_tutor_id,
      name: tutor.User?.name || 'Unknown Tutor',
      subjects: tutor.subjects,
      titles: tutor.titles,
      rating: Number(tutor.rating) || 0,
      reviewsCount: Math.floor(Math.random() * 200) + 10, // Mock review count for now
      hourlyRate: Number(tutor.hourly_rate) || 0,
      profilePicture: tutor.User?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.User?.name || 'Tutor')}&background=random`,
      type: 'Individual' as const,
      description: tutor.description || 'Experienced tutor',
      verified: true
    }));
  };

  // Fetch tutors from API
  const fetchTutors = async () => {
    if (tutorType === 'Mass') {
      // For Mass tutors/group classes, use mock data and apply frontend filtering
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Apply filtering based on class name, tutor name and selected subjects
        let filteredClasses = mockGroupClasses;
        
        if (classNameSearch.trim()) {
          filteredClasses = filteredClasses.filter(cls =>
            cls.name.toLowerCase().includes(classNameSearch.toLowerCase()) ||
            cls.tutor.name.toLowerCase().includes(classNameSearch.toLowerCase())
          );
        }
        
        // Filter by selected subjects
        if (selectedSubjects.length > 0) {
          const selectedSubjectNames = subjects
            .filter(subject => selectedSubjects.includes(subject.sub_id))
            .map(subject => subject.name);
          
          filteredClasses = filteredClasses.filter(cls =>
            selectedSubjectNames.some(subjectName =>
              cls.subject.toLowerCase().includes(subjectName.toLowerCase())
            )
          );
        }
        
        setGroupClasses(filteredClasses);
        setTutors([]); // Clear individual tutors when showing group classes
        setTotalTutors(filteredClasses.length);
      } catch (err) {
        setError('Failed to fetch group classes. Please try again.');
        console.error('Error fetching group classes:', err);
        setGroupClasses([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle Individual tutors
    setLoading(true);
    setError(null);
    
    try {
      // Convert subject IDs to subject names for the API
      const selectedSubjectNames = selectedSubjects.length > 0 
        ? subjects
            .filter(subject => selectedSubjects.includes(subject.sub_id))
            .map(subject => subject.name)
            .join(',')
        : undefined;
      
      console.log('Selected subject IDs:', selectedSubjects);
      console.log('Converted subject names for API:', selectedSubjectNames);
      console.log('Selected title names:', selectedTitles);
      
      const filters = {
        subjects: selectedSubjectNames,
        titles: selectedTitles.length > 0 ? selectedTitles.join(',') : undefined,
        min_hourly_rate: hourlyRateRange[0],
        max_hourly_rate: hourlyRateRange[1],
        rating: minRating > 0 ? minRating : undefined,
        sort: (sortBy === 'rating' ? 'rating_desc' : 
              sortBy === 'hourly_rate_asc' ? 'price_asc' : 
              sortBy === 'hourly_rate_desc' ? 'price_desc' : 'rating_desc') as 'rating_desc' | 'price_asc' | 'price_desc' | 'rating_asc' | 'all',
        page: currentPage,
        limit: tutorsPerPage
      };

      const backendTutors = await tutorService.getIndividualTutors(filters);
      const convertedTutors = convertBackendToFrontend(backendTutors);
      setTutors(convertedTutors);
      
      // If we got fewer tutors than requested, we're on the last page
      // This is a simple way to handle pagination without total count from backend
      if (backendTutors.length < tutorsPerPage) {
        setTotalTutors((currentPage - 1) * tutorsPerPage + backendTutors.length);
      } else {
        // Estimate total based on current page - this is not perfect but works for basic pagination
        setTotalTutors(currentPage * tutorsPerPage + 1); // +1 to indicate there might be more
      }
    } catch (err) {
      setError('Failed to fetch tutors. Please try again.');
      console.error('Error fetching tutors:', err);
      // Fallback to empty array
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects from API
  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const subjectsData = await tutorService.getAllSubjects();
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to fetch subjects');
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch titles from API for selected subjects only
  const fetchTitlesForSelectedSubjects = async () => {
    if (selectedSubjects.length === 0) {
      setTitles([]);
      setSelectedTitles([]);
      return;
    }

    setLoadingTitles(true);
    try {
      console.log('Fetching titles for selected subjects:', selectedSubjects);
      const allTitles: Title[] = [];
      
      // Fetch titles for each selected subject
      for (const subjectId of selectedSubjects) {
        const titlesData = await tutorService.getTitlesBySubject(subjectId);
        allTitles.push(...titlesData);
      }
      
      console.log('Fetched titles:', allTitles);
      
      // Convert Title[] to TitleWithSubject[] for consistency with existing state
      const titlesWithSubjects: TitleWithSubject[] = allTitles.map(title => {
        const subject = subjects.find(s => s.sub_id === title.sub_id);
        return {
          name: title.name,
          Subjects: {
            name: subject?.name || 'Unknown'
          }
        };
      });
      
      setTitles(titlesWithSubjects);
    } catch (err) {
      console.error('Error fetching titles:', err);
      setError('Failed to fetch titles');
    } finally {
      setLoadingTitles(false);
    }
  };

  // Effect to fetch tutors when filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTutors();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [tutorType, selectedSubjects, selectedTitles, hourlyRateRange, minRating, sortBy, currentPage, classNameSearch]);

  // Effect to reset to page 1 when filters change (excluding currentPage itself)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [tutorType, selectedSubjects, selectedTitles, hourlyRateRange, minRating, sortBy, classNameSearch]);

  // Effect to fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Effect to fetch titles when selected subjects change
  useEffect(() => {
    fetchTitlesForSelectedSubjects();
  }, [selectedSubjects]);

  // Filter tutors based on search query (client-side filtering for search)
  const filteredTutors = tutors.filter(tutor => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tutor.name.toLowerCase().includes(query) ||
        tutor.subjects.some(subject => subject.toLowerCase().includes(query)) ||
        tutor.titles.some(title => title.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Handle subject selection
  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        // Remove subject and related titles
        const newSubjects = prev.filter(s => s !== subjectId);
        setSelectedTitles(prevTitles => 
          prevTitles.filter(title => newSubjects.includes(title))
        );
        return newSubjects;
      } else {
        return [...prev, subjectId];
      }
    });
  };

  // Handle title selection (now using title names)
  const handleTitleToggle = (titleName: string) => {
    setSelectedTitles(prev => {
      if (prev.includes(titleName)) {
        return prev.filter(t => t !== titleName);
      } else {
        return [...prev, titleName];
      }
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedSubjects([]);
    setSelectedTitles([]);
    setHourlyRateRange([1000, 8000]);
    setMinRating(0);
    setSortBy('rating');
    setSearchQuery('');
    setClassNameSearch('');
    setCurrentPage(1);
  };

  const toggleSaveTutor = (tutorId: string) => {
    setSavedTutors(prev => {
      if (prev.includes(tutorId)) {
        return prev.filter(id => id !== tutorId);
      } else {
        return [...prev, tutorId];
      }
    });
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

       {/* heading section */}
      <div className="container mx-auto px-4 py-8 ">
        {/* Page Header */}
        <div className="text-center mb-8 bg-gradient-to-bl from-blue-500 to-purple-500 p-10 rounded-lg">
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Perfect Tutor</h1>
          <p className="text-xl text-white">Connect with qualified tutors for personalized learning</p>
        </div>

        {/* Tutor Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Select Tutor Type</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setTutorType('Individual')}
              className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
                tutorType === 'Individual'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <User className={`w-8 h-8 ${tutorType === 'Individual' ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${tutorType === 'Individual' ? 'text-blue-700' : 'text-gray-700'}`}>
                Individual Tutoring
              </h3>
              <p className="text-gray-600 text-sm">
                One-on-one personalized lessons with dedicated tutors
              </p>
            </button>
            
            <button
              onClick={() => setTutorType('Mass')}
              className={`flex-1 p-6 rounded-xl border-2 transition-all duration-300 ${
                tutorType === 'Mass'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-3">
                <Users className={`w-8 h-8 ${tutorType === 'Mass' ? 'text-purple-500' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${tutorType === 'Mass' ? 'text-purple-700' : 'text-gray-700'}`}>
                Group Classes
              </h3>
              <p className="text-gray-600 text-sm">
                Learn with other students in structured group sessions
              </p>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/3">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-5 h-5 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            <div className={`bg-white rounded-xl shadow-lg p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                {tutorType === 'Mass' ? (
                  // Group Classes Search - By class name and tutor name
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by class name or tutor name..."
                      value={classNameSearch}
                      onChange={(e) => setClassNameSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  // Individual Tutors Search
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search tutors, subjects, or titles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Subjects */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Subjects ({selectedSubjects.length} selected)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {loadingSubjects ? (
                    <div className="text-gray-500">Loading subjects...</div>
                  ) : (
                    subjects.map(subject => (
                      <label key={subject.sub_id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(subject.sub_id)}
                          onChange={() => handleSubjectToggle(subject.sub_id)}
                          className={`w-4 h-4 border-gray-300 rounded focus:ring-2 ${
                            tutorType === 'Mass' 
                              ? 'text-purple-600 focus:ring-purple-500' 
                              : 'text-blue-600 focus:ring-blue-500'
                          }`}
                        />
                        <span className="ml-3 text-gray-700">{subject.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Titles - Only show for Individual tutors */}
              {tutorType === 'Individual' && titles.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Titles ({selectedTitles.length} selected)
                    {selectedSubjects.length > 0 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (filtered by selected subjects)
                      </span>
                    )}
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loadingTitles ? (
                      <div className="text-gray-500">Loading titles...</div>
                    ) : getAvailableTitles().length > 0 ? (
                      getAvailableTitles().map((title, index) => (
                        <label key={`${title.name}-${index}`} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedTitles.includes(title.name)}
                            onChange={() => handleTitleToggle(title.name)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-700">
                            {title.name} <span className="text-xs text-gray-500">({title.Subjects.name})</span>
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-gray-500">
                        {selectedSubjects.length > 0 
                          ? 'No titles available for selected subjects' 
                          : 'No titles available'
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hourly Rate Range - Only show for Individual tutors */}
              {tutorType === 'Individual' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Hourly Rate (Rs. {hourlyRateRange[0]} - Rs. {hourlyRateRange[1]})
                  </label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Minimum Rate</label>
                      <input
                        type="range"
                        min={500}
                        max={8000}
                        step={100}
                        value={hourlyRateRange[0]}
                        onChange={(e) => setHourlyRateRange([parseInt(e.target.value), hourlyRateRange[1]])}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Maximum Rate</label>
                      <input
                        type="range"
                        min={500}
                        max={8000}
                        step={100}
                        value={hourlyRateRange[1]}
                        onChange={(e) => setHourlyRateRange([hourlyRateRange[0], parseInt(e.target.value)])}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Minimum Rating - Only show for Individual tutors */}
              {tutorType === 'Individual' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <div className="space-y-2">
                    {[0, 3, 4, 4.5].map(rating => (
                      <label key={rating} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="rating"
                          checked={minRating === rating}
                          onChange={() => setMinRating(rating)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex items-center">
                          {rating === 0 ? (
                            <span className="text-gray-700">Any Rating</span>
                          ) : (
                            <>
                              <div className="flex mr-2">
                                {renderStars(rating)}
                              </div>
                              <span className="text-gray-700">{rating}+ Stars</span>
                            </>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sort By - Only show for Individual tutors */}
              {tutorType === 'Individual' && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="rating">Highest Rating</option>
                    <option value="hourly_rate_asc">Price: Low to High</option>
                    <option value="hourly_rate_desc">Price: High to Low</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Tutors Grid */}
          <div className="lg:w-2/3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {loading ? 'Loading...' : tutorType === 'Mass' 
                  ? `${groupClasses.length} Group Class${groupClasses.length !== 1 ? 'es' : ''} Found`
                  : `${filteredTutors.length} ${tutorType} Tutor${filteredTutors.length !== 1 ? 's' : ''} Found`
                }
                {!loading && totalTutors > tutorsPerPage && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    (Page {currentPage})
                  </span>
                )}
              </h2>
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {tutorType === 'Mass' ? 'Filtered by Class/Tutor Name & Subject Selection' : 
                   `Sorted by ${sortBy === 'rating' ? 'Rating' : sortBy === 'hourly_rate_asc' ? 'Price (Low)' : 'Price (High)'}`}
                </span>
              </div>
            </div>

            {/* Content Grid */}
            {loading ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Loading {tutorType === 'Mass' ? 'group classes' : 'tutors'}...
                </h3>
                <p className="text-gray-500">Please wait while we fetch the best {tutorType === 'Mass' ? 'classes' : 'tutors'} for you</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <X className="w-16 h-16 mx-auto mb-4 text-red-300" />
                <h3 className="text-xl font-semibold text-red-600 mb-2">
                  Error Loading {tutorType === 'Mass' ? 'Group Classes' : 'Tutors'}
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchTutors}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : tutorType === 'Mass' ? (
              // Group Classes Grid
              groupClasses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No group classes found</h3>
                  <p className="text-gray-500">Try adjusting your search terms to see more results</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {groupClasses.map(groupClass => (
                    <div key={groupClass.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
                      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        {/* Tutor Profile Picture */}
                        <div className="flex-shrink-0">
                          <img
                            src={groupClass.tutor.profilePicture}
                            alt={groupClass.tutor.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-purple-100"
                          />
                        </div>

                        {/* Class Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                            <div>
                              <div className="flex items-center mb-2">
                                <h3 className="text-xl font-bold text-gray-900 mr-3">{groupClass.name}</h3>
                                {groupClass.verified && (
                                  <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    Verified
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 mb-2">
                                {renderStars(groupClass.tutor.rating)}
                                <span className="text-sm text-gray-600 ml-2">
                                  {groupClass.tutor.rating} • by {groupClass.tutor.name}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-purple-600 mb-1">
                                Rs. {groupClass.price.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">per month</div>
                            </div>
                          </div>

                          {/* Class Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                              <span className="font-semibold text-purple-700">{groupClass.subject}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2 text-purple-500" />
                              <span>{new Date(groupClass.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 mr-2 text-purple-500" />
                              <span>{groupClass.duration} per session</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-purple-500" />
                              <span>{groupClass.studentsEnrolled} Students</span>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{groupClass.description}</p>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                              onClick={() => navigate(`/mass-tutor-profile/${groupClass.tutor.id}`)}
                              className="flex-1 bg-purple-100 text-purple-700 px-6 py-3 rounded-lg hover:bg-purple-200 transition-colors font-semibold text-center flex items-center justify-center"
                            >
                              <User className="w-4 h-4 mr-2" />
                              View Tutor
                            </button>
                            <button
                              onClick={() => navigate(`/mass-class/${groupClass.id}`)}
                              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold text-center flex items-center justify-center"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              View Class
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // Individual Tutors Grid
              filteredTutors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No tutors found</h3>
                  <p className="text-gray-500">Try adjusting your filters to see more results</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredTutors.map(tutor => (
                    <div key={tutor.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                          <img
                            src={tutor.profilePicture}
                            alt={tutor.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-100"
                          />
                        </div>

                        {/* Tutor Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                            <div>
                              <div className="flex items-center mb-2">
                                <h3 className="text-xl font-bold text-gray-900 mr-2">{tutor.name}</h3>
                                {tutor.verified && (
                                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    Verified
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 mb-2">
                                {renderStars(tutor.rating)}
                                <span className="text-sm text-gray-600 ml-2">
                                  {tutor.rating} ({tutor.reviewsCount} reviews)
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600 mb-1">
                                Rs. {tutor.hourlyRate.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">per hour</div>
                            </div>
                          </div>

                          {/* Subjects and Titles */}
                          <div className="mb-4">
                            <div className="mb-2">
                              <span className="text-sm font-semibold text-gray-700 mr-2">Subjects:</span>
                              <div className="flex flex-wrap gap-1">
                                {tutor.subjects.map(subject => (
                                  <span
                                    key={subject}
                                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-gray-700 mr-2">Specializations:</span>
                              <div className="flex flex-wrap gap-1">
                                {tutor.titles.map(title => (
                                  <span
                                    key={title}
                                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {title}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-600 text-sm mb-4">{tutor.description}</p>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                              onClick={() => {navigate(`/tutor-profile/${tutor.id}`)}}
                              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                              View Profile
                            </button>
                            <button 
                              onClick={() => {currentUser? navigate(`/book-session/${tutor.id}`) : navigate('/auth')}}
                              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                              Book Session
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Pagination Controls */}
            {!loading && !error && filteredTutors.length > 0 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {(() => {
                    const maxPages = Math.ceil(totalTutors / tutorsPerPage);
                    const pages = [];
                    const startPage = Math.max(1, currentPage - 2);
                    const endPage = Math.min(maxPages, startPage + 4);

                    // Show first page if not in range
                    if (startPage > 1) {
                      pages.push(1);
                      if (startPage > 2) {
                        pages.push('...');
                      }
                    }

                    // Show page numbers in range
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(i);
                    }

                    // Show last page if not in range
                    if (endPage < maxPages) {
                      if (endPage < maxPages - 1) {
                        pages.push('...');
                      }
                      pages.push(maxPages);
                    }

                    return pages.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                        disabled={page === '...' || page === currentPage}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          page === currentPage
                            ? 'bg-blue-600 text-white shadow-lg'
                            : page === '...'
                            ? 'bg-transparent text-gray-400 cursor-default'
                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={tutors.length < tutorsPerPage}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      tutors.length < tutorsPerPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Results Info */}
            {!loading && !error && filteredTutors.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                Showing {((currentPage - 1) * tutorsPerPage) + 1} to {Math.min(currentPage * tutorsPerPage, totalTutors)} of {totalTutors}+ results
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
