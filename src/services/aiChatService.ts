import { AIApi, AIChatMessage, AIChatResponse } from './api/aiApi';

export interface ChatSessionMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  provider?: string;
  suggestedPrompts?: string[];
}

export class AIChatService {
  /**
   * Sends cadet question to backend AI Chatbot endpoint, with client-side fallback.
   */
  public static async sendMessage(
    message: string,
    history: ChatSessionMessage[] = [],
    context: {
      stage?: string;
      financialHealth?: number;
      netWorth?: number;
      score?: number;
      playerName?: string;
    } = {}
  ): Promise<AIChatResponse> {
    // 1. Try Backend API endpoint
    try {
      const apiHistory: AIChatMessage[] = history.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const res = await AIApi.chat({
        message,
        history: apiHistory,
        context,
      });

      if (res.success && res.data) {
        return res.data;
      }
    } catch {
      // Backend offline or unreachable — seamlessly proceed to local knowledge engine
    }

    // 2. Client-side Fallback
    return this.getLocalFallbackResponse(message, context);
  }

  private static getLocalFallbackResponse(
    message: string,
    context: { playerName?: string }
  ): AIChatResponse {
    const q = message.toLowerCase().trim();

    if (q.includes('cibil') || q.includes('credit')) {
      return {
        reply: `Captain! Your CIBIL score acts as your **Financial Altimeter** (ranging from 300 to 900). Banks in India reserve prime loan interest rates for pilots with a score of **750+**.\n\nKey rules to maintain altitude:\n1. **Pay 100% of Total Due on time:** Avoid the minimum-due trap (which accrues 42% APR).\n2. **Keep Credit Utilization under 30%:** Protects against risk flagging.\n3. **Avoid excessive loan inquiries:** Limit multiple BNPL/loan apps.`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'What is the credit card minimum due trap?',
          'How does BNPL affect credit score?',
          'Explain the 50/30/20 budget rule',
        ],
      };
    }

    if (q.includes('budget') || q.includes('50/30/20') || q.includes('salary')) {
      return {
        reply: `Roger that, Cadet! The **50/30/20 Rule** keeps your aircraft in balanced trim:\n\n- **50% Needs:** Rent, groceries, electricity, essential commute.\n- **30% Wants:** Dining, entertainment, weekend leisure.\n- **20% Savings:** Automated index SIPs, emergency reserve fund.\n\n💡 **Pro Rule:** Always **"Pay Yourself First"** on salary day before spending on discretionary wants!`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'How much emergency fuel do I need?',
          'What is an Index Mutual Fund?',
          'How to spot fake Telegram scams?',
        ],
      };
    }

    if (q.includes('scam') || q.includes('fraud') || q.includes('upi') || q.includes('telegram')) {
      return {
        reply: `🚨 **Warning: Cyber Threat Detected!**\n\nRemember these 4 Golden Shield Protocols:\n1. **Never enter UPI PIN to receive money.** PIN is only for debiting funds.\n2. **Part-time video liking jobs on Telegram are traps.**\n3. **Never install APK files sent on WhatsApp.**\n4. **Dial Helpline 1930 immediately** within the 2-hour Golden Hour to freeze stolen funds!`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'How does Helpline 1930 work?',
          'Explain the 50/30/20 budget rule',
          'How to boost my CIBIL score?',
        ],
      };
    }

    if (q.includes('emergency') || q.includes('fund') || q.includes('runway')) {
      return {
        reply: `Affirmative! In aviation, you never take off without enough reserve fuel to divert to an alternate airport.\n\nAn **Emergency Runway Fund** requires **3 to 6 months of essential living expenses** parked in a high-liquidity vehicle (Auto-sweep Fixed Deposit or Liquid Mutual Fund). Its purpose is **capital defense, not high returns!**`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'What is a low-cost Index Fund?',
          'How to improve my CIBIL score?',
          'Explain the 50/30/20 budget rule',
        ],
      };
    }

    if (q.includes('invest') || q.includes('sip') || q.includes('stock')) {
      return {
        reply: `Clear for takeoff on Wealth Compounding! 🚀\n\nA **Systematic Investment Plan (SIP)** into a broad Nifty 50 Index Fund allows compounding to build altitude over time.\n\n- Investing **₹5,000/month** at ~12% CAGR turns into **~₹11.6 Lakhs in 10 years** and **~₹50 Lakhs in 20 years**!\n- Stick to broad market index funds rather than speculative options trading.`,
        provider: 'Deterministic Flight Co-Pilot',
        suggestedPrompts: [
          'What is an Index Mutual Fund?',
          'Explain the 50/30/20 budget rule',
          'How to identify UPI scams?',
        ],
      };
    }

    const cadetName = context.playerName || 'Cadet';
    return {
      reply: `Greetings, ${cadetName}! I am your **FinQuest Flight Co-Pilot & Financial Instructor** ✈️\n\nI can advise you on:\n- 📊 **50/30/20 Budgeting & Cashflow Defense**\n- 💳 **CIBIL Score Altitude (750+)**\n- 🛡️ **Scam Radar & Helpline 1930**\n- 📈 **SIPs & Wealth Compounding**\n- 🚨 **Emergency Reserve Runway**\n\nWhat financial maneuver would you like to review today?`,
      provider: 'Deterministic Flight Co-Pilot',
      suggestedPrompts: [
        'How to boost CIBIL score to 750+?',
        'Explain the 50/30/20 budget rule',
        'How to identify UPI & Telegram scams?',
      ],
    };
  }
}
