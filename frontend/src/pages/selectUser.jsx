import React, { useState } from 'react';
import { BookOpen, Users, Calendar, Award, ChevronRight, Search, Menu, X, UserCheck, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserSelectionPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleUserSelection = (userType) => {
  const card = document.querySelector(`.${userType}-card`);
  if (!card) return;

  card.classList.add('scale-95');         // Tailwind: scale to 95%
  setTimeout(() => {
    card.classList.remove('scale-95');     // back to 100%
    navigate('/auth', { state: { userType } });
  }, 150);
};


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {/* Hero Section with User Selection */}
        <div className="bg-blue-600 text-white ">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to LearnConnect</h1>
              <p className="text-xl mb-8 max-w-3xl mx-auto">Join our community of learners and educators. Choose your role to get started on your learning journey.</p>
            </div>

            {/* User Selection Cards */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Who Are You?</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Student Card */}
                <div 
                  className="student-card bg-white text-gray-900 rounded-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  onClick={() => handleUserSelection('student')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <GraduationCap className="text-blue-600" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">I'm a Student</h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      Find expert tutors, access quality resources, and achieve your academic goals with personalized learning.
                    </p>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Search size={16} className="text-blue-600" />
                        <span>Find tutors by subject and availability</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-blue-600" />
                        <span>Flexible scheduling that fits your life</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <BookOpen size={16} className="text-blue-600" />
                        <span>Interactive learning tools and resources</span>
                      </div>
                    </div>
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                      Get Started as Student <ChevronRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>

                {/* Tutor Card */}
                <div 
                  className="tutor-card bg-white text-gray-900 rounded-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  onClick={() => handleUserSelection('tutor')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UserCheck className="text-blue-600" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">I'm a Tutor</h3>
                    <p className="text-gray-600 mb-6 text-lg">
                      Share your knowledge, connect with students worldwide, and build a flexible teaching career.
                    </p>
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Users size={16} className="text-blue-600" />
                        <span>Connect with students globally</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-blue-600" />
                        <span>Set your own schedule and rates</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <Award size={16} className="text-blue-600" />
                        <span>Build your reputation and earn more</span>
                      </div>
                    </div>
                    <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors inline-flex items-center justify-center">
                      Get Started as Tutor <ChevronRight size={16} className="ml-2" />
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