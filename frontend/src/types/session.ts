// Session status enumeration
export type SessionStatus = 'scheduled' | 'ongoing' | 'completed' | 'canceled';

// Material interface for enhanced material management
export interface Material {
  id: string;
  name: string;
  type: 'document' | 'video' | 'link' | 'image' | 'text' | 'presentation';
  url?: string;
  content?: string; // For text materials
  uploadDate: string;
  size?: number; // File size in bytes
  mimeType?: string;
  description?: string;
  isPublic: boolean; // Whether students can access before session
}

// Base session interface
export interface Session {
  id: number;
  studentName: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  amount: number;
  materials?: (string | Material)[]; // Support both formats for backward compatibility
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
  materials: (string | Material)[]; // Support both formats for backward compatibility
  created_at: Date | null;
  date: Date | null;
  i_tutor_id: string | null;
  meeting_urls: string[];
  price: number | null;
  slots: Date[];
  title: string | null;
  subject: string | null;  // Added subject column from Sessions table
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