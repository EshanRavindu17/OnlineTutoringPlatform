import apiClient from './apiClient';
import { getToken } from './Student';

// Base URL for the API - removed since it's now in apiClient
// const API_BASE_URL = 'http://localhost:5000/api';

// Types matching the backend response
// export interface IndividualTutor {
//   i_tutor_id: string;
//   subjects: string[];
//   titles: string[];
//   hourly_rate: number;
//   rating: number;
//   description: string;
//   heading?: string;
//   User?: {
//     name: string;
//     photo_url: string | null;
//   } | null;
// }

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
  name?: string;
  subjects?: string;
  titles?: string;
  min_hourly_rate?: number;
  max_hourly_rate?: number;
  rating?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'rating_asc' | 'all';
  page?: number;
  limit?: number;
}

// Interface for tutor profile data from dashboard
export interface TutorProfile {
  i_tutor_id: string;
  subjects: string[];
  titles: string[]; 
  titlesGroupedBySubject?: { [subjectName: string]: string[] }; 
  hourly_rate: number;
  rating: number;
  description: string;
  heading?: string;
  phone_number: string;
  qualifications: string[];
  User: {
    dob: string;
    name: string;
    photo_url: string | null;
  };
}

// Interface for tutor statistics from dashboard
export interface TutorStatistics {
  totalSessions: number;
  totalEarnings: number;
  averageRating: number;
  reviewsCount: number;
  upcomingSessions: number;
}

// API service for fetching individual tutors
export const tutorService = {
  // Get individual tutors with filters
  // getIndividualTutors: async (filters: TutorFilters = {}): Promise<IndividualTutor[]> => {
  getIndividualTutors: async (filters: TutorFilters = {}): Promise<TutorProfile[]> => {  
    console.log('Fetching individual tutors with filters:', filters);
    try {
      const token = await getToken();
      const params = new URLSearchParams();

      if (filters.name) params.append('name', filters.name);
      if (filters.subjects) params.append('subjects', filters.subjects);
      if (filters.titles) params.append('titles', filters.titles);
      if (filters.min_hourly_rate) params.append('min_hourly_rate', filters.min_hourly_rate.toString());
      if (filters.max_hourly_rate) params.append('max_hourly_rate', filters.max_hourly_rate.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`/student/getAllIndividualTutors?${params.toString()}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching individual tutors:', error);
      throw new Error('Failed to fetch tutors');
    }
  },

  // Get all subjects
  getAllSubjects: async (): Promise<Subject[]> => {
    try {
      const token = await getToken();
      const response = await apiClient.get('/individual-tutor/subjects', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
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
      const token = await getToken();
      const response = await apiClient.get(`/individual-tutor/titles/${subjectId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching titles:', error);
      throw new Error('Failed to fetch titles');
    }
  },

  // Get all titles with subject names (new endpoint)
  getAllTitlesWithSubjects: async (): Promise<TitleWithSubject[]> => {
    try {
      const token = await getToken();
      const response = await apiClient.get('/individual-tutor/titles', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Fetched all titles with subjects:', response.data);  
      return response.data;
    } catch (error) {
      console.error('Error fetching all titles:', error);
      throw new Error('Failed to fetch all titles');
    }
  },

  // Create a new subject
  createSubject: async (name: string): Promise<Subject> => {
    try {
      const token = await getToken();
      const response = await apiClient.post('/individual-tutor/subjects', { name }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Created new subject:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating subject:', error);
      throw new Error('Failed to create subject');
    }
  },

  // Create a new title for a subject
  createTitle: async (name: string, subjectId: string): Promise<Title> => {
    try {
      const token = await getToken();
      const response = await apiClient.post('/individual-tutor/titles', { 
        name, 
        sub_id: subjectId 
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Created new title:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating title:', error);
      throw new Error('Failed to create title');
    }
  },

  // Get tutor profile for dashboard
  getTutorProfile: async (firebaseUid: string): Promise<TutorProfile> => {
    try {
      const token = await getToken();
      const response = await apiClient.get(`/individual-tutor/profile/${firebaseUid}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Fetched tutor profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor profile:', error);
      throw new Error('Failed to fetch tutor profile');
    }
  },

  // Get tutor statistics for dashboard
  getTutorStatistics: async (tutorId: string): Promise<TutorStatistics> => {
    try {
      const token = await getToken();
      const response = await apiClient.get(`/individual-tutor/stats/${tutorId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Fetched tutor statistics:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tutor statistics:', error);
      throw new Error('Failed to fetch tutor statistics');
    }
  },

  // Update user profile photo
  updateUserPhoto: async (firebaseUid: string, photoUrl: string): Promise<any> => {
    try {
      const token = await getToken();
      const response = await apiClient.put(`/individual-tutor/photo/${firebaseUid}`, {
        photoUrl: photoUrl
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Updated user photo:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user photo:', error);
      throw new Error('Failed to update profile photo');
    }
  },

  // Upload user profile photo file
  uploadUserPhoto: async (firebaseUid: string, file: File): Promise<any> => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiClient.post(`/individual-tutor/photo/upload/${firebaseUid}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Uploaded user photo:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error uploading user photo:', error);
      throw new Error('Failed to upload profile photo');
    }
  },

  // Update tutor qualifications
  updateTutorQualifications: async (firebaseUid: string, qualifications: string[]): Promise<any> => {
    try {
      console.log('Updating tutor qualifications:', { firebaseUid, qualifications });
      const token = await getToken();
      const response = await apiClient.put(`/individual-tutor/qualifications/${firebaseUid}`, {
        qualifications
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Qualifications updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating qualifications:', error);
      throw new Error('Failed to update qualifications');
    }
  },

  // Update tutor hourly rate
  updateTutorHourlyRate: async (firebaseUid: string, hourlyRate: number): Promise<any> => {
    try {
      console.log('Updating tutor hourly rate:', { firebaseUid, hourlyRate });
      const token = await getToken();
      const response = await apiClient.put(`/individual-tutor/hourly-rate/${firebaseUid}`, {
        hourlyRate
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Hourly rate updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating hourly rate:', error);
      throw new Error('Failed to update hourly rate');
    }
  },

  // Update tutor subjects and titles
  updateTutorSubjectsAndTitles: async (firebaseUid: string, subjectsWithTitles: { [subjectName: string]: string[] }): Promise<any> => {
    try {
      console.log('Updating tutor subjects and titles:', { firebaseUid, subjectsWithTitles });
      const token = await getToken();
      const response = await apiClient.put(`/individual-tutor/subjects-titles/${firebaseUid}`, {
        subjectsWithTitles
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Subjects and titles updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating subjects and titles:', error);
      throw new Error('Failed to update subjects and titles');
    }
  },

  // Update tutor personal information
  updateTutorPersonalInfo: async (firebaseUid: string, personalInfo: {
    name: string;
    description: string;
    phone_number: string;
    heading?: string | null;
  }): Promise<any> => {
    try {
      console.log('Updating tutor personal information:', { firebaseUid, personalInfo });
      const token = await getToken();
      const response = await apiClient.put(`/individual-tutor/personal-info/${firebaseUid}`, personalInfo, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      });
      console.log('Personal information updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating personal information:', error);
      throw new Error('Failed to update personal information');
    }
  }
};

export default tutorService;
