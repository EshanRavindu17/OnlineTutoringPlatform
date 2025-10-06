import React, { useState } from 'react';
import { Megaphone, Send, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { massTutorAPI } from '../../api/massTutorAPI';
import toast from 'react-hot-toast';

export default function BroadcastPage() {
  const [studentEmail, setStudentEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [className, setClassName] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!studentEmail || !subject || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSending(true);
      const result = await massTutorAPI.sendStudentEmail({
        studentEmail,
        subject,
        message,
        className: className || undefined,
      });

      // Show success message with student name if available
      const successMessage = result.studentName 
        ? `Email sent successfully to ${result.studentName}!`
        : 'Email sent successfully!';
      
      toast.success(successMessage, {
        duration: 4000,
        icon: '✉️',
      });
      
      // Reset form
      setStudentEmail('');
      setSubject('');
      setMessage('');
      setClassName('');
    } catch (error: any) {
      console.error('Error sending email:', error);
      
      // Extract error details from response
      const errorData = error.response?.data;
      const errorCode = errorData?.code;
      const errorMessage = errorData?.error;
      
      // Provide specific error messages based on error code
      let displayMessage = 'Failed to send email. Please try again.';
      let duration = 5000;
      
      if (errorCode === 'STUDENT_NOT_FOUND') {
        displayMessage = errorMessage || `No student found with email "${studentEmail}". The student must be registered on the platform.`;
        duration = 6000;
      } else if (errorCode === 'NOT_A_STUDENT') {
        displayMessage = errorMessage || `This email belongs to a registered user, but not as a student. Only students can receive tutor messages.`;
        duration = 6000;
      } else if (errorCode === 'EMAIL_DELIVERY_FAILED') {
        displayMessage = 'Email service is currently unavailable. Please try again later.';
        duration = 5000;
      } else if (errorCode === 'TUTOR_NOT_FOUND') {
        displayMessage = 'Your tutor profile was not found. Please contact support.';
        duration = 5000;
      } else if (errorMessage) {
        displayMessage = errorMessage;
      }
      
      toast.error(displayMessage, {
        duration,
        style: {
          maxWidth: '500px',
        },
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-3 rounded-xl">
            <Megaphone className="w-7 h-7 text-blue-700" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Broadcast Messages</h2>
        </div>
        <p className="text-gray-600 ml-16">
          Send announcements and messages to your students via email
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast to Class - Coming Soon */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Broadcast to Class</h3>
            <p className="text-sm text-gray-600 mb-4">
              Send announcements to all students in a specific class
            </p>
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>
          </div>
        </div>

        {/* Message a Student - Active */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2.5 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Message a Student</h3>
                <p className="text-sm text-gray-600 mt-0.5">Send a personalized email to a student</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSendEmail} className="p-6 space-y-5">
            {/* Student Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="student@example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">
                The student must be registered on the platform
              </p>
            </div>

            {/* Class Name (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class Name <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., Combined Maths — Grade 12"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Reference which class this message relates to
              </p>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Email subject"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                rows={8}
                placeholder="Write your message here..."
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">
                {message.length} characters
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Email will be sent from Tutorly</p>
                <p className="text-blue-700">
                  The student will receive this message in their inbox and can reply directly to you.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Email</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Activity / Tips Section */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Effective Communication</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Be Clear and Concise</p>
              <p className="text-xs text-gray-600 mt-1">
                Keep your message focused on one topic for better understanding
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Professional Tone</p>
              <p className="text-xs text-gray-600 mt-1">
                Maintain a professional yet friendly tone in all communications
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 text-sm">Timely Responses</p>
              <p className="text-xs text-gray-600 mt-1">
                Reply to student queries promptly to maintain engagement
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
