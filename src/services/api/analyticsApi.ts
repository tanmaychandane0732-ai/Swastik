import { apiClient, ApiResponse } from './apiClient';
import { DecisionDNAProfile, RiskRadarMetrics, WhatIfProjection } from '../../types/flightSimulator';

export class AnalyticsApi {
  public static async getDecisionDna(payload: {
    cash: number;
    debt: number;
    invested?: number;
    creditScore: number;
    decisionsHistory: Array<{
      scenarioId?: string;
      choiceId: string;
      isOptimal?: boolean;
      cashDelta?: number;
      debtDelta?: number;
    }>;
  }): Promise<ApiResponse<DecisionDNAProfile>> {
    return apiClient.post<DecisionDNAProfile>('/analytics/decision-dna', payload);
  }

  public static async getRiskRadar(payload: {
    cash: number;
    debt: number;
    monthlyIncome?: number;
    monthlyExpenses?: number;
    creditScore: number;
    scamChoiceCount?: number;
    speculativeChoiceCount?: number;
    impulseChoiceCount?: number;
  }): Promise<ApiResponse<RiskRadarMetrics>> {
    return apiClient.post<RiskRadarMetrics>('/analytics/risk-radar', payload);
  }

  public static async getWhatIf(payload: {
    startingCash: number;
    startingDebt: number;
    monthlySavingsActual: number;
    monthlyDebtPaymentActual: number;
    actualInterestRateAnnual: number;
    monthlySavingsCounterfactual: number;
    monthlyDebtPaymentCounterfactual: number;
    counterfactualInterestRateAnnual: number;
    scenarioTitle?: string;
  }): Promise<ApiResponse<WhatIfProjection>> {
    return apiClient.post<WhatIfProjection>('/analytics/what-if', payload);
  }
}

