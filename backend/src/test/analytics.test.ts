import { describe, it, expect } from 'vitest';
import { decisionDnaService } from '../services/decisionDnaService';
import { riskRadarService } from '../services/riskRadarService';
import { whatIfService } from '../services/whatIfService';
import { financialIqService } from '../services/financialIqService';

describe('Financial Flight Simulator Analytics', () => {
  it('assigns Strategic Flight Captain to disciplined pilot profile', () => {
    const dna = decisionDnaService.analyze({
      cash: 45000,
      debt: 0,
      invested: 35000,
      creditScore: 780,
      decisionsHistory: [
        { choiceId: 'optimal_budget', isOptimal: true },
        { choiceId: 'block_scam_upi', isOptimal: true },
        { choiceId: 'index_sip_investment', isOptimal: true },
      ],
    });

    expect(dna.archetype).toBe('Strategic Flight Captain');
    expect(dna.traits.debtDiscipline).toBeGreaterThanOrEqual(80);
    expect(dna.traits.scamImmunity).toBeGreaterThanOrEqual(80);
  });

  it('assigns Debt-Trapped Glider when debt is high and revolving', () => {
    const dna = decisionDnaService.analyze({
      cash: 2000,
      debt: 45000,
      creditScore: 560,
      decisionsHistory: [
        { choiceId: 'minimum_due_emi', isOptimal: false },
        { choiceId: 'instant_loan_app', isOptimal: false },
      ],
    });

    expect(dna.archetype).toBe('Debt-Trapped Glider');
    expect(dna.dangerBlindSpot).toContain('BNPL');
  });

  it('computes 6-axis Risk Radar metrics accurately', () => {
    const radar = riskRadarService.calculate({
      cash: 60000,
      debt: 0,
      monthlyIncome: 30000,
      monthlyExpenses: 18000,
      creditScore: 790,
      scamChoiceCount: 0,
      speculativeChoiceCount: 0,
      impulseChoiceCount: 0,
    });

    expect(radar.debtRisk).toBe(0);
    expect(radar.emergencyVulnerability).toBeLessThanOrEqual(30); // healthy 3+ months runway
    expect(radar.creditFragility).toBeLessThanOrEqual(25);
  });

  it('calculates What-If 5-year compounding divergence', () => {
    const projection = whatIfService.simulateDivergence({
      startingCash: 20000,
      startingDebt: 30000,
      monthlySavingsActual: 2000,
      monthlyDebtPaymentActual: 1500,
      actualInterestRateAnnual: 0.42, // 42% credit card APR
      monthlySavingsCounterfactual: 5000,
      monthlyDebtPaymentCounterfactual: 10000,
      counterfactualInterestRateAnnual: 0.12,
      scenarioTitle: 'Credit Card Payoff vs Minimum Dues',
    });

    expect(projection.alternativeChoiceOutcome.year5NetWorth).toBeGreaterThan(
      projection.currentChoiceOutcome.year5NetWorth
    );
    expect(projection.currentChoiceOutcome.interestPaid5Years).toBeGreaterThan(
      projection.alternativeChoiceOutcome.interestPaid5Years
    );
    expect(projection.divergenceSummary).toContain('more in net worth over 5 years');
  });

  it('evaluates pre-flight diagnostic and computes IQ delta', () => {
    const preResult = financialIqService.evaluateSubmission(
      [
        {
          id: 'q1',
          category: 'debt',
          scenario: 'Credit test',
          question: 'What is minimum due?',
          options: [
            { id: 'o1', text: 'Trap', isCorrect: true, explanation: 'Trap', points: 100 },
            { id: 'o2', text: 'Good', isCorrect: false, explanation: 'Bad', points: 0 },
          ],
        },
      ],
      { q1: 'o2' }
    );

    const postResult = financialIqService.evaluateSubmission(
      [
        {
          id: 'q1',
          category: 'debt',
          scenario: 'Credit test',
          question: 'What is minimum due?',
          options: [
            { id: 'o1', text: 'Trap', isCorrect: true, explanation: 'Trap', points: 100 },
            { id: 'o2', text: 'Good', isCorrect: false, explanation: 'Bad', points: 0 },
          ],
        },
      ],
      { q1: 'o1' }
    );

    const delta = financialIqService.computeDelta(preResult, postResult);
    expect(delta.preFlightIQ).toBe(0);
    expect(delta.postFlightIQ).toBe(100);
    expect(delta.deltaPoints).toBe(100);
    expect(delta.strongestImprovementArea).toBe('Debt & Interest Defense');
  });
});
