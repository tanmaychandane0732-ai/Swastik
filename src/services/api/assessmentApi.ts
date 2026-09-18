import { apiClient, ApiResponse } from './apiClient';
import { DiagnosticQuestion, DiagnosticResult, FinancialIQDelta } from '../../types/flightSimulator';

export class AssessmentApi {
  public static async evaluate(
    questions: DiagnosticQuestion[],
    selectedOptionIds: Record<string, string>
  ): Promise<ApiResponse<DiagnosticResult>> {
    return apiClient.post<DiagnosticResult>('/assessments/evaluate', {
      questions,
      selectedOptionIds,
    });
  }

  public static async submit(
    type: 'PRE_FLIGHT' | 'POST_FLIGHT',
    result: DiagnosticResult,
    sessionId?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post('/assessments/submit', {
      type,
      result,
      sessionId,
    });
  }

  public static async computeDelta(
    preResult: DiagnosticResult,
    postResult: DiagnosticResult
  ): Promise<ApiResponse<FinancialIQDelta>> {
    return apiClient.post<FinancialIQDelta>('/assessments/delta', {
      preResult,
      postResult,
    });
  }

  public static async getUserAssessments(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/assessments/user');
  }
}

