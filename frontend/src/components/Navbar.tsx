// src/components/Navbar
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.tsx';
import logo from '../assets/logo.png'; // Assuming you have a logo image in your assets

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const toggleMenu = () => setIsMenuOpen(open => !open);

  // Helper function to get user's initials
  const getUserInitials = (name: string) => {
    if (!name) return 'U'; // Default to 'U' for User
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper function to generate a consistent color based on name
  const getInitialsColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // Profile Image Component for Navbar
  const ProfileImage = ({ 
    src, 
    alt, 
    name, 
    className = "w-8 h-8", 
    textClassName = "text-sm",
    showPlaceholder = false 
  }: {
    src?: string;
    alt: string;
    name: string;
    className?: string;
    textClassName?: string;
    showPlaceholder?: boolean;
  }) => {
    const [imageError, setImageError] = useState(false);
    const hasValidImage = src && !imageError;
    
    // If we have a valid image, show it
    if (hasValidImage) {
      return (
        <img
          src={src}
          alt={alt}
          className={`${className} rounded-full object-cover border-2 border-gray-200`}
          onError={() => setImageError(true)}
        />
      );
    }
    
    // If showPlaceholder is true, show placeholder icon instead of initials
    if (showPlaceholder) {
      return (
        <div className={`${className} rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-200`}>
          <User className="w-4 h-4 text-gray-400" />
        </div>
      );
    }
    
    // Otherwise show initials
    return (
      <div className={`${className} rounded-full ${getInitialsColor(name)} flex items-center justify-center text-white font-bold ${textClassName} border-2 border-gray-200`}>
        {getUserInitials(name)}
      </div>
    );
  };

  // Common navigation items
  const commonLinks = [
    { to: '/',        label: 'Home'       },
    { to: '/findtutors', label: 'Find Tutors' },
  ];

  // Role-specific items
  const studentLinks = [
    { to: '/mycalendar', label: 'My Calendar' },
    { to: '/payment-history', label: 'Payments'   },
  ];

  const tutorLinks = [
    { to: '/addnewcourse', label: 'Create Course' },
    { to: '/mycourses',     label: 'My Courses'},
    { to: '/manageSchedule',     label: 'Manage Schedule'},
  ];

  const LastLink =[
    { to: '/about', label: 'About Us' }
  ]

  // Pick the right extras
  let extraLinks: { to: string; label: string }[] = [];
  if (userProfile?.role === 'student') extraLinks = studentLinks;
  if (userProfile?.role === 'Individual')   extraLinks = tutorLinks;
  if (userProfile?.role === 'Mass')   extraLinks = tutorLinks;

  // Profile path
  const profilePath =userProfile?.role === 'Individual' || userProfile?.role === 'Mass'
    ? '/tutorprofile'
    : '/studentprofile';

  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
  };

  const handleLoginClick = () => {
    navigate('/auth');
  };

  const handleRoleSelection = (role: string) => {
    setShowSignUpModal(false);
    setIsMenuOpen(false);
    // Navigate to role-specific signup page or pass role as state
    navigate('/selectuser', { state: { selectedRole: role, action: 'signup' } });
  };

  const handleCloseSignUpModal = () => {
    setShowSignUpModal(false);
  };

  const handleConfirmSignOut = async () => {
    try {
      await signOut(auth);
      setShowSignOutModal(false);
      setIsMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCancelSignOut = () => {
    setShowSignOutModal(false);
  };

  // helpers for active styling
  const desktopClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center px-4 py-2 text-base font-semibold transition-all duration-300 relative group ${
      isActive
        ? 'text-blue-600'
        : 'text-gray-700 hover:text-blue-600'
    }`;

  const mobileClass = ({ isActive }: { isActive: boolean }) =>
    `block pl-4 pr-6 py-3 text-lg font-semibold transition-all duration-300 ${
      isActive
        ? 'text-blue-700 bg-blue-100 border-l-4 border-blue-600 font-bold'
        : 'text-gray-700 hover:text-blue-600 border-l-4 border-transparent'
    }`;

  return (
    <>
      {/* <nav className="bg-gradient-to-r from-white via-pink-500 to-white-500 shadow-lg border-b border-gray-100 backdrop-blur-sm"> */}
      <nav className="bg-white-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Brand Logo */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 font-bold text-xl">
                <a href="/" className="hover:opacity-80 transition-opacity duration-300">
                  <img src={logo} alt="LearnConnect" className="h-24 w-auto" />
                </a>
              </span>
            </div>

            {/* Desktop Navigation - Right Aligned */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {/* Navigation Links */}
              <div className="flex items-center space-x-1 mr-8">
                {commonLinks.concat(extraLinks).map(({ to, label }) => (
                  <NavLink key={to} to={to} className={desktopClass}>
                    {label}
                  </NavLink>
                ))}
              </div>
              <div className="hidden lg:flex lg:items-center lg:space-x-2">
                {LastLink.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={desktopClass}>
                    {label}
                  </NavLink>
                ))}
              </div>

              {/* Auth/Profile Section */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                {currentUser ? (
                  <>
                    <NavLink
                      to={profilePath}
                      className="flex items-center space-x-2 px-4 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300"
                    >
                      <ProfileImage
                        src={userProfile?.photo_url || currentUser?.photoURL || undefined}
                        alt="Profile"
                        name={userProfile?.name || currentUser?.displayName || 'User'}
                        className="w-8 h-8"
                        textClassName="text-sm"
                      />
                      <span>{userProfile?.name.split(' ')[0]}</span>

                    </NavLink>
                    <button
                      onClick={handleSignOutClick}
                      className="px-6 py-2 text-base font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/auth')}
                      className="px-6 py-2 text-base font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => navigate('/selectuser')}
                      className="px-6 py-2 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile toggle */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-3 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gradient-to-r from-white via-blue-50 to-purple-50 border-t border-gray-100">
            <div className="pt-4 pb-4 space-y-2 px-4">
              {commonLinks.concat(extraLinks).map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={mobileClass}
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <div className="pt-4 pb-6 border-t border-gray-200">
              <div className="flex flex-col space-y-3 px-4">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        navigate(profilePath);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-lg font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                    >
                      <ProfileImage
                        src={userProfile?.photo_url || currentUser?.photoURL || undefined}
                        alt="Profile"
                        name={userProfile?.name || currentUser?.displayName || 'User'}
                        className="w-8 h-8"
                        textClassName="text-sm"
                      />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={handleSignOutClick}
                      className="w-full px-4 py-3 text-lg font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-300"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        handleLoginClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-lg font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300"
                    >
                      Log in
                    </button>
                    <button
                      onClick={handleSignUpClick}
                      className="w-full px-4 py-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Sign Out
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to sign out? You'll need to log in again to access your account.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleCancelSignOut}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Role Selection Modal */}
      {showSignUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Join LearnConnect
              </h3>
              <p className="text-gray-600 mb-6">
                Choose how you'd like to get started
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelection('student')}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">I'm a Student</h4>
                    <p className="text-sm text-gray-600">Learn from expert tutors and access courses</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection('tutor')}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">I'm a Tutor</h4>
                    <p className="text-sm text-gray-600">Share your knowledge and create courses</p>
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseSignUpModal}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setShowSignUpModal(false);
                    handleLoginClick();
                  }}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Log in instead
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
