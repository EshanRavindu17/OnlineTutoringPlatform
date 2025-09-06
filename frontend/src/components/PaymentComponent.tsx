import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CheckCircle, AlertCircle, DollarSign, Loader2, CreditCard, User, Calendar, Clock } from 'lucide-react';
import paymentService, { PaymentIntentData } from '../api/paymentService';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface SessionData {
  tutorId: string;
  tutorName: string;
  tutorPhoto: string;
  studentId: string;
  subject: string;
  selectedDate: string;
  selectedSlots: string[];
  hourlyRate: number;
  sessionTimeRange: string;
  duration: number;
}

interface PaymentComponentProps {
  sessionData: SessionData;
  onSuccess: (sessionId: string) => void;
  onCancel: () => void;
}

interface PaymentFormProps {
  sessionData: SessionData;
  onSuccess: (sessionId: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ sessionData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');

  const totalAmount = sessionData.hourlyRate * sessionData.duration;

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Convert Rs. to USD for Stripe (approximate conversion: 1 USD = 300 LKR)
        const usdAmount = Math.round(totalAmount / 300);
        
        const paymentData: PaymentIntentData = {
          amount: usdAmount, // Convert Rs. to USD
          tutorId: sessionData.tutorId,
          studentId: sessionData.studentId,
          sessionDate: sessionData.selectedDate,
          sessionTime: sessionData.selectedSlots[0], // First slot as start time
          duration: sessionData.duration,
          subject: sessionData.subject,
          selectedSlots: sessionData.selectedSlots
        };

        const { clientSecret } = await paymentService.createPaymentIntent(paymentData);
        setClientSecret(clientSecret);
      } catch (error) {
        setErrorMessage('Failed to initialize payment. Please try again.');
        setPaymentStatus('error');
      }
    };

    createPaymentIntent();
  }, [sessionData, totalAmount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setPaymentStatus('processing');
    setErrorMessage('');

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setErrorMessage('Card element not found');
      setPaymentStatus('error');
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: sessionData.studentId, // You might want to pass actual student name
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setPaymentStatus('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await paymentService.confirmPayment(paymentIntent.id, sessionData);
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess(paymentIntent.id);
        }, 2000);
      }
    } catch (error) {
      setErrorMessage('Payment processing failed. Please try again.');
      setPaymentStatus('error');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your session has been booked successfully.</p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-semibold">Session Details:</p>
          <p className="text-green-700">Date: {sessionData.selectedDate}</p>
          <p className="text-green-700">Time: {sessionData.sessionTimeRange}</p>
          <p className="text-green-700">Subject: {sessionData.subject}</p>
          <p className="text-green-700">Amount: Rs. {totalAmount.toLocaleString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
          Complete Payment
        </h2>

        {/* Session Summary */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Summary</h3>
          
          <div className="flex items-center mb-4">
            <img 
              src={sessionData.tutorPhoto || 'https://via.placeholder.com/60'} 
              alt={sessionData.tutorName}
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <p className="font-semibold text-gray-800 flex items-center">
                <User className="w-4 h-4 mr-2" />
                {sessionData.tutorName}
              </p>
              <p className="text-gray-600">{sessionData.subject}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-gray-700">{sessionData.selectedDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-gray-700">{sessionData.sessionTimeRange}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-800">{sessionData.duration} hour(s)</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Rate:</span>
              <span className="text-gray-800">Rs. {sessionData.hourlyRate.toLocaleString()}/hour</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg">
              <span className="text-gray-800">Total:</span>
              <span className="text-blue-600">Rs. {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{errorMessage}</span>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={paymentStatus === 'processing'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || ['processing', 'success'].includes(paymentStatus)}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center"
            >
              {paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Rs. {totalAmount.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Test Mode:</strong> Use test card 4242424242424242 with any future expiry date and any CVC.
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Note: For demo purposes, Rs. {totalAmount.toLocaleString()} is converted to ~${Math.round(totalAmount / 300)} USD for Stripe processing.
          </p>
        </div>
      </div>
    </div>
  );
};

const PaymentComponent: React.FC<PaymentComponentProps> = ({ sessionData, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm sessionData={sessionData} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

export default PaymentComponent;
