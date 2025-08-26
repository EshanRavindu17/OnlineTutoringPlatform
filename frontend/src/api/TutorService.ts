import apiClient from './apiClient';

// Base URL for the API - removed since it's now in apiClient
// const API_BASE_URL = 'http://localhost:5000/api';

// Types matching the backend response
export interface IndividualTutor {
  i_tutor_id: string;
  subjects: string[];
  titles: string[];
  hourly_rate: number;
  rating: number;
  description: string;
  heading?: string;
  User?: {
    name: string;
    photo_url: string | null;
  } | null;
}

// Interface for subjects from database
export interface Subject {
  sub_id: string;
  name: string;
}

// Interface for titles from database (when fetching with subject name)
export interface TitleWithSubject {
  name: string;
  Subjects: {
    name: string;
  };
}

// Interface for titles from database
export interface Title {
  title_id: string;
  sub_id: string;
  name: string;
}

export interface TutorFilters {
  subjects?: string;
  titles?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  rating?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc' | 'all';
  page?: number;
  limit?: number;
}

// API service for fetching individual tutors
export const tutorService = {
  // Get individual tutors with filters
  getIndividualTutors: async (filters: TutorFilters = {}): Promise<IndividualTutor[]> => {
    console.log('Fetching individual tutors with filters:', filters);
    try {
      const params = new URLSearchParams();
      
      if (filters.subjects) params.append('subjects', filters.subjects);
      if (filters.titles) params.append('titles', filters.titles);
      if (filters.min_hourly_rate) params.append('min_hourly_rate', filters.min_hourly_rate.toString());
      if (filters.max_hourly_rate) params.append('max_hourly_rate', filters.max_hourly_rate.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`/student/getAllIndividualTutors?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching individual tutors:', error);
      throw new Error('Failed to fetch tutors');
    }
  },

  // Get all subjects
  getAllSubjects: async (): Promise<Subject[]> => {
    try {
      const response = await apiClient.get('/individual-tutor/subjects');
      console.log('Fetched subjects:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw new Error('Failed to fetch subjects');
    }
  },

  // Get titles for a specific subject
  getTitlesBySubject: async (subjectId: string): Promise<Title[]> => {
    console.log('Fetching titles for subject:', subjectId);
    try {
      const response = await apiClient.get(`/individual-tutor/titles/${subjectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching titles:', error);
      throw new Error('Failed to fetch titles');
    }
  },

  // Get all titles with subject names (new endpoint)
  getAllTitlesWithSubjects: async (): Promise<TitleWithSubject[]> => {
    try {
      const response = await apiClient.get('/individual-tutor/titles');
      return response.data;
      console.log('Fetched all titles with subjects:', response.data);  
    } catch (error) {
      console.error('Error fetching all titles:', error);
      throw new Error('Failed to fetch all titles');
    }
  }
};

export default tutorService;
