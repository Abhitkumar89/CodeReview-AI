export type Language = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp' | 'go';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIResponse {
  qualityScore: number;
  summary: string;
  bugs: string[];
  securityIssues: string[];
  performanceImprovements: string[];
  readabilitySuggestions: string[];
  bestPractices: string[];
  cleanedCode: string;
  timeComplexity: string;
  spaceComplexity: string;
}

export interface Review {
  _id: string;
  userId: string;
  title: string;
  language: Language;
  originalCode: string;
  aiResponse: AIResponse;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewListResponse {
  items: Review[];
  pagination: Pagination;
}

export interface ReviewStats {
  totalReviews: number;
  averageScore: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  details?: unknown;
}
