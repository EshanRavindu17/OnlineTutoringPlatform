import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, CheckCircle, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react';
import { sendVerificationEmail, reloadUserVerificationStatus } from '../utils/emailVerification';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const role = location.state?.role || 'student';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    // Check verification status periodically
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        const isVerified = await reloadUserVerificationStatus(auth.currentUser);
        if (isVerified) {
          clearInterval(interval);
          navigate('/auth', { replace: true });
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      setError('No user found. Please try signing up again.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    const result = await sendVerificationEmail(auth.currentUser);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to send verification email. Please try again.');
    }
    
    setLoading(false);
  };

  const handleCheckVerification = async () => {
    if (!auth.currentUser) {
      setError('No user found. Please try signing up again.');
      return;
    }

    setCheckingVerification(true);
    setError('');
    
    const isVerified = await reloadUserVerificationStatus(auth.currentUser);
    
    if (isVerified) {
      navigate('/auth', { replace: true });
    } else {
      setError('Email not yet verified. Please check your inbox and click the verification link.');
    }
    
    setCheckingVerification(false);
  };

  const handleBackToAuth = async () => {
    await signOut(auth);
    navigate('/auth', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-blue-100">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-blue-600 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)'
              }}></div>
            </div>
            
            <div className="relative text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-white bg-opacity-20 mb-4 shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
              <p className="text-blue-100 text-lg">
                We've sent a verification link to your email address
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 py-8">
            {/* Email Display */}
            {email && (
              <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-sm">
                <div className="flex items-center justify-center">
                  <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm">
                    <Mail className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-sm font-semibold text-blue-900">{email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                What to do next:
              </h3>
              <ol className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold text-white">1</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-900">Check your email inbox</p>
                    <p className="text-xs text-gray-600 mt-1">Look for a verification message from Tutorly</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold text-white">2</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-900">Click the verification link</p>
                    <p className="text-xs text-gray-600 mt-1">This will verify your email address with us</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-sm font-bold text-white">3</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-medium text-gray-900">Return here and check status</p>
                    <p className="text-xs text-gray-600 mt-1">Or wait for automatic detection</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Role-specific message */}
            {(role === 'Individual' || role === 'Mass') && (
              <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-yellow-900 mb-2">Tutor Application Process</h4>
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      After email verification, your <span className="font-semibold">{role.toLowerCase()} tutor application</span> will be carefully reviewed by our admin team. You'll receive a notification once the review is complete.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-400 rounded-r-xl shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-5 bg-green-50 border-l-4 border-green-400 rounded-r-xl shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Verification email sent successfully! Please check your inbox.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleCheckVerification}
                disabled={checkingVerification}
                className="w-full flex justify-center items-center py-4 px-6 border-2 border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                {checkingVerification ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Checking Status...
                  </>
                ) : (
                  <>
                    <CheckCircle className="-ml-1 mr-3 h-5 w-5" />
                    Check Verification Status
                  </>
                )}
              </button>

              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-6 border-2 border-blue-200 rounded-xl shadow-sm text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Mail className="-ml-1 mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={handleBackToAuth}
                className="w-full flex justify-center items-center py-3 px-6 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                <ArrowLeft className="-ml-1 mr-2 h-4 w-4" />
                Back to Login
              </button>
            </div>

            {/* Additional Help */}
            <div className="mt-8 text-center">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Need Help?
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Didn't receive the email? Check your spam folder or contact our support team for assistance.
                </p>
              </div>
            </div>

            {/* Auto-checking notification */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
                <RefreshCw className="animate-spin h-4 w-4 text-blue-600 mr-2" />
                <span className="text-xs font-medium text-blue-700">
                  Auto-checking verification status...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
