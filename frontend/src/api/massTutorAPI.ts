import axios from 'axios';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get Firebase ID token for authentication
const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const massTutorAPI = {
  // Get all classes for the authenticated tutor
  async getClasses() {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/mass-tutor/classes`, {
      headers,
    });
    return response.data;
  },

  // Get class statistics
  async getClassStats() {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/mass-tutor/classes/stats`, {
      headers,
    });
    return response.data;
  },

  // Get a single class by ID
  async getClassById(classId: string) {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/mass-tutor/classes/${classId}`, {
      headers,
    });
    return response.data;
  },

  // Create a new class
  async createClass(data: {
    title: string;
    subject: string;
    day: string;
    time: string;
    description?: string;
    product_id?: string;
    price_id?: string;
  }) {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/mass-tutor/classes`, data, {
      headers,
    });
    return response.data;
  },

  // Update an existing class
  async updateClass(
    classId: string,
    data: {
      title?: string;
      subject?: string;
      day?: string;
      time?: string;
      description?: string;
      product_id?: string;
      price_id?: string;
    }
  ) {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/mass-tutor/classes/${classId}`, data, {
      headers,
    });
    return response.data;
  },

  // Delete a class
  async deleteClass(classId: string) {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/mass-tutor/classes/${classId}`, {
      headers,
    });
    return response.data;
  },

  // Create a class slot
  async createClassSlot(
    classId: string,
    data: {
      dateTime: string;
      duration: number;
      meetingURLs?: string[];
      materials?: string[];
      announcement?: string;
    }
  ) {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/mass-tutor/classes/${classId}/slots`, data, {
      headers,
    });
    return response.data;
  },

  // Update a class slot
  async updateClassSlot(
    slotId: string,
    data: {
      dateTime?: string;
      duration?: number;
      meetingURLs?: string[];
      materials?: string[];
      announcement?: string;
      recording?: string;
      status?: 'upcoming' | 'completed';
    }
  ) {
    const headers = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/mass-tutor/slots/${slotId}`, data, {
      headers,
    });
    return response.data;
  },

  // Delete a class slot
  async deleteClassSlot(slotId: string) {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/mass-tutor/slots/${slotId}`, {
      headers,
    });
    return response.data;
  },

  // Get all slots for a class
  async getClassSlots(classId: string) {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/mass-tutor/classes/${classId}/slots`, {
      headers,
    });
    return response.data;
  },

  // Create Zoom meeting for a slot
  async createZoomMeeting(classId: string, data: {
    slotId: string;
    topic: string;
    startTime: string;
    duration: number;
  }) {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/mass-tutor/classes/${classId}/zoom`, data, {
      headers,
    });
    return response.data;
  },

  // Upload material
  async uploadMaterial(file: File) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const token = await user.getIdToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/mass-tutor/upload/material`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Upload multiple materials
  async uploadMaterials(files: File[]) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const token = await user.getIdToken();
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await axios.post(`${API_URL}/mass-tutor/upload/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Upload recording
  async uploadRecording(file: File) {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const token = await user.getIdToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/mass-tutor/upload/recording`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // Get updated host URL for joining Zoom (via getZak)
  async getZoomHostUrl(oldHostUrl: string) {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/mass-tutor/zoom/get-zak`, { oldHostUrl }, {
      headers,
    });
    return response.data;
  },

  // Get all enrollments for a specific class
  async getClassEnrollments(classId: string) {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/mass-tutor/classes/${classId}/enrollments`, {
      headers,
    });
    return response.data;
  },
};
