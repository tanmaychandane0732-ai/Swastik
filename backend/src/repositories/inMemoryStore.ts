import bcrypt from 'bcryptjs';

export interface InMemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
  ageGroup: string;
  educationLevel: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryUserProfile {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  financialIQ: number;
  decisionDNA: any;
  financialHealth: number;
  riskScore: number;
  learningProgress: any;
  totalSimulations?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryScenarioOption {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  scenarioId: string;
  text: string;
  description: string;
  cashImpact: number;
  debtImpact: number;
  savingsImpact: number;
  creditImpact: number;
  riskImpact: number;
  scoreImpact: number;
  healthImpact: number;
  monthlyEmiImpact: number;
  isOptimal: boolean;
  outcomeHeadline: string;
  outcomeExplanation: string;
  financialLesson: string;
}

export interface InMemoryScenario {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  difficulty: string;
  country: string;
  isActive: boolean;
  month: number;
  createdAt: Date;
  options: InMemoryScenarioOption[];
}

export interface InMemoryGameSession {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  currentMonth: number;
  totalMonths: number;
  status: string; // IN_PROGRESS, COMPLETED, ABANDONED
  startingCash: number;
  currentCash: number;
  totalCash?: number;
  savings: number;
  debt: number;
  totalDebt?: number;
  netWorth?: number;
  monthlyEmi: number;
  invested: number;
  creditScore: number;
  stressLevel?: number;
  financialHealth: number;
  riskScore: number;
  overallScore: number;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface InMemoryDecision {
  id: string;
  sessionId: string;
  scenarioId: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  optionId?: string;
  choiceSelected?: string;
  month: number;
  cashBefore?: number;
  cashAfter?: number;
  cashImpact?: number;
  debtBefore?: number;
  debtAfter?: number;
  debtImpact?: number;
  stressImpact?: number;
  cibilImpact?: number;
  riskBefore?: number;
  riskAfter?: number;
  financialHealthBefore?: number;
  financialHealthAfter?: number;
  netWorthBefore?: number;
  netWorthAfter?: number;
  isOptimal: boolean;
  headline?: string;
  whyItHappened?: string;
  financialLesson?: string;
  explanation?: string;
  createdAt: Date;
}

export interface InMemoryAssessment {
  id: string;
  userId: string;
  type: string; // PRE_QUEST, POST_QUEST
  score: number;
  categoryScores: any;
  tier: string;
  completedAt: Date;
}

export interface InMemoryBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface InMemoryUserBadge {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  badgeId: string;
  unlockedAt: Date;
}

export interface InMemoryDailyChallenge {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  date: string;
  scenario: string;
  question: string;
  explanation: string;
  learningPoint: string;
  options: any[];
  createdAt: Date;
}

export class InMemoryStore {
  public users: Map<string, InMemoryUser> = new Map();
  public profiles: Map<string, InMemoryUserProfile> = new Map();
  public scenarios: Map<string, InMemoryScenario> = new Map();
  public sessions: Map<string, InMemoryGameSession> = new Map();
  public decisions: Map<string, InMemoryDecision> = new Map();
  public assessments: Map<string, InMemoryAssessment> = new Map();
  public badges: Map<string, InMemoryBadge> = new Map();
  public userBadges: Map<string, InMemoryUserBadge> = new Map();
  public challenges: Map<string, InMemoryDailyChallenge> = new Map();
  public challengeAttempts: Map<string, { id: string; challengeId: string; userId: string; optionId: string; isOptimal: boolean; score?: number; attemptedAt: Date }> = new Map();
  public classrooms: Map<string, { id: string; name: string; code: string; description?: string; instructorId: string; createdAt: Date }> = new Map();
  public classroomMembers: Map<string, { id: string; classroomId: string; userId: string; joinedAt: Date }> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // 1. Seed Badges
    const badgeList: InMemoryBadge[] = [
      { id: 'b1', code: 'SCAM_SPOTTER', name: 'Scam Spotter', description: 'Detected your first fraudulent financial scheme.', icon: 'ShieldAlert', category: 'scam' },
      { id: 'b2', code: 'BUDGET_PILOT', name: 'Budget Pilot', description: 'Achieved textbook 50/30/20 aerodynamic balance.', icon: 'Zap', category: 'budget' },
      { id: 'b3', code: 'DEBT_NAVIGATOR', name: 'Debt Navigator', description: 'Successfully navigated around high-interest compound traps.', icon: 'TrendingUp', category: 'debt' },
      { id: 'b4', code: 'MARKET_EXPLORER', name: 'Market Explorer', description: 'Maintained disciplined SIP investing during market dips.', icon: 'Compass', category: 'investment' },
      { id: 'b5', code: 'FINANCIAL_PILOT', name: 'Licensed Financial Aviator', description: 'Completed a full 6-month career flight simulation with positive net worth.', icon: 'Plane', category: 'flight' },
      { id: 'b6', code: 'STREAK_CHAMPION', name: 'Streak Champion', description: 'Executed 5 consecutive optimal financial maneuvers.', icon: 'Flame', category: 'mastery' },
      { id: 'b7', code: 'TURBULENCE_SURVIVOR', name: 'Turbulence Survivor', description: 'Weathered sudden life financial shocks without crashing your reserves.', icon: 'Wind', category: 'flight' },
      { id: 'b8', code: 'CALM_PILOT', name: 'Calm Pilot', description: 'Maintained high emergency resilience under economic downdrafts.', icon: 'ShieldCheck', category: 'flight' },
      { id: 'b9', code: 'DECISION_MASTER', name: 'Decision Master', description: 'Demonstrated superior cognitive financial radar across all modules.', icon: 'Award', category: 'mastery' },
    ];
    badgeList.forEach((b) => this.badges.set(b.id, b));

    // 2. Seed 6-Month Indian Reality Scenarios
    const scenarioList: InMemoryScenario[] = [
      {
        id: 'scen_month_1',
        title: 'Tech Salary Allocation in Pune',
        subtitle: 'First Month Paycheck & The 50/30/20 Aerodynamics',
        description: 'You received your first professional IT monthly paycheck of ₹60,000 in Hinjawadi, Pune. Rent and utilities are ₹20,000. Your university friends are booking an impromptu Goa luxury beach trip costing ₹25,000.',
        category: 'budget',
        difficulty: 'cadet',
        country: 'IN',
        isActive: true,
        month: 1,
        createdAt: new Date(),
        options: [
          {
            id: 'opt_1_a',
            scenarioId: 'scen_month_1',
            text: 'Execute 50/30/20 Rule: ₹15,000 to Emergency Fund & Index SIP, ₹10,000 for Goa',
            description: 'Maintain flight discipline by anchoring savings first while enjoying a budgeted weekend.',
            cashImpact: -30000,
            debtImpact: 0,
            savingsImpact: 15000,
            creditImpact: 15,
            riskImpact: -15,
            scoreImpact: 120,
            healthImpact: 15,
            monthlyEmiImpact: 0,
            isOptimal: true,
            outcomeHeadline: 'Aerodynamic Stability Achieved!',
            outcomeExplanation: 'By paying yourself first and allocating ₹15,000 to liquid savings, you built a 0.75-month safety cushion with zero debt.',
            financialLesson: 'Pay yourself first. Emergency savings convert future catastrophes into minor inconveniences.',
          },
          {
            id: 'opt_1_b',
            scenarioId: 'scen_month_1',
            text: 'Goa YOLO: Spend ₹35,000 on 5-Star Resort & VIP Lounge',
            description: 'Blow your entire remaining salary celebrating your first job with zero savings.',
            cashImpact: -45000,
            debtImpact: 5000,
            savingsImpact: 0,
            creditImpact: -10,
            riskImpact: 35,
            scoreImpact: 30,
            healthImpact: -20,
            monthlyEmiImpact: 0,
            isOptimal: false,
            outcomeHeadline: 'Zero Altitude Warning: Bank Balance ₹5,000',
            outcomeExplanation: 'You lived like a king for 3 days but entered Month 2 with zero cash cushion and ₹5,000 in credit card dues.',
            financialLesson: 'Lifestyle creep during early paychecks creates permanent vulnerability to financial downdrafts.',
          },
        ],
      },
      {
        id: 'scen_month_2',
        title: 'Great Indian Festival BNPL Dilemma',
        subtitle: 'The 0% Interest Gadget Marketing Trap',
        description: 'E-commerce giants announce their annual festive sale. You are targeted with "No-Cost EMI" promotions for a ₹95,000 flagship smartphone. The fine print reveals an upfront processing fee and 36% APR penalty on delayed payments.',
        category: 'debt',
        difficulty: 'cadet',
        country: 'IN',
        isActive: true,
        month: 2,
        createdAt: new Date(),
        options: [
          {
            id: 'opt_2_a',
            scenarioId: 'scen_month_2',
            text: 'Decline Gadget Financing: Buy ₹800 Case & Invest ₹10,000 in Nifty 50',
            description: 'Your existing phone works smoothly. Avoid high-APR consumer debt drag.',
            cashImpact: -10800,
            debtImpact: 0,
            savingsImpact: 10000,
            creditImpact: 20,
            riskImpact: -15,
            scoreImpact: 150,
            healthImpact: 15,
            monthlyEmiImpact: 0,
            isOptimal: true,
            outcomeHeadline: 'Compound Interest Working For You, Not Against You!',
            outcomeExplanation: 'You deflected a ₹95,000 consumer liability and directed ₹10,000 into wealth-compounding equities.',
            financialLesson: 'No-cost EMI on depreciating electronics is an aerodynamic airbrake on your monthly cashflow.',
          },
          {
            id: 'opt_2_b',
            scenarioId: 'scen_month_2',
            text: 'Swipe 12-Month EMI for ₹95,000 Phone (₹8,800/mo)',
            description: 'Lock in a monthly obligation that consumes 15% of your take-home pay.',
            cashImpact: -8800,
            debtImpact: 95000,
            savingsImpact: 0,
            creditImpact: -15,
            riskImpact: 30,
            scoreImpact: 25,
            healthImpact: -25,
            monthlyEmiImpact: 8800,
            isOptimal: false,
            outcomeHeadline: 'Turbulent Debt Drag Activated',
            outcomeExplanation: 'Your monthly free cashflow has dropped by ₹8,800 for the next full year.',
            financialLesson: 'Debt for consumption restricts future career choices and destroys financial agility.',
          },
        ],
      },
      {
        id: 'scen_month_3',
        title: 'Emergency Dental Surgery & Deductible Shock',
        subtitle: 'Liquid Reserve Defense vs Instant 7-Day Loan Traps',
        description: 'Severe wisdom tooth pain requires emergency oral surgery costing ₹18,000. Your corporate group health insurance policy has an immediate ₹5,000 deductible clause before claim reimbursement.',
        category: 'shock',
        difficulty: 'investigator',
        country: 'IN',
        isActive: true,
        month: 3,
        createdAt: new Date(),
        options: [
          {
            id: 'opt_3_a',
            scenarioId: 'scen_month_3',
            text: 'Deploy Emergency Fund: Pay ₹18,000 Cash and File Insurance Claim',
            description: 'Your savings buffer absorbs the medical shock completely with zero interest bleed.',
            cashImpact: -18000,
            debtImpact: 0,
            savingsImpact: -18000,
            creditImpact: 10,
            riskImpact: -10,
            scoreImpact: 140,
            healthImpact: 15,
            monthlyEmiImpact: 0,
            isOptimal: true,
            outcomeHeadline: 'Emergency Reserve Successfully Deployed!',
            outcomeExplanation: 'Zero debt incurred. Your emergency fund performed exactly what it was engineered to do.',
            financialLesson: 'An emergency fund is insurance against life, not an investment intended for high yields.',
          },
          {
            id: 'opt_3_b',
            scenarioId: 'scen_month_3',
            text: 'Download Instant 7-Day Loan App from SMS Ad',
            description: 'Borrow ₹20,000 in 60 seconds with contact book permission.',
            cashImpact: 16000, // after hidden fees
            debtImpact: 25000,
            savingsImpact: 0,
            creditImpact: -40,
            riskImpact: 50,
            scoreImpact: 15,
            healthImpact: -40,
            monthlyEmiImpact: 5000,
            isOptimal: false,
            outcomeHeadline: 'CRITICAL WARNING: Predatory Extortion Trap!',
            outcomeExplanation: 'The unverified app deducted ₹4,000 in upfront fees, charged 150% APR, and began harassing your phone contacts.',
            financialLesson: 'Never install non-RBI-registered lending apps that demand phone contact permissions.',
          },
        ],
      },
      {
        id: 'scen_month_4',
        title: 'Cyber Threat Radar: Reverse UPI QR Phishing',
        subtitle: 'Spotting Social Engineering & Identity Thefts',
        description: 'A buyer on an online marketplace agrees to purchase your old bicycle for ₹6,000. They send you a UPI QR code stating: "Scan this QR code and type your 6-digit UPI PIN to receive ₹6,000 immediately in your bank account."',
        category: 'scam',
        difficulty: 'investigator',
        country: 'IN',
        isActive: true,
        month: 4,
        createdAt: new Date(),
        options: [
          {
            id: 'opt_4_a',
            scenarioId: 'scen_month_4',
            text: 'Report & Block: Decline QR. UPI PIN is ONLY for sending money, never receiving.',
            description: 'Intercept the fraud, report the mobile number to 1930 National Cybercrime Portal.',
            cashImpact: 0,
            debtImpact: 0,
            savingsImpact: 0,
            creditImpact: 25,
            riskImpact: -30,
            scoreImpact: 180,
            healthImpact: 20,
            monthlyEmiImpact: 0,
            isOptimal: true,
            outcomeHeadline: 'RADAR LOCK: Scam Intercepted!',
            outcomeExplanation: 'You recognized that entering a UPI PIN strictly authorizes a debit from your account.',
            financialLesson: 'Receiving money on UPI is 100% passive. You NEVER enter a PIN to receive funds.',
          },
          {
            id: 'opt_4_b',
            scenarioId: 'scen_month_4',
            text: 'Scan QR and Enter PIN to Claim the ₹6,000',
            description: 'Trust the buyer and hurry before the payment link expires.',
            cashImpact: -6000,
            debtImpact: 0,
            savingsImpact: 0,
            creditImpact: -25,
            riskImpact: 40,
            scoreImpact: 10,
            healthImpact: -30,
            monthlyEmiImpact: 0,
            isOptimal: false,
            outcomeHeadline: 'DEBIT DETONATION: ₹6,000 Stolen!',
            outcomeExplanation: 'The attacker siphoned ₹6,000 from your account into a mule UPI address.',
            financialLesson: 'Scammers exploit artificial urgency to force bypass of cognitive security checks.',
          },
        ],
      },
      {
        id: 'scen_month_5',
        title: 'The Compounding Fork: Dividend SIP vs Penny Stock Hype',
        subtitle: 'Long-Term Index Accumulation vs Telegram Pump Syndicate',
        description: 'You have accumulated ₹25,000 in surplus savings. A viral Telegram channel "VIP Multibagger 100x" promises 400% guaranteed returns in 14 days on an illiquid penny stock.',
        category: 'investment',
        difficulty: 'master',
        country: 'IN',
        isActive: true,
        month: 5,
        createdAt: new Date(),
        options: [
          {
            id: 'opt_5_a',
            scenarioId: 'scen_month_5',
            text: 'Invest ₹25,000 in Broad Market Index Fund & Maintain SIP',
            description: 'Ignore social media euphoria and leverage low-cost, diversified index compounding.',
            cashImpact: -25000,
            debtImpact: 0,
            savingsImpact: 0,
            creditImpact: 20,
            riskImpact: -20,
            scoreImpact: 160,
            healthImpact: 20,
            monthlyEmiImpact: 0,
            isOptimal: true,
            outcomeHeadline: 'Disciplined Capital Formation Executed',
            outcomeExplanation: 'Historical data shows low-cost index funds outperform 85%+ of active retail traders over 5+ years.',
            financialLesson: 'True investing is watching grass grow or paint dry. If you want excitement, go to Las Vegas.',
          },
          {
            id: 'opt_5_b',
            scenarioId: 'scen_month_5',
            text: 'Put ₹25,000 into the Telegram Penny Stock Tip',
            description: 'Try to double your money quickly before operators dump the shares.',
            cashImpact: -25000,
            debtImpact: 0,
            savingsImpact: 0,
            creditImpact: -20,
            riskImpact: 45,
            scoreImpact: 20,
            healthImpact: -30,
            monthlyEmiImpact: 0,
            isOptimal: false,
            outcomeHeadline: 'OPERATOR DUMP: 85% Capital Loss!',
            outcomeExplanation: 'The promoters dumped their shares onto retail buyers. Your ₹25,000 was crushed to ₹3,750.',
            financialLesson: 'Guaranteed high returns do not exist in financial markets. Risk and return are inseparable twins.',
          },
        ],
      },
      {
        id: 'scen_month_6',
        title: 'Career Appraisal & Tax Regime Sovereignty',
        subtitle: 'Navigating Salary Hikes, New vs Old Tax Regime, and Career Runway',
        description: 'Your 6-month probation ends with a ₹15,000/month salary hike. You must decide whether to inflate your rent or channel the surplus into an automated financial independence portfolio.',
        category: 'flight',
        difficulty: 'master',
        country: 'IN',
        isActive: true,
        month: 6,
        createdAt: new Date(),
        options: [
          {
            id: 'opt_6_a',
            scenarioId: 'scen_month_6',
            text: 'Bank 70% of Raise: Increase Monthly SIP by ₹10,000, Spend ₹5,000 on Quality of Life',
            description: 'Stealth wealth trajectory: grow your investments faster than your expenses.',
            cashImpact: 5000,
            debtImpact: 0,
            savingsImpact: 10000,
            creditImpact: 30,
            riskImpact: -25,
            scoreImpact: 200,
            healthImpact: 25,
            monthlyEmiImpact: 0,
            isOptimal: true,
            outcomeHeadline: 'HYPERSONIC FLIGHT CRUISE ACHIEVED!',
            outcomeExplanation: 'You conquered lifestyle inflation and secured financial autonomy.',
            financialLesson: 'True wealth is what you do not spend. Financial freedom is the ability to walk away on your own terms.',
          },
          {
            id: 'opt_6_b',
            scenarioId: 'scen_month_6',
            text: 'Upgrade to Penthouse: Spend ₹15,000 Full Hike on Luxury Rent',
            description: 'Absorb the entirety of your salary increment into fixed living overhead.',
            cashImpact: 0,
            debtImpact: 0,
            savingsImpact: 0,
            creditImpact: 0,
            riskImpact: 20,
            scoreImpact: 40,
            healthImpact: -10,
            monthlyEmiImpact: 0,
            isOptimal: false,
            outcomeHeadline: 'Golden Handcuffs Locked',
            outcomeExplanation: 'Your fixed monthly overhead increased, leaving your savings rate at 0%.',
            financialLesson: 'Increasing fixed costs immediately upon a raise traps you on the corporate treadmill.',
          },
        ],
      },
    ];
    scenarioList.forEach((s) => this.scenarios.set(s.id, s));

    // 3. Seed Demo Pilot User
    const demoPasswordHash = bcrypt.hashSync('DemoPilot2026!', 8);
    const demoUser: InMemoryUser = {
      id: 'usr_demo_pilot_001',
      name: 'Tanmay Chandane',
      email: 'demo@finquest.edu',
      passwordHash: demoPasswordHash,
      ageGroup: '18-25',
      educationLevel: 'Engineering Undergrad',
      location: 'Pune, India',
      createdAt: new Date('2026-01-15T10:00:00Z'),
      updatedAt: new Date('2026-09-17T12:00:00Z'),
    };
    this.users.set(demoUser.id, demoUser);

    const demoProfile: InMemoryUserProfile = {
      id: 'prof_demo_001',
      userId: demoUser.id,
      financialIQ: 88,
      decisionDNA: {
        archetype: 'Strategic Flight Captain',
        tagline: 'Disciplined Navigator with Aerodynamic Cashflow Defense',
        badgeIcon: 'Plane',
        summary: 'Balances immediate lifestyle needs with long-term compound trajectory. Uncompromising on emergency liquidity and immune to digital fraud.',
        traits: {
          patience: 92,
          riskIntelligence: 85,
          debtDiscipline: 95,
          scamImmunity: 90,
          emergencyReadiness: 88,
        },
        primaryStrength: 'Unshakeable Debt Discipline & Fraud Immunity',
        dangerBlindSpot: 'Occasional excessive caution in diversified equities',
        recommendedFlightCheck: 'Maintain automated index SIPs and review term cover annual indexation',
      },
      financialHealth: 92,
      riskScore: 12,
      learningProgress: {
        budgetingLevel: 3,
        scamDetectiveRank: 'Chief Cyber Inspector',
        turbulenceSurvivalRate: '100%',
        modulesCompleted: ['level1', 'level2', 'level3', 'simulator', 'scam-detective', 'turbulence'],
      },
      createdAt: new Date('2026-01-15T10:00:00Z'),
      updatedAt: new Date('2026-09-17T12:00:00Z'),
    };
    this.profiles.set(demoProfile.id, demoProfile);

    // 4. Seed Demo Completed Flight Session
    const demoSession: InMemoryGameSession = {
      id: 'sess_demo_6month_completed',
      userId: demoUser.id,
      currentMonth: 6,
      totalMonths: 6,
      status: 'COMPLETED',
      startingCash: 10000,
      currentCash: 48500,
      savings: 35000,
      debt: 0,
      monthlyEmi: 0,
      invested: 45000,
      creditScore: 785,
      financialHealth: 92,
      riskScore: 12,
      overallScore: 950,
      createdAt: new Date('2026-03-01T08:00:00Z'),
      updatedAt: new Date('2026-09-17T14:30:00Z'),
      completedAt: new Date('2026-09-17T14:30:00Z'),
    };
    this.sessions.set(demoSession.id, demoSession);

    // 5. Seed Demo Badges
    const userBadgesList = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'];
    userBadgesList.forEach((bid) => {
      this.userBadges.set(`${demoUser.id}_${bid}`, {
        id: `ub_${demoUser.id}_${bid}`,
        userId: demoUser.id,
        badgeId: bid,
        unlockedAt: new Date(),
      });
    });

    // 6. Seed Daily Challenge
    const todayStr = new Date().toISOString().split('T')[0];
    this.challenges.set(todayStr, {
      id: `chal_${todayStr}`,
      date: todayStr,
      scenario: 'You are moving cities for a new high-paying job. The landlord requests a ₹60,000 security deposit.',
      question: 'Which financing maneuver provides the safest aerodynamic stability?',
      explanation: 'Using dedicated liquid reserves avoids high consumer interest and monthly cashflow squeeze.',
      learningPoint: 'Never finance rental deposits via 36%+ APR instant loan apps.',
      options: [
        { id: 'c_opt_1', text: 'Deploy Liquid Cash Buffer from Emergency Reserve', isOptimal: true, rationale: 'Zero interest, zero EMI drag.' },
        { id: 'c_opt_2', text: 'Swipe Credit Card at 42% APR Revolving Credit', isOptimal: false, rationale: 'Adds heavy compounding drag.' },
        { id: 'c_opt_3', text: 'Take a 7-Day Instant App Loan', isOptimal: false, rationale: 'High predatory extortion and privacy risks.' },
      ],
      createdAt: new Date(),
    });
  }
}

export const inMemoryStore = new InMemoryStore();
