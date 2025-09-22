import apiClient from './apiClient';

// Types for schedule management
export interface TimeSlot {
  slot_id: string;
  i_tutor_id: string;
  date: Date | string;
  start_time: Date | string;
  end_time: Date | string;
  status: 'free' | 'booked';
  created_at?: string;
  updated_at?: string;
}

export interface CreateTimeSlotRequest {
  date: string;
  start_time: string;
  end_time: string;
  status?: 'free' | 'booked';
}

export interface UpdateTimeSlotRequest {
  date?: string;
  start_time?: string;
  end_time?: string;
  status?: 'free' | 'booked';
}

export interface BookTimeSlotRequest {
  studentId: string;
  title?: string;
  description?: string;
}

export interface CancelBookingRequest {
  studentId: string;
}

export interface AvailableTimeSlot extends TimeSlot {
  Individual_Tutor: {
    i_tutor_id: string;
    User: {
      name: string;
      email: string;
    };
  };
}

export interface Session {
  session_id: string;
  slot_id: string;
  student_id: string;
  start_time?: Date | string;
  end_time?: Date | string;
  status?: string;
  materials: string[];
  created_at?: string;
  updated_at?: string;
  Free_Time_Slots: TimeSlot;
}

export interface TutorSession extends Session {
  Student: {
    User: {
      name: string;
      email: string;
    };
  };
}

export interface StudentSession extends Session {
  Free_Time_Slots: TimeSlot & {
    Individual_Tutor: {
      User: {
        name: string;
        email: string;
      };
    };
  };
}

// Schedule service class
export class ScheduleService {
  private static baseUrl = '/api/schedule';

  // Get tutor ID by Firebase UID
  static async getTutorId(
    firebaseUid: string
  ): Promise<{ success: boolean; data: { tutorId: string }; message: string }> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/tutor-id/${firebaseUid}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tutor ID:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tutor ID');
    }
  }

  // Get time slots for a tutor
  static async getTutorTimeSlots(
    tutorId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<{ success: boolean; data: TimeSlot[]; message: string }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const queryString = params.toString();
      const url = `${this.baseUrl}/tutor/${tutorId}/slots${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching tutor time slots:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch time slots');
    }
  }

  // Create a new time slot
  static async createTimeSlot(
    tutorId: string, 
    timeSlotData: CreateTimeSlotRequest
  ): Promise<{ success: boolean; data: TimeSlot; message: string }> {
    try {
      const response = await apiClient.post(
        `${this.baseUrl}/tutor/${tutorId}/slots`,
        timeSlotData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating time slot:', error);
      throw new Error(error.response?.data?.message || 'Failed to create time slot');
    }
  }

  // Update an existing time slot
  static async updateTimeSlot(
    slotId: string, 
    updateData: UpdateTimeSlotRequest
  ): Promise<{ success: boolean; data: TimeSlot; message: string }> {
    try {
      const response = await apiClient.put(
        `${this.baseUrl}/slots/${slotId}`,
        updateData
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating time slot:', error);
      throw new Error(error.response?.data?.message || 'Failed to update time slot');
    }
  }

  // Delete a time slot
  static async deleteTimeSlot(
    slotId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/slots/${slotId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting time slot:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete time slot');
    }
  }

  // Get available time slots (for students)
  static async getAvailableTimeSlots(
    tutorId?: string, 
    date?: string
  ): Promise<{ success: boolean; data: AvailableTimeSlot[]; message: string }> {
    try {
      const params = new URLSearchParams();
      if (tutorId) params.append('tutorId', tutorId);
      if (date) params.append('date', date);
      
      const queryString = params.toString();
      const url = `${this.baseUrl}/available-slots${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching available time slots:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch available time slots');
    }
  }

  // Book a time slot
  // static async bookTimeSlot(
  //   slotId: string, 
  //   bookingData: BookTimeSlotRequest
  // ): Promise<{ success: boolean; data: any; message: string }> {
  //   try {
  //     const response = await apiClient.post(
  //       `${this.baseUrl}/slots/${slotId}/book`,
  //       bookingData
  //     );
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error booking time slot:', error);
  //     throw new Error(error.response?.data?.message || 'Failed to book time slot');
  //   }
  // }

  // Cancel a booking
  // static async cancelBooking(
  //   sessionId: string, 
  //   cancelData: CancelBookingRequest
  // ): Promise<{ success: boolean; data: any; message: string }> {
  //   try {
  //     const response = await apiClient.delete(
  //       `${this.baseUrl}/sessions/${sessionId}/cancel`,
  //       { data: cancelData }
  //     );
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error cancelling booking:', error);
  //     throw new Error(error.response?.data?.message || 'Failed to cancel booking');
  //   }
  // }

  // Get tutor's sessions
  // static async getTutorSessions(
  //   tutorId: string
  // ): Promise<{ success: boolean; data: TutorSession[]; message: string }> {
  //   try {
  //     const response = await apiClient.get(`${this.baseUrl}/tutor/${tutorId}/sessions`);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error fetching tutor sessions:', error);
  //     throw new Error(error.response?.data?.message || 'Failed to fetch tutor sessions');
  //   }
  // }

  // Get student's sessions
  // static async getStudentSessions(
  //   studentId: string
  // ): Promise<{ success: boolean; data: StudentSession[]; message: string }> {
  //   try {
  //     const response = await apiClient.get(`${this.baseUrl}/student/${studentId}/sessions`);
  //     return response.data;
  //   } catch (error: any) {
  //     console.error('Error fetching student sessions:', error);
  //     throw new Error(error.response?.data?.message || 'Failed to fetch student sessions');
  //   }
  // }

  // Helper function to format date for API calls
  // static formatDate(date: Date): string {
  //   return date.toISOString().split('T')[0];
  // }

  // Helper function to format time for API calls
  // static formatTime(date: Date): string {
  //   return date.toTimeString().split(' ')[0].substring(0, 5);
  // }

  // Helper function to get current week's date range
  // static getCurrentWeekRange(): { startDate: string; endDate: string } {
  //   const today = new Date();
  //   const currentDayOfWeek = today.getDay();
  //   const startOfWeek = new Date(today);
  //   startOfWeek.setDate(today.getDate() - currentDayOfWeek);
    
  //   const endOfWeek = new Date(startOfWeek);
  //   endOfWeek.setDate(startOfWeek.getDate() + 6);
    
  //   return {
  //     startDate: this.formatDate(startOfWeek),
  //     endDate: this.formatDate(endOfWeek)
  //   };
  // }

  // Helper function to get next week's date range
  // static getNextWeekRange(): { startDate: string; endDate: string } {
  //   const today = new Date();
  //   const currentDayOfWeek = today.getDay();
  //   const startOfNextWeek = new Date(today);
  //   startOfNextWeek.setDate(today.getDate() - currentDayOfWeek + 7);
    
  //   const endOfNextWeek = new Date(startOfNextWeek);
  //   endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    
  //   return {
  //     startDate: this.formatDate(startOfNextWeek),
  //     endDate: this.formatDate(endOfNextWeek)
  //   };
  // }
}
