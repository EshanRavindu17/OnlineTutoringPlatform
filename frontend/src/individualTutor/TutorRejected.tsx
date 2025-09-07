import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Mail, RefreshCw } from 'lucide-react';

const TutorRejected: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleReapply = () => {
    // Navigate to tutor registration form for reapplication
    navigate('/become-tutor'); // Adjust path as needed
  };

  const handleContactSupport = () => {
    // Navigate to contact/support page
    navigate('/contact'); // Adjust path as needed
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Not Approved
          </h1>
          <p className="text-lg text-gray-600">
            Your tutor application has been reviewed but was not approved at this time.
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="space-y-6">
            {/* Status Message */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">
                    Application Status: Rejected
                  </h3>
                  <p className="text-sm text-red-700">
                    After careful review, your application did not meet our current requirements. 
                    Don't worry - you can reapply after addressing the feedback below.
                  </p>
                </div>
              </div>
            </div>

            {/* Common Reasons */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Common Reasons for Application Review:
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Incomplete or insufficient qualification documentation</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Teaching experience requirements not met</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Subject expertise verification needed</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Profile information requires more detail</span>
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                What You Can Do Next:
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Review and improve your qualifications
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact support for specific feedback
                </li>
                <li className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reapply with updated information
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleContactSupport}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </button>
          
          <button
            onClick={handleReapply}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reapply Now
          </button>
          
          <button
            onClick={handleBackToHome}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
        </div>

        {/* Support Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Have questions? Our support team is here to help you improve your application.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Response time: Usually within 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default TutorRejected;
