import { dataRepository } from '../repositories/dataRepository';

export interface DiagnosticQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  points: number;
}

export interface DiagnosticQuestion {
  id: string;
  category: 'budget' | 'debt' | 'scam' | 'investing' | 'insurance';
  scenario: string;
  question: string;
  options: DiagnosticQuestionOption[];
}

export interface DiagnosticResult {
  totalScore: number;       // 0 - 100
  categoryScores: {
    budget: number;
    debt: number;
    scam: number;
    investing: number;
    insurance: number;
  };
  tier: 'Pre-Flight Cadet' | 'Co-Pilot in Training' | 'Licensed Financial Aviator' | 'Elite Squadron Commander';
  completedAt: string;
}

export interface FinancialIQDelta {
  preFlightIQ: number;
  postFlightIQ: number;
  deltaPoints: number;
  percentageGain: number;
  strongestImprovementArea: string;
  verifiedAt: string;
}

export class FinancialIqService {
  public evaluateSubmission(
    questions: DiagnosticQuestion[],
    selectedOptionIds: Record<string, string>
  ): DiagnosticResult {
    let totalScore = 0;
    const categoryTotals: Record<string, { scored: number; max: number }> = {
      budget: { scored: 0, max: 0 },
      debt: { scored: 0, max: 0 },
      scam: { scored: 0, max: 0 },
      investing: { scored: 0, max: 0 },
      insurance: { scored: 0, max: 0 },
    };

    const pointsPerQuestion = questions.length > 0 ? 100 / questions.length : 20;

    questions.forEach((q) => {
      const selectedId = selectedOptionIds[q.id];
      const selectedOption = q.options.find((o) => o.id === selectedId);
      const points = selectedOption ? selectedOption.points : 0;

      totalScore += points;

      if (!categoryTotals[q.category]) {
        categoryTotals[q.category] = { scored: 0, max: 0 };
      }
      categoryTotals[q.category].scored += points;
      categoryTotals[q.category].max += pointsPerQuestion;
    });

    const categoryScores = {
      budget: Math.round((categoryTotals.budget.scored / Math.max(1, categoryTotals.budget.max)) * 100),
      debt: Math.round((categoryTotals.debt.scored / Math.max(1, categoryTotals.debt.max)) * 100),
      scam: Math.round((categoryTotals.scam.scored / Math.max(1, categoryTotals.scam.max)) * 100),
      investing: Math.round((categoryTotals.investing.scored / Math.max(1, categoryTotals.investing.max)) * 100),
      insurance: Math.round((categoryTotals.insurance.scored / Math.max(1, categoryTotals.insurance.max)) * 100),
    };

    const finalTotal = Math.min(100, Math.max(0, Math.round(totalScore)));

    let tier: DiagnosticResult['tier'] = 'Pre-Flight Cadet';
    if (finalTotal >= 85) tier = 'Elite Squadron Commander';
    else if (finalTotal >= 70) tier = 'Licensed Financial Aviator';
    else if (finalTotal >= 50) tier = 'Co-Pilot in Training';

    return {
      totalScore: finalTotal,
      categoryScores,
      tier,
      completedAt: new Date().toISOString(),
    };
  }

  public computeDelta(preResult: DiagnosticResult, postResult: DiagnosticResult): FinancialIQDelta {
    const deltaPoints = postResult.totalScore - preResult.totalScore;
    const percentageGain = preResult.totalScore > 0
      ? Math.round((deltaPoints / preResult.totalScore) * 100)
      : Math.round(deltaPoints * 2);

    const gains = [
      { name: 'Debt & Interest Defense', gain: postResult.categoryScores.debt - preResult.categoryScores.debt },
      { name: 'Scam & Fraud Shield', gain: postResult.categoryScores.scam - preResult.categoryScores.scam },
      { name: 'Liquidity & Budgeting', gain: postResult.categoryScores.budget - preResult.categoryScores.budget },
      { name: 'Compounding & Investments', gain: postResult.categoryScores.investing - preResult.categoryScores.investing },
      { name: 'Emergency Risk Mitigation', gain: postResult.categoryScores.insurance - preResult.categoryScores.insurance },
    ];

    gains.sort((a, b) => b.gain - a.gain);
    const strongestImprovementArea = gains[0]?.name || 'Overall Financial Resilience';

    return {
      preFlightIQ: preResult.totalScore,
      postFlightIQ: postResult.totalScore,
      deltaPoints: Math.max(0, deltaPoints),
      percentageGain: Math.max(0, percentageGain),
      strongestImprovementArea,
      verifiedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
  }

  public async saveAssessment(
    userId: string,
    type: 'PRE_FLIGHT' | 'POST_FLIGHT',
    result: DiagnosticResult,
    sessionId?: string
  ): Promise<any> {
    const assessment = await dataRepository.createAssessment({
      userId,
      sessionId,
      type,
      score: result.totalScore,
      breakdown: result.categoryScores,
      tier: result.tier,
    });

    // Also update user profile with latest financial IQ
    const profile = await dataRepository.getProfile(userId);
    if (profile) {
      await dataRepository.updateProfile(userId, {
        financialIQ: result.totalScore,
      });
    }

    return assessment;
  }
}

export const financialIqService = new FinancialIqService();
