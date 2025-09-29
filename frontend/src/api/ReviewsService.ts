const API_BASE_URL = 'http://localhost:5000/api';

export interface ReviewData {
  review_id: string;
  student_name: string;
  student_photo?: string;
  rating: number;
  review: string;
  subject: string;
  date: Date;
  session_id: string;
  isVerified: boolean;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: ReviewData[];
  subjectRatings: { [subject: string]: { count: number; average: number } };
  monthlyReviews: { [month: string]: number };
  responseRate: number;
}

export interface ReviewAnalytics {
  totalSessions: number;
  reviewedSessions: number;
  reviewRate: number;
  monthlyRatings: { [month: string]: number };
  improvementTrends: string;
}

export interface ReviewsDashboard {
  statistics: ReviewStatistics;
  analytics: ReviewAnalytics;
  topSessions: ReviewData[];
}

export interface FilterOptions {
  rating?: number;
  subject?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export class ReviewsService {
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

  // Get all reviews with optional filters
  static async getTutorReviews(firebaseUid: string, options: FilterOptions = {}): Promise<ReviewData[]> {
    const queryParams = new URLSearchParams();
    
    if (options.rating) queryParams.append('rating', options.rating.toString());
    if (options.subject) queryParams.append('subject', options.subject);
    if (options.dateFrom) queryParams.append('dateFrom', options.dateFrom);
    if (options.dateTo) queryParams.append('dateTo', options.dateTo);
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.offset) queryParams.append('offset', options.offset.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/reviews/${firebaseUid}/all${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ReviewData[]>(endpoint);
  }

  // Get comprehensive review statistics
  static async getReviewStatistics(firebaseUid: string): Promise<ReviewStatistics> {
    return this.makeRequest<ReviewStatistics>(`/reviews/${firebaseUid}/statistics`);
  }

  // Get reviews by rating
  static async getReviewsByRating(firebaseUid: string, rating: number): Promise<ReviewData[]> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return this.makeRequest<ReviewData[]>(`/reviews/${firebaseUid}/rating/${rating}`);
  }

  // Get reviews by subject
  static async getReviewsBySubject(firebaseUid: string, subject: string): Promise<ReviewData[]> {
    return this.makeRequest<ReviewData[]>(`/reviews/${firebaseUid}/subject/${encodeURIComponent(subject)}`);
  }

  // Get reviews by date range
  static async getReviewsByDateRange(
    firebaseUid: string, 
    startDate: string, 
    endDate: string
  ): Promise<ReviewData[]> {
    return this.makeRequest<ReviewData[]>(
      `/reviews/${firebaseUid}/date-range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Get review analytics
  static async getReviewAnalytics(firebaseUid: string): Promise<ReviewAnalytics> {
    return this.makeRequest<ReviewAnalytics>(`/reviews/${firebaseUid}/analytics`);
  }

  // Get top-rated sessions
  static async getTopRatedSessions(firebaseUid: string, limit: number = 10): Promise<ReviewData[]> {
    return this.makeRequest<ReviewData[]>(`/reviews/${firebaseUid}/top-rated?limit=${limit}`);
  }

  // Get reviews dashboard summary
  static async getReviewsDashboard(firebaseUid: string): Promise<ReviewsDashboard> {
    return this.makeRequest<ReviewsDashboard>(`/reviews/${firebaseUid}/dashboard`);
  }

  // Utility methods for review analysis
  static calculateAverageRating(reviews: ReviewData[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }

  static getRatingDistribution(reviews: ReviewData[]): { [key: number]: number } {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  }

  static getReviewsByTimeframe(reviews: ReviewData[], days: number): ReviewData[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return reviews.filter(review => new Date(review.date) >= cutoffDate);
  }

  static getSubjectBreakdown(reviews: ReviewData[]): { [subject: string]: { count: number; average: number } } {
    const subjects: { [subject: string]: { ratings: number[]; count: number; average: number } } = {};
    
    reviews.forEach(review => {
      if (!subjects[review.subject]) {
        subjects[review.subject] = { ratings: [], count: 0, average: 0 };
      }
      subjects[review.subject].ratings.push(review.rating);
      subjects[review.subject].count++;
    });
    
    // Calculate averages
    Object.keys(subjects).forEach(subject => {
      const ratings = subjects[subject].ratings;
      subjects[subject].average = ratings.length > 0 
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;
    });
    
    // Return without ratings array
    const result: { [subject: string]: { count: number; average: number } } = {};
    Object.keys(subjects).forEach(subject => {
      result[subject] = {
        count: subjects[subject].count,
        average: subjects[subject].average
      };
    });
    
    return result;
  }

  static formatReviewDate(date: Date | string): string {
    const reviewDate = typeof date === 'string' ? new Date(date) : date;
    return reviewDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static getReviewTrend(currentAverage: number, previousAverage: number): 'improving' | 'declining' | 'stable' {
    const difference = currentAverage - previousAverage;
    if (difference > 0.2) return 'improving';
    if (difference < -0.2) return 'declining';
    return 'stable';
  }

  // Get paginated reviews
  static async getPaginatedReviews(
    firebaseUid: string, 
    page: number = 1, 
    pageSize: number = 10,
    filters: Omit<FilterOptions, 'limit' | 'offset'> = {}
  ): Promise<{ reviews: ReviewData[]; hasMore: boolean }> {
    const options: FilterOptions = {
      ...filters,
      limit: pageSize + 1, // Get one extra to check if there are more
      offset: (page - 1) * pageSize
    };
    
    const reviews = await this.getTutorReviews(firebaseUid, options);
    const hasMore = reviews.length > pageSize;
    
    return {
      reviews: hasMore ? reviews.slice(0, -1) : reviews,
      hasMore
    };
  }
}