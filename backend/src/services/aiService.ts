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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export interface ChatParams {
  message: string;
  history?: ChatMessage[];
  context?: {
    stage?: string;
    financialHealth?: number;
    netWorth?: number;
    score?: number;
    playerName?: string;
  };
}

export interface ChatResponse {
  reply: string;
  provider: 'Google Gemini 1.5 Flash' | 'Deterministic Flight Co-Pilot';
  suggestedPrompts: string[];
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

    return this.getDeterministicExplanation(params);
  }

  /**
   * Conversational Chatbot endpoint for FinQuest cadets.
   * Leverages Gemini 1.5 Flash when API key is set, or a rich local financial engine when offline.
   */
  public async chat(params: ChatParams): Promise<ChatResponse> {
    const { message, history = [], context = {} } = params;

    // 1. Try Gemini AI if API key is present
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemPrompt = `You are "FinQuest Flight Co-Pilot", an aviation-themed financial literacy coach inside FinQuest (the financial flight simulator for India).
Cadet Name: ${context.playerName || 'Cadet'}
Cadet Telemetry:
- Net Worth: ₹${context.netWorth ?? 10000}
- Financial Health Rating: ${context.financialHealth ?? 75}%
- Pilot Score: ${context.score ?? 0} pts
- Current Stage: ${context.stage || 'General Hangar'}

Mission:
1. Provide actionable, supportive personal finance advice for young adults in India.
2. Ground all answers in Indian financial systems: Reserve Bank of India (RBI), SEBI investor protection, CIBIL score (750+), UPI safety, Emergency Fund runway, 50/30/20 budget, Systematic Investment Plans (SIP), Public Provident Fund (PPF), National Cybercrime Helpline (1930).
3. Naturally weave in aviation metaphors ("climbing to financial altitude", "drag coefficient of debt", "turbulent headwinds", "checking altimeter").
4. Keep answers concise, clear, and easy to read (2-3 short paragraphs max, with bullet points where appropriate). Do not use excessive walls of text.`;

        // Format history
        let conversationContext = systemPrompt + '\n\nRecent Conversation:\n';
        const recentHistory = history.slice(-6);
        for (const h of recentHistory) {
          const speaker = h.role === 'user' ? 'Cadet' : 'Co-Pilot';
          conversationContext += `${speaker}: ${h.content}\n`;
        }
        conversationContext += `Cadet: ${message}\nCo-Pilot:`;

        const result = await model.generateContent(conversationContext);
        const replyText = result.response.text();

        return {
          reply: replyText.trim(),
          provider: 'Google Gemini 1.5 Flash',
          suggestedPrompts: this.generateFollowUpPrompts(message),
        };
      } catch (err) {
        console.warn('Gemini chat error, seamlessly using local Co-Pilot knowledge engine:', err);
      }
    }

    // 2. Free, high-fidelity local Co-Pilot engine
    return this.getLocalChatResponse(message, context);
  }

  private generateFollowUpPrompts(input: string): string[] {
    const lower = input.toLowerCase();
    if (lower.includes('cibil') || lower.includes('credit')) {
      return ['What damages CIBIL score the most?', 'How fast can I rebuild credit?', 'Should I get a credit card at 21?'];
    }
    if (lower.includes('budget') || lower.includes('50')) {
      return ['How to cut 30% Wants without suffering?', 'Where should my 20% savings go?', 'What if my rent is over 50%?'];
    }
    if (lower.includes('scam') || lower.includes('fraud') || lower.includes('1930')) {
      return ['How does the 1930 Golden Hour work?', 'Can someone steal money via QR code?', 'What is an APK screen share scam?'];
    }
    if (lower.includes('sip') || lower.includes('invest') || lower.includes('stock')) {
      return ['Index fund vs FD for 5 years?', 'How much should I start a SIP with?', 'What is compounding interest CAGR?'];
    }
    return [
      'How do I boost my CIBIL score to 750+?',
      'Explain the 50/30/20 budget rule',
      'How to spot fake Telegram trading scams?',
    ];
  }

  private getLocalChatResponse(message: string, context: any): ChatResponse {
    const q = message.toLowerCase().trim();

    // 1. CIBIL & Credit Score
    if (q.includes('cibil') || q.includes('credit score') || q.includes('credit card')) {
      return {
        reply: `Captain! Your CIBIL score acts as your **Financial Altimeter** (ranging from 300 to 900). Banks in India reserve prime loan interest rates for pilots with a score of **750+**.

Here are the 3 Golden Flight Checks for your credit altitude:
1. **Pay 100% Total Due on time:** Never pay just the "Minimum Due". Credit cards charge 3.5% per month (42% APR) on revolving balances!
2. **Keep Credit Utilization under 30%:** If your card limit is ₹50,000, don't spend more than ₹15,000 in a billing cycle.
3. **Avoid Loan Stacking:** Applying for multiple Buy-Now-Pay-Later (BNPL) or personal loan apps triggers hard credit inquiries that drag your score down.`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'What is the credit card minimum due trap?',
          'How does BNPL affect CIBIL score?',
          'Explain the 50/30/20 budget rule',
        ],
      };
    }

    // 2. Budgeting & 50/30/20 Rule
    if (q.includes('budget') || q.includes('50/30/20') || q.includes('salary') || q.includes('expense')) {
      return {
        reply: `Roger that, Cadet! In aviation, balanced weight and trim keep an aircraft in stable flight. The **50/30/20 Rule** is your standard aerodynamic budget formula:

- **50% Needs (Essential Fuel):** Rent, groceries, electricity, essential commute, and minimum loan repayments.
- **30% Wants (In-Flight Comforts):** Dining out, OTT subscriptions, weekend trips, and lifestyle upgrades.
- **20% Savings (Climbing Altitude):** Automated index SIPs, emergency reserve fund, and retirement corpus.

💡 **Pro Pilot Tip:** Always **"Pay Yourself First"**. On the day your salary lands, automate your 20% transfer to your savings or mutual fund before you spend a single rupee on discretionary items!`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'How much emergency fuel do I need?',
          'What is an Index Mutual Fund?',
          'How to identify UPI scams?',
        ],
      };
    }

    // 3. Scams & Cybercrime
    if (q.includes('scam') || q.includes('fraud') || q.includes('fake') || q.includes('telegram') || q.includes('upi') || q.includes('hack')) {
      return {
        reply: `🚨 **Warning: Hostile Interceptors Detected!** Cybercrime syndicates target young adults using psychological urgency and fake authority.

Remember these 4 Anti-Jamming Flight Protocols:
1. **Never enter your UPI PIN to receive money:** Entering your PIN is *always* an authorization to debit funds from your account.
2. **Beware of Part-Time "YouTube Like / Rating" Job Offers:** These are classic pig-butchering scams run via Telegram channels.
3. **Never install unverified APK files:** Fraudsters use screen-sharing trojans (like AnyDesk or fake bank APKs) to bypass OTP security.
4. **Golden Hour Action:** If defrauded, dial the **National Cybercrime Helpline at 1930** immediately or report at **cybercrime.gov.in** within 2 hours to freeze bank nodal accounts.`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'How does Helpline 1930 work?',
          'How to check if a digital lending app is RBI registered?',
          'What is the 50/30/20 budget rule?',
        ],
      };
    }

    // 4. Emergency Fund
    if (q.includes('emergency') || q.includes('runway') || q.includes('contingency') || q.includes('fd') || q.includes('savings')) {
      return {
        reply: `Affirmative, Cadet! In aviation, you never take off without enough reserve fuel to divert to an alternate airport. An **Emergency Runway Fund** protects you from financial crashes when life throws sudden crosswinds (layoffs, medical emergencies, laptop breakdown).

Target Runway:
- **Baseline:** 3 months of essential living expenses (rent + food + EMIs).
- **Ideal:** 6 months of expenses parked in a safe, high-liquidity vehicle (Auto-sweep Fixed Deposit or Liquid Mutual Fund).

Never invest your emergency runway into volatile stocks or crypto. Its purpose is **capital defense, not high returns!**`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'Where should I park my emergency fund?',
          'How do I start investing with ₹500/month?',
          'How to boost CIBIL score to 750+?',
        ],
      };
    }

    // 5. Investing & SIP
    if (q.includes('invest') || q.includes('sip') || q.includes('stock') || q.includes('mutual fund') || q.includes('wealth') || q.includes('compound')) {
      return {
        reply: `Clear for takeoff on Wealth Compounding! 🚀

A **Systematic Investment Plan (SIP)** is an automated monthly investment into a diversified Mutual Fund (like a Nifty 50 or Sensex Index Fund).

The Math of Liftoff:
- Investing **₹5,000 every month** at an average 12% CAGR:
  - In 10 years: You invest ₹6 Lakhs → Corpus climbs to **~₹11.6 Lakhs**.
  - In 20 years: You invest ₹12 Lakhs → Corpus soars to **~₹50 Lakhs**!

Avoid trading options/F&O without years of training—SEBI reports that 93% of individual retail F&O traders lose money. Stick to low-cost broad-market index funds!`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'What is a low-cost Index Fund?',
          'Explain the 50/30/20 budget rule',
          'How to improve my CIBIL score?',
        ],
      };
    }

    // 6. Generic Co-Pilot Greeting & Assistance
    const cadetName = context.playerName || 'Cadet';
    return {
      reply: `Greetings, ${cadetName}! I am your **FinQuest Flight Co-Pilot & Financial Instructor**. ✈️

I can guide you through:
- 📊 **50/30/20 Budgeting:** Weight, trim, and cashflow defense.
- 💳 **CIBIL Score Altitude:** Reaching 750+ without debt traps.
- 🛡️ **Scam Radar:** Spotting Telegram fraud, UPI traps, and Helpline 1930.
- 📈 **Wealth Compounding:** SIPs, index funds, and long-term trajectory.
- 🚨 **Emergency Reserves:** Building your 6-month safety runway.

*(Note: For unlimited open-ended AI conversations, you can paste your free Google Gemini API key into \`backend/.env\` anytime!)*

What financial maneuver would you like to review today?`,
      provider: 'Deterministic Flight Co-Pilot',
      suggestedPrompts: [
        'How to boost CIBIL score to 750+?',
        'Explain the 50/30/20 budget rule',
        'How to identify UPI & Telegram scams?',
      ],
    };
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
