import axios from 'axios';

const API_URL = 'http://localhost:5000'; // Adjust this to your backend URL

export interface PaymentIntentData {
  amount: number;
  currency?: string;
  tutorId: string;
  studentId: string;
  sessionDate?: string;
  sessionTime?: string;
  duration?: number;
  subject?: string;
  selectedSlots?: string[];
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: string;
  sessionDate: string;
  sessionTime: string;
  duration: number;
  subject: string;
  tutorName: string;
  tutorPhoto: string;
  createdAt: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistory[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class PaymentService {
  // Create payment intent
  async createPaymentIntent(data: PaymentIntentData): Promise<PaymentIntent> {
    try {
      const response = await axios.post(`${API_URL}/payment/create-payment-intent`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Confirm payment after successful Stripe payment
  async confirmPayment(paymentIntentId: string, sessionDetails?: any): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/payment/confirm-payment`, {
        paymentIntentId,
        sessionDetails
      });
      return response.data;
    } catch (error: any) {
      console.error('Error confirming payment:', error.response?.data || error);
      if(error.response?.data?.error === "One of your selected time slots is not available now") {
        throw new Error('Sorry! One of your selected time slots is not available now . Please go back and reload the page and select again');
      }else{
        throw new Error('Payment processing failed. Please try again.');
      }
    }
  }

  // Get payment history for a student
  async getPaymentHistory(studentId: string, page: number = 1, limit: number = 10): Promise<PaymentHistoryResponse> {
    try {
      const response = await axios.get(`${API_URL}/payment/payment-history/${studentId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw new Error('Failed to fetch payment history');
    }
  }

  // Request refund
  async requestRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/payment/refund`, {
        paymentIntentId,
        amount,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // For Mass Payment

  async createPaymentIntentForMass(data: { studentId: string; classId: string; amount: number; }): Promise<PaymentIntent> {
    try {
      console.log('Creating payment intent for mass class with data:', data);
      const response = await axios.post(`${API_URL}/payment/create-payment-intent-mass`, data);
      console.log('Payment intent response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating payment intent for mass students:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to create payment intent for mass students');
    }
  }

  async confirmPaymentForMass(paymentIntentId: string, studentId: string, classId: string, amount: number): Promise<any> {
    try {
      console.log('Confirming payment for mass class:', { paymentIntentId, studentId, classId, amount });
      const response = await axios.post(`${API_URL}/payment/confirm-payment-mass`, {
        paymentIntentId,
        studentId,
        classId,
        amount
      });
      console.log('Payment confirmation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.log('Error payload:', error.response?.data || error);
      console.error('Error confirming payment for mass students:', error.response?.data || error);
      throw new Error(error.response?.data?.error || 'Failed to confirm payment for mass students');
    }
  }
}



export const paymentService = new PaymentService();
export default paymentService;
