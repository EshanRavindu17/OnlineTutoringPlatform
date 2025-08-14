import { useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  Bookmark, 
  Languages, 
  CheckCircle,
  X
} from 'lucide-react';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';

interface Tutor {
  id: number;
  name: string;
  subject: string;
  subSubjects: string[];
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  imageUrl: string;
  availability: string;
  description: string;
  verified: boolean;
  topTutor: boolean;
  languages: string[];
}

export default function FindTutorsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 80]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('Any Time');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [savedTutors, setSavedTutors] = useState<number[]>([2, 5]);
  
  // Mock data for tutors
  const tutors: Tutor[] = [
    {
      id: 1,
      name: "Dr. Rebecca Chen",
      subject: "Mathematics",
      subSubjects: ["Calculus", "Linear Algebra", "Statistics"],
      rating: 4.9,
      reviewsCount: 127,
      hourlyRate: 45,
      imageUrl: "/api/placeholder/100/100",
      availability: "Today",
      description: "Mathematics professor with 10+ years of experience teaching college-level calculus, linear algebra, and statistics.",
      verified: true,
      topTutor: true,
      languages: ["English", "Mandarin"]
    },
    {
      id: 2,
      name: "Michael Johnson",
      subject: "Computer Science",
      subSubjects: ["Python", "Data Structures", "Algorithms"],
      rating: 4.8,
      reviewsCount: 93,
      hourlyRate: 50,
      imageUrl: "/api/placeholder/100/100",
      availability: "Tomorrow",
      description: "Software engineer with expertise in programming fundamentals, algorithms, and preparing students for technical interviews.",
      verified: true,
      topTutor: true,
      languages: ["English"]
    },
    {
      id: 3,
      name: "Sophia Martinez",
      subject: "Chemistry",
      subSubjects: ["Organic Chemistry", "Biochemistry"],
      rating: 4.7,
      reviewsCount: 85,
      hourlyRate: 40,
      imageUrl: "/api/placeholder/100/100",
      availability: "This Week",
      description: "Chemistry researcher and experienced tutor specializing in organic chemistry and biochemistry for undergraduate students.",
      verified: true,
      topTutor: false,
      languages: ["English", "Spanish"]
    },
    {
      id: 4,
      name: "James Wilson",
      subject: "Physics",
      subSubjects: ["Mechanics", "Electromagnetism", "Quantum Physics"],
      rating: 4.6,
      reviewsCount: 72,
      hourlyRate: 55,
      imageUrl: "/api/placeholder/100/100",
      availability: "Today",
      description: "Physics PhD with a talent for breaking down complex concepts into understandable explanations for high school and college students.",
      verified: true,
      topTutor: false,
      languages: ["English"]
    },
    {
      id: 5,
      name: "Emma Davis",
      subject: "English",
      subSubjects: ["Essay Writing", "Literature", "Grammar"],
      rating: 4.9,
      reviewsCount: 114,
      hourlyRate: 35,
      imageUrl: "/api/placeholder/100/100",
      availability: "Tomorrow",
      description: "English teacher with expertise in essay writing, literary analysis, and college application essays.",
      verified: true,
      topTutor: true,
      languages: ["English", "French"]
    },
    {
      id: 6,
      name: "Dr. David Kim",
      subject: "Biology",
      subSubjects: ["Genetics", "Cell Biology", "Ecology"],
      rating: 4.8,
      reviewsCount: 91,
      hourlyRate: 50,
      imageUrl: "/api/placeholder/100/100",
      availability: "This Week",
      description: "Biology professor who specializes in making complex biological concepts accessible to students at all levels.",
      verified: true,
      topTutor: false,
      languages: ["English", "Korean"]
    }
  ];

  const subjects: string[] = [
    "All Subjects",
    "Mathematics",
    "English",
    "Science",
    "Computer Science",
    "History",
    "Foreign Languages",
    "Physics",
    "Chemistry",
    "Biology",
    "Economics",
    "Business"
  ];

  const toggleSaveTutor = (tutorId: number): void => {
    if (savedTutors.includes(tutorId)) {
      setSavedTutors(savedTutors.filter(id => id !== tutorId));
    } else {
      setSavedTutors([...savedTutors, tutorId]);
    }
  };

  const toggleFilters = (): void => {
    setShowFilters(!showFilters);
  };

  const filteredTutors = tutors.filter((tutor) => {
    // Filter by search query
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tutor.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tutor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tutor.subSubjects.some(sub => sub.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by subject
    const matchesSubject = selectedSubject === 'All Subjects' || tutor.subject === selectedSubject;
    
    // Filter by price range
    const matchesPrice = tutor.hourlyRate >= priceRange[0] && tutor.hourlyRate <= priceRange[1];
    
    // Filter by rating
    const matchesRating = tutor.rating >= ratingFilter;
    
    // Filter by availability (simplified for the example)
    const matchesAvailability = availabilityFilter === 'Any Time' || 
                               (availabilityFilter === 'Today' && tutor.availability === 'Today') ||
                               (availabilityFilter === 'This Week' && (tutor.availability === 'Today' || tutor.availability === 'Tomorrow' || tutor.availability === 'This Week'));
    
    return matchesSearch && matchesSubject && matchesPrice && matchesRating && matchesAvailability;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-600">{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar/>
      {/* Hero section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Tutor</h1>
          <p className="text-lg text-blue-100 max-w-3xl">
            Connect with expert tutors in any subject to achieve your academic goals. Filter by subject, availability, and price to find the right match for your learning needs.
          </p>
        </div>
      </div>

      {/* Search and filters section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white shadow-sm -mt-6 rounded-t-lg">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by tutor name, subject, or keyword..."
            />
          </div>
          <div className="sm:w-64">
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
          <button 
            onClick={toggleFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range (per hour)
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative mt-1 rounded-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="pl-8 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Min"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative mt-1 rounded-md w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="pl-8 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <div className="relative">
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Any Time">Any Time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Clock size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <div className="flex items-center space-x-2">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating + 1)}
                    className={`p-1 rounded-md hover:bg-gray-100 ${ratingFilter === rating + 1 ? 'bg-gray-100' : ''}`}
                  >
                    <Star size={24} className={ratingFilter > rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                  </button>
                ))}
                <button 
                  onClick={() => setRatingFilter(0)} 
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              <button 
                onClick={toggleFilters}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Close Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            {filteredTutors.length} tutors available
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="block w-auto pl-3 pr-8 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option>Recommended</option>
              <option>Highest Rated</option>
              <option>Lowest Price</option>
              <option>Highest Price</option>
            </select>
          </div>
        </div>

        {filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredTutors.map((tutor) => (
              <div key={tutor.id} className="bg-white shadow overflow-hidden rounded-lg">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <img className="h-20 w-20 rounded-full object-cover" src={tutor.imageUrl} alt={tutor.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 flex items-center">
                            {tutor.name}
                            {tutor.verified && (
                              <CheckCircle size={16} className="ml-2 text-blue-600 flex-shrink-0" />
                            )}
                            {tutor.topTutor && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Top Tutor
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-blue-600 font-medium">{tutor.subject} Tutor</p>
                          <div className="mt-1 flex items-center">
                            {renderStars(tutor.rating)}
                            <span className="ml-2 text-sm text-gray-500">({tutor.reviewsCount} reviews)</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => toggleSaveTutor(tutor.id)}
                            className={`p-2 rounded-full ${
                              savedTutors.includes(tutor.id) 
                              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                              : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            <Bookmark size={20} className={savedTutors.includes(tutor.id) ? "fill-blue-600" : ""} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 line-clamp-2">{tutor.description}</p>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tutor.subSubjects.map((subject) => (
                          <span 
                            key={subject} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-sm">
                        <DollarSign size={16} className="mr-1.5 text-gray-500 flex-shrink-0" />
                        <span className="font-medium">${tutor.hourlyRate}</span>
                        <span className="text-gray-500 ml-1">/ hour</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock size={16} className="mr-1.5 text-gray-500 flex-shrink-0" />
                        <span className={`${
                          tutor.availability === 'Today' ? 'text-green-600' : 
                          tutor.availability === 'Tomorrow' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          Available {tutor.availability}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Languages size={16} className="mr-1.5 text-gray-500 flex-shrink-0" />
                        <span>{tutor.languages.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-end md:justify-start md:col-span-1">
                        <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          View Profile
                        </button>
                        <button className="ml-3 px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          Book Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100">
              <X size={32} className="text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No tutors found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your filters or search query to find more tutors.
            </p>
            <div className="mt-4">
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('All Subjects');
                  setPriceRange([20, 80]);
                  setAvailabilityFilter('Any Time');
                  setRatingFilter(0);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}
        
        {filteredTutors.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
              </a>
              {[1, 2, 3].map((page) => (
                <a
                  key={page}
                  href="#"
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    page === 1 ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  } text-sm font-medium`}
                >
                  {page}
                </a>
              ))}
              <a
                href="#"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
              </a>
            </nav>
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}
