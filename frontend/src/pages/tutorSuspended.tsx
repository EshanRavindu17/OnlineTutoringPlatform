import React from 'react';
import { useAuth } from '../context/authContext';
import { XCircle, Mail, Phone, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

const TutorSuspended: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Status Icon */}
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Account Suspended
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Your tutor account has been temporarily suspended. This may be due to policy violations, 
            quality concerns, or other administrative reasons.
          </p>

          {/* Status Card */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <span className="font-semibold text-red-800">Account Suspended</span>
            </div>
            <p className="text-red-700">
              {userProfile?.message || 'Your tutor account has been suspended'}
            </p>
          </div>

          {/* Possible Reasons */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Common Reasons for Suspension
            </h2>
            <ul className="space-y-3 text-gray-600 max-w-md mx-auto">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <span>Violation of platform policies or terms of service</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <span>Multiple student complaints or low ratings</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <span>Inappropriate behavior or unprofessional conduct</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <span>Failure to provide quality tutoring services</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                <span>Non-compliance with verification requirements</span>
              </li>
            </ul>
          </div>

          {/* What to Do Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              What can you do?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-medium text-blue-800 mb-2">1. Review the Issue</h3>
                <p className="text-sm text-blue-700">
                  Check your email for specific details about the suspension reason
                </p>
              </div>
              <div>
                <h3 className="font-medium text-blue-800 mb-2">2. Contact Support</h3>
                <p className="text-sm text-blue-700">
                  Reach out to our support team to discuss the suspension
                </p>
              </div>
              <div>
                <h3 className="font-medium text-blue-800 mb-2">3. Submit Appeal</h3>
                <p className="text-sm text-blue-700">
                  If you believe this is an error, you can submit an appeal
                </p>
              </div>
              <div>
                <h3 className="font-medium text-blue-800 mb-2">4. Plan for Reinstatement</h3>
                <p className="text-sm text-blue-700">
                  Work with our team on steps to resolve the issues
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">
              Contact Support Team
            </h3>
            <p className="text-yellow-700 mb-4">
              Our support team is here to help you understand the suspension and guide you 
              through the appeal process if applicable.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <a 
                href="mailto:appeals@tutorly.com" 
                className="flex items-center text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                appeals@tutorly.com
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center text-yellow-600 hover:text-yellow-800 transition-colors"
              >
                <Phone className="w-4 h-4 mr-2" />
                (123) 456-7890
              </a>
            </div>
          </div>

          {/* Return to Home */}
          <div className="mt-8">
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSuspended;
