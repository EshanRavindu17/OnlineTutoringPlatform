import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentComponent from '../../components/PaymentComponent';

export default function PaymentDemoPage() {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  // Mock session data for demo (prices in Sri Lankan Rupees)
  const mockSessionData = {
    tutorId: "93e62aef-2762-4b11-beaf-c0cf73ad7084", // Valid UUID format
    tutorName: "John Smith",
    tutorPhoto: "https://via.placeholder.com/150",
    studentId: "f4832651-f7ff-4466-a19a-87d83f27223e", // Valid UUID format
    subject: "Mathematics",
    hourlyRate: 2500, // Rs. 2500 per hour
    duration: 2, // 2 hours
    selectedDate: "2024-01-15",
    selectedSlots: ["10:00", "11:00"],
    sessionTimeRange: "10:00 - 12:00"
  };

  const handlePaymentSuccess = (sessionId: string) => {
    console.log('Payment successful! Session ID:', sessionId);
    alert(`Payment successful! Your session has been booked. Session ID: ${sessionId}`);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto py-8 px-4">
          <PaymentComponent
            sessionData={mockSessionData}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Gateway Demo</h1>
          <p className="text-gray-600 mb-8">
            This is a demo page to test the Stripe payment integration for session bookings.
          </p>

          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Demo Session Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-700"><strong>Tutor:</strong> {mockSessionData.tutorName}</p>
                <p className="text-blue-700"><strong>Subject:</strong> {mockSessionData.subject}</p>
                <p className="text-blue-700"><strong>Date:</strong> {mockSessionData.selectedDate}</p>
              </div>
              <div>
                <p className="text-blue-700"><strong>Time:</strong> {mockSessionData.sessionTimeRange}</p>
                <p className="text-blue-700"><strong>Duration:</strong> {mockSessionData.duration} hours</p>
                <p className="text-blue-700"><strong>Rate:</strong> Rs. {mockSessionData.hourlyRate.toLocaleString()}/hour</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-lg font-semibold text-blue-800">
                Total: Rs. {(mockSessionData.hourlyRate * mockSessionData.duration).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setShowPayment(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Test Payment Process
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
          </div>

          <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-yellow-800 font-semibold mb-2">Test Instructions:</h3>
            <ul className="text-yellow-700 space-y-1">
              <li>• This uses Stripe test mode - no real payments will be charged</li>
              <li>• Use test card number: 4242424242424242</li>
              <li>• Use any future expiry date (e.g., 12/34)</li>
              <li>• Use any 3-digit CVC (e.g., 123)</li>
              <li>• Use any postal code (e.g., 12345)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
