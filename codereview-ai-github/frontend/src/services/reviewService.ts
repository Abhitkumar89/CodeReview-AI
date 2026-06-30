import { api } from '@/lib/api';
import type {
  ApiEnvelope,
  Language,
  Review,
  ReviewListResponse,
  ReviewStats,
} from '@/types';

export interface ReviewQuery {
  page?: number;
  limit?: number;
  search?: string;
  language?: Language | '';
}

export const reviewService = {
  async create(payload: { code: string; language: Language; title?: string }): Promise<Review> {
    const { data } = await api.post<ApiEnvelope<{ review: Review }>>('/review', payload);
    return data.data.review;
  },

  async list(query: ReviewQuery = {}): Promise<ReviewListResponse> {
    const { data } = await api.get<ApiEnvelope<ReviewListResponse>>('/reviews', {
      params: query,
    });
    return data.data;
  },

  async getById(id: string): Promise<Review> {
    const { data } = await api.get<ApiEnvelope<{ review: Review }>>(`/review/${id}`);
    return data.data.review;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/review/${id}`);
  },

  async stats(): Promise<ReviewStats> {
    const { data } = await api.get<ApiEnvelope<ReviewStats>>('/reviews/stats');
    return data.data;
  },
};
