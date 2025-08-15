import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Users, DollarSign, BookOpen, ChevronDown, Grid, List, ArrowUpDown, Heart, ShoppingCart, Play } from 'lucide-react';
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Course {
  id: number;
  title: string;
  subtitle: string;
  instructor: string;
  instructorImage: string;
  category: string;
  level: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  duration: string;
  lessons: number;
  thumbnail: string;
  tags: string[];
  isPopular: boolean;
  isBestseller: boolean;
  isNewRelease: boolean;
  lastUpdated: string;
  language: string;
  hasClosedCaptions: boolean;
  certificateOfCompletion: boolean;
}

const ViewAllCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [cart, setCart] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for courses
  const mockCourses = [
    {
      id: 1,
      title: "Complete React Development Bootcamp",
      subtitle: "Build modern web applications with React and JavaScript",
      instructor: "Sarah Johnson",
      instructorImage: "/api/placeholder/40/40",
      category: "Technology",
      level: "Intermediate",
      price: 89.99,
      originalPrice: 129.99,
      rating: 4.8,
      reviewCount: 2156,
      studentCount: 12450,
      duration: "42 hours",
      lessons: 156,
      thumbnail: "/api/placeholder/400/225",
      tags: ["React", "JavaScript", "Web Development"],
      isPopular: true,
      isBestseller: false,
      isNewRelease: false,
      lastUpdated: "2024-11-15",
      language: "English",
      hasClosedCaptions: true,
      certificateOfCompletion: true
    },
    {
      id: 2,
      title: "Advanced Mathematics for Engineers",
      subtitle: "Master calculus, linear algebra, and differential equations",
      instructor: "Dr. Michael Chen",
      instructorImage: "/api/placeholder/40/40",
      category: "Mathematics",
      level: "Advanced",
      price: 0,
      originalPrice: 0,
      rating: 4.6,
      reviewCount: 892,
      studentCount: 5230,
      duration: "28 hours",
      lessons: 84,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Calculus", "Linear Algebra", "Engineering"],
      isPopular: false,
      isBestseller: false,
      isNewRelease: true,
      lastUpdated: "2024-11-10",
      language: "English",
      hasClosedCaptions: true,
      certificateOfCompletion: true
    },
    {
      id: 3,
      title: "Spanish for Beginners",
      subtitle: "Learn Spanish from scratch with interactive lessons",
      instructor: "Maria Rodriguez",
      instructorImage: "/api/placeholder/40/40",
      category: "Languages",
      level: "Beginner",
      price: 49.99,
      originalPrice: 79.99,
      rating: 4.9,
      reviewCount: 3421,
      studentCount: 18650,
      duration: "35 hours",
      lessons: 120,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Spanish", "Beginner", "Conversation"],
      isPopular: true,
      isBestseller: true,
      isNewRelease: false,
      lastUpdated: "2024-11-12",
      language: "Spanish",
      hasClosedCaptions: true,
      certificateOfCompletion: true
    },
    {
      id: 4,
      title: "Digital Marketing Masterclass",
      subtitle: "Complete guide to modern digital marketing strategies",
      instructor: "Alex Thompson",
      instructorImage: "/api/placeholder/40/40",
      category: "Business",
      level: "All Levels",
      price: 69.99,
      originalPrice: 99.99,
      rating: 4.7,
      reviewCount: 1567,
      studentCount: 8940,
      duration: "38 hours",
      lessons: 145,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Marketing", "SEO", "Social Media"],
      isPopular: false,
      isBestseller: false,
      isNewRelease: false,
      lastUpdated: "2024-11-08",
      language: "English",
      hasClosedCaptions: true,
      certificateOfCompletion: true
    },
    {
      id: 5,
      title: "Watercolor Painting Fundamentals",
      subtitle: "Create beautiful watercolor paintings step by step",
      instructor: "Emma Williams",
      instructorImage: "/api/placeholder/40/40",
      category: "Arts & Design",
      level: "Beginner",
      price: 39.99,
      originalPrice: 59.99,
      rating: 4.5,
      reviewCount: 756,
      studentCount: 3210,
      duration: "22 hours",
      lessons: 68,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Watercolor", "Painting", "Art"],
      isPopular: false,
      isBestseller: false,
      isNewRelease: false,
      lastUpdated: "2024-11-05",
      language: "English",
      hasClosedCaptions: false,
      certificateOfCompletion: true
    },
    {
      id: 6,
      title: "Python Programming for Data Science",
      subtitle: "Learn Python, pandas, numpy, and machine learning",
      instructor: "Dr. James Wilson",
      instructorImage: "/api/placeholder/40/40",
      category: "Technology",
      level: "Intermediate",
      price: 94.99,
      originalPrice: 149.99,
      rating: 4.8,
      reviewCount: 2890,
      studentCount: 15670,
      duration: "55 hours",
      lessons: 198,
      thumbnail: "/api/placeholder/400/225",
      tags: ["Python", "Data Science", "Machine Learning"],
      isPopular: true,
      isBestseller: true,
      isNewRelease: false,
      lastUpdated: "2024-11-14",
      language: "English",
      hasClosedCaptions: true,
      certificateOfCompletion: true
    }
  ];

  const categories = ['Technology', 'Mathematics', 'Languages', 'Business', 'Arts & Design', 'Science', 'Health & Fitness', 'Music'];
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const priceRanges = [
    { label: 'Free', value: 'free' },
    { label: '$1 - $50', value: '1-50' },
    { label: '$51 - $100', value: '51-100' },
    { label: '$100+', value: '100+' }
  ];
  const ratings = [4.5, 4.0, 3.5, 3.0];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Price filter
    if (selectedPriceRange) {
      filtered = filtered.filter(course => {
        if (selectedPriceRange === 'free') return course.price === 0;
        if (selectedPriceRange === '1-50') return course.price > 0 && course.price <= 50;
        if (selectedPriceRange === '51-100') return course.price > 50 && course.price <= 100;
        if (selectedPriceRange === '100+') return course.price > 100;
        return true;
      });
    }

    // Rating filter
    if (selectedRating) {
      filtered = filtered.filter(course => course.rating >= parseFloat(selectedRating));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'oldest':
          return new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'popular':
          return b.studentCount - a.studentCount;
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedLevel, selectedPriceRange, selectedRating, sortBy, isLoading]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedPriceRange('');
    setSelectedRating('');
    setSortBy('newest');
  };

  const toggleFavorite = (courseId:number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(courseId)) {
      newFavorites.delete(courseId);
    } else {
      newFavorites.add(courseId);
    }
    setFavorites(newFavorites);
  };

  const toggleCart = (courseId: number) => {
    const newCart = new Set(cart);
    if (newCart.has(courseId)) {
      newCart.delete(courseId);
    } else {
      newCart.add(courseId);
    }
    setCart(newCart);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      </div>
    </div>
  );

  const CourseCard = ({ course, isListView = false }: { course: Course; isListView?: boolean }) => (
    <div className={`bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer group relative ${
      isListView ? 'flex gap-4 p-4' : 'overflow-hidden'
    }`}>
      {/* Course Image Section */}
      <div className={isListView ? 'w-48 flex-shrink-0' : ''}>
        <div className="relative overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className={`w-full object-cover transition-transform duration-200 group-hover:scale-105 ${
              isListView ? 'h-32 rounded-lg' : 'h-48'
            }`}
          />
          
          {/* Overlay with Play Button */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {course.isPopular && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                Popular
              </span>
            )}
            {course.isBestseller && (
              <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                Bestseller
              </span>
            )}
            {course.isNewRelease && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                New
              </span>
            )}
            {course.price === 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Free
              </span>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(course.id);
            }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`w-4 h-4 ${
                favorites.has(course.id) ? 'text-red-500 fill-current' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Course Content */}
      <div className={`${isListView ? 'flex-1' : 'p-4'}`}>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors ${
            isListView ? 'text-lg' : 'text-base'
          }`}>
            {course.title}
          </h3>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.subtitle}</p>
        
        {/* Instructor */}
        <div className="flex items-center gap-2 mb-3">
          <img
            src={course.instructorImage}
            alt={course.instructor}
            className="w-6 h-6 rounded-full"
          />
          <p className="text-gray-500 text-sm">By {course.instructor}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {renderStars(course.rating)}
          </div>
          <span className="text-sm font-medium text-gray-900">{course.rating}</span>
          <span className="text-sm text-gray-500">({course.reviewCount.toLocaleString()})</span>
        </div>

        {/* Course Details */}
        <div className={`flex items-center gap-4 mb-3 text-sm text-gray-500 ${
          isListView ? 'flex-wrap' : ''
        }`}>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons} lessons</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.studentCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          <span>{course.language}</span>
          {course.hasClosedCaptions && <span>• CC</span>}
          {course.certificateOfCompletion && <span>• Certificate</span>}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.price === 0 ? (
              <span className="text-2xl font-bold text-green-600">Free</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                {course.originalPrice > course.price && (
                  <span className="text-lg text-gray-500 line-through">
                    ${course.originalPrice}
                  </span>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {course.level}
            </span>
            
            {course.price > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCart(course.id);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  cart.has(course.id)
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar/>

        <div className="bg-blue-600 shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="animate-pulse">
              <div className="h-8 bg-blue-500 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-blue-500 rounded w-1/4"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            <div className="hidden lg:block w-64">
              <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="mb-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-4">
                    <LoadingSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>

      <div className="bg-blue-600 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white">All Courses</h1>
          <p className="text-white mt-2">
            Discover {filteredCourses.length} courses from expert instructors
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`bg-white rounded-lg shadow-sm border p-4 h-fit ${
            showFilters ? 'block' : 'hidden lg:block'
          } lg:w-64 w-full lg:sticky lg:top-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search courses..."
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Prices</option>
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Ratings</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>
                    {rating}+ stars
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                <span className="text-gray-600">
                  {filteredCourses.length} results
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Course Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredCourses.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isListView={viewMode === 'list'} 
                />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No courses found</h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search criteria or browse different categories.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ViewAllCoursesPage;
