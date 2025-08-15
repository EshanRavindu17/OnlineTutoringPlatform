import React, { useState } from 'react';
import { BookOpen, Users, Calendar, Award, ChevronRight, Search, Menu, X, UserCheck, GraduationCap, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserSelectionPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserSelection = (userType: string) => {
    // Convert userType to lowercase for URL and remove spaces
    const path = userType.toLowerCase().replace(' ', '');
    navigate(`/selectuser/${path}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Hero Section with User Selection */}
        <div className="bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to LearnConnect</h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">Join our community of learners and educators. Choose your role to get started on your learning journey.</p>
            </div>

            {/* User Selection Cards */}
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Who Are You?</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Student Card */}
                <div 
                  className="group bg-white text-gray-900 rounded-2xl p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 border-2 border-transparent hover:border-blue-200 relative overflow-hidden"
                  onClick={() => handleUserSelection('student')}
                >
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full transform translate-x-16 -translate-y-16 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <GraduationCap className="text-white" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-700 transition-colors">I'm a Student</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      Discover expert tutors, access premium learning resources, and achieve your academic goals with personalized education.
                    </p>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Search size={14} className="text-blue-600" />
                        </div>
                        <span>Find tutors by subject and availability</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar size={14} className="text-blue-600" />
                        </div>
                        <span>Flexible scheduling that fits your lifestyle</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <BookOpen size={14} className="text-blue-600" />
                        </div>
                        <span>Interactive learning tools and resources</span>
                      </div>
                    </div>
                    <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl group-hover:scale-105">
                      Get Started as Student <ChevronRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>

                {/* Individual Tutor Card */}
                <div 
                  className="group bg-white text-gray-900 rounded-2xl p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 border-2 border-transparent hover:border-emerald-200 relative overflow-hidden"
                  onClick={() => handleUserSelection('Individual')}
                >
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100 to-transparent rounded-full transform translate-x-16 -translate-y-16 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <User className="text-white" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-emerald-700 transition-colors">Individual Tutor</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      Provide personalized one-to-one tutoring, build meaningful connections with students, and create tailored learning experiences.
                    </p>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User size={14} className="text-emerald-600" />
                        </div>
                        <span>One-to-one personalized teaching</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Calendar size={14} className="text-emerald-600" />
                        </div>
                        <span>Flexible scheduling and premium rates</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Award size={14} className="text-emerald-600" />
                        </div>
                        <span>Build strong mentor relationships</span>
                      </div>
                    </div>
                    <button className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl group-hover:scale-105">
                      Get Started as Individual Tutor <ChevronRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>

                {/* Mass Tutor Card */}
                <div 
                  className="group bg-white text-gray-900 rounded-2xl p-8 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 border-2 border-transparent hover:border-purple-200 relative overflow-hidden"
                  onClick={() => handleUserSelection('Mass')}
                >
                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-transparent rounded-full transform translate-x-16 -translate-y-16 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                      <Users className="text-white" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-700 transition-colors">Mass Tutor</h3>
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      Teach large groups of students, create courses for many learners, and maximize your impact through scalable education.
                    </p>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users size={14} className="text-purple-600" />
                        </div>
                        <span>Teach multiple students simultaneously</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <BookOpen size={14} className="text-purple-600" />
                        </div>
                        <span>Create courses and group sessions</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 group-hover:text-gray-700">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Award size={14} className="text-purple-600" />
                        </div>
                        <span>Scale your teaching business</span>
                      </div>
                    </div>
                    <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-violet-700 transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl group-hover:scale-105">
                      Get Started as Mass Tutor <ChevronRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-center mt-12">
                <p className="text-blue-100 mb-4">
                  Not sure which role is right for you? You can always switch later.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button className="px-6 py-3 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 text-center">
                    Learn More
                  </button>
                  <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-md font-medium hover:bg-white hover:text-blue-600 text-center">
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Preview */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started is Easy</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">Join thousands of students and tutors who are already transforming their learning experience</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Choose Your Role</h3>
                <p className="text-gray-600">Select whether you're here to learn or teach</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Create Your Profile</h3>
                <p className="text-gray-600">Tell us about yourself and your goals</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Start Learning</h3>
                <p className="text-gray-600">Connect with your perfect match and begin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
                <div className="text-gray-600">Active Students</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">2,500+</div>
                <div className="text-gray-600">Expert Tutors</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Subjects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">LearnConnect</h3>
              <p className="text-sm">Connecting tutors and students for personalized learning experiences since 2024.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Find a Tutor</a></li>
                <li><a href="#" className="hover:text-white">Become a Tutor</a></li>
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Tutorials</a></li>
                <li><a href="#" className="hover:text-white">Study Guides</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li>support@learnconnect.com</li>
                <li>1-800-LEARN-NOW</li>
                <li>
                  <div className="flex space-x-3 mt-3">
                    {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                      <a key={social} href="#" className="hover:text-white">
                        {social.charAt(0)}
                      </a>
                    ))}
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2025 LearnConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
