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

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export interface AIChatPayload {
  message: string;
  history?: AIChatMessage[];
  context?: {
    stage?: string;
    financialHealth?: number;
    netWorth?: number;
    score?: number;
    playerName?: string;
  };
}

export interface AIChatResponse {
  reply: string;
  provider: string;
  suggestedPrompts: string[];
}

export class AIApi {
  public static async explain(payload: AICoachRequestPayload): Promise<ApiResponse<AICoachExplanation>> {
    return apiClient.post<AICoachExplanation>('/ai/coach', payload);
  }

  public static async chat(payload: AIChatPayload): Promise<ApiResponse<AIChatResponse>> {
    return apiClient.post<AIChatResponse>('/ai/chat', payload);
  }
}
