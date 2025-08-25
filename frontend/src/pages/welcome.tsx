import React,{ useEffect, useState } from 'react';
import { BookOpen, Users, Calendar, Award, ChevronRight, Search, Menu, X } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Footer from '../components/Footer';
import NavBar from '../components/Navbar';

export default function WelcomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar/>
      {/* Hero Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Transform Your Learning Journey</h1>
              <p className="text-xl mb-8">Connect with expert tutors, access quality resources, and achieve your academic goals on our interactive online platform.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 text-center">
                  Find a Tutor
                </button>
                <button className="px-6 py-3 bg-blue-700 text-white rounded-md font-medium hover:bg-blue-800 text-center">
                  Become a Tutor
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-blue-500 p-6 rounded-lg shadow-lg">
                <div className="bg-white rounded-md p-6 text-gray-800">
                  <div className="flex space-x-4 mb-4">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Algebra Session</span>
                      <span className="text-sm text-blue-600">Live</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full">
                      <div className="bg-blue-600 h-1.5 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className="text-blue-600" />
                      <span className="text-sm">Next session: Tomorrow, 3:00 PM</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users size={16} className="text-blue-600" />
                      <span className="text-sm">4 students in this group</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="text-sm">12 sessions completed</span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LearnConnect?</h2>
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
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <div className="inline-flex rounded-md border border-gray-200 p-1 mb-6">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'student' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                onClick={() => setActiveTab('student')}
              >
                For Students
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'tutor' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
                onClick={() => setActiveTab('tutor')}
              >
                For Tutors
              </button>
            </div>
          </div>
          
          {activeTab === 'student' ? (
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Sign Up</h3>
                <p className="text-gray-600">Create your account and profile</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Find Tutors</h3>
                <p className="text-gray-600">Search for tutors based on subject and availability</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Schedule Sessions</h3>
                <p className="text-gray-600">Book one-on-one or group tutoring sessions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Learn & Improve</h3>
                <p className="text-gray-600">Attend interactive sessions and track your progress</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Apply</h3>
                <p className="text-gray-600">Submit your credentials and teaching experience</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Verified</h3>
                <p className="text-gray-600">Complete our verification process</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Set Availability</h3>
                <p className="text-gray-600">Create your schedule and set your rates</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-blue-600">4</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Start Teaching</h3>
                <p className="text-gray-600">Connect with students and conduct sessions</p>
              </div>
            </div>
          )}
          
          <div className="text-center mt-10">
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
              Get Started <ChevronRight size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Subjects/Categories */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Subjects</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Find expert tutors in a wide range of academic disciplines</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Mathematics', 'Science', 'English', 'History', 'Computer Science', 'Languages', 'Test Prep', 'Arts'].map((subject) => (
              <button key={subject} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-center">
                {subject}
              </button>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="#" className="text-blue-600 font-medium hover:text-blue-800 inline-flex items-center">
              View all subjects <ChevronRight size={16} className="ml-1" />
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
              <p className="text-gray-600">"The tutors on LearnConnect helped me improve my calculus grade from a C to an A. The flexible scheduling made it easy to fit sessions into my busy college schedule."</p>
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
              <p className="text-gray-600">"My son was struggling with reading, but after just a few sessions with his LearnConnect tutor, we've seen incredible improvement. The personalized approach made all the difference."</p>
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
              <p className="text-xl mb-0">Join LearnConnect today and connect with expert tutors or share your knowledge with students.</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 text-center">
                Sign Up
              </button>
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
