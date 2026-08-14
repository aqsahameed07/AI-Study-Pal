import Constants from 'expo-constants';
import { useAuth } from '@clerk/expo';

// Get API URL from environment
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Client class
export class ApiClient {
  private token: string | null = null;

  constructor(token?: string) {
    this.token = token || null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth endpoints
  async syncUser() {
    return this.request('/auth/sync-user', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateSettings(settings: { darkMode?: boolean; notifications?: boolean; studyReminders?: boolean }) {
    return this.request('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async updateStats(stats: { studyTime?: number; quizScore?: number; flashcardCount?: number }) {
    return this.request('/auth/stats', {
      method: 'PUT',
      body: JSON.stringify(stats),
    });
  }

  // Study Plan endpoints
  async getStudyPlans() {
    return this.request('/study-plans');
  }

  async getStudyPlan(id: string) {
    return this.request(`/study-plans/${id}`);
  }

  async createStudyPlan(data: any) {
    return this.request('/study-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateStudyPlan(id: string, data: any) {
    return this.request(`/study-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteStudyPlan(id: string) {
    return this.request(`/study-plans/${id}`, {
      method: 'DELETE',
    });
  }

  // Flashcard endpoints
  async getFlashcardDecks() {
    return this.request('/flashcards');
  }

  async getFlashcardDeck(id: string) {
    return this.request(`/flashcards/${id}`);
  }

  async createFlashcardDeck(data: any) {
    return this.request('/flashcards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reviewFlashcard(deckId: string, cardIndex: number, correct: boolean) {
    return this.request(`/flashcards/${deckId}/review/${cardIndex}`, {
      method: 'PUT',
      body: JSON.stringify({ correct }),
    });
  }

  async deleteFlashcardDeck(id: string) {
    return this.request(`/flashcards/${id}`, {
      method: 'DELETE',
    });
  }

  // Quiz endpoints
  async getQuizzes() {
    return this.request('/quiz');
  }

  async getQuiz(id: string) {
    return this.request(`/quiz/${id}`);
  }

  async createQuiz(data: any) {
    return this.request('/quiz', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitQuiz(id: string, answers: any[], timeSpent?: number) {
    return this.request(`/quiz/${id}/submit`, {
      method: 'PUT',
      body: JSON.stringify({ answers, timeSpent }),
    });
  }

  async deleteQuiz(id: string) {
    return this.request(`/quiz/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// React hook for using the API
export function useApi() {
  const { getToken } = useAuth();
  
  const getApiClient = async () => {
    const token = await getToken();
    return new ApiClient(token || undefined);
  };

  return { getApiClient };
}