import axios from 'axios';

const AGENT_BASE_URL = import.meta.env.VITE_TUTORLY_AGENT_URL || 'http://localhost:8000';

export interface TutorlyAssistantChatRequest {
  user_id: string;
  message: string;
}

export interface TutorlyAssistantTutor {
  name: string;
  image?: string;
  subject?: string;
  topic?: string;
  tutorid?: string;
  rate?: string;
  rating?: string;
}

export interface TutorlyAssistantClass {
  // The agent prompt sometimes uses `Title` (capital T) and sometimes `title`
  Title?: string;
  title?: string;
  name?: string;
  image?: string;
  classid?: string;
  rating?: string;
  price?: string;
}

export interface TutorlyAssistantChatResponse {
  reply: string;
  tutors: TutorlyAssistantTutor[];
  classes: TutorlyAssistantClass[];
}

const apiClient = axios.create({
  baseURL: AGENT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

export const tutorlyAssistantApi = {
  chat: async (payload: TutorlyAssistantChatRequest): Promise<TutorlyAssistantChatResponse> => {
    const response = await apiClient.post<TutorlyAssistantChatResponse>('/api/chat', payload);
    return response.data;
  },
};
