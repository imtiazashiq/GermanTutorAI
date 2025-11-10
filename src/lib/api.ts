/**
 * API service for backend communication
 * Handles all REST API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  language: 'en-de' | 'de-en';
  formality: 'du' | 'sie';
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  translatedText?: string;
}

export interface CourseRequest {
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  dailyStudyHours: number;
  goals?: string;
}

export interface Lesson {
  title: string;
  content: string;
  vocabulary: string[];
  grammar: string[];
  exercises: string[];
}

export interface CourseResponse {
  courseName: string;
  level: string;
  lessons: Lesson[];
  estimatedDuration: string;
}

export interface ExerciseRequest {
  lessonIndex: number;
  lessonTitle: string;
  lessonContent: string;
  vocabulary: string[];
  grammar: string[];
  level: string;
}

export interface ExerciseResponse {
  exercises: string[];
  solutions?: string[];
}

export interface ProgressRequest {
  lessonIndex: number;
  exerciseIndex?: number;
  completed: boolean;
}

export interface ProgressResponse {
  lessonIndex: number;
  completed: boolean;
  progress: number;
}

export interface ProgressData {
  progress: number;
  lessons: Record<number, {
    completed: boolean;
    exercises?: Record<number, boolean>;
  }>;
}

/**
 * Send a chat message to the backend
 */
export const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Chat API error:', error);
    throw new Error('Failed to send message. Please try again.');
  }
};

/**
 * Create a personalized course
 */
export const createCourse = async (request: CourseRequest): Promise<CourseResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Course creation API error:', error);
    throw new Error('Failed to create course. Please try again.');
  }
};

/**
 * Generate exercises for a lesson
 */
export const generateExercises = async (request: ExerciseRequest): Promise<ExerciseResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Exercise generation API error:', error);
    throw new Error('Failed to generate exercises. Please try again.');
  }
};

/**
 * Update user progress
 */
export const updateProgress = async (request: ProgressRequest): Promise<ProgressResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/update-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Progress update API error:', error);
    throw new Error('Failed to update progress. Please try again.');
  }
};

/**
 * Get user progress
 */
export const getProgress = async (): Promise<ProgressData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-progress`);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get progress API error:', error);
    throw new Error('Failed to get progress. Please try again.');
  }
};
