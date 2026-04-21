import api from './axios';
import type { RecommendationResponse, SportType } from '../types';

export const getRecommendations = (sportType: SportType) =>
  api.get<RecommendationResponse>('/recommendations', { params: { sportType } });
