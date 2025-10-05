// Session status enumeration
export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'canceled';

// Base session interface
export interface Session {
  id: number;
  studentName: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  amount: number;
  materials?: string[];
  rating?: number;
  review?: string;
  reason?: string;
  refunded?: boolean;
  status: SessionStatus;
}

// Detailed session interface for API responses
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

// Session statistics interface
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

// Session filter options
export interface SessionFilters {
  status?: SessionStatus[];
  dateFrom?: string;
  dateTo?: string;
  studentName?: string;
  subject?: string;
}

// Session management actions
export interface SessionAction {
  type: 'start' | 'complete' | 'cancel' | 'reschedule';
  sessionId: string;
  reason?: string;
  newDateTime?: string;
}

// Meeting URL interface
export interface MeetingUrl {
  url: string;
  type: 'zoom' | 'google-meet' | 'teams' | 'custom';
  addedAt: Date;
}