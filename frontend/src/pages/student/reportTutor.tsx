import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Flag, 
  AlertTriangle,
  CheckCircle,
  User
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getIndividualTutorById, generateReport, getStudentIDByUserID, getTutorNameAndTypeById } from '../../api/Student';
import { useAuth } from '../../context/authContext';
import { useToast } from '../../components/Toast';

export default function ReportTutorPage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { showToast, ToastContainer } = useToast();
  
  const [reportReason, setReportReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tutorName, setTutorName] = useState("Dr Sarah Johnson");
  const [tutorType, setTutorType] = useState('unknown');
  const [studentId, setStudentId] = useState<string | null>(null);

  // Mock tutor data - in real app, this would be fetched based on tutorId
  // const tutorName = 'Dr. Sarah Johnson';

  const reportReasons = [
    'Inappropriate behavior',
    'Unprofessional conduct',
    'No-show for scheduled sessions',
    'Poor teaching quality',
    'Harassment or discrimination',
    'Fraudulent activity',
    'Violation of platform policies',
    'Other'
  ];

  useEffect(() => {
    // Fetch tutor details and student ID
    const fetchData = async () => {
      if (!tutorId) {
        console.error('No tutor ID provided');
        return;
      }
      
      try {
        // Fetch tutor details
        const tutorDetails = await getIndividualTutorById(tutorId);
        const response = await getTutorNameAndTypeById(tutorId);
        console.log("fetchedTutorType", response.type);
        const tutorName = tutorDetails?.User?.name || 'Unknown Tutor';
        console.log("Fetched tutor name:", tutorName);
        setTutorName(tutorName);
        // setTutorName(response.name);
        setTutorType(response.type);
        // Fetch student ID if user is logged in
        if (userProfile?.id) {
          const fetchedStudentId = await getStudentIDByUserID(userProfile.id);
          setStudentId(fetchedStudentId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load tutor details', 'error');
      }
    };

    fetchData();
  }, [tutorId, userProfile]);


  useEffect(()=>{
    if(tutorType === 'unknown'){
      console.error('Could not determine tutor type. Please try again later.');
    }
    console.log("Tutor type:", tutorType);
  }, [tutorType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportReason || !description.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!studentId || !tutorId) {
      showToast('Missing required information. Please try again.', 'error');
      return;
    }

    if (description.trim().length < 20) {
      showToast('Please provide at least 20 characters in your description', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('tutorType', tutorType);
      // Call the generateReport API with tutor_type as "individual"
      await generateReport(
        studentId,
        tutorId,
        tutorType, // for now, we pass the fetched tutorType
        description.trim(),
        reportReason
      );
      
      setIsSubmitted(true);
      showToast('Report submitted successfully', 'success');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate(-1);
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting report:', error);
      showToast(error.message || 'Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <ToastContainer />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Report Submitted Successfully</h1>
            <p className="text-gray-600 mb-6">
              Thank you for bringing this to our attention. We take all reports seriously and will investigate this matter promptly.
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-green-800 font-semibold mb-2">What happens next:</p>
              <ul className="text-green-700 text-sm space-y-1 text-left">
                <li>• Our moderation team will review your report within 24 hours</li>
                <li>• We may contact you for additional information if needed</li>
                <li>• Appropriate action will be taken based on our investigation</li>
                <li>• You will receive an email confirmation of our review</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">Redirecting you back...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <ToastContainer />
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Report Tutor</h1>
              <p className="text-gray-600">Help us maintain a safe learning environment</p>
            </div>
          </div>

          {/* Tutor Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Reporting: <strong>{tutorName}</strong></span>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-yellow-800">
                <p className="font-semibold mb-1">Important Notice</p>
                <p className="text-sm">
                  Please only submit reports for genuine concerns. False or malicious reports may result in action against your account. 
                  All reports are reviewed confidentially and appropriate action will be taken.
                </p>
              </div>
            </div>
          </div>

          {/* Report Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What is the reason for your report? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {reportReasons.map((reason) => (
                  <label key={reason} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="mr-3 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please provide details about your concern <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Please describe the incident or concern in detail. Include dates, times, and any relevant information that will help us investigate this matter. The more specific information you provide, the better we can address your concern."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 20 characters required. Be specific and factual in your description.
              </p>
            </div>

            {/* Anonymity Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Privacy:</strong> Your identity will be kept confidential during the investigation process. 
                However, we may need to contact you for additional information if required.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reportReason || description.trim().length < 20}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Report...
                  </div>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
