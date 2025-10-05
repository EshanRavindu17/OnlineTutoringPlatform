import { SessionStatus } from "../types/session";

export interface SessionWithDetails {
  session_id: string;
  student_id: string | null;
  status: SessionStatus | null;
  materials: string[];
  created_at: Date | null;
  date: Date | null;
  i_tutor_id: string | null;
  meeting_urls: string[];
  price: number | null;
  slots: Date[];
  title: string | null;
  start_time: Date | null;
  end_time: Date | null;
  Student?: {
    User: {
      name: string;
      email: string;
      photo_url: string | null;
    };
  } | null;
  Rating_N_Review_Session?: Array<{
    r_id: string;
    rating: number | null;
    review: string | null;
  }>;
}

export interface SessionStatistics {
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  ongoingSessions: number;
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  averageSessionDuration: number | null;
}

class SessionService {
  private baseURL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/sessions`;

  // Get all sessions for the tutor
  async getAllSessions(firebaseUid: string): Promise<SessionWithDetails[]> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      throw error;
    }
  }

  // Get sessions by status
  async getSessionsByStatus(firebaseUid: string, status: SessionStatus): Promise<SessionWithDetails[]> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/status/${status}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${status} sessions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Error fetching ${status} sessions:`, error);
      throw error;
    }
  }

  // Get upcoming sessions
  async getUpcomingSessions(firebaseUid: string): Promise<SessionWithDetails[]> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch upcoming sessions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }
  }

  // Get today's sessions
  async getTodaySessions(firebaseUid: string): Promise<SessionWithDetails[]> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/today`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch today's sessions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching today's sessions:", error);
      throw error;
    }
  }

  // Get session statistics
  async getSessionStatistics(firebaseUid: string): Promise<SessionStatistics> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch session statistics: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching session statistics:', error);
      throw error;
    }
  }

  // Get sessions in date range
  async getSessionsInDateRange(firebaseUid: string, startDate: string, endDate: string): Promise<SessionWithDetails[]> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/date-range?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions in date range: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching sessions in date range:', error);
      throw error;
    }
  }

  // Get specific session details
  async getSessionDetails(firebaseUid: string, sessionId: string): Promise<SessionWithDetails> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/session/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch session details: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error;
    }
  }

  // Add material to session
  async addSessionMaterial(firebaseUid: string, sessionId: string, material: string): Promise<SessionWithDetails> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/session/${sessionId}/material`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ material }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add session material: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error adding session material:', error);
      throw error;
    }
  }

  // Remove material from session
  async removeSessionMaterial(firebaseUid: string, sessionId: string, materialIndex: number): Promise<SessionWithDetails> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/session/${sessionId}/material`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ materialIndex }),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove session material: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error removing session material:', error);
      throw error;
    }
  }

  // Update session status
  async updateSessionStatus(firebaseUid: string, sessionId: string, status: SessionStatus): Promise<SessionWithDetails> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/session/${sessionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update session status: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating session status:', error);
      throw error;
    }
  }

  // Add meeting URL to session
  async addMeetingUrl(firebaseUid: string, sessionId: string, meetingUrl: string): Promise<SessionWithDetails> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/session/${sessionId}/meeting-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingUrl }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add meeting URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error adding meeting URL:', error);
      throw error;
    }
  }

  // Request session cancellation
  async requestCancellation(firebaseUid: string, sessionId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/${firebaseUid}/session/${sessionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request cancellation: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Error requesting session cancellation:', error);
      throw error;
    }
  }

  // Helper method to format session data for display
  formatSessionForDisplay(session: SessionWithDetails) {
    return {
      id: session.session_id,
      studentName: session.Student?.User.name || 'Unknown Student',
      studentEmail: session.Student?.User.email || '',
      studentPhoto: session.Student?.User.photo_url || null,
      subject: session.title || 'No Subject',
      title: session.title || 'No Title',
      date: session.date ? new Date(session.date).toISOString().split('T')[0] : '',
      time: session.start_time && session.end_time 
        ? `${new Date(session.start_time).toLocaleTimeString()} - ${new Date(session.end_time).toLocaleTimeString()}`
        : 'Time not set',
      amount: session.price || 0,
      status: session.status || 'scheduled',
      materials: session.materials || [],
      meetingUrls: session.meeting_urls || [],
      rating: session.Rating_N_Review_Session?.[0]?.rating || null,
      review: session.Rating_N_Review_Session?.[0]?.review || null,
    };
  }
}

export const sessionService = new SessionService();
export default sessionService;