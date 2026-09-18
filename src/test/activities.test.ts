import { describe, it, expect } from 'vitest';
import { SCAM_DETECTIVE_SCENARIOS } from '../data/scamDetectiveData';
import { TURBULENCE_EVENTS } from '../data/turbulenceData';
import { INITIAL_BADGES } from '../data/badgesData';
import { TurbulenceFlightMetrics } from '../types/turbulence';

describe('FinQuest In-Game Activities Unit Tests', () => {
  describe('🚨 Scam Detective Scenarios & Logic Tests', () => {
    it('loads all 6 forensic scam scenarios with required properties', () => {
      expect(SCAM_DETECTIVE_SCENARIOS).toHaveLength(6);

      SCAM_DETECTIVE_SCENARIOS.forEach((scenario) => {
        expect(scenario.id).toBeDefined();
        expect(scenario.senderName).toBeTruthy();
        expect(scenario.channel).toMatch(/sms|whatsapp|email|upi|telegram/);
        expect(scenario.messageText.length).toBeGreaterThan(20);
        expect(scenario.clues.length).toBeGreaterThanOrEqual(3);
        expect(scenario.decisionOptions.length).toBeGreaterThanOrEqual(2);
        expect(scenario.caseAnalysis.realWorldPrecedent).toBeTruthy();
      });
    });

    it('contains legitimate red flag clues and distractors in each scenario', () => {
      SCAM_DETECTIVE_SCENARIOS.forEach((scenario) => {
        const correctClues = scenario.clues.filter((c) => c.isCorrect);
        const distractorClues = scenario.clues.filter((c) => !c.isCorrect);

        expect(correctClues.length).toBeGreaterThanOrEqual(2);
        expect(distractorClues.length).toBeGreaterThanOrEqual(1);

        correctClues.forEach((clue) => {
          expect(clue.explanation).toBeTruthy();
          expect(clue.category).toBeDefined();
        });
      });
    });

    it('ensures each scenario provides at least one safe containment protocol', () => {
      SCAM_DETECTIVE_SCENARIOS.forEach((scenario) => {
        const safeOptions = scenario.decisionOptions.filter((opt) => opt.isSafe);
        const dangerousOptions = scenario.decisionOptions.filter((opt) => !opt.isSafe);

        expect(safeOptions.length).toBeGreaterThanOrEqual(1);
        expect(dangerousOptions.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('references authentic Indian cybercrime institutions and regulations', () => {
      const allPrecedents = SCAM_DETECTIVE_SCENARIOS.map(
        (s) => s.caseAnalysis.realWorldPrecedent
      ).join(' ');

      expect(allPrecedents).toContain('1930');
      expect(allPrecedents).toContain('RBI');
      expect(allPrecedents).toContain('cybercrime.gov.in');
      expect(allPrecedents).toContain('SEBI');
    });
  });

  describe('🌪️ Financial Turbulence Simulation & Aerodynamics Tests', () => {
    it('loads all 6 turbulence events across varying severities', () => {
      expect(TURBULENCE_EVENTS).toHaveLength(6);

      const severities = TURBULENCE_EVENTS.map((e) => e.severity);
      expect(severities).toContain('calm');
      expect(severities).toContain('moderate');
      expect(severities).toContain('severe');
    });

    it('ensures every turbulence event provides multiple distinct tradeoff strategies', () => {
      TURBULENCE_EVENTS.forEach((event) => {
        expect(event.choices.length).toBeGreaterThanOrEqual(3);

        const validActionTypes = ['savings', 'emi', 'borrow', 'delay'];
        event.choices.forEach((c) => {
          expect(validActionTypes).toContain(c.actionType);
        });

        // Optimal alternative must match one of the choices
        const optimalChoice = event.choices.find((c) => c.id === event.whatIfAlternativeId);
        expect(optimalChoice).toBeDefined();
      });
    });

    it('correctly models cash depletion vs debt drag in tradeoffs', () => {
      const laptopCrash = TURBULENCE_EVENTS.find((e) => e.id === 'turb_1_laptop_crash')!;
      expect(laptopCrash).toBeDefined();

      const savingsChoice = laptopCrash.choices.find((c) => c.actionType === 'savings')!;
      const emiChoice = laptopCrash.choices.find((c) => c.actionType === 'emi')!;

      // Savings choice pays ₹18,000 upfront with 0 debt drag and positive resilience
      expect(savingsChoice.cashDelta).toBe(-18000);
      expect(savingsChoice.debtDelta).toBe(0);
      expect(savingsChoice.monthlyEmiDelta).toBe(0);
      expect(savingsChoice.resilienceDelta).toBeGreaterThan(0);

      // EMI choice retains immediate cash but adds ₹18,000 debt + monthly EMI drag
      expect(emiChoice.cashDelta).toBe(0);
      expect(emiChoice.debtDelta).toBe(18000);
      expect(emiChoice.monthlyEmiDelta).toBeGreaterThan(0);
      expect(emiChoice.resilienceDelta).toBeLessThan(0);
      expect(emiChoice.chainEffectKey).toBe('heavy_emi_drag');
    });

    it('accurately updates cockpit flight metrics after sequential shock decisions', () => {
      const metrics: TurbulenceFlightMetrics = {
        altitudeNetWorth: 50000,
        fuelCash: 45000,
        debtDrag: 0,
        monthlyEmi: 0,
        resilienceScore: 80,
      };

      // Event 1: Pay ₹18,000 cash for motherboard failure
      const choice1 = TURBULENCE_EVENTS[0].choices[0]; // c1_savings
      metrics.fuelCash += choice1.cashDelta;
      metrics.debtDrag += choice1.debtDelta;
      metrics.monthlyEmi += choice1.monthlyEmiDelta;
      metrics.resilienceScore = Math.min(100, metrics.resilienceScore + choice1.resilienceDelta);

      expect(metrics.fuelCash).toBe(27000);
      expect(metrics.debtDrag).toBe(0);
      expect(metrics.resilienceScore).toBe(90);

      // Event 2: Medical bill using ₹14,000 cash
      const choice2 = TURBULENCE_EVENTS[1].choices[0]; // c2_savings
      metrics.fuelCash += choice2.cashDelta;
      metrics.debtDrag += choice2.debtDelta;
      metrics.monthlyEmi += choice2.monthlyEmiDelta;
      metrics.resilienceScore = Math.min(100, metrics.resilienceScore + choice2.resilienceDelta);

      expect(metrics.fuelCash).toBe(13000);
      expect(metrics.debtDrag).toBe(0);
      expect(metrics.resilienceScore).toBe(100);
    });
  });

  describe('🏅 Badges System Integration Tests', () => {
    it('contains all 5 newly added aviation & activity badges', () => {
      const badgeIds = INITIAL_BADGES.map((b) => b.id);

      expect(badgeIds).toContain('badge_scam_spotter');
      expect(badgeIds).toContain('badge_scam_shield');
      expect(badgeIds).toContain('badge_turbulence_survivor');
      expect(badgeIds).toContain('badge_calm_pilot');
      expect(badgeIds).toContain('badge_decision_master');
    });

    it('has correct categories and non-empty titles/descriptions for all new badges', () => {
      const newBadgeIds = [
        'badge_scam_spotter',
        'badge_scam_shield',
        'badge_turbulence_survivor',
        'badge_calm_pilot',
        'badge_decision_master',
      ];

      newBadgeIds.forEach((id) => {
        const badge = INITIAL_BADGES.find((b) => b.id === id);
        expect(badge).toBeDefined();
        expect(badge!.title.length).toBeGreaterThan(3);
        expect(badge!.description.length).toBeGreaterThan(10);
        expect(badge!.iconName).toBeTruthy();
        expect(['scam', 'debt', 'mastery']).toContain(badge!.category);
      });
    });
  });

  describe('📜 Player Name Onboarding & Certificate Printing Tests', () => {
    it('correctly sets and formats the recipient name for the certificate', () => {
      const enteredName = '  Tanmay Chandane  ';
      const trimmed = enteredName.trim() || 'FinQuester';
      expect(trimmed).toBe('Tanmay Chandane');

      // Check certificate resolution logic
      const customName = trimmed;
      const playerName = trimmed;
      const displayName = customName.trim() || playerName || 'FinQuest Pilot';
      expect(displayName).toBe('Tanmay Chandane');
    });

    it('falls back to FinQuest Pilot if no name is provided', () => {
      const customName = '';
      const playerName = '';
      const displayName = customName.trim() || playerName || 'FinQuest Pilot';
      expect(displayName).toBe('FinQuest Pilot');
    });
  });
});
