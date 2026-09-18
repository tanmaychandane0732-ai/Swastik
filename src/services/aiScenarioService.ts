import { AICoachExplanation, WhatIfProjection } from '../types/flightSimulator';
import { SimulatorChoice, SimulatorPlayerState } from '../data/lifeSimulatorScenarios';
import { AIApi } from './api/aiApi';

/**
 * AI Scenario Engine & Flight Coach Service
 * Seamlessly calls the Node.js backend AI Coach endpoint (which uses Gemini 1.5 Flash),
 * with automatic fallback to a deterministic, high-fidelity local generator
 * with Indian financial context (RBI, SEBI, 1930 Cybercrime) when offline.
 */

const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export class AIScenarioService {
  private static getApiKey(): string | null {
    // Check Vite client env variable
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY as string;
    }
    // Check localStorage in case user provided one in settings
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('finquest_gemini_api_key');
      if (stored) return stored;
    }
    return null;
  }

  /**
   * Explains a player's decision through the AI Flight Coach lens
   */
  static async explainDecision(
    choice: SimulatorChoice,
    scenarioTitle: string,
    playerState: SimulatorPlayerState
  ): Promise<AICoachExplanation> {
    // 1. Try Backend AI Coach API first
    try {
      const backendRes = await AIApi.explain({
        choiceLabel: choice.label,
        choiceDescription: choice.description,
        scenarioTitle,
        cash: playerState.cash,
        debt: playerState.debt,
        creditScore: playerState.creditScore,
        cashDelta: choice.effects.cashDelta,
        debtDelta: choice.effects.debtDelta,
        isOptimal: choice.effects.scoreDelta >= 800,
      });

      if (backendRes.success && backendRes.data) {
        return backendRes.data;
      }
    } catch {
      // Backend offline, fallback to client-direct or deterministic
    }
    const apiKey = this.getApiKey();

    if (apiKey) {
      try {
        const prompt = `
You are the Chief Financial Flight Instructor for FinQuest, an educational financial flight simulator.
The user is a young adult in India navigating their career.
Current scenario: "${scenarioTitle}"
User's financial metrics before decision:
- Cash in hand: ₹${playerState.cash}
- Active Debt: ₹${playerState.debt}
- Monthly EMI: ₹${playerState.monthlyEmi}
- CIBIL Credit Score: ${playerState.creditScore}

User selected this choice:
"${choice.label}" - ${choice.description}
Financial impact: Cash: ₹${choice.effects.cashDelta}, Debt: ₹${choice.effects.debtDelta}, Monthly EMI: ₹${choice.effects.monthlyEmiDelta}, Credit Score: ${choice.effects.creditScoreDelta}.

Respond in valid JSON format only:
{
  "headline": "A sharp, aviation-themed executive verdict (under 8 words)",
  "whyThisHappened": "Friendly, non-shaming analysis of the immediate cause and effect (2-3 sentences)",
  "mathematicalTruth": "Clear mathematical breakdown of compounding, interest drag, or opportunity cost (2 sentences)",
  "indianRegulatoryContext": "Specific Indian context referencing RBI guidelines, SEBI advisories, CIBIL scoring, or the National Cybercrime 1930 helpline (2 sentences)",
  "coachAdvice": "1 actionable golden rule for their future financial journey"
}
`;

        const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text) as AICoachExplanation;
            return parsed;
          }
        }
      } catch (err) {
        console.warn('AIScenarioService: Gemini API request failed, falling back to local engine.', err);
      }
    }

    // Local Deterministic Offline Fallback
    return this.generateDeterministicExplanation(choice, playerState);
  }

  /**
   * Deterministic local fallback with Indian financial reality rules
   */
  private static generateDeterministicExplanation(
    choice: SimulatorChoice,
    playerState: SimulatorPlayerState
  ): AICoachExplanation {
    const isDebtChoice = choice.effects.debtDelta > 0 || choice.effects.monthlyEmiDelta > 0;
    const isOptimal = choice.effects.scoreDelta >= 800;
    const isScamChoice = choice.id.includes('scam') || choice.id.includes('yolo') || choice.id.includes('crypto');

    if (isOptimal) {
      return {
        headline: 'Smooth Flight Path: Altitude Secured',
        whyThisHappened: `By choosing "${choice.label}", you prioritized liquidity and risk mitigation. Your liquid buffer shielded your balance sheet without triggering emergency loans.`,
        mathematicalTruth: `Every ₹10,000 saved into compounding index funds at 12% CAGR doubles roughly every 6 years by the Rule of 72. Meanwhile, your debt interest bleed remains ₹0.`,
        indianRegulatoryContext: `The Reserve Bank of India (RBI) consistently advises maintaining 3 to 6 months of fixed expenses in liquid instruments to avoid predatory debt cycles.`,
        coachAdvice: `Golden Rule: Pay your future self first before funding lifestyle luxuries.`,
      };
    }

    if (isDebtChoice) {
      const annualApr = 36;
      return {
        headline: 'Turbulence Alert: High-APR Drag Detected',
        whyThisHappened: `You committed to an ongoing liability. When you take short-term credit with existing debt of ₹${playerState.debt}, your monthly cashflow suffocates.`,
        mathematicalTruth: `At an average credit card or instant loan APR of ${annualApr}%, paying only minimum dues means a ₹30,000 balance takes over 8 years to clear and costs over ₹48,000 in pure interest.`,
        indianRegulatoryContext: `Under RBI Fair Practices Code, unregulated instant loan apps charging 100%+ APR and accessing phone contacts are illegal. Always verify NBFC registration on the RBI official portal.`,
        coachAdvice: `Rule of Thumb: If an item is not an emergency and you cannot buy it twice in cash, you cannot afford it on EMI.`,
      };
    }

    if (isScamChoice) {
      return {
        headline: 'Warning: Hull Breach from Social Engineering',
        whyThisHappened: `High-pressure promises of guaranteed outsized returns exploit FOMO. Legitimate markets never guarantee 40-50% monthly gains with zero risk.`,
        mathematicalTruth: `Risk and return are mathematically intertwined. Any scheme promising 50% guaranteed monthly returns would turn ₹10,000 into ₹1.29 Crores in 12 months—a mathematical impossibility.`,
        indianRegulatoryContext: `SEBI explicitly warns that registered advisors never operate via Telegram/WhatsApp tip channels or guarantee fixed returns. Report fraudulent financial handles to the National Cybercrime Portal (cybercrime.gov.in) or call 1930.`,
        coachAdvice: `Never enter your UPI PIN to receive money. A UPI PIN is strictly used to debit your account.`,
      };
    }

    // Default Balanced Advice
    return {
      headline: 'Flight Path Adjusted: Balancing Altitude and Drag',
      whyThisHappened: `Your decision reflects a common compromise between short-term gratification and long-term security. While you survived the round, your financial headroom contracted.`,
      mathematicalTruth: `Inflation in India averages 5.5% to 6.5%. Money sitting idle loses purchasing power, while unmanaged expenses erode your net worth trajectory over 5 years.`,
      indianRegulatoryContext: `CIBIL credit bureaus penalize credit utilization ratios exceeding 30%. Maintaining low debt and consistent repayments builds an 750+ score for prime home loan rates.`,
      coachAdvice: `Always track your net worth altitude monthly: Net Worth = Assets - Liabilities.`,
    };
  }

  /**
   * Generates a 5-year compounding divergence comparison
   */
  static generateWhatIf(
    chosen: SimulatorChoice,
    alternative: SimulatorChoice,
    currentNetWorth: number
  ): WhatIfProjection {
    const chosenCashDelta = chosen.effects.cashDelta + chosen.effects.investedDelta;
    const chosenDebt = chosen.effects.debtDelta;

    const altCashDelta = alternative.effects.cashDelta + alternative.effects.investedDelta;
    const altDebt = alternative.effects.debtDelta;

    // 5-Year compound projection models (12% investment growth vs 36% debt compounding)
    const year1Chosen = Math.round(currentNetWorth + chosenCashDelta * 1.12 - chosenDebt * 1.36);
    const year5Chosen = Math.round(currentNetWorth + chosenCashDelta * Math.pow(1.12, 5) - chosenDebt * Math.pow(1.36, 5));
    const chosenInterest = Math.round(chosenDebt > 0 ? chosenDebt * 1.8 : 0);

    const year1Alt = Math.round(currentNetWorth + altCashDelta * 1.12 - altDebt * 1.36);
    const year5Alt = Math.round(currentNetWorth + altCashDelta * Math.pow(1.12, 5) - altDebt * Math.pow(1.36, 5));
    const altInterest = Math.round(altDebt > 0 ? altDebt * 1.8 : 0);

    const divergenceDiff = Math.abs(year5Alt - year5Chosen);

    return {
      currentChoiceOutcome: {
        year1NetWorth: year1Chosen,
        year5NetWorth: year5Chosen,
        interestPaid5Years: chosenInterest,
        stressLevel: chosenDebt > 20000 ? 'Critical' : chosenDebt > 0 ? 'Moderate' : 'Low',
      },
      alternativeChoiceOutcome: {
        year1NetWorth: year1Alt,
        year5NetWorth: year5Alt,
        interestPaid5Years: altInterest,
        stressLevel: altDebt > 20000 ? 'Critical' : altDebt > 0 ? 'Moderate' : 'Low',
      },
      divergenceSummary: `Over 5 years, this single decision creates a ₹${divergenceDiff.toLocaleString()} divergence in total wealth, driven by compounding assets versus compounding debt interest.`,
    };
  }
}

