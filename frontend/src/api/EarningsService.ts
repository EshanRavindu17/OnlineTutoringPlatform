const API_BASE_URL = 'http://localhost:5000/api';

export interface EarningsStatistics {
  totalEarnings: number;
  adminCommission: number;
  netEarnings: number;
  totalSessions: number;
  completedSessions: number;
  averageSessionValue: number;
  thisMonthEarnings: number;
  thisWeekEarnings: number;
  todayEarnings: number;
  pendingPayments: number;
  paidPayments: number;
  yearlyEarnings: { [month: string]: number };
  monthlyBreakdown: EarningsBreakdown[];
}

export interface EarningsBreakdown {
  month: string;
  year: number;
  sessions: number;
  grossEarnings: number;
  commission: number;
  netEarnings: number;
}

export interface RecentPayment {
  session_id: string;
  student_name: string;
  subject: string;
  amount: number;
  commission: number;
  net_amount: number;
  date: Date;
  payment_status: string;
}

export interface PaymentStatistics {
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  completionRate: number;
}

export interface EarningsDashboard {
  earnings: EarningsStatistics;
  recentPayments: RecentPayment[];
  paymentStatistics: PaymentStatistics;
}

export class EarningsService {
  private static async makeRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data.data;
  }

  // Get comprehensive earnings statistics
  static async getTutorEarnings(firebaseUid: string): Promise<EarningsStatistics> {
    return this.makeRequest<EarningsStatistics>(`/earnings/${firebaseUid}/all`);
  }

  // Get recent payments
  static async getRecentPayments(firebaseUid: string, limit: number = 10): Promise<RecentPayment[]> {
    return this.makeRequest<RecentPayment[]>(`/earnings/${firebaseUid}/payments?limit=${limit}`);
  }

  // Get earnings by date range
  static async getEarningsByDateRange(
    firebaseUid: string, 
    startDate: string, 
    endDate: string
  ): Promise<EarningsStatistics> {
    return this.makeRequest<EarningsStatistics>(
      `/earnings/${firebaseUid}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Get payment statistics
  static async getPaymentStatistics(firebaseUid: string): Promise<PaymentStatistics> {
    return this.makeRequest<PaymentStatistics>(`/earnings/${firebaseUid}/statistics`);
  }

  // Get earnings dashboard summary
  static async getEarningsDashboard(firebaseUid: string): Promise<EarningsDashboard> {
    return this.makeRequest<EarningsDashboard>(`/earnings/${firebaseUid}/dashboard`);
  }

  // Utility methods for calculations
  static calculateNetEarnings(grossEarnings: number, commissionRate: number = 0.10): number {
    return grossEarnings * (1 - commissionRate);
  }

  static calculateCommission(grossEarnings: number, commissionRate: number = 0.10): number {
    return grossEarnings * commissionRate;
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  // Get earnings summary for different time periods
  static async getEarningsSummary(firebaseUid: string) {
    try {
      const earnings = await this.getTutorEarnings(firebaseUid);
      
      return {
        today: {
          gross: earnings.todayEarnings / 0.9, // Reverse calculate gross from net
          net: earnings.todayEarnings,
          sessions: 0 // Would need additional API call to get session count
        },
        thisWeek: {
          gross: earnings.thisWeekEarnings / 0.9,
          net: earnings.thisWeekEarnings,
          sessions: 0
        },
        thisMonth: {
          gross: earnings.thisMonthEarnings / 0.9,
          net: earnings.thisMonthEarnings,
          sessions: 0
        },
        total: {
          gross: earnings.totalEarnings,
          net: earnings.netEarnings,
          sessions: earnings.completedSessions
        }
      };
    } catch (error) {
      console.error('Error getting earnings summary:', error);
      throw error;
    }
  }
}