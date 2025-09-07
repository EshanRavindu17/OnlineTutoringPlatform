import React from 'react';
import { useAuth } from '../context/authContext';
import { Clock, Mail, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import Navbar from '../components/Navbar';

const TutorPending: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Status Icon */}
          <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Application Under Review
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for your interest in becoming an individual tutor on our platform! 
            Your application is currently being reviewed by our admin team.
          </p>

          {/* Status Card */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">Pending Approval</span>
            </div>
            <p className="text-yellow-700">
              {userProfile?.message || 'Your tutor application is pending approval'}
            </p>
          </div>

          {/* What Happens Next */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              What happens next?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Review Process</h3>
                <p className="text-sm text-gray-600">
                  Our team will review your qualifications and documents
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Email Notification</h3>
                <p className="text-sm text-gray-600">
                  You'll receive an email with the approval decision
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Access Granted</h3>
                <p className="text-sm text-gray-600">
                  Once approved, you can start tutoring students
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="text-left max-w-md mx-auto mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Typical Review Timeline</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Document verification: 1-2 business days</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Qualification review: 2-3 business days</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span>Final approval: 1 business day</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Need Help?
            </h3>
            <p className="text-blue-700 mb-4">
              If you have any questions about your application or need to update your information, 
              please don't hesitate to contact us.
            </p>
            <div className="flex items-center justify-center space-x-6">
              <a 
                href="mailto:support@tutorly.com" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                support@tutorly.com
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
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
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPending;
