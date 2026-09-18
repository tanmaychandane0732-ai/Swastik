import { apiClient, ApiResponse } from './apiClient';
import { DailyDilemma } from '../../types/flightSimulator';

export class ChallengeApi {
  public static async getDaily(date?: string): Promise<ApiResponse<DailyDilemma>> {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    return apiClient.get<DailyDilemma>(`/challenges/daily${query}`);
  }

  public static async attempt(challengeId: string, optionId: string): Promise<ApiResponse<any>> {
    return apiClient.post(`/challenges/${challengeId}/attempt`, { optionId });
  }
}

