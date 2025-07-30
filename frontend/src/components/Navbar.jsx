// src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/authContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const toggleMenu = () => setIsMenuOpen(open => !open);

  // Common navigation items
  const commonLinks = [
    { to: '/',        label: 'Home'       },
    { to: '/findtutors', label: 'Find Tutors' },
    { to: '/courses',    label: 'Courses'    },
    { to: '/resources',  label: 'Resources'  },
  ];

  // Role-specific items
  const studentLinks = [
    { to: '/studentcourses', label: 'My Courses' },
    { to: '/stripe-payment', label: 'Payments'   },
  ];

  const tutorLinks = [
    { to: '/addnewcourse', label: 'Create Course' },
    { to: '/mycourses',     label: 'My Courses'     },
    { to: '/tutorcalender',     label: 'Schedule Meeting'     },
  ];

  // Pick the right extras
  let extraLinks = [];
  if (userProfile?.role === 'student') extraLinks = studentLinks;
  if (userProfile?.role === 'tutor')   extraLinks = tutorLinks;

  // Profile path
  const profilePath =
    userProfile?.role === 'tutor'
      ? '/tutorprofile'
      : '/studentprofile';

  const handleSignOutClick = () => {
    setShowSignOutModal(true);
  };

  const handleSignUpClick = () => {
    setShowSignUpModal(true);
  };

  const handleLoginClick = () => {
    navigate('/selectuser');
  };

  const handleRoleSelection = (role) => {
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
  const desktopClass = ({ isActive }) =>
    `inline-flex items-center px-1 pt-1 text-sm font-medium ${
      isActive
        ? 'font-bold text-gray-900 border-b-2 border-blue-500'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  const mobileClass = ({ isActive }) =>
    `block pl-3 pr-4 py-2 text-base font-medium ${
      isActive
        ? 'font-bold text-blue-700 bg-blue-50 border-l-4 border-blue-500'
        : 'text-gray-700 hover:bg-gray-50 hover:border-gray-300'
    }`;

  return (
    <>
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Brand + desktop nav */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-blue-600 font-bold text-xl">
                  LearnConnect
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {commonLinks.concat(extraLinks).map(({ to, label }) => (
                  <NavLink key={to} to={to} className={desktopClass}>
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Desktop auth/profile */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {currentUser ? (
                <>
                  <NavLink
                    to={profilePath}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleSignOutClick}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/selectuser')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate('/selectuser')}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
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
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4 space-x-3">
                {currentUser ? (
                  <>
                    <button
                      onClick={() => {
                        navigate(profilePath);
                        setIsMenuOpen(false);
                      }}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Profile
                    </button>
                    <button
                      onClick={handleSignOutClick}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
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
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Log in
                    </button>
                    <button
                      onClick={handleSignUpClick}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
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