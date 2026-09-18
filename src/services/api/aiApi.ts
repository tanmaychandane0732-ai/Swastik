import { apiClient, ApiResponse } from './apiClient';
import { AICoachExplanation } from '../../types/flightSimulator';

export interface AICoachRequestPayload {
  choiceLabel: string;
  choiceDescription?: string;
  scenarioTitle: string;
  cash: number;
  debt: number;
  creditScore: number;
  cashDelta: number;
  debtDelta: number;
  isOptimal: boolean;
}

export class AIApi {
  public static async explain(payload: AICoachRequestPayload): Promise<ApiResponse<AICoachExplanation>> {
    return apiClient.post<AICoachExplanation>('/ai/coach', payload);
  }
}

