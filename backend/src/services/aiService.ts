import { env } from '../config/env';

interface GenAIClient {
  models: {
    generateContent(params: { model: string; contents: string }): Promise<{ text?: string | null }>;
  };
}

// Dynamic loader for ESM-only @google/genai in CommonJS environment
let genAIClassPromise: Promise<new (options: { apiKey: string }) => GenAIClient> | null = null;
function loadGoogleGenAIClass(): Promise<new (options: { apiKey: string }) => GenAIClient> {
  if (!genAIClassPromise) {
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    genAIClassPromise = (
      dynamicImport('@google/genai') as Promise<{ GoogleGenAI: new (options: { apiKey: string }) => GenAIClient }>
    ).then((m) => m.GoogleGenAI);
  }
  return genAIClassPromise;
}

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
  provider: string;
  suggestedPrompts: string[];
}

export interface ScenarioParams {
  topic?: 'budgeting' | 'debt' | 'investments' | 'scams' | 'emergency';
  difficulty?: 'cadet' | 'navigator' | 'commander';
}

export interface GeneratedScenario {
  title: string;
  context: string;
  options: {
    label: string;
    description: string;
    cashDelta: number;
    debtDelta: number;
    isOptimal: boolean;
    reasoning: string;
  }[];
  regulatoryNote: string;
  provider: string;
}

export interface ScamAnalysisParams {
  message: string;
  sender?: string;
  offerType?: string;
}

export interface ScamAnalysisResult {
  isLikelyScam: boolean;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  redFlags: string[];
  safeAction: string;
  regulatorySafetyTip: string;
  provider: string;
}

export interface WhatIfParams {
  eventTitle: string;
  eventDescription: string;
  currentCash: number;
  currentDebt: number;
  currentScore: number;
}

export interface WhatIfResult {
  bestCaseTrajectory: string;
  worstCaseTrajectory: string;
  recoveryFlightPlan: string[];
  provider: string;
}

export interface FlightReportParams {
  playerName: string;
  finalScore: number;
  finalHealth: number;
  finalNetWorth: number;
  completedLevels: string[];
  badgesEarned: string[];
}

export interface FlightReportInsight {
  callsignVerdict: string;
  pilotingStyle: string;
  topStrengths: string[];
  vulnerabilities: string[];
  nextFlightGoal: string;
  provider: string;
}

export class AIService {
  private genAI: GenAIClient | null = null;
  private modelName: string;
  private hasApiKey: boolean;
  private clientInitPromise: Promise<GenAIClient | null> | null = null;

  constructor() {
    this.modelName = env.GEMINI_MODEL || 'gemini-3.5-flash';
    this.hasApiKey = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '');
    if (this.hasApiKey && process.env.NODE_ENV !== 'test') {
      this.clientInitPromise = this.initClient(env.GEMINI_API_KEY!.trim());
    }
  }

  private async initClient(apiKey: string): Promise<GenAIClient | null> {
    if (process.env.NODE_ENV === 'test') {
      return null;
    }
    try {
      const GoogleGenAI = await loadGoogleGenAIClass();
      this.genAI = new GoogleGenAI({ apiKey });
      return this.genAI;
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
      return null;
    }
  }

  private async getClient(): Promise<GenAIClient | null> {
    if (this.genAI) return this.genAI;
    if (this.clientInitPromise) {
      return await this.clientInitPromise;
    }
    return null;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public isConfigured(): boolean {
    return this.hasApiKey;
  }

  /**
   * 1. Analyze Financial Decision (Decision Coach)
   */
  public async analyzeFinancialDecision(params: ExplainDecisionParams): Promise<AICoachExplanation> {
    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `You are the Chief Financial Flight Instructor for FinQuest, an educational financial flight simulator.
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
}`;

        const result = await client.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });

        const text = result.text || '';
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

  /** Alias for backward compatibility */
  public async explainDecision(params: ExplainDecisionParams): Promise<AICoachExplanation> {
    return this.analyzeFinancialDecision(params);
  }

  /**
   * 2. Financial Coach Conversational Assistant (Co-Pilot Chatbot)
   */
  public async generateCoachResponse(params: ChatParams): Promise<ChatResponse> {
    const { message, history = [], context = {} } = params;

    const client = await this.getClient();
    if (client) {
      try {
        const systemPrompt = `You are "FinQuest Flight Co-Pilot", an aviation-themed financial literacy coach inside FinQuest (the financial flight simulator for India).
Cadet Name: ${context.playerName || 'Cadet'}
Cadet Telemetry:
- Net Worth: ₹${context.netWorth ?? 10000}
- Financial Health Rating: ${context.financialHealth ?? 75}%
- Pilot Score: ${context.score ?? 0} pts
- Current Stage: ${context.stage || 'General Hangar'}

Mission Guidelines:
1. Provide actionable, supportive personal finance education for learners in India.
2. Ground all answers in Indian financial systems: Reserve Bank of India (RBI), SEBI investor protection, CIBIL score (750+), UPI safety, Emergency Fund runway (3-6 months), 50/30/20 budget, Systematic Investment Plans (SIP), Public Provident Fund (PPF), National Cybercrime Helpline (1930).
3. Naturally weave in subtle aviation metaphors ("climbing to financial altitude", "drag coefficient of debt", "turbulent headwinds", "checking altimeter").
4. Keep answers concise, clear, and easy to read (2-3 short paragraphs max, with bullet points where appropriate). Never provide personalized investment advice or fabricate live stock prices.`;

        let conversationContext = systemPrompt + '\n\nRecent Conversation:\n';
        const recentHistory = history.slice(-6);
        for (const h of recentHistory) {
          const speaker = h.role === 'user' ? 'Cadet' : 'Co-Pilot';
          conversationContext += `${speaker}: ${h.content}\n`;
        }
        conversationContext += `Cadet: ${message}\nCo-Pilot:`;

        const result = await client.models.generateContent({
          model: this.modelName,
          contents: conversationContext,
        });

        const replyText = result.text || '';
        return {
          reply: replyText.trim(),
          provider: `Google Gemini (${this.modelName})`,
          suggestedPrompts: this.generateFollowUpPrompts(message),
        };
      } catch (err) {
        console.warn('Gemini chat error, seamlessly using local Co-Pilot knowledge engine:', err);
      }
    }

    return this.getLocalChatResponse(message, context);
  }

  /** Alias for backward compatibility */
  public async chat(params: ChatParams): Promise<ChatResponse> {
    return this.generateCoachResponse(params);
  }

  /**
   * 3. AI Scenario Engine: Generate Dynamic Flight Scenario
   */
  public async generateScenario(params: ScenarioParams = {}): Promise<GeneratedScenario> {
    const topic = params.topic || 'budgeting';
    const difficulty = params.difficulty || 'cadet';

    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `Generate a realistic Indian personal finance scenario for a flight simulation game.
Topic: ${topic}
Difficulty: ${difficulty}
Return ONLY valid JSON with this exact schema:
{
  "title": "Aviation-themed scenario title",
  "context": "Realistic dilemma facing an early-career Indian graduate (2-3 sentences)",
  "options": [
    {
      "label": "Option A action title",
      "description": "Short description",
      "cashDelta": -5000,
      "debtDelta": 0,
      "isOptimal": true,
      "reasoning": "Why this is financially sound"
    },
    {
      "label": "Option B action title",
      "description": "Short description",
      "cashDelta": 0,
      "debtDelta": 15000,
      "isOptimal": false,
      "reasoning": "Hidden cost or debt trap explanation"
    }
  ],
  "regulatoryNote": "RBI or SEBI guideline note"
}`;

        const result = await client.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });

        const jsonMatch = (result.text || '').match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            provider: `Google Gemini (${this.modelName})`,
          };
        }
      } catch (err) {
        console.warn('Gemini generateScenario fallback triggered:', err);
      }
    }

    return {
      title: 'Salary Day Calibration: The No-Cost EMI Temptation',
      context: 'Your first major ₹45,000 salary has landed. An e-commerce platform offers an ultra-thin laptop via a "No-Cost EMI" with upfront processing fees and 18% GST.',
      options: [
        {
          label: 'Deploy 50/30/20 & Save Up First',
          description: 'Allocate ₹9,000 (20%) directly to an emergency runway and defer luxury purchases by 3 months.',
          cashDelta: -9000,
          debtDelta: 0,
          isOptimal: true,
          reasoning: 'Zero interest drag; strengthens cash flow altitude without recurring credit liabilities.',
        },
        {
          label: 'Accept 12-Month No-Cost EMI',
          description: 'Lock into ₹4,200/month recurring deductions with hidden processing charge of ₹750.',
          cashDelta: -750,
          debtDelta: 42000,
          isOptimal: false,
          reasoning: 'Spikes credit utilization above 30% and locks essential runway during potential emergencies.',
        },
      ],
      regulatoryNote: 'RBI Circular on Digital Lending mandates explicit display of Annual Percentage Rate (APR) including all processing charges and GST.',
      provider: 'Deterministic Flight Co-Pilot',
    };
  }

  /**
   * 4. Explain Financial Concept (Learning Assistant)
   */
  public async explainFinancialConcept(concept: string): Promise<{ explanation: string; keyTakeaway: string; provider: string }> {
    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `Explain the financial concept "${concept}" for an Indian flight simulation game in an engaging aviation metaphor.
Return ONLY valid JSON:
{
  "explanation": "2-3 clear sentences explaining how it works with an aviation flight analogy",
  "keyTakeaway": "1 golden rule for Indian retail investors / earners"
}`;
        const result = await client.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });

        const jsonMatch = (result.text || '').match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            explanation: parsed.explanation,
            keyTakeaway: parsed.keyTakeaway,
            provider: `Google Gemini (${this.modelName})`,
          };
        }
      } catch (err) {
        console.warn('Gemini explainConcept fallback triggered:', err);
      }
    }

    return {
      explanation: `Think of ${concept} as an essential flight flight-control trim system. When dialed correctly, it minimizes drag and ensures your aircraft climbs steadily without sudden engine stalls.`,
      keyTakeaway: 'Always verify fee ratios, understand compounding timelines, and prioritize capital protection.',
      provider: 'Deterministic Flight Co-Pilot',
    };
  }

  /**
   * 5. Scam Detective Case Analysis
   */
  public async analyzeScamCase(params: ScamAnalysisParams): Promise<ScamAnalysisResult> {
    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `Analyze this simulated message for fraud indicators in an Indian financial context:
Message: "${params.message}"
Sender: "${params.sender || 'Unknown'}"
Offer Type: "${params.offerType || 'General'}"

Return ONLY valid JSON:
{
  "isLikelyScam": true,
  "threatLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "redFlags": ["Flag 1", "Flag 2"],
  "safeAction": "Concrete immediate protective action",
  "regulatorySafetyTip": "Reference to RBI/1930/cybercrime guidelines"
}`;
        const result = await client.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });

        const jsonMatch = (result.text || '').match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            provider: `Google Gemini (${this.modelName})`,
          };
        }
      } catch (err) {
        console.warn('Gemini analyzeScamCase fallback triggered:', err);
      }
    }

    const lower = params.message.toLowerCase();
    const isScam = lower.includes('otp') || lower.includes('pin') || lower.includes('telegram') || lower.includes('apk') || lower.includes('lottery') || lower.includes('urgent');

    return {
      isLikelyScam: isScam,
      threatLevel: isScam ? 'CRITICAL' : 'LOW',
      redFlags: isScam
        ? ['Urgent psychological pressure', 'Requests for credentials or UPI interaction', 'Unverified external communication channel']
        : ['Standard corporate notification'],
      safeAction: isScam
        ? 'Never enter UPI PIN or click third-party links. Block and report sender.'
        : 'Verify through official banking app directly.',
      regulatorySafetyTip: 'Dial 1930 immediately or visit cybercrime.gov.in within the 2-hour Golden Window if any funds are compromised.',
      provider: 'Deterministic Flight Co-Pilot',
    };
  }

  /**
   * 6. Financial Turbulence What-If Analyzer
   */
  public async generateWhatIf(params: WhatIfParams): Promise<WhatIfResult> {
    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `Analyze downstream consequences of an unexpected financial event in a flight simulator game:
Event: ${params.eventTitle} - ${params.eventDescription}
Player Status: Cash ₹${params.currentCash}, Debt ₹${params.currentDebt}, Score ${params.currentScore}

Return ONLY valid JSON:
{
  "bestCaseTrajectory": "How disciplined handling prevents a stall (2 sentences)",
  "worstCaseTrajectory": "How panic or high-interest debt compounds into a tailspin (2 sentences)",
  "recoveryFlightPlan": ["Step 1", "Step 2", "Step 3"]
}`;
        const result = await client.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });

        const jsonMatch = (result.text || '').match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            provider: `Google Gemini (${this.modelName})`,
          };
        }
      } catch (err) {
        console.warn('Gemini generateWhatIf fallback triggered:', err);
      }
    }

    return {
      bestCaseTrajectory: 'Drawing from liquid emergency reserves preserves your CIBIL score and prevents borrowing at predatory 36%+ APR interest.',
      worstCaseTrajectory: 'Relying on Buy-Now-Pay-Later or revolving credit card dues creates an escalating interest drag that halves your discretionary cash flow.',
      recoveryFlightPlan: [
        'Freeze all discretionary lifestyle spending until emergency reserve reaches 3 months runway.',
        'Prioritize high-interest loans first using the Avalanche debt reduction method.',
        'Engage RBI-regulated formal banking channels if debt restructuring is required.',
      ],
      provider: 'Deterministic Flight Co-Pilot',
    };
  }

  /**
   * 7. Flight Report Personalized Insight
   */
  public async generateFlightReportInsight(params: FlightReportParams): Promise<FlightReportInsight> {
    const client = await this.getClient();
    if (client) {
      try {
        const prompt = `Generate a personalized financial flight evaluation for cadet "${params.playerName}":
Score: ${params.finalScore} pts | Health: ${params.finalHealth}% | Net Worth: ₹${params.finalNetWorth}
Completed Levels: ${params.completedLevels.join(', ') || 'Rookie Flight'}
Badges: ${params.badgesEarned.join(', ') || 'In Training'}

Return ONLY valid JSON:
{
  "callsignVerdict": "Punchy aviation rank verdict (e.g. Senior Crosswind Navigator)",
  "pilotingStyle": "Summary of their financial temperament (2 sentences)",
  "topStrengths": ["Strength 1", "Strength 2"],
  "vulnerabilities": ["Vulnerability 1", "Vulnerability 2"],
  "nextFlightGoal": "Actionable next frontier for their real-life financial flight path"
}`;
        const result = await client.models.generateContent({
          model: this.modelName,
          contents: prompt,
        });

        const jsonMatch = (result.text || '').match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            provider: `Google Gemini (${this.modelName})`,
          };
        }
      } catch (err) {
        console.warn('Gemini generateFlightReportInsight fallback triggered:', err);
      }
    }

    const isHighPerformer = params.finalHealth >= 70;
    return {
      callsignVerdict: isHighPerformer ? 'Aviation Ace Navigator' : 'Resilient High-Altitude Cadet',
      pilotingStyle: isHighPerformer
        ? 'Prudent risk containment with excellent cashflow discipline and disciplined response to predatory interest offers.'
        : 'Braved severe financial turbulence; exhibits high recovery potential with automated emergency runway discipline.',
      topStrengths: [
        'High scam awareness and identity protection discipline',
        'Systematic asset allocation across low-drag index investments',
      ],
      vulnerabilities: [
        'Susceptibility to sudden short-term BNPL financing traps',
        'Potential emergency reserve depletion during prolonged multi-month turbulence',
      ],
      nextFlightGoal: 'Build an ironclad 6-month liquid emergency runway and maintain credit card utilization strictly under 30%.',
      provider: 'Deterministic Flight Co-Pilot',
    };
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

  private getLocalChatResponse(message: string, _context: any): ChatResponse {
    const q = message.toLowerCase().trim();

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

    if (q.includes('emergency') || q.includes('runway') || q.includes('contingency') || q.includes('fd') || q.includes('savings')) {
      return {
        reply: `Affirmative, Cadet! In aviation, you never take off without enough reserve fuel to divert to an alternate airport. An **Emergency Runway Fund** protects you from financial crashes when life throws sudden crosswinds (layoffs, medical emergencies, laptop breakdown).

Target Runway:
- **Baseline:** 3 months of essential living expenses (rent + food + EMIs).
- **Ideal:** 6 months of expenses parked in a safe, high-liquidity vehicle (Auto-sweep Fixed Deposit or Liquid Mutual Fund).

Never invest your emergency runway into volatile stocks or crypto. Its purpose is **capital defense, not high returns!**`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'What is a low-cost Index Fund?',
          'How to improve my CIBIL score?',
          'Explain the 50/30/20 budget rule',
        ],
      };
    }

    return {
      reply: `Flight telemetry received, Cadet! I am ready to advise on your flight vector. We can calculate your runway against debt drag, optimize your 50/30/20 fuel allocation, or run defensive scans against cyber scams. What maneuver shall we review?`,
      provider: 'Deterministic Flight Co-Pilot',
      suggestedPrompts: [
        'How do I boost my CIBIL score to 750+?',
        'Explain the 50/30/20 budget rule',
        'How to spot fake Telegram scams?',
      ],
    };
  }

  private getDeterministicExplanation(params: ExplainDecisionParams): AICoachExplanation {
    if (params.isOptimal) {
      return {
        headline: 'Optimal Trajectory: Maximum Aerodynamic Efficiency',
        whyThisHappened: `By choosing "${params.choiceLabel}", you prioritized long-term solvency over impulsive short-term gratification. This keeps your cash flow positive and minimizes unnecessary debt friction.`,
        mathematicalTruth: `Saving ₹${Math.abs(params.cashDelta)} directly into compounding assets or avoiding high APR debt compound keeps your net worth curve steepening upward exponentially.`,
        indianRegulatoryContext: 'RBI guidelines and SEBI educational advisories emphasize maintaining emergency liquid reserves and avoiding unregulated credit schemes.',
        coachAdvice: 'Keep your emergency runway at 3-6 months before taking on speculative investments.',
      };
    }

    return {
      headline: 'Turbulence Detected: Unfavorable Aerodynamic Drag',
      whyThisHappened: `Selecting "${params.choiceLabel}" added ₹${params.debtDelta} in new liabilities or drained vital cash reserves. High recurring dues reduce your monthly maneuvering margins.`,
      mathematicalTruth: `A debt of ₹${params.debtDelta} at standard consumer interest rates (18-42% APR) compounds aggressively against you, draining future earnings before they even arrive.`,
      indianRegulatoryContext: 'The Reserve Bank of India (RBI) mandates transparent Annual Percentage Rate (APR) disclosures to prevent predatory debt traps.',
      coachAdvice: 'Always calculate the total cost including interest before opting for EMIs or BNPL schemes.',
    };
  }
}

export const aiService = new AIService();
export default aiService;
