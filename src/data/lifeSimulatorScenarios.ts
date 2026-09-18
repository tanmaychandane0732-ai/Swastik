export interface SimulatorPlayerState {
  month: number;
  salary: number;
  cash: number;
  debt: number;
  monthlyEmi: number;
  invested: number;
  creditScore: number; // 300 to 850
  health: number;      // 0 to 100
  score: number;
  decisionsHistory: string[];
}

export interface SimulatorChoice {
  id: string;
  label: string;
  description: string;
  requiredCash?: number;
  requiredMaxDebt?: number;
  effects: {
    cashDelta: number;
    debtDelta: number;
    monthlyEmiDelta: number;
    investedDelta: number;
    creditScoreDelta: number;
    healthDelta: number;
    scoreDelta: number;
  };
  outcomeHeadline: string;
  outcomeExplanation: string;
  financialLesson: string;
}

export interface SimulatorScenario {
  id: string;
  month: number;
  title: string;
  subtitle: string;
  description: string;
  category: 'budget' | 'lifestyle' | 'emergency' | 'scam' | 'compounding' | 'audit';
  condition?: (state: SimulatorPlayerState) => boolean;
  choices: SimulatorChoice[];
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  // MONTH 1: Cashflow Baseline
  {
    id: 'month_1_budget',
    month: 1,
    title: 'Month 1: The Salary Foundation',
    subtitle: 'Allocating Your First ₹60,000 Paycheck',
    description: 'Your monthly salary of ₹60,000 has just been credited. Essential needs (rent, groceries, electricity, internet) consume ₹25,000. How will you deploy the remaining ₹35,000 surplus?',
    category: 'budget',
    choices: [
      {
        id: 'm1_c1_optimal',
        label: 'Automate 50/30/20 Allocation Standard',
        description: 'Deposit ₹15,000 into Emergency Cash Reserve, invest ₹10,000 in Nifty 50 Index ETF, allocate ₹10,000 for lifestyle leisure.',
        effects: {
          cashDelta: 15000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 10000,
          creditScoreDelta: +25,
          healthDelta: +12,
          scoreDelta: 950,
        },
        outcomeHeadline: 'Disciplined Wealth Architecture Established',
        outcomeExplanation: 'By paying yourself first, you created an immediate liquidity cushion while letting capital compound in productive assets.',
        financialLesson: 'An emergency fund is the shield that keeps you from ever being forced into high-interest predatory debt.',
      },
      {
        id: 'm1_c2_splurge',
        label: 'Lifestyle Upgrade & Token Savings',
        description: 'Spend ₹25,000 on upscale dining, night outs & branded clothing. Stash only ₹10,000 into savings.',
        effects: {
          cashDelta: 10000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 0,
          creditScoreDelta: +5,
          healthDelta: -4,
          scoreDelta: 500,
        },
        outcomeHeadline: 'Thin Cash Buffer with High Lifestyle Burn',
        outcomeExplanation: 'You had fun, but ₹10,000 provides barely 10 days of living expenses if an emergency strikes.',
        financialLesson: 'Lifestyle creep is insidious. When your income rises, increase your savings rate before your expenses.',
      },
      {
        id: 'm1_c3_yolo',
        label: 'All-In Spending (Zero Savings Buffer)',
        description: 'Spend all ₹35,000 throwing a party, impulse buying gadgets, and living paycheck to paycheck.',
        effects: {
          cashDelta: 0,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 0,
          creditScoreDelta: -15,
          healthDelta: -16,
          scoreDelta: 150,
        },
        outcomeHeadline: 'Extreme Vulnerability: Paycheck-to-Paycheck Trap',
        outcomeExplanation: 'You enter Month 2 with zero cash reserves. Even a ₹5,000 minor hiccup will now force you to borrow.',
        financialLesson: 'Living with zero savings is not freedom; it is financial surrender to whatever unexpected bill arrives next.',
      },
    ],
  },

  // MONTH 2: The Flash Sale / Lifestyle Pressure
  {
    id: 'month_2_lifestyle',
    month: 2,
    title: 'Month 2: The Gadget Flash Sale & Peer Pressure',
    subtitle: 'Consumerist Trap vs Asset Accumulation',
    description: 'A flash sale launches the newest flagship smartphone for ₹35,000. Your coworkers are buying it on "No-Cost EMI". How do you respond?',
    category: 'lifestyle',
    choices: [
      {
        id: 'm2_c1_resist',
        label: 'Resist the Consumer Trap & Invest Surplus',
        description: 'Keep your current phone. Invest ₹12,000 into broad-market index funds and bank ₹8,000 into savings.',
        effects: {
          cashDelta: 8000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 12000,
          creditScoreDelta: +20,
          healthDelta: +10,
          scoreDelta: 900,
        },
        outcomeHeadline: 'Delayed Gratification Triumph',
        outcomeExplanation: 'Instead of buying a depreciating brick, your ₹12,000 is now earning compounding dividend returns.',
        financialLesson: 'Wealth is what you do not see: the fancy cars not purchased, the upgrades declined, the investments quietly compounding.',
      },
      {
        id: 'm2_c2_bnpl',
        label: 'Swipe Credit Card on 6-Month EMI (₹6,000/mo)',
        description: 'Opt for easy monthly installments of ₹6,000/month plus ₹1,500 hidden bank processing charges.',
        effects: {
          cashDelta: 0,
          debtDelta: 36500,
          monthlyEmiDelta: 6000,
          investedDelta: 0,
          creditScoreDelta: -20,
          healthDelta: -14,
          scoreDelta: 400,
        },
        outcomeHeadline: 'Committed to Fixed Debt: Monthly Cashflow Pinched',
        outcomeExplanation: 'Your monthly discretionary cashflow is now locked into ₹6,000 EMI for the next 6 months.',
        financialLesson: 'No-cost EMIs frequently bundle processing fees and reduce your monthly margin of safety for genuine emergencies.',
      },
      {
        id: 'm2_c3_cash',
        label: 'Pay 100% Upfront in Cash (Only if Available)',
        description: 'Dip into your cash reserves to pay ₹35,000 outright without incurring interest or EMIs.',
        requiredCash: 35000,
        effects: {
          cashDelta: -35000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 0,
          creditScoreDelta: +5,
          healthDelta: -10,
          scoreDelta: 650,
        },
        outcomeHeadline: 'Phone Bought Debt-Free, But Reserves Depleted',
        outcomeExplanation: 'You avoided interest charges, but wiping out your liquidity leaves you completely exposed to next month.',
        financialLesson: 'Even if you can afford to buy consumer toys in cash, never deplete your core emergency foundation.',
      },
    ],
  },

  // MONTH 3: Sudden Medical Emergency (DYNAMIC CONSEQUENCE OF MONTH 1 & 2)
  {
    id: 'month_3_emergency',
    month: 3,
    title: 'Month 3: The Sudden Emergency Crisis',
    subtitle: 'The Test of Your Financial Shield',
    description: 'Disaster hits! A sudden dental surgery / critical vehicle transmission failure demands ₹25,000 payable immediately. Your available options depend strictly on your cash reserves.',
    category: 'emergency',
    choices: [
      {
        id: 'm3_c1_cash_fund',
        label: 'Pay Outright from Emergency Reserve (Zero Debt)',
        description: 'Use your saved liquidity cushion. Clear the entire ₹25,000 bill at 0% interest and preserve your peace of mind.',
        requiredCash: 25000,
        effects: {
          cashDelta: -25000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 0,
          creditScoreDelta: +35,
          healthDelta: +15,
          scoreDelta: 1000,
        },
        outcomeHeadline: 'Emergency Shield Activated: Zero Debt Incurred!',
        outcomeExplanation: 'Because of your disciplined budgeting in earlier months, this crisis was merely an inconvenience, not a catastrophe.',
        financialLesson: 'This is the exact reason emergency funds exist. Without cash, emergencies metastasize into compounding debt traps.',
      },
      {
        id: 'm3_c2_credit_card',
        label: 'Swipe Credit Card at 36% APR (Pay Minimum Due)',
        description: 'Borrow ₹25,000 on credit card. Pay only the minimum ₹1,500/month while the rest compounds exponentially.',
        effects: {
          cashDelta: 0,
          debtDelta: 25000,
          monthlyEmiDelta: 1500,
          investedDelta: 0,
          creditScoreDelta: -30,
          healthDelta: -20,
          scoreDelta: 350,
        },
        outcomeHeadline: 'Trapped in 36% Revolving Credit Debt',
        outcomeExplanation: 'At 36% APR, paying only the minimum due will take over 5 years and cost more than ₹42,000 in total interest!',
        financialLesson: 'Credit card interest is financial quicksand. Minimum payments are mathematically engineered to keep you in debt for years.',
      },
      {
        id: 'm3_c3_loan_shark',
        label: 'Take Instant 7-Day Digital App Loan (Predatory)',
        description: 'Download an unverified quick loan app. High processing fees, 42% annualized rate, and aggressive harassment.',
        effects: {
          cashDelta: 0,
          debtDelta: 32000,
          monthlyEmiDelta: 4500,
          investedDelta: 0,
          creditScoreDelta: -55,
          healthDelta: -35,
          scoreDelta: 100,
        },
        outcomeHeadline: 'Predatory FinTech App Trap Sprung',
        outcomeExplanation: 'Hidden fees swelled the ₹25,000 need into a ₹32,000 debt burden with ruthless collection tactics.',
        financialLesson: 'Never use unregulated quick-cash loan apps. They trap desperate borrowers with extortionate penalties.',
      },
    ],
  },

  // MONTH 4: Scam Lure vs Opportunistic Accumulation (DYNAMIC BRANCH)
  {
    id: 'month_4_branch',
    month: 4,
    title: 'Month 4: High-Yield Temptation or Market Opportunity',
    subtitle: 'Evaluating Digital Risk vs Strategic Investing',
    description: 'In Month 4, your financial environment reacts to your balance. A viral offer reaches you while markets fluctuate.',
    category: 'scam',
    choices: [
      {
        id: 'm4_c1_scam_avoid',
        label: 'Inspect & Reject "Guaranteed 40% Monthly Return" Scheme',
        description: 'A direct message promises to double your money in 14 days through "insider algorithmic arbitrage". Reject and report.',
        effects: {
          cashDelta: 5000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 0,
          creditScoreDelta: +25,
          healthDelta: +10,
          scoreDelta: 950,
        },
        outcomeHeadline: 'Tactical Scam Intercepted & Defended',
        outcomeExplanation: 'You identified the classic red flags: guaranteed high returns, urgency, and absence of regulatory registration.',
        financialLesson: 'No legitimate investment guarantees 40% monthly returns. If it sounds too good to be true, it is guaranteed fraud.',
      },
      {
        id: 'm4_c2_invest_index',
        label: 'Accumulate Index Funds During 8% Market Dip',
        description: 'Broad market indices experience temporary volatility. Allocate ₹15,000 to buy blue-chip companies on sale.',
        requiredCash: 15000,
        effects: {
          cashDelta: -15000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 16500,
          creditScoreDelta: +30,
          healthDelta: +12,
          scoreDelta: 1000,
        },
        outcomeHeadline: 'Counter-Cyclical Buying: Buying Shares at a Discount',
        outcomeExplanation: 'Investing during market corrections harnesses the power of rupee-cost averaging and long-term economic growth.',
        financialLesson: 'Market dips are not catastrophes for long-term investors; they are seasonal discounts on profitable enterprises.',
      },
      {
        id: 'm4_c3_scam_fall',
        label: 'Deposit ₹10,000 in "Crypto Arbitrage Doubler"',
        description: 'Desperate for fast money or greedy for quick profits, you send ₹10,000 to an anonymous Telegram bot.',
        requiredCash: 10000,
        effects: {
          cashDelta: -10000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 0,
          creditScoreDelta: -35,
          healthDelta: -25,
          scoreDelta: 50,
        },
        outcomeHeadline: 'Capital Stolen: The Doubler Vanishes',
        outcomeExplanation: 'The Telegram bot blocks your account immediately after receiving the transfer. Your ₹10,000 is gone forever.',
        financialLesson: 'Greed is the scammer’s primary weapon. High promised returns without risk always equal 100% loss of capital.',
      },
    ],
  },

  // MONTH 5: Compounding Reality Check
  {
    id: 'month_5_compounding',
    month: 5,
    title: 'Month 5: The Compounding Reality Check',
    subtitle: 'Exponential Growth vs Compounding Debt Drain',
    description: 'Five months of decisions have accumulated. The mathematical reality of compounding is now fully active on your balance sheet.',
    category: 'compounding',
    choices: [
      {
        id: 'm5_c1_debt_avalanche',
        label: 'Aggressive Debt Avalanche: Pay Down Principal',
        description: 'Redirect ₹15,000 surplus to wipe out high-interest credit debt and eliminate ongoing monthly EMI bleeding.',
        requiredCash: 15000,
        effects: {
          cashDelta: -15000,
          debtDelta: -18000,
          monthlyEmiDelta: -3500,
          investedDelta: 0,
          creditScoreDelta: +45,
          healthDelta: +20,
          scoreDelta: 950,
        },
        outcomeHeadline: 'Debt Slain: Monthly Freedom Restored!',
        outcomeExplanation: 'Eliminating high-APR debt delivers a guaranteed 36% risk-free return on your money by eliminating future interest.',
        financialLesson: 'Paying down expensive debt is the highest-yielding, zero-risk investment you will ever make in your life.',
      },
      {
        id: 'm5_c2_reinvest_dividends',
        label: 'Reinvest Dividends into Compound Snowball',
        description: 'Your investments generated ₹3,000 in dividends and capital growth. Automatically reinvest 100% to fuel the snowball.',
        effects: {
          cashDelta: 5000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 8000,
          creditScoreDelta: +30,
          healthDelta: +15,
          scoreDelta: 950,
        },
        outcomeHeadline: 'The Snowball Effect: Money Making Money',
        outcomeExplanation: 'Your capital now works for you 24 hours a day, generating compounding returns independent of your physical labor.',
        financialLesson: 'Compound interest is the eighth wonder of the world. He who understands it, earns it; he who does not, pays it.',
      },
      {
        id: 'm5_c3_ignore_debt',
        label: 'Ignore Debt & Continue Minimum Payments',
        description: 'Pay only the required minimum dues. Spend surplus on luxury dining and weekend escapes.',
        effects: {
          cashDelta: 0,
          debtDelta: +5500,
          monthlyEmiDelta: +500,
          investedDelta: 0,
          creditScoreDelta: -30,
          healthDelta: -18,
          scoreDelta: 200,
        },
        outcomeHeadline: 'Reverse Compounding Spiral Deepens',
        outcomeExplanation: 'Unpaid balances accumulated finance charges, increasing total debt despite monthly payments.',
        financialLesson: 'Debt does not sleep, take sick days, or slow down. If you do not attack it aggressively, it consumes your future earnings.',
      },
    ],
  },

  // MONTH 6: Annual Performance Audit & Career Leap
  {
    id: 'month_6_audit',
    month: 6,
    title: 'Month 6: The Career Leap & Annual Financial Audit',
    subtitle: 'Evaluating Your Financial Sovereignty',
    description: 'You reach your 6-month career checkpoint. A career promotion and salary increment negotiation depends directly on your credit resilience and stability.',
    category: 'audit',
    choices: [
      {
        id: 'm6_c1_negotiate_boost',
        label: 'Leverage Financial Stability for 25% Career Raise',
        description: 'With a rock-solid financial foundation, negotiate confidently for an appraisal and allocate the raise to long-term wealth.',
        effects: {
          cashDelta: 20000,
          debtDelta: 0,
          monthlyEmiDelta: 0,
          investedDelta: 25000,
          creditScoreDelta: +50,
          healthDelta: +25,
          scoreDelta: 1200,
        },
        outcomeHeadline: 'Financial Sovereignty Achieved: Elite Tier!',
        outcomeExplanation: 'You proved that financial discipline creates life leverage. You operate from strength rather than desperation.',
        financialLesson: 'Financial literacy transforms you from a stressed economic survivor into an empowered architect of your destiny.',
      },
      {
        id: 'm6_c2_stabilize',
        label: 'Consolidate Holdings & Refinance Remaining Liabilities',
        description: 'Lock in balanced budget habits, set up automated SIPs, and establish a firm 12-month wealth roadmap.',
        effects: {
          cashDelta: 10000,
          debtDelta: -5000,
          monthlyEmiDelta: -1000,
          investedDelta: 10000,
          creditScoreDelta: +30,
          healthDelta: +15,
          scoreDelta: 800,
        },
        outcomeHeadline: 'Stable & Recovering Financial Position',
        outcomeExplanation: 'You learned critical lessons from previous missteps and engineered a sustainable recovery trajectory.',
        financialLesson: 'Mistakes in finance are tuition fees for wisdom—as long as you correct them before they become fatal.',
      },
    ],
  },
];

