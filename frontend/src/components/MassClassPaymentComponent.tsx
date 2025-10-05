import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  Loader2, 
  CreditCard, 
  User, 
  Calendar, 
  Clock,
  BookOpen,
  Star,
  Users,
  X,
  Shield,
  Lock
} from 'lucide-react';
import paymentService from '../api/paymentService';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface MassClassData {
  classId: string;
  title: string;
  subject: string;
  tutorName: string;
  tutorPhoto: string;
  tutorRating: number;
  price: number;
  duration: string;
  schedule: string;
  studentsEnrolled: number;
  maxStudents: number;
}

interface MassClassPaymentComponentProps {
  classData: MassClassData;
  studentId: string;
  onSuccess: (enrollmentId: string) => void;
  onCancel: () => void;
}

interface PaymentFormProps {
  classData: MassClassData;
  studentId: string;
  onSuccess: (enrollmentId: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ classData, studentId, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');

  // Debug: Log whenever paymentStatus changes
  useEffect(() => {
    console.log('💡 Payment status changed to:', paymentStatus);
  }, [paymentStatus]);

  // Convert Rs. to USD for Stripe (approximate conversion: 1 USD = 300 LKR)
//   const usdAmount = Math.round((classData.price * 100) / 300); // Amount in cents

     const price = classData.price;

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('Creating payment intent for mass class:', {
          studentId,
          classId: classData.classId,
          amount: price
        });

        const { clientSecret, paymentIntentId } = await paymentService.createPaymentIntentForMass({
          studentId,
          classId: classData.classId,
          amount: price
        });

        console.log('Payment intent created:', { clientSecret, paymentIntentId });
        setClientSecret(clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setErrorMessage('Failed to initialize payment. Please try again.');
        setPaymentStatus('error');
      }
    };

    if (studentId && classData.classId) {
      createPaymentIntent();
    }
  }, [studentId, classData.classId, price]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Payment system not ready. Please wait a moment and try again.');
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
            name: 'Student', // You can make this dynamic if you have student name
          },
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        setPaymentStatus('error');
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded:', paymentIntent);
        console.log('Current payment status before setting to success:', paymentStatus);
        
        // Confirm payment with backend and create enrollment
        try {
          console.log('Confirming payment with backend...');
          const result = await paymentService.confirmPaymentForMass(
            paymentIntent.id,
            studentId,
            classData.classId,
            price
          );
          
          console.log('Payment confirmed and enrollment created:', result);
          console.log('Setting payment status to success...');
          setPaymentStatus('success');
          
          // Call success callback after showing success message
          setTimeout(() => {
            console.log('Calling onSuccess callback...');
            onSuccess(result.enrollmentId || paymentIntent.id);
          }, 3000); // Increased delay to 3 seconds
        } catch (confirmError) {
          console.error('Error confirming payment:', confirmError);
          setErrorMessage('Payment processed but enrollment failed. Please contact support.');
          setPaymentStatus('error');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrorMessage('Payment processing failed. Please try again.');
      setPaymentStatus('error');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (paymentStatus === 'success') {
    console.log('Rendering success component for:', classData.title);
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            You've successfully enrolled in <strong>{classData.title}</strong>
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm font-medium">
              ✅ You now have full access to all class sessions, materials, and recordings.
            </p>
          </div>
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-500">Redirecting in 3 seconds...</p>
            <button
              onClick={() => onSuccess('manual-success')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Continue to Class
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Complete Your Enrollment</h2>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Shield className="w-4 h-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>

      <div className="p-6">
        {/* Class Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Class Summary</h3>
          
          <div className="flex items-start space-x-4 mb-4">
            <img
              src={classData.tutorPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'}
              alt={classData.tutorName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{classData.title}</h4>
              <p className="text-sm text-gray-600">{classData.subject}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-700">{classData.tutorName}</span>
                <div className="flex items-center space-x-1">
                  {renderStars(classData.tutorRating)}
                  <span className="text-xs text-gray-600">({classData.tutorRating})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{classData.schedule}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{classData.duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{classData.studentsEnrolled}/{classData.maxStudents} students</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>Full access</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Price Display */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Monthly Subscription</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  Rs. {classData.price.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
          </div>

          {/* Card Element */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <CreditCard className="w-4 h-4" />
              <span>Card Information</span>
            </label>
            <div className="border border-gray-300 rounded-lg p-3 bg-white">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Test Card Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Test Card Information:</h4>
            <div className="text-xs text-yellow-700 space-y-1">
              <p>• Card Number: 4242424242424242</p>
              <p>• Expiry: Any future date (e.g., 12/34)</p>
              <p>• CVC: Any 3 digits (e.g., 123)</p>
              <p>• Postal Code: Any valid code</p>
            </div>
          </div>

          {/* Debug Status */}
          <div className="text-xs text-gray-500 text-center space-y-2">
            <p>Status: {paymentStatus} | ClientSecret: {clientSecret ? 'Ready' : 'Loading...'}</p>
            <button
              type="button"
              onClick={() => {
                console.log('🧪 Testing success state...');
                setPaymentStatus('success');
              }}
              className="text-xs bg-yellow-200 px-2 py-1 rounded hover:bg-yellow-300"
            >
              Test Success State
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || !clientSecret || paymentStatus === 'processing'}
              className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay Rs. {classData.price.toLocaleString()}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MassClassPaymentComponent: React.FC<MassClassPaymentComponentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default MassClassPaymentComponent;