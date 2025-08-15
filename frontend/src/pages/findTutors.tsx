import React, { useState, useEffect } from 'react';
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
import { tutorService, IndividualTutor, Subject, Title, TitleWithSubject } from '../api/TutorService';

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

export default function FindTutorsPage() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const convertBackendToFrontend = (backendTutors: IndividualTutor[]): Tutor[] => {
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
    if (tutorType !== 'Individual') {
      // For Mass tutors, we'll use mock data for now since the endpoint is only for Individual tutors
      setTutors([
        {
          id: "mass-1",
          name: "Engineering Academy",
          subjects: ["Mathematics", "Physics"],
          titles: ["Calculus", "Mechanics", "Thermodynamics"],
          rating: 4.5,
          reviewsCount: 200,
          hourlyRate: 2000,
          profilePicture: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
          type: "Mass",
          description: "Professional engineering preparation classes.",
          verified: true,
          totalStudents: 150,
          classSize: 25
        },
        {
          id: "mass-2",
          name: "Science Learning Center",
          subjects: ["Chemistry", "Biology", "Physics"],
          titles: ["Organic Chemistry", "Cell Biology", "Optics"],
          rating: 4.3,
          reviewsCount: 180,
          hourlyRate: 1800,
          profilePicture: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=150&h=150&fit=crop&crop=center",
          type: "Mass",
          description: "Comprehensive science education for all levels.",
          verified: true,
          totalStudents: 200,
          classSize: 30
        }
      ]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        subjects: selectedSubjects.length > 0 ? selectedSubjects.join(',') : undefined,
        titles: selectedTitles.length > 0 ? selectedTitles.join(',') : undefined,
        min_hourly_rate: hourlyRateRange[0],
        max_hourly_rate: hourlyRateRange[1],
        rating: minRating > 0 ? minRating : undefined,
        sort: (sortBy === 'rating' ? 'rating_desc' : 
              sortBy === 'hourly_rate_asc' ? 'price_asc' : 
              sortBy === 'hourly_rate_desc' ? 'price_desc' : 'rating_desc') as 'rating_desc' | 'price_asc' | 'price_desc' | 'rating_asc' | 'all'
      };

      const backendTutors = await tutorService.getIndividualTutors(filters);
      const convertedTutors = convertBackendToFrontend(backendTutors);
      setTutors(convertedTutors);
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
  }, [tutorType, selectedSubjects, selectedTitles, hourlyRateRange, minRating, sortBy]);

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
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Tutor</h1>
          <p className="text-xl text-gray-600">Connect with qualified tutors for personalized learning</p>
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
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-gray-700">{subject.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Titles */}
              {titles.length > 0 && (
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

              {/* Hourly Rate Range */}
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

              {/* Minimum Rating */}
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

              {/* Sort By */}
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
            </div>
          </div>

          {/* Tutors Grid */}
          <div className="lg:w-2/3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {filteredTutors.length} {tutorType} Tutor{filteredTutors.length !== 1 ? 's' : ''} Found
              </h2>
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Sorted by {sortBy === 'rating' ? 'Rating' : sortBy === 'hourly_rate_asc' ? 'Price (Low)' : 'Price (High)'}
                </span>
              </div>
            </div>

            {/* Tutors Grid */}
            {loading ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading tutors...</h3>
                <p className="text-gray-500">Please wait while we fetch the best tutors for you</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <X className="w-16 h-16 mx-auto mb-4 text-red-300" />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Tutors</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchTutors}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Try Again
                </button>
              </div>
            ) : filteredTutors.length === 0 ? (
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
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                Rs. {tutor.hourlyRate.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">per hour</div>
                            </div>
                            <button
                              onClick={() => toggleSaveTutor(tutor.id)}
                              className={`p-2 rounded-full transition-colors ${
                                savedTutors.includes(tutor.id)
                                  ? 'text-red-500 hover:text-red-600'
                                  : 'text-gray-400 hover:text-gray-500'
                              }`}
                            >
                              <Bookmark className={`w-5 h-5 ${savedTutors.includes(tutor.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Subjects and Titles */}
                        <div className="mb-3">
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

                        {/* Additional Info for Mass Tutors */}
                        {tutor.type === 'Mass' && (
                          <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              <span>Class Size: {tutor.classSize}</span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              <span>Total Students: {tutor.totalStudents}</span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                            View Profile
                          </button>
                          <button className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                            {tutor.type === 'Individual' ? 'Book Session' : 'Join Class'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
