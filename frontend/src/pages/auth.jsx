import React, { useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path as needed
import { useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, BookOpen, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        console.log('User signed in:', user);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: ''
    });
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Full name is required');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    return true;
  };

  // Fix handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
      } else {
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        // Create user profile with role
        await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: userCredential.user.uid,
            email: formData.email,
            name: formData.name,
            role: userType,
          }),
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Construct request body with required fields
      const userPayload = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: userType,
        name: firebaseUser.displayName || 'Unnamed User',
        photo_url: firebaseUser.photoURL || '',
        bio: 'Signed up via Google',
        dob: null // Optional field, handled in backend
      };

      const response = await fetch('http://localhost:5000/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        await signOut(auth);
        window.location.reload();
        throw new Error(errJson.detail || "Failed to register/login");
      }

      const createdUser = await response.json();
      console.log('✅ Saved Google user to DB:', createdUser);

      // Send verification email only if not verified (Google users usually are verified)
      if (createdUser.created && !firebaseUser.emailVerified) {
        await sendEmailVerification(firebaseUser, {
          url: "https://learnconnect.com/finishSignUp",
          handleCodeInApp: false
        });
        console.log("📩 Verification email sent to:", firebaseUser.email);
        await signOut(auth);
        setError("Verification email sent. Please verify your email before logging in.");
      }

      // ✅ You can redirect or set user state here if needed

    } catch (err) {
      console.error('❌ Google sign-in error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleMicrosoftSignIn = async () => {
    setLoading(true);
    setError('');

    
    try {
      const provider = new OAuthProvider('microsoft.com');
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userPayload = {
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: userType,
        name: firebaseUser.displayName || 'Unnamed User',
        photo_url: firebaseUser.photoURL || '',
        bio: 'Signed up via Google',
        dob: null // Optional field, handled in backend
      };

      const response = await fetch('http://localhost:5000/api/add-user', { // Updated port to 5000
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        await signOut(auth);
        throw new Error(errJson.detail || 'Failed to register/login');
      }

      console.log('Microsoft sign in successful:', result.user);
    } catch (error) {
      console.error('Microsoft sign in error:', error);
      setError('Failed to sign in with Microsoft');
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

  const handleForgotPassword = async (e) => {
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
    } catch (error) {
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

  // Add role validation before navigation
  useEffect(() => {
    if (user) {
      // Check user role before navigation
      const checkUserRole = async () => {
        try {
          const token = await user.getIdToken();
          const response = await fetch(`http://localhost:5000/api/user/${user.uid}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.status === 404) {
            // User exists in Firebase but not in database - this is normal for new users
            console.log('User not found in database - needs to complete registration');
            return; // Don't set error, just return
          }
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const userData = await response.json();
          
          if (userData.role !== userType) {
            await signOut(auth);
            setError('Invalid role for this account');
            return;
          }

          // Navigate based on verified role
          navigate(userData.role === 'Student' ? '/studentprofile' : '/tutorprofile');
        } catch (error) {
          console.error('Role verification failed:', error);
          // Only set error for actual failures, not 404s
          if (!error.message.includes('404')) {
            setError('Failed to verify user role');
          }
        }
      };

      checkUserRole();
    }
  }, [user, userType]);

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
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? 'New to LearnConnect? ' : 'Already have an account? '}
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
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
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

              {!isLogin && (
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
                      className="pl-10 pr-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              )}

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

            {isLogin && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Google
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={handleMicrosoftSignIn}
                      disabled={loading}
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Microsoft
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reset Your Password</h3>
                <button
                  onClick={closeForgotModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {!resetSuccess ? (
                <>
                  <p className="text-sm text-gray-500 mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {resetError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{resetError}</p>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword}>
                    <div className="mb-4">
                      <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-400" />
                        </div>
                        <input
                          id="forgotEmail"
                          name="forgotEmail"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          disabled={resetLoading}
                          className="pl-10 block w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeForgotModal}
                        disabled={resetLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resetLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Email Sent!</h4>
                  <p className="text-sm text-gray-500 mb-6">
                    We've sent a password reset link to <strong>{forgotEmail}</strong>. 
                    Check your inbox and follow the instructions to reset your password.
                  </p>
                  <button
                    onClick={closeForgotModal}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Close
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