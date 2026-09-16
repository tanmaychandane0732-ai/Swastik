import { describe, it, expect } from 'vitest';
import {
  calculateBudgetScore,
  calculateCompoundDebt,
  calculateStreakMultiplier,
  calculateFinancialHealthScore,
  calculateScamScore,
} from '../utils/financialMath';
import { SCAM_TARGETS } from '../data/scamScenarios';

describe('Financial Math Engine', () => {
  describe('50/30/20 Budget Scoring', () => {
    it('awards high score and positive health for exact 50/30/20 split', () => {
      const income = 60000;
      const needs = 30000;  // 50%
      const wants = 18000;  // 30%
      const savings = 12000; // 20%

      const result = calculateBudgetScore(income, needs, wants, savings);
      expect(result.status).toBe('excellent');
      expect(result.score).toBeGreaterThanOrEqual(900);
      expect(result.healthDelta).toBeGreaterThan(0);
      expect(result.isBalanced).toBe(true);
      expect(result.needsPct).toBe(50);
      expect(result.wantsPct).toBe(30);
      expect(result.savingsPct).toBe(20);
    });

    it('penalizes severely when total allocation exceeds monthly income (deficit)', () => {
      const income = 60000;
      const needs = 40000;
      const wants = 25000;
      const savings = 5000; // Total 70,000 > 60,000

      const result = calculateBudgetScore(income, needs, wants, savings);
      expect(result.status).toBe('critical');
      expect(result.score).toBeLessThan(300);
      expect(result.healthDelta).toBeLessThan(0);
      expect(result.isBalanced).toBe(false);
    });

    it('warns when wants exceed 40% (lifestyle inflation)', () => {
      const income = 60000;
      const needs = 25000;
      const wants = 30000; // 50% wants
      const savings = 5000;

      const result = calculateBudgetScore(income, needs, wants, savings);
      expect(result.status).toBe('warning');
      expect(result.healthDelta).toBeLessThan(0);
    });
  });

  describe('Compound Debt Engine', () => {
    it('calculates compound interest for minimum payments over 24 months', () => {
      const principal = 25000;
      const rateApr = 36; // 36% APR credit card
      const minPayment = 1250;

      const result = calculateCompoundDebt(principal, rateApr, minPayment, 24);
      expect(result.months.length).toBe(25); // 0 through 24
      expect(result.totalInterestPaid).toBeGreaterThan(5000);
      expect(result.isCompoundingOutOfControl).toBe(true);
    });

    it('calculates full immediate payoff with zero interest paid', () => {
      const principal = 25000;
      const rateApr = 36;
      const fullPayment = 25000;

      const result = calculateCompoundDebt(principal, rateApr, fullPayment, 24);
      expect(result.balances[1]).toBe(0);
      expect(result.payoffMonth).toBe(1);
    });
  });

  describe('Streak Multiplier', () => {
    it('returns 1.0x for streak < 3', () => {
      expect(calculateStreakMultiplier(0)).toBe(1.0);
      expect(calculateStreakMultiplier(2)).toBe(1.0);
    });

    it('returns 1.2x for streak between 3 and 4', () => {
      expect(calculateStreakMultiplier(3)).toBe(1.2);
      expect(calculateStreakMultiplier(4)).toBe(1.2);
    });

    it('returns 1.5x for streak between 5 and 6', () => {
      expect(calculateStreakMultiplier(5)).toBe(1.5);
      expect(calculateStreakMultiplier(6)).toBe(1.5);
    });

    it('returns 2.0x for streak >= 7', () => {
      expect(calculateStreakMultiplier(7)).toBe(2.0);
      expect(calculateStreakMultiplier(10)).toBe(2.0);
    });
  });

  describe('Financial Health Score', () => {
    it('clamps health between 0 and 100 with accurate status categorization', () => {
      expect(calculateFinancialHealthScore(85, 10).score).toBe(95);
      expect(calculateFinancialHealthScore(85, 10).status).toBe('excellent');

      expect(calculateFinancialHealthScore(70, 0).score).toBe(70);
      expect(calculateFinancialHealthScore(70, 0).status).toBe('healthy');

      expect(calculateFinancialHealthScore(45, 0).score).toBe(45);
      expect(calculateFinancialHealthScore(45, 0).status).toBe('warning');

      expect(calculateFinancialHealthScore(20, -5).score).toBe(15);
      expect(calculateFinancialHealthScore(20, -5).status).toBe('critical');

      // Clamping limits
      expect(calculateFinancialHealthScore(95, 20).score).toBe(100);
      expect(calculateFinancialHealthScore(10, -30).score).toBe(0);
    });
  });

  describe('Scam Detection Radar Scoring', () => {
    const cryptoScamTarget = SCAM_TARGETS[0]; // actualScam: true

    it('correctly scores player when marking a scam as fraud with identified red flags', () => {
      const selectedFlags = ['flag_guaranteed_return', 'flag_urgency_pressure'];
      const result = calculateScamScore(cryptoScamTarget, selectedFlags, true);

      expect(result.isCorrect).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(600);
      expect(result.netWorthDelta).toBeGreaterThan(0);
      expect(result.healthDelta).toBeGreaterThan(0);
    });

    it('penalizes player when failing to spot a scam', () => {
      const result = calculateScamScore(cryptoScamTarget, [], false);

      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(100);
      expect(result.netWorthDelta).toBeLessThan(0);
      expect(result.healthDelta).toBeLessThan(0);
    });
  });
});

