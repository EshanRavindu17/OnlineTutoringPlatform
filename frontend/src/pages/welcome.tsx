import React,{ useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Award, ChevronRight, Search, Menu, X, ChevronLeft, GroupIcon, User, Users2, UserCircle2, User2Icon, UserCog2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';
import NavBar from '../components/Navbar';
import { tutorService, Subject } from '../api/TutorService';

// Import banner images
import banner1 from '../assets/banner1.webp';
import banner2 from '../assets/banner2.jpeg';
import banner3 from '../assets/banner3.jpg';
import banner4 from '../assets/banner4.jpeg';


import { useAuth } from '../context/authContext';






// Add custom styles for animations
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float-delayed 3s ease-in-out infinite 1.5s;
  }
`;

export default function WelcomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const navigate = useNavigate();

  const { currentUser, userProfile } = useAuth();

  // Banner images array
  const bannerImages = [
    { src: banner1, alt: "Learning Environment 1" , description:"Learn anything you want " },
    { src: banner2, alt: "Learning Environment 2" , description:"Best place to earn by your skills" },
    { src: banner3, alt: "Learning Environment 3" , description:"Grow your student base" },
    { src: banner4, alt: "Learning Environment 4" ,description:"Find a tutor instantly" }
  ];

  // Inject custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        const fetchedSubjects = await tutorService.getAllSubjects();
        setSubjects(fetchedSubjects);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        // Fallback to default subjects if API fails
        setSubjects([]);
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerImages.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to get gradient colors for subjects
  const getSubjectGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-teal-500 to-cyan-500',
      'from-yellow-500 to-orange-500',
      'from-pink-500 to-rose-500',
      'from-violet-500 to-purple-500',
      'from-emerald-500 to-teal-500',
      'from-red-500 to-pink-500',
      'from-cyan-500 to-blue-500'
    ];
    return gradients[index % gradients.length];
  };

  // Get limited subjects to display (max 8)
  const displaySubjects = subjects.slice(0, 8);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar/>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-indigo-400/20 rounded-full blur-lg animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm font-medium">Trusted by 10,000+ students worldwide</span>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Transform Your
                  <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-white bg-clip-text text-transparent">
                    Learning Journey
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl">
                  Connect with world-class tutors, access premium resources, and achieve extraordinary academic success on our cutting-edge platform.
                </p>
              </div>

              {/* Action Buttons */}
              { !userProfile ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => navigate('/findtutors')}
                  className="group relative px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold text-base hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Find Your Perfect Tutor
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button 
                  onClick={() => navigate('/selectuser')}
                  className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-base hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/20"
                >
                 <span className="flex items-center justify-center">
                    Start Teaching Today
                    <BookOpen className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                  </span>
                </button>
              </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  {userProfile?.role === 'student' ? (
                    <button 
                      onClick={() => navigate('/findtutors')}
                      className="group relative px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold text-base hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Find Your Perfect Tutor
                        <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  ) : userProfile?.role === 'Individual'  ? (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold text-base hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-white/20"
                    >
                      <span className="flex items-center justify-center">
                        Start to Teach
                        <BookOpen className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                      </span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="group relative px-6 py-3 bg-white text-blue-600 rounded-2xl font-bold text-base hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        Schedule a Class
                        <Users2 className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  )}
                </div>
              )}
              {/* Stats */}
              <div className="flex flex-wrap gap-6 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-blue-200 text-xs">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-blue-200 text-xs">Expert Tutors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-blue-200 text-xs">Subjects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-blue-200 text-xs">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right Side - Banner Slideshow */}
            <div className="hidden lg:block relative">
              <div className="relative z-10">
                {/* Main Slideshow Card */}
                <div className="bg-white/95 backdrop-blur-lg p-6 rounded-3xl shadow-2xl border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* Slideshow Container */}
                    <div className="relative w-full h-80">
                      {bannerImages.map((image, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentSlide ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          <img 
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                      
                      {/* Navigation Arrows */}
                      <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      
                      {/* Slide Indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {bannerImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              index === currentSlide 
                                ? 'bg-white scale-110' 
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Overlay Content */}
                      <div className="absolute bottom-12 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold mb-2">{bannerImages[currentSlide].description}</h3>
                        <p className="text-sm opacity-90">Transform your learning journey with our platform</p>
                      </div>
                      
                      {/* Live Indicator */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                          Live Sessions
                        </span>
                      </div>
                    </div>
                    
                    {/* Stats Below Slideshow */}
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-xl">
                        <div className="text-lg font-bold text-blue-600">24/7</div>
                        <div className="text-xs text-gray-600">Support</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-xl">
                        <div className="text-lg font-bold text-green-600">98%</div>
                        <div className="text-xs text-gray-600">Success</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-xl">
                        <div className="text-lg font-bold text-purple-600">1:1</div>
                        <div className="text-xs text-gray-600">Sessions</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 animate-float">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">New Subject</div>
                      <div className="text-xs text-gray-600">Mathematics</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 animate-float-delayed">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Mass Class</div>
                      <div className="text-xs text-gray-600">Join now</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Tutorly?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Our platform provides the tools and connections you need to excel in your studies or share your expertise with eager learners.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Tutors</h3>
              <p className="text-gray-600">Connect with verified tutors specializing in various subjects and academic levels.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">Book sessions that fit your schedule with our easy-to-use calendar system.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Tools</h3>
              <p className="text-gray-600">Utilize our digital whiteboard, file sharing, and video conferencing for effective learning.</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {/* Student Background */}
          <div 
            className={`absolute inset-0 transition-opacity duration-700 ${activeTab === 'student' ? 'opacity-20' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(/src/assets/banner1.webp)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-indigo-500/30"></div>
          </div>
          
          {/* Tutor Background */}
          <div 
            className={`absolute inset-0 transition-opacity duration-700 ${activeTab === 'tutor' ? 'opacity-20' : 'opacity-0'}`}
            style={{
              backgroundImage: `url(/src/assets/banner3.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-teal-500/20 to-violet-500/30"></div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-indigo-400 rounded-full blur-2xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Get started in just a few simple steps and transform your learning experience
            </p>
            
            {/* Modern Tab Switcher */}
            <div className="inline-flex bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/40 shadow-lg">
              <button 
                className={`px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'student' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab('student')}
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>For Students</span>
                </div>
              </button>
              <button 
                className={`px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 ${
                  activeTab === 'tutor' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
                onClick={() => setActiveTab('tutor')}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>For Tutors</span>
                </div>
              </button>
            </div>
          </div>
          
          {activeTab === 'student' ? (
            <div className="grid md:grid-cols-4 gap-8">
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Sign Up</h3>
                <p className="text-gray-600 leading-relaxed">Create your personalized account and set up your learning profile in minutes</p>
              </div>
              
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Find Tutors</h3>
                <p className="text-gray-600 leading-relaxed">Browse expert tutors by subject, rating, and availability to find your perfect match</p>
              </div>
              
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Schedule Sessions</h3>
                <p className="text-gray-600 leading-relaxed">Book flexible one-on-one or group sessions that fit your busy schedule</p>
              </div>
              
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">4</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">Learn & Grow</h3>
                <p className="text-gray-600 leading-relaxed">Attend interactive sessions and track your amazing learning progress</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-8">
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Apply</h3>
                <p className="text-gray-600 leading-relaxed">Submit your credentials and showcase your teaching expertise and experience</p>
              </div>
              
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">Get Verified</h3>
                <p className="text-gray-600 leading-relaxed">Complete our thorough verification process to join our trusted tutor network</p>
              </div>
              
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">Set Availability</h3>
                <p className="text-gray-600 leading-relaxed">Create your flexible schedule and set competitive rates for your services</p>
              </div>
              
              <div className="group text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-violet-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl font-bold text-white">4</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-violet-600 transition-colors">Start Teaching</h3>
                <p className="text-gray-600 leading-relaxed">Connect with eager students and begin conducting engaging learning sessions</p>
              </div>
            </div>
          )}
          
          <div className="text-center mt-16">
            <button 
              onClick={() => {activeTab === 'student' ? navigate('/selectuser/student') : navigate('/selectuser/individual')}}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10 flex items-center">
                Get Started Today
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Subjects/Categories */}
      <div className="py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-indigo-400 rounded-full blur-xl animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/50 mb-6">
              <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">Academic Excellence</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Popular Subjects
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find expert tutors in a wide range of academic disciplines and unlock your potential
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {isLoadingSubjects ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-300 rounded-lg mb-3"></div>
                  <div className="h-2 bg-gray-200 rounded-full mx-auto w-12"></div>
                </div>
              ))
            ) : displaySubjects.length > 0 ? (
              displaySubjects.map((subject, index) => {
                const gradientColor = getSubjectGradient(index);
                return (
                  <button 
                    key={subject.sub_id} 
                    className="group relative bg-white/80 backdrop-blur-sm border border-white/40 rounded-2xl p-6 hover:bg-white hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => navigate('/findtutors', { state: { selectedSubject: subject.name } })}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    
                    {/* Glow Effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${gradientColor} rounded-2xl opacity-0 group-hover:opacity-20 blur-lg transition-all duration-300`}></div>
                    
                    <div className="relative z-10 text-center">
                      {/* Subject Name */}
                      <h3 className="font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300 text-base md:text-lg mb-3">
                        {subject.name}
                      </h3>
                      
                      {/* Hover Indicator */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className={`w-12 h-1 bg-gradient-to-r ${gradientColor} rounded-full mx-auto`}></div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              // Fallback if no subjects loaded
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">No subjects available at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-12">
            <a href="/findtutors" className="text-blue-600 hover:underline">
            <button 
              // onClick={() => navigate('/findtutors')}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <span className="relative z-10 flex items-center">
                View All Subjects with Tutors 
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            </a>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">S</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Award key={star} size={16} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"The tutors on Tutorly helped me improve my calculus grade from a C to an A. The flexible scheduling made it easy to fit sessions into my busy college schedule."</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">M</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Michael Torres</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Award key={star} size={16} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"As a tutor, I've been able to connect with students from around the world. The platform is easy to use, and the interactive tools make teaching online just as effective as in-person."</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold">J</span>
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Jennifer Patel</h4>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Award key={star} size={16} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"My son was struggling with reading, but after just a few sessions with his Tutorly tutor, we've seen incredible improvement. The personalized approach made all the difference."</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="md:flex md:items-center md:justify-between">
            <div className="mb-8 md:mb-0 md:max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Ready to transform your learning experience?</h2>
              <p className="text-xl mb-0">Join Tutorly today and connect with expert tutors or share your knowledge with students.</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <a href="/selectuser">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 text-center"
              >
                Sign Up
              </button>
              </a>
              <button className="px-6 py-3 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 text-center">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    <Footer/>
    </div>
  );
}
