import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

export interface AICoachExplanation {
  headline: string;
  whyThisHappened: string;
  mathematicalTruth: string;
  indianRegulatoryContext: string;
  coachAdvice: string;
}

export interface ExplainDecisionParams {
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

export class AIService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY.trim());
      } catch (err) {
        console.warn('Failed to initialize GoogleGenerativeAI client:', err);
      }
    }
  }

  public async explainDecision(params: ExplainDecisionParams): Promise<AICoachExplanation> {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `
You are the Chief Financial Flight Instructor for FinQuest, an educational financial flight simulator.
The user is a young adult in India navigating their early career.
Current flight scenario: "${params.scenarioTitle}"
User financial status before decision:
- Cash in hand: ₹${params.cash}
- Active Debt: ₹${params.debt}
- CIBIL Credit Score: ${params.creditScore}

User selected this decision:
"${params.choiceLabel}" ${params.choiceDescription ? `- ${params.choiceDescription}` : ''}
Decision impacts: Cash Delta ₹${params.cashDelta}, Debt Delta ₹${params.debtDelta}, Optimal: ${params.isOptimal}.

Analyze this decision and return ONLY valid JSON matching this schema:
{
  "headline": "Sharp, aviation-themed executive verdict (under 8 words)",
  "whyThisHappened": "Friendly, non-shaming analysis of the immediate cause and effect (2-3 sentences)",
  "mathematicalTruth": "Clear mathematical breakdown of compounding, interest drag, or opportunity cost (2 sentences)",
  "indianRegulatoryContext": "Specific Indian context referencing RBI guidelines, SEBI advisories, CIBIL scoring, or the National Cybercrime 1930 helpline (2 sentences)",
  "coachAdvice": "1 actionable golden rule for their future financial flight path"
}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extract JSON from markdown or raw text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            headline: parsed.headline || 'Flight Telemetry Verified',
            whyThisHappened: parsed.whyThisHappened || 'Telemetry processed by flight deck.',
            mathematicalTruth: parsed.mathematicalTruth || 'Cash flow balance updated.',
            indianRegulatoryContext: parsed.indianRegulatoryContext || 'Governed by RBI Fair Practices Code.',
            coachAdvice: parsed.coachAdvice || 'Maintain disciplined emergency reserves.',
          };
        }
      } catch (error) {
        console.warn('Gemini API call failed, falling back to deterministic coach:', error);
      }
    }

    // Deterministic High-Fidelity Flight Coach Fallback
    return this.getDeterministicExplanation(params);
  }

  private getDeterministicExplanation(params: ExplainDecisionParams): AICoachExplanation {
    const { choiceLabel, scenarioTitle, isOptimal, cashDelta, debtDelta, debt } = params;
    const labelLower = choiceLabel.toLowerCase();

    if (labelLower.includes('scam') || labelLower.includes('fake') || labelLower.includes('phish') || labelLower.includes('telegram')) {
      if (isOptimal) {
        return {
          headline: 'Radar Lock: Scam Thwarted Cleanly',
          whyThisHappened: 'You recognized high-pressure urgency and refused to authorize an unverified payment or grant remote access to your device.',
          mathematicalTruth: 'A single phishing error can erase up to 100% of your liquid emergency runway in less than 90 seconds.',
          indianRegulatoryContext: 'RBI mandates that banks provide zero-liability protection if unauthorized transactions are reported within 3 working days via the National Cybercrime Portal (cybercrime.gov.in or helpline 1930).',
          coachAdvice: 'Never authorize a UPI mandate or enter your UPI PIN to receive money.',
        };
      } else {
        return {
          headline: 'Cabin Depressurization: Cyber Trap Tripped',
          whyThisHappened: 'You interacted with an unverified third-party link or transferred funds under fraudulent urgency.',
          mathematicalTruth: `You absorbed an immediate loss of ₹${Math.abs(cashDelta).toLocaleString('en-IN')}, wiping out critical liquid altitude.`,
          indianRegulatoryContext: 'SEBI and the Department of Telecommunications warn against unregulated investment channels on Telegram and WhatsApp promising guaranteed returns.',
          coachAdvice: 'Immediately freeze compromised bank accounts and dial the National Cybercrime Helpline at 1930 within the Golden Hour.',
        };
      }
    }

    if (debtDelta > 0 || labelLower.includes('loan') || labelLower.includes('emi') || labelLower.includes('bnpl')) {
      return {
        headline: 'Heavy Payload: Predatory Debt Stalling Lift',
        whyThisHappened: 'You financed an immediate desire with unsecured debt or flexible EMIs rather than saving cash up-front.',
        mathematicalTruth: `At standard credit card rates of 3.5% per month (42% APR), a balance of ₹${(debt + debtDelta).toLocaleString('en-IN')} accrues massive compounding interest, doubling in roughly 20 months.`,
        indianRegulatoryContext: 'The Reserve Bank of India (RBI) mandates all regulated lending platforms disclose the Annual Percentage Rate (APR) and Key Fact Statement (KFS) upfront.',
        coachAdvice: 'Avoid financing lifestyle depreciating assets with double-digit APR revolving credit lines.',
      };
    }

    if (isOptimal) {
      return {
        headline: 'Cruising at Optimal Altitude',
        whyThisHappened: `You executed a disciplined financial maneuver in "${scenarioTitle}", prioritizing cash runway, low liabilities, and systematic growth.`,
        mathematicalTruth: 'By keeping debt at zero and maintaining positive net cash flow, you preserve 100% of your capital for wealth compounding.',
        indianRegulatoryContext: 'Building a consistent track record of on-time payments and under 30% credit utilization pushes your CIBIL score above 750, unlocking prime bank interest rates.',
        coachAdvice: 'Automate your monthly savings on salary day before allocating discretionary lifestyle spending.',
      };
    }

    return {
      headline: 'Turbulence Encountered: Review Flight Plan',
      whyThisHappened: `Your decision in "${scenarioTitle}" introduced avoidable drag or reduced your liquid fuel buffer.`,
      mathematicalTruth: `This choice created an adverse delta of ₹${Math.abs(cashDelta + debtDelta).toLocaleString('en-IN')}, shifting your financial trajectory downward.`,
      indianRegulatoryContext: 'Financial discipline and emergency buffer protection are essential foundations under Indian personal finance regulations and wealth guidelines.',
      coachAdvice: 'Always pause for 24 hours on discretionary purchases above 10% of your monthly take-home income.',
    };
  }
}

export const aiService = new AIService();

