import { describe, it, expect } from 'vitest';
import { DiagnosticService } from '../services/diagnosticService';
import { DecisionDNAEngine } from '../services/decisionDnaEngine';
import { AIScenarioService } from '../services/aiScenarioService';
import { PRE_FLIGHT_DIAGNOSTIC_QUESTIONS } from '../data/diagnosticQuestions';
import { SimulatorPlayerState, SimulatorChoice } from '../data/lifeSimulatorScenarios';

describe('Financial Flight Simulator Engine Tests', () => {
  describe('DiagnosticService Tests', () => {
    it('correctly evaluates a perfect diagnostic score', () => {
      const perfectAnswers: Record<string, string> = {
        diag_1_emergency: 'd1_opt_c',
        diag_2_credit_card: 'd2_opt_a',
        diag_3_upi_scam: 'd3_opt_a',
        diag_4_loan_app: 'd4_opt_b',
        diag_5_compounding: 'd5_opt_b',
        diag_6_insurance: 'd6_opt_b',
        diag_7_stock_scam: 'd7_opt_a',
      };

      const result = DiagnosticService.evaluateSubmission(
        PRE_FLIGHT_DIAGNOSTIC_QUESTIONS,
        perfectAnswers
      );

      expect(result.totalScore).toBeGreaterThanOrEqual(95);
      expect(result.tier).toBe('Elite Squadron Commander');
      expect(result.categoryScores.budget).toBeGreaterThanOrEqual(80);
      expect(result.categoryScores.debt).toBeGreaterThanOrEqual(80);
      expect(result.categoryScores.scam).toBeGreaterThanOrEqual(80);
    });

    it('correctly calculates Financial IQ Delta between pre-flight and post-flight tests', () => {
      const preResult = {
        totalScore: 45,
        categoryScores: { budget: 40, debt: 30, scam: 50, investing: 40, insurance: 35 },
        tier: 'Pre-Flight Cadet' as const,
        completedAt: '2026-09-17',
      };

      const postResult = {
        totalScore: 85,
        categoryScores: { budget: 85, debt: 80, scam: 90, investing: 80, insurance: 85 },
        tier: 'Elite Squadron Commander' as const,
        completedAt: '2026-09-17',
      };

      const delta = DiagnosticService.computeDelta(preResult, postResult);

      expect(delta.preFlightIQ).toBe(45);
      expect(delta.postFlightIQ).toBe(85);
      expect(delta.deltaPoints).toBe(40);
      expect(delta.percentageGain).toBe(89); // Math.round((40/45)*100) = 89
      expect(delta.strongestImprovementArea).toBeDefined();
    });
  });

  describe('DecisionDNAEngine Tests', () => {
    it('assigns Strategic Flight Captain to a disciplined player with savings and no debt', () => {
      const prudentState: SimulatorPlayerState = {
        month: 6,
        salary: 60000,
        cash: 35000,
        debt: 0,
        monthlyEmi: 0,
        invested: 40000,
        creditScore: 780,
        health: 90,
        score: 5500,
        decisionsHistory: ['in_m1_c1_optimal', 'in_m2_c1_resist', 'in_m3_c1_cash_shield', 'in_m4_c1_shield_active', 'in_m5_c2_reinvest_sip', 'in_m6_c1_sovereignty'],
      };

      const dna = DecisionDNAEngine.analyze(prudentState);

      expect(dna.archetype).toBe('Strategic Flight Captain');
      expect(dna.traits.patience).toBeGreaterThanOrEqual(70);
      expect(dna.traits.debtDiscipline).toBeGreaterThanOrEqual(70);
      expect(dna.traits.scamImmunity).toBeGreaterThanOrEqual(70);
      expect(dna.traits.emergencyReadiness).toBeGreaterThanOrEqual(70);
    });

    it('identifies Debt-Trapped Glider when debt discipline collapses', () => {
      const debtState: SimulatorPlayerState = {
        month: 6,
        salary: 60000,
        cash: 2000,
        debt: 65000,
        monthlyEmi: 9500,
        invested: 0,
        creditScore: 540,
        health: 35,
        score: 1200,
        decisionsHistory: ['in_m1_c3_yolo', 'in_m2_c2_bnpl_trap', 'in_m3_c2_loan_trap'],
      };

      const dna = DecisionDNAEngine.analyze(debtState);

      expect(dna.archetype).toBe('Debt-Trapped Glider');
      expect(dna.traits.debtDiscipline).toBeLessThan(45);
      expect(dna.dangerBlindSpot).toBeDefined();
    });

    it('clamps all trait scores securely between 15 and 99', () => {
      const extremeState: SimulatorPlayerState = {
        month: 6,
        salary: 60000,
        cash: 0,
        debt: 200000,
        monthlyEmi: 20000,
        invested: 0,
        creditScore: 300,
        health: 10,
        score: 0,
        decisionsHistory: ['impulse', 'yolo', 'scam_accept', 'crypto_tip', 'credit_trap'],
      };

      const dna = DecisionDNAEngine.analyze(extremeState);

      expect(dna.traits.patience).toBeGreaterThanOrEqual(15);
      expect(dna.traits.patience).toBeLessThanOrEqual(99);
      expect(dna.traits.debtDiscipline).toBeGreaterThanOrEqual(15);
      expect(dna.traits.scamImmunity).toBeGreaterThanOrEqual(15);
      expect(dna.traits.emergencyReadiness).toBeGreaterThanOrEqual(15);
    });
  });

  describe('AIScenarioService Tests', () => {
    it('produces an instant, robust offline explanation with Indian regulatory context', async () => {
      const dummyChoice: SimulatorChoice = {
        id: 'in_m3_c2_loan_trap',
        label: 'Take Instant 7-Day Personal Loan',
        description: 'Take a high APR instant personal loan',
        effects: {
          cashDelta: 0,
          debtDelta: 42000,
          monthlyEmiDelta: 4200,
          investedDelta: 0,
          creditScoreDelta: -45,
          healthDelta: -25,
          scoreDelta: 200,
        },
        outcomeHeadline: 'Emergency Loan Trap Activated',
        outcomeExplanation: 'High interest rate credit',
        financialLesson: 'Avoid unregulated lending apps',
      };

      const playerState: SimulatorPlayerState = {
        month: 3,
        salary: 60000,
        cash: 1000,
        debt: 20000,
        monthlyEmi: 2000,
        invested: 0,
        creditScore: 620,
        health: 50,
        score: 1000,
        decisionsHistory: [],
      };

      const explanation = await AIScenarioService.explainDecision(
        dummyChoice,
        'Mid-Air Turbulence',
        playerState
      );

      expect(explanation.headline).toBeDefined();
      expect(explanation.whyThisHappened).toBeDefined();
      expect(explanation.mathematicalTruth).toBeDefined();
      expect(explanation.indianRegulatoryContext).toContain('RBI');
      expect(explanation.coachAdvice).toBeDefined();
    });

    it('calculates 5-year compounding divergence in What-If projection', () => {
      const chosenChoice: SimulatorChoice = {
        id: 'spend_yolo',
        label: 'Spend All on Gadgets',
        description: '',
        effects: {
          cashDelta: -30000,
          debtDelta: 30000,
          monthlyEmiDelta: 2500,
          investedDelta: 0,
          creditScoreDelta: -20,
          healthDelta: -10,
          scoreDelta: 200,
        },
        outcomeHeadline: '',
        outcomeExplanation: '',
        financialLesson: '',
      };

      const altChoice: SimulatorChoice = {
        id: 'invest_sip',
        label: 'Invest in Index Fund',
        description: '',
        effects: {
          cashDelta: 0,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 30000,
          creditScoreDelta: 30,
          healthDelta: 15,
          scoreDelta: 950,
        },
        outcomeHeadline: '',
        outcomeExplanation: '',
        financialLesson: '',
      };

      const projection = AIScenarioService.generateWhatIf(chosenChoice, altChoice, 50000);

      expect(projection.alternativeChoiceOutcome.year5NetWorth).toBeGreaterThan(
        projection.currentChoiceOutcome.year5NetWorth
      );
      expect(projection.divergenceSummary).toContain('5 years');
    });
  });
});

