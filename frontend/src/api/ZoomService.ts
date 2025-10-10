import { getAuth } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://onlinetutoringplatform.onrender.com';

class ZoomService {
  private async getAuthHeaders() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    throw new Error('User not authenticated');
  }

  async getRefreshedZoomLink(oldUrl: string): Promise<string> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/zoom/get-zak`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ oldUrl })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result; 
    } catch (error) {
      console.error('Error refreshing Zoom link:', error);
      throw error;
    }
  }
}

export const zoomService = new ZoomService();