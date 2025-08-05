import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, BookOpen, ChevronRight, Users, Star, Shield } from 'lucide-react';
import axios from 'axios';

export default function SignupForm({ role = 'student' }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      // Create user in database
      const response = await axios.post('http://localhost:5000/api/add-user', {
        firebase_uid: newUser.uid,
        email: newUser.email,
        role: role, 
        name: formData.name,
        photo_url: '',
        bio: `New ${role} account`,
        dob: null
      });

      // Send verification email
      await sendEmailVerification(newUser, {
        url: process.env.REACT_APP_VERIFICATION_URL || "http://localhost:3000/finishSignUp",
        handleCodeInApp: false
      });

      // Sign out and show verification message
      await signOut(auth);
      setError("Verification email sent. Please verify your email before logging in.");
      
      // Navigate to login
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Signup error:', error);
      
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || 'Failed to create account');
      } else if (error.code) {
        // Handle Firebase errors
        switch (error.code) {
          case 'auth/email-already-in-use':
            setError('An account with this email already exists');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address');
            break;
          default:
            setError('Failed to create account. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = () => {
    switch (role) {
      case 'student':
        return {
          title: 'Join as a Student',
          subtitle: 'Start your learning journey with expert tutors',
          features: [
            { icon: BookOpen, title: 'Personalized Learning', desc: 'Get matched with tutors who understand your learning style' },
            { icon: Users, title: 'Expert Tutors', desc: 'Learn from qualified professionals in your subject area' },
            { icon: Star, title: 'Track Progress', desc: 'Monitor your improvement with detailed analytics' }
          ]
        };
      case 'Individual':
        return {
          title: 'Join as an Individual Tutor',
          subtitle: 'Share your expertise and help students succeed',
          features: [
            { icon: Users, title: 'Flexible Schedule', desc: 'Set your own availability and teaching hours' },
            { icon: Star, title: 'Build Reputation', desc: 'Earn ratings and reviews from satisfied students' },
            { icon: Shield, title: 'Secure Platform', desc: 'Safe payment processing and student verification' }
          ]
        };
      case 'Mass':
        return {
          title: 'Join as a Mass Tutor',
          subtitle: 'Teach multiple students and scale your impact',
          features: [
            { icon: Users, title: 'Group Sessions', desc: 'Conduct classes with multiple students simultaneously' },
            { icon: BookOpen, title: 'Course Creation', desc: 'Create and sell structured course content' },
            { icon: Star, title: 'Higher Earnings', desc: 'Maximize your income with group teaching' }
          ]
        };
      default:
        return {
          title: 'Create Your Account',
          subtitle: 'Join the LearnConnect community',
          features: []
        };
    }
  };

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <a href="#" className="flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-2xl">LearnConnect</span>
            </a>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {roleInfo.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {roleInfo.subtitle}
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/auth')}
                className="font-medium text-blue-600 hover:text-blue-500"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <div className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="pl-10 pr-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="Create a strong password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none disabled:opacity-50"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-gray-400" />
                      ) : (
                        <Eye size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    disabled={loading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={acceptedTerms}
                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center">
                    {loading ? 'Creating account...' : 'Create account'}
                    {!loading && <ChevronRight size={16} className="ml-2" />}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right panel - Role-specific info */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-blue-600">
          <div className="flex flex-col h-full justify-center p-12 text-white">
            <button 
              onClick={() => navigate('/selectuser')}
              className="absolute top-8 left-8 flex items-center text-blue-50 hover:text-white"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to role selection
            </button>
            
            <h2 className="text-3xl font-bold mb-6">Welcome to LearnConnect!</h2>
            <p className="text-xl mb-8">
              Join thousands of {role === 'student' ? 'students' : 'tutors'} who are already part of our learning community.
            </p>
            
            <div className="space-y-6">
              {roleInfo.features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium mb-1">{feature.title}</h3>
                    <p className="text-blue-100">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}