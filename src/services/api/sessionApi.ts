import { apiClient, ApiResponse } from './apiClient';
import { FlightReportData } from '../../types/flightSimulator';

export interface AdvanceMonthPayload {
  scenarioId: string;
  choiceId: string;
  choiceText: string;
  cashDelta: number;
  debtDelta: number;
  isOptimal: boolean;
  explanation?: string;
  whyExplanation?: string;
  category?: string;
}

export interface SimulationStepResponse {
  session: any;
  decisionRecorded: any;
  isCompleted: boolean;
  stepFeedback: {
    monthlySalary: number;
    mandatoryExpenses: number;
    interestCharged: number;
    cashAfterStep: number;
    debtAfterStep: number;
    cibilChange: number;
    stressChange: number;
    message: string;
  };
  nextScenario?: any;
  finalReport?: FlightReportData;
}

export class SessionApi {
  public static async createSession(params: {
    startingCash?: number;
    startingDebt?: number;
    scenarioType?: string;
    pilotCallsign?: string;
  } = {}): Promise<ApiResponse<{ session: any; initialScenario: any }>> {
    return apiClient.post('/sessions', params);
  }

  public static async listSessions(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/sessions');
  }

  public static async getSession(id: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/sessions/${id}`);
  }

  public static async advanceMonth(id: string, payload: AdvanceMonthPayload): Promise<ApiResponse<SimulationStepResponse>> {
    return apiClient.post(`/sessions/${id}/advance`, payload);
  }

  public static async getReport(id: string): Promise<ApiResponse<FlightReportData>> {
    return apiClient.get(`/sessions/${id}/report`);
  }
}

