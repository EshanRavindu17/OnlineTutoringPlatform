import React, { useEffect, useState } from 'react';
import {  
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase.tsx'; // Adjust path as needed
import { useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, BookOpen, Users, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { addStudent } from '../api/Student.ts';

export default function AuthPage() {
  const { currentUser, userProfile } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { state } = useLocation();
  const initialType = state?.userType;
  // console.log('Initial userType from location:', initialType);
  const [userType, setUserType] = useState(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [selectedRole, setSelectedRole] = useState('student');

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'Individual', label: 'Individual Tutor' },
    { value: 'Mass', label: 'Mass Tutor' }
  ];

  // Update the navigation effect
  useEffect(() => {
    if (currentUser && userProfile) {
      const dest = userProfile.role === 'student' ? '/studentprofile' : '/tutorprofile';
      navigate(dest, { replace: true });
    }
  }, [currentUser, userProfile, navigate]);

  const toggleAuthMode = () => {
    if (isLogin) {
      navigate('/selectuser');
    } else {
      setIsLogin(true);
      setError('');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setResendSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await fetch('/api/check-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: formData.email, 
            role: selectedRole
          })
        });

        if (res.ok) {
          const { user } = await signInWithEmailAndPassword(
            auth, 
            formData.email, 
            formData.password
          );
          
          // Check if email is verified
          if (!user.emailVerified) {
            await signOut(auth);
            setError(`Please verify your email before logging in. Check your inbox for the verification link sent to ${formData.email}.`);
            return;
          }
          
          console.log('User signed in successfully:', user);
          
          // Store userType in localStorage for persistence
          localStorage.setItem('userType', selectedRole);
          
          // Navigate based on role
          if (selectedRole === 'student') {
            navigate('/studentprofile');
          } else if (selectedRole === 'Individual') {
            navigate('/tutorprofile');
          } else if (selectedRole === 'Mass') {
            navigate('/mass-tutor-dashboard');
          }
        } 
        else {
          const { detail } = await res.json();
          setError(detail || 'Invalid role for this account');
        }
      } 

    } catch (error: any) {
      console.error('Authentication error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled');
          break;
        case 'auth/weak-password':
          setError('Password is too weak');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/user-not-found':
          setError('No account found with this email');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('An error occurred. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (selectedRole !== 'student') {
      setError('Google sign-in is only available for students');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userPayload = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: 'student',
        name: firebaseUser.displayName || 'Unnamed User',
        photo_url: firebaseUser.photoURL || '',
        bio: 'Signed up via Google',
        dob: null
      };

      const response = await fetch('http://localhost:5000/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        await signOut(auth);
        throw new Error(errJson.detail || "Failed to save user to database");
      }

      const savedUser = await response.json();
      const user_id = savedUser.user.id;

      const student = await addStudent({
        user_id,
        points: 0
      }).then(
        (student) => {
          console.log('Student Add to Student Table', student);
        }
      ).catch((error) => {
        console.error('Error adding student:', error);
      });


      console.log('Student Add to Student Table', student);
      console.log('✅ Saved Google user to DB:', savedUser);

      // ✅ Set user type and role — persist for better UX
      setUserType('student');
      setSelectedRole('student');
      localStorage.setItem('userType', 'student'); // Persist role for user experience

    } catch (err: any) {
      console.error('❌ Google sign-in error:', err);
      setError(err.message);
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const openForgotModal = () => {
    setShowForgotModal(true);
    setForgotEmail(formData.email);
    setResetError('');
    setResetSuccess(false);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  const handleResendVerification = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);

    try {
      // Sign in temporarily to get access to the user object
      const { user } = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // Send verification email
      await sendEmailVerification(user);
      
      // Sign out immediately
      await signOut(auth);
      
      setResendSuccess(true);
      setError('');
    } catch (error: any) {
      console.error('Resend verification error:', error);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!forgotEmail.trim()) {
      setResetError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    setResetError('');

    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      setResetSuccess(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setResetError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setResetError('Invalid email address');
          break;
        case 'auth/too-many-requests':
          setResetError('Too many requests. Please try again later');
          break;
        default:
          setResetError('Failed to send password reset email. Please try again');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-8">
            <a href="#" className="flex items-center justify-center mb-6">
              <span className="text-blue-600 font-bold text-2xl">Tutorly</span>
            </a>
            
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? 'New to Tutorly? ' : 'Already have an account? '}
              <button 
                onClick={toggleAuthMode}
                className="font-medium text-blue-600 hover:text-blue-500"
                disabled={loading}
              >
                {isLogin ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 mb-2">{error}</p>
              {error.includes('verify your email') && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">
                Verification email sent successfully! Please check your inbox.
              </p>
            </div>
          )}

          <div className="mt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {isLogin && ( // Add this section for login mode
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-800 mb-4">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {roleOptions.map((role) => (
                      <label 
                        key={role.value} 
                        className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                          selectedRole === role.value 
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg ring-2 ring-blue-200' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={selectedRole === role.value}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="text-center">
                          <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                            selectedRole === role.value 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {role.value === 'student' && <BookOpen size={24} />}
                            {role.value === 'Individual' && <User size={24} />}
                            {role.value === 'Mass' && <Users size={24} />}
                          </div>
                          <span className={`text-sm font-medium ${
                            selectedRole === role.value 
                              ? 'text-blue-700' 
                              : 'text-gray-700'
                          }`}>
                            {role.label}
                          </span>
                          {selectedRole === role.value && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    Choose the role that best describes your learning or teaching needs
                  </div>
                </div>

              )}

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
                    placeholder="john@gmail.com"
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
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="pl-10 pr-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
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

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={openForgotModal}
                      disabled={loading}
                      className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center">
                    {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Create account')}
                    {!loading && <ChevronRight size={16} className="ml-2" />}
                  </span>
                </button>
              </div>
            </form>

            {isLogin && selectedRole === 'student' && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full inline-flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right panel - Image/Info */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-blue-600">
          <div className="flex flex-col h-full justify-center p-12 text-white">
            <a href="/" className="absolute top-8 left-8 flex items-center text-blue-50 hover:text-white">
              <ArrowLeft size={20} className="mr-2" />
              Back to home
            </a>
            
            <h2 className="text-3xl font-bold mb-6">{isLogin ? "Welcome back!" : "Join our community"}</h2>
            <p className="text-xl mb-8">
              {isLogin 
                ? "Access your account to connect with tutors, track your progress, and continue your learning journey."
                : "Create an account to find expert tutors, schedule sessions, and achieve your academic goals."}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium mb-1">Personalized Learning</h3>
                  <p className="text-blue-100">Connect with tutors who match your learning style and academic needs.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium mb-1">Comprehensive Resources</h3>
                  <p className="text-blue-100">Access study materials, practice exercises, and interactive tools.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium mb-1">Secure Platform</h3>
                  <p className="text-blue-100">Your data is protected with advanced security measures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-white bg-opacity-60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all duration-300 ease-out scale-100">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl px-6 py-6 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-blue-600 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                }}></div>
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Reset Password</h3>
                    <p className="text-blue-100 text-sm">Secure account recovery</p>
                  </div>
                </div>
                <button
                  onClick={closeForgotModal}
                  className="text-white hover:text-blue-100 transition-colors duration-200 p-1 hover:bg-white hover:bg-opacity-10 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              {!resetSuccess ? (
                <>
                  {/* Description */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Don't worry! Enter your email address below and we'll send you a secure link to reset your password.
                    </p>
                  </div>

                  {/* Error Message */}
                  {resetError && (
                    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <X className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 font-medium">{resetError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                      <label htmlFor="forgotEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail size={20} className="text-blue-400" />
                        </div>
                        <input
                          id="forgotEmail"
                          name="forgotEmail"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          disabled={resetLoading}
                          className="pl-12 pr-4 py-3 block w-full border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={closeForgotModal}
                        disabled={resetLoading}
                        className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                      >
                        <span className="flex items-center justify-center">
                          {resetLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Reset Link
                              <ChevronRight size={16} className="ml-1" />
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="text-center py-4">
                  {/* Success Animation */}
                  <div className="mx-auto mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Mail className="h-10 w-10 text-white" />
                      </div>
                      {/* Checkmark overlay */}
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-gray-900 mb-3">Email Sent Successfully!</h4>
                  
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg mb-6">
                    <p className="text-sm text-green-700 leading-relaxed">
                      We've sent a password reset link to <span className="font-semibold text-green-800">{forgotEmail}</span>
                    </p>
                  </div>
                  
                  <div className="text-left bg-blue-50 rounded-xl p-4 mb-6">
                    <h5 className="font-semibold text-blue-900 mb-2">Next Steps:</h5>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">1.</span>
                        Check your email inbox (and spam folder)
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">2.</span>
                        Click the "Reset Password" link in the email
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">3.</span>
                        Create your new secure password
                      </li>
                    </ol>
                  </div>
                  
                  <button
                    onClick={closeForgotModal}
                    className="w-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border-2 border-blue-600 rounded-xl hover:from-blue-700 hover:to-blue-800 hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <span className="flex items-center justify-center">
                      Got it, thanks!
                      <ChevronRight size={16} className="ml-2" />
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
