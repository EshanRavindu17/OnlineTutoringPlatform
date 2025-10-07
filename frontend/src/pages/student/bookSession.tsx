import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import NavBar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getFreeTimeSlotsByTutorId, getIndividualTutorById, getStudentIDByUserID ,findTimeSlots, updateAccessTimeinFreeSlots} from '../../api/Student';
import { paymentService } from '../../api/paymentService';
import { useAuth } from '../../context/authContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY!);

interface TutorData {
  i_tutor_id: string;
  subjects: string[];
  titles: string[];
  hourly_rate: number;
  rating: number;
  description: string;
  qualifications: string[];
  location: string;
  phone_number: string;
  heading?: string;
  User?: {
    name: string;
    photo_url: string | null;
    email: string | null;
  } | null;
}

interface TimeSlot {
  slot_id: string;
  i_tutor_id: string;
  date: string;
  status: string;
  start_time: string;
  end_time: string;
  last_access_time: string | null;
}

interface ProcessedTimeSlot {
  time: string;
  lastAccessTime: Date | null;
  slot_id: string;
}

interface SessionData {
  student_id: string;
  title:string;
  i_tutor_id: string;
  slots: string[]; // Array of slot times like "1970-01-01T15:00:00.000Z"
  status: string;
  price: number;
  date: string; // Date of the session
}

// PaymentForm component for Stripe integration
interface PaymentFormProps {
  sessionData: {
    tutorId: string;
    studentId: string;
    subject: string;
    selectedDate: string;
    selectedSlots: string[];
    hourlyRate: number;
    sessionTimeRange: string;
    duration: number;
    tutorName: string;
  };
  onSuccess: (sessionId: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ sessionData, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const { userProfile } = useAuth();

  const totalAmount = sessionData.hourlyRate * sessionData.duration;

  // Create payment intent when component mounts
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Convert Rs. to USD for Stripe (approximate conversion: 1 USD = 300 LKR)
        const usdAmount = Math.round(totalAmount / 300);
        
        const paymentData = {
          amount: usdAmount,
          currency: 'usd',
          tutorId: sessionData.tutorId,
          studentId: sessionData.studentId,
          sessionDate: sessionData.selectedDate,
          sessionTime: sessionData.selectedSlots[0],
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
      // Get student_id from user_id
      const studentId = await getStudentIDByUserID(sessionData.studentId);
      if (!studentId) {
        setErrorMessage('Student information not found');
        setPaymentStatus('error');
        return;
      }

      const formattedSlots = sessionData.selectedSlots.map(timeSlot => {
          const [hours, minutes] = timeSlot.split(':');
          return `1970-01-01T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00.000Z`;
        });


      const timeSlots = await findTimeSlots(sessionData.selectedDate,sessionData.tutorId,formattedSlots);
      console.log("Time Slots:", timeSlots);

      if(timeSlots.length < formattedSlots.length) {
        setErrorMessage('Some selected time slots are unavailable now . Please go back and reload and try again.');
        setPaymentStatus('error');
        return;
      }

      

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // name: sessionData.tutorName,
            name: userProfile?.name || 'Student',
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setPaymentStatus('error');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Convert selected time slots to proper format for the backend
        // const formattedSlots = sessionData.selectedSlots.map(timeSlot => {
        //   const [hours, minutes] = timeSlot.split(':');
        //   return `1970-01-01T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00.000Z`;
        // });

        // Prepare session details for backend
        const sessionDetails = {
          student_id: studentId,
          i_tutor_id: sessionData.tutorId,
          slots: formattedSlots,
          status: 'scheduled',
          price: totalAmount,
          subject: sessionData.subject,
          date: sessionData.selectedDate
        };

        // Confirm payment on backend
        await paymentService.confirmPayment(paymentIntent.id, sessionDetails);
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess(paymentIntent.id);
        }, 2000);
      }
    } catch (error: any) {
      setErrorMessage( error.message);
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Payment</h2>
        
        {/* Session Summary */}
        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Session Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700"><strong>Tutor:</strong> {sessionData.tutorName}</p>
              <p className="text-blue-700"><strong>Subject:</strong> {sessionData.subject}</p>
              <p className="text-blue-700"><strong>Date:</strong> {sessionData.selectedDate}</p>
            </div>
            <div>
              <p className="text-blue-700"><strong>Time:</strong> {sessionData.sessionTimeRange}</p>
              <p className="text-blue-700"><strong>Duration:</strong> {sessionData.duration} hour{sessionData.duration > 1 ? 's' : ''}</p>
              <p className="text-blue-700"><strong>Rate:</strong> Rs. {sessionData.hourlyRate.toLocaleString()}/hour</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-lg font-semibold text-blue-800">
              Total: Rs. {totalAmount.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={!stripe || paymentStatus === 'processing'}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {paymentStatus === 'processing' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay Rs. ${totalAmount.toLocaleString()}`
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h4 className="text-yellow-800 font-semibold mb-2">Test Payment Instructions:</h4>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Use test card: 4242 4242 4242 4242</li>
            <li>• Use any future expiry date (e.g., 12/34)</li>
            <li>• Use any 3-digit CVC (e.g., 123)</li>
            <li>• Use any postal code (e.g., 12345)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default function BookSessionPage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'payment' | 'loading' | 'success' | 'error'>('idle');
  const [tutorData, setTutorData] = useState<TutorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<ProcessedTimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  // Fetch tutor data on component mount
  useEffect(() => {
    const fetchTutorData = async () => {
      if (!tutorId) {
        console.error('No tutor ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching tutor data for booking page, ID:', tutorId);
        
        const apiResponse = await getIndividualTutorById(tutorId);
        console.log('Tutor data received:', apiResponse);
        
        setTutorData(apiResponse);
      } catch (error) {
        console.error('Failed to fetch tutor data:', error);
        // Continue with limited functionality even if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [tutorId]);

  // Fetch free time slots for the selected date
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!tutorId || !selectedDate) {
        setSlotsLoading(false);
        return;
      }

      try {
        setSlotsLoading(true);
        // Clear selected slots when date changes
        setSelectedSlots([]);
        
        console.log('Fetching time slots for tutor:', tutorId, 'date:', selectedDate);
        
        const apiResponse = await getFreeTimeSlotsByTutorId(tutorId);
        console.log('Time slots received:', apiResponse);
        
        if (apiResponse && Array.isArray(apiResponse)) {
          // Filter slots for the selected date and process them
          const dateFilteredSlots = apiResponse.filter((slot: TimeSlot) => {
            const slotDate = new Date(slot.date).toISOString().split('T')[0];
            return slotDate === selectedDate;
          });

          // Convert API response to processed time slots and apply 5-minute access control
          const processedSlots: ProcessedTimeSlot[] = dateFilteredSlots
            .map((slot: TimeSlot) => {
              // Extract time from start_time (format: "1970-01-01T09:00:00.000Z")
              // Split by 'T' and get the time part, then split by ':' to get hours and minutes
              const timePart = slot.start_time.split('T')[1]; // Gets "09:00:00.000Z"
              const timeString = timePart.split(':').slice(0, 2).join(':'); // Gets "09:00"
              
              return {
                time: timeString,
                lastAccessTime: slot.last_access_time ? new Date(slot.last_access_time) : null,
                slot_id: slot.slot_id
              };
            })
            .filter((slot: ProcessedTimeSlot) => {
              // Apply 5-minute access control - only show slots that should be rendered
              const shouldShow = shouldRenderSlot(slot.lastAccessTime);
              if (!shouldShow) {
                console.log(`Slot ${slot.time} hidden due to recent access (within 5 minutes)`);
              }
              return shouldShow;
            });

          console.log(`Showing ${processedSlots.length} available slots after 5-minute access control`);
          setAvailableSlots(processedSlots.sort((a, b) => a.time.localeCompare(b.time)));
        } else {
          // Fallback to empty array if no data
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Failed to fetch time slots:', error);
        // Fallback to hardcoded slots if API fails
        setAvailableSlots([
          { time: '09:00', lastAccessTime: null, slot_id: 'fallback-1' },
          { time: '10:00', lastAccessTime: null, slot_id: 'fallback-2' },
          { time: '11:00', lastAccessTime: null, slot_id: 'fallback-3' },
          { time: '13:00', lastAccessTime: null, slot_id: 'fallback-4' },
          { time: '14:00', lastAccessTime: null, slot_id: 'fallback-5' },
          { time: '15:00', lastAccessTime: null, slot_id: 'fallback-6' }
        ]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [tutorId, selectedDate]);

  // Dynamic subjects list based on tutor data, with fallback
  const subjects = (tutorData?.subjects && tutorData.subjects.length > 0) ? tutorData.subjects : ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to safely convert values to numbers
  const safeNumber = (value: any, fallback: number = 0): number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string' && !isNaN(Number(value))) {
      return Number(value);
    }
    return fallback;
  };

  // Helper function to check if a slot should be rendered based on 5-minute access control
  const shouldRenderSlot = (lastAccessTime: Date | null): boolean => {
    // If last_access_time is null, the slot should be rendered
    if (!lastAccessTime) {
      return true;
    }

    // Calculate the time difference between current time and last access time
    const currentTime = new Date();
    const timeDifferenceMs = currentTime.getTime() - lastAccessTime.getTime();
    const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60); // Convert to minutes

    // Slot should be rendered if the gap is greater than 5 minutes
    const shouldRender = timeDifferenceMinutes > 5;
    
    // Log detailed information for debugging
    console.log(`Access control check:`, {
      lastAccessTime: lastAccessTime.toISOString(),
      currentTime: currentTime.toISOString(),
      timeDifferenceMinutes: timeDifferenceMinutes.toFixed(2),
      shouldRender
    });

    return shouldRender;
  };

  // Update slot access time when selected (keeping for data structure)
  const updateSlotAccess = (timeSlot: string) => {
    setAvailableSlots(prev => 
      prev.map(slot => 
        slot.time === timeSlot 
          ? { ...slot, lastAccessTime: new Date() }
          : slot
      )
    );
  };

  // Check if slots are consecutive
  const areConsecutive = (slots: string[]): boolean => {
    if (slots.length <= 1) return true;
    
    const sortedSlots = [...slots].sort();
    for (let i = 1; i < sortedSlots.length; i++) {
      const prevHour = parseInt(sortedSlots[i - 1].split(':')[0]);
      const currHour = parseInt(sortedSlots[i].split(':')[0]);
      if (currHour - prevHour !== 1) {
        return false;
      }
    }
    return true;
  };

  const handleSlotSelection = (slot: string) => {
    // If slot is already selected, allow unselection
    if (selectedSlots.includes(slot)) {
      const newSelectedSlots = selectedSlots.filter(s => s !== slot);
      setSelectedSlots(newSelectedSlots);
      return;
    }

    // Add slot and update its access time
    const newSelectedSlots = [...selectedSlots, slot];
    updateSlotAccess(slot);
    
    // Check if the new selection maintains consecutive slots
    if (areConsecutive(newSelectedSlots)) {
      setSelectedSlots(newSelectedSlots);
    }
  };

  const getSessionTimeRange = (): string => {
    if (selectedSlots.length === 0) return '';
    
    const sortedSlots = [...selectedSlots].sort();
    const startTime = sortedSlots[0];
    const endHour = parseInt(sortedSlots[sortedSlots.length - 1].split(':')[0]) + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;
    
    return `${startTime} - ${endTime}`;
  };

  const getDurationInHours = (): number => {
    return selectedSlots.length;
  };

  const handleBooking = async () => {
    if (!selectedDate || selectedSlots.length === 0 || !subject || !userProfile || !tutorId) {
      setBookingStatus('error');
      return;
    }

    // Additional validation: Ensure selected date is not in the past
    if (selectedDate < getTodayDate()) {
      console.error('Cannot book sessions for past dates');
      setBookingStatus('error');
      return;
    }

    try {
      setBookingStatus('loading');

      // Update last access time for selected slots
      console.log('Updating last access time for selected slots...');
      const currentTime = new Date();
      
      // Get slot_ids for the selected time slots
      const selectedSlotIds = availableSlots
        .filter(slot => selectedSlots.includes(slot.time))
        .map(slot => slot.slot_id);

      console.log('Selected slot IDs:', selectedSlotIds);
      console.log('Updating access time to:', currentTime);

      // Update access time for each selected slot
      const updatePromises = selectedSlotIds.map(slotId => 
        updateAccessTimeinFreeSlots(slotId, currentTime)
      );

      await Promise.all(updatePromises);
      
      console.log('Successfully updated access time for all selected slots');

      // Update local state to reflect the change
      setAvailableSlots(prev => 
        prev.map(slot => 
          selectedSlots.includes(slot.time) 
            ? { ...slot, lastAccessTime: currentTime }
            : slot
        )
      );

      // Show payment form
      setBookingStatus('payment');
      
    } catch (error) {
      console.error('Failed to update slot access times:', error);
      setBookingStatus('error');
    }
  };

  const calculateCost = () => {
    const hourlyRate = safeNumber(tutorData?.hourly_rate, 65); // Use tutor's rate or fallback
    return (hourlyRate * getDurationInHours()).toFixed(2);
  };

  // Handle payment success
  const handlePaymentSuccess = (sessionId: string) => {
    console.log('Payment successful! Session ID:', sessionId);
    setBookingStatus('success');
    setTimeout(() => {
      navigate('/payment-history');
    }, 2000);
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setBookingStatus('idle');
  };

  // Show payment form
  if (bookingStatus === 'payment' && userProfile && tutorData) {
    const sessionData = {
      tutorId: tutorId!,
      studentId: userProfile.id, // We'll get the actual student_id in the PaymentForm
      subject: subject,
      selectedDate: selectedDate,
      selectedSlots: selectedSlots,
      hourlyRate: safeNumber(tutorData.hourly_rate, 65),
      sessionTimeRange: getSessionTimeRange(),
      duration: getDurationInHours(),
      tutorName: tutorData.User?.name || 'Unknown Tutor'
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <Elements stripe={stripePromise}>
            <PaymentForm
              sessionData={sessionData}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </Elements>
        </div>
        <Footer />
      </div>
    );
  }

  if (bookingStatus === 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Session Booked Successfully!</h1>
            <p className="text-gray-600 mb-6">Your tutoring session has been confirmed and payment processed. The selected time slots have been reserved.</p>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-green-800 font-semibold">Session Details:</p>
              <p className="text-green-700">Date: {selectedDate}</p>
              <p className="text-green-700">Time: {getSessionTimeRange()}</p>
              <p className="text-green-700">Subject: {subject}</p>
              <p className="text-green-700">Duration: {getDurationInHours()} hour{getDurationInHours() > 1 ? 's' : ''}</p>
              <p className="text-green-700">Total Cost: Rs.{calculateCost()}</p>
            </div>
            <p className="text-sm text-gray-500">Redirecting to your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">Book a Session</h1>
              
              <div className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      // Only allow selection of today or future dates
                      if (selectedValue >= getTodayDate()) {
                        setSelectedDate(selectedValue);
                      }
                    }}
                    min={getTodayDate()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can only book sessions for today or future dates
                  </p>
                </div>

                {/* Time Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots (Select consecutive slots - minimum 1 hour)
                  </label>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Selected: {selectedSlots.length > 0 ? getSessionTimeRange() : 'None'} 
                      {selectedSlots.length > 0 && ` (${getDurationInHours()} hour${getDurationInHours() > 1 ? 's' : ''})`}
                    </p>
                  </div>
                  
                  {!selectedDate ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Please select a date first to see available time slots</p>
                    </div>
                  ) : slotsLoading ? (
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="p-3 border border-gray-200 rounded-lg animate-pulse">
                          <div className="text-center">
                            <div className="h-4 bg-gray-300 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No available time slots for the selected date</p>
                      <p className="text-sm mt-1">
                        Some slots might be temporarily unavailable due to recent activity.
                      </p>
                      <p className="text-sm">
                        Please try selecting a different date or refresh the page in a few minutes.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((slot) => {
                        const isSelected = selectedSlots.includes(slot.time);
                        const isDisabled = !isSelected && selectedSlots.length > 0 && !areConsecutive([...selectedSlots, slot.time]);
                        
                        return (
                          <button
                            key={slot.slot_id}
                            onClick={() => handleSlotSelection(slot.time)}
                            disabled={isDisabled}
                            className={`p-3 border rounded-lg transition-colors relative ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                : isDisabled
                                ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                            }`}
                          >
                            <div className="text-center">
                              <div className="font-medium">{slot.time}</div>
                              <div className="text-xs opacity-80">1 hour</div>
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-3 text-sm text-gray-500">
                    <p>• Each slot represents 1 hour (e.g., 9:00 = 9:00-10:00)</p>
                    <p>• You can select multiple consecutive slots for longer sessions</p>
                    <p>• Click a selected slot again to unselect it</p>
                    <p>• Minimum session duration is 1 hour</p>
                    <p>• Slots may be temporarily hidden if accessed by others recently</p>
                  </div>
                  
                  {/* Refresh button for time slots */}
                  {selectedDate && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          console.log('Refreshing time slots...');
                          // Trigger useEffect to refetch slots by clearing and resetting the date
                          const currentDate = selectedDate;
                          setSelectedDate('');
                          setTimeout(() => setSelectedDate(currentDate), 100);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        🔄 Refresh Available Slots
                      </button>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>

                {/* Error Message */}
                {bookingStatus === 'error' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <div>
                        <p className="text-red-700">Booking failed. Please try again.</p>
                        <p className="text-red-600 text-sm mt-1">
                          Make sure all fields are filled and you're connected to the internet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Tutor Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tutor Information</h3>
              {loading ? (
                <div className="animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center mb-4">
                    <img 
                      src={tutorData?.User?.photo_url || "https://via.placeholder.com/60?text=No+Image"}
                      alt={tutorData?.User?.name || "Tutor"}
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{tutorData?.User?.name || 'Loading...'}</p>
                      <p className="text-sm text-gray-600">
                        {(tutorData?.subjects && tutorData.subjects.length > 0) 
                          ? tutorData.subjects.slice(0, 2).join(' & ') 
                          : 'Mathematics & Physics'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-500 mb-2">
                    <span className="font-semibold">{safeNumber(tutorData?.rating, 4.9).toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">(127 reviews)</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Rate:</span> Rs.{safeNumber(tutorData?.hourly_rate, 65)}/hour
                  </div>
                  {tutorData?.location && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Location:</span> {tutorData.location}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Booking Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedDate || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{getSessionTimeRange() || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{getDurationInHours()} hour{getDurationInHours() > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subject:</span>
                  <span className="font-medium">{subject || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-medium">Rs.{safeNumber(tutorData?.hourly_rate, 65)}/hour</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Cost:</span>
                    <span className="text-blue-600">Rs.{calculateCost()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={bookingStatus === 'loading' || !selectedDate || selectedSlots.length === 0 || !subject}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {bookingStatus === 'loading' ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Proceed to Payment'
              )}
            </button>

            {/* Note */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can cancel or reschedule your session up to 24 hours before the scheduled time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
