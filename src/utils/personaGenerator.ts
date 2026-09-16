import { GameState } from '../types/game';

export interface FinancialPersona {
  title: string;
  badge: string;
  tagline: string;
  description: string;
  strengths: string[];
  areasForGrowth: string[];
  recommendedHabit: string;
}

export function generateFinancialPersona(state: GameState): FinancialPersona {
  const { budget, debt, scam, financialHealth, score } = state;
  const savingsPct = budget.income > 0 ? (budget.savings / budget.income) * 100 : 0;
  const isDebtFree = debt.totalDebt <= 0;
  const highScamAccuracy = scam.totalAnalyzed > 0 && (scam.detectedScams / scam.totalAnalyzed) >= 0.75;

  if (financialHealth >= 80 && isDebtFree && highScamAccuracy) {
    return {
      title: 'The Wealth Guardian',
      badge: '🛡️ Apex Financial Sentinel',
      tagline: 'Impenetrable defense, zero toxic debt, and pristine capital allocation.',
      description: 'You demonstrated elite financial literacy. You resisted consumer impulse traps, detected predatory scams with laser precision, and maintained the sacred 50/30/20 balance.',
      strengths: [
        'Zero high-interest debt accumulation',
        'Strong scam radar & skepticism of unrealistic yields',
        'Systematic wealth building through discipline',
      ],
      areasForGrowth: [
        'Explore tax-advantaged long-term compounding vehicles',
        'Automate your monthly investment sweeps',
      ],
      recommendedHabit: 'Step up your SIP (Systematic Investment Plan) by 10% annually with salary hikes.',
    };
  }

  if (savingsPct >= 20 && isDebtFree) {
    return {
      title: 'The Smart Strategist',
      badge: '📈 Strategic Compounder',
      tagline: 'Disciplined planner who balances present lifestyle with compounding future freedom.',
      description: 'You know where every rupee goes. By prioritizing emergency liquidity and smart budgeting, you have insulated yourself from debt spirals.',
      strengths: [
        'Mastery of the 50/30/20 allocation rule',
        'Keeps lifestyle inflation comfortably under control',
        'Resistant to BNPL promotional illusions',
      ],
      areasForGrowth: [
        'Double down on spotting multi-tier WhatsApp investment scams',
        'Diversify emergency funds into liquid funds + high-yield savings',
      ],
      recommendedHabit: 'Build a dedicated 6-month emergency fund before taking calculated equity risks.',
    };
  }

  if (debt.totalDebt > 20000 || financialHealth < 45) {
    return {
      title: 'The Debt Rescuer in Training',
      badge: '⚡ High-Voltage Learner',
      tagline: 'Facing financial gravity head-on to conquer high-interest pitfalls.',
      description: 'You encountered the brutal reality of compound interest on consumer debt. Fortunately, every mistake in FinQuest is a free simulation that protects your real-world wallet.',
      strengths: [
        'Recognizes the trap of minimum credit card payments',
        'Learning how quick loan APRs compound exponentially',
      ],
      areasForGrowth: [
        'Treat credit cards strictly as convenience tools, not free money',
        'Say NO to BNPL for non-essential lifestyle wants',
      ],
      recommendedHabit: 'Deploy the Debt Avalanche method: pay highest APR debt first while paying minimums on others.',
    };
  }

  if (scam.missedScams > 0 && score > 2000) {
    return {
      title: 'The Optimistic Growth Seeker',
      badge: '🚀 Bold Capitalist',
      tagline: 'Hungry for returns, but needs stronger defenses against predatory hype.',
      description: 'You understand that money must work for you, but high return promises made you drop your guard against Ponzi schemes and unregulated promises.',
      strengths: [
        'Great enthusiasm for growing net worth',
        'Solid day-to-day budgeting fundamentals',
      ],
      areasForGrowth: [
        'Remember: Zero risk + guaranteed high return is ALWAYS a scam',
        'Verify regulatory registration (SEBI/RBI) before depositing funds',
      ],
      recommendedHabit: 'Adopt the 24-hour cooling-off rule before committing capital to any investment offer.',
    };
  }

  return {
    title: 'The Conscious Budget Builder',
    badge: '🧱 Foundation Architect',
    tagline: 'Laying down the structural pillars of lasting financial stability.',
    description: 'You took calculated steps through budgeting and credit challenges, developing a functional awareness of how daily choices aggregate into life outcomes.',
    strengths: [
      'Positive net worth trajectory',
      'Willingness to evaluate trade-offs before spending',
    ],
    areasForGrowth: [
      'Refine the split between true Needs vs luxury Wants',
      'Sharpen red flag recognition on digital payment requests',
    ],
    recommendedHabit: 'Track all subscriptions and recurring debit mandates at the start of every month.',
  };
}
