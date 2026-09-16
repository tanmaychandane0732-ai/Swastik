export type HealthStatus = 'critical' | 'warning' | 'healthy' | 'excellent';

export interface BudgetState {
  income: number;
  needs: number;
  wants: number;
  savings: number;
  isSubmitted: boolean;
  score: number;
}

export interface DebtDecisionResult {
  scenarioId: string;
  choiceId: string;
  title: string;
  debtImpact: number;
  netWorthImpact: number;
  healthImpact: number;
  scoreImpact: number;
  explanation: string;
  whyExplanation: string;
  isOptimal: boolean;
  compoundComparison?: {
    months: number[];
    minimumPayBalance: number[];
    fullPayBalance: number[];
    totalInterestPaidMin: number;
    totalInterestPaidFull: number;
  };
}

export interface DebtState {
  totalDebt: number;
  decisions: DebtDecisionResult[];
  score: number;
}

export interface InvestmentChoice {
  id: string;
  title: string;
  category: 'index_fund' | 'speculative_crypto' | 'emergency_fund' | 'get_rich_quick';
  description: string;
  expectedReturnAnnual: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Extreme';
  allocationAmount: number;
  isRecommended: boolean;
  educationalTakeaway: string;
}

export interface InvestmentState {
  portfolioValue: number;
  choices: InvestmentChoice[];
  score: number;
}

export interface ScamRedFlag {
  id: string;
  label: string;
  description: string;
}

export interface ScamTarget {
  id: string;
  senderName: string;
  platform: 'WhatsApp' | 'Telegram' | 'Instagram' | 'SMS' | 'Email';
  timestamp: string;
  messageText: string;
  offerHighlight: string;
  actualScam: boolean;
  availableFlags: ScamRedFlag[];
  correctFlags: string[]; // ids of flags
  explanation: string;
  whyDangerous: string;
  tip: string;
}

export interface ScamState {
  detectedScams: number;
  missedScams: number;
  totalAnalyzed: number;
  scamScore: number;
}

export interface Badge {
  id: string;
  name: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'budget' | 'debt' | 'invest' | 'scam' | 'mastery';
}

export interface GameSettings {
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface GameState {
  player: {
    name: string;
    avatarId: string;
  };
  netWorth: number;
  financialHealth: number; // 0 to 100
  score: number;
  streak: number;
  streakMultiplier: number;
  currentLevel: number; // 1, 2, 3
  completedLevels: number[];
  levelScores: {
    level1: number;
    level2: number;
    level3: number;
  };
  budget: BudgetState;
  debt: DebtState;
  investment: InvestmentState;
  scam: ScamState;
  badges: string[]; // badge IDs
  settings: GameSettings;
  gameStage: 'landing' | 'onboarding' | 'dashboard' | 'level1' | 'level2' | 'level3' | 'results' | 'leaderboard';
  history: {
    timestamp: number;
    netWorthChange: number;
    reason: string;
  }[];
}

export interface EducationalFeedback {
  isOpen: boolean;
  title: string;
  verdict: 'success' | 'warning' | 'danger';
  headline: string;
  financialImpact: {
    netWorthDelta: number;
    healthDelta: number;
    scoreDelta: number;
    debtDelta?: number;
  };
  whyItHappened: string;
  whatYouShouldLearn: string;
  didYouKnow?: string;
  compoundData?: {
    initialAmount: number;
    apr: number;
    months: number[];
    balances: number[];
    interestPaid: number;
  };
  onContinue?: () => void;
}

export type GameAction =
  | { type: 'SET_STAGE'; payload: GameState['gameStage'] }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'SUBMIT_BUDGET'; payload: { needs: number; wants: number; savings: number; score: number; netWorthChange: number; healthChange: number } }
  | { type: 'RECORD_DEBT_DECISION'; payload: DebtDecisionResult }
  | { type: 'SUBMIT_INVESTMENTS'; payload: { choices: InvestmentChoice[]; score: number; netWorthChange: number; healthChange: number } }
  | { type: 'RECORD_SCAM_VERDICT'; payload: { targetId: string; isCorrect: boolean; detectedFlags: string[]; scoreChange: number; healthChange: number; netWorthChange: number } }
  | { type: 'COMPLETE_LEVEL'; payload: { levelNumber: number; levelScore: number } }
  | { type: 'UNLOCK_BADGE'; payload: string }
  | { type: 'INCREMENT_STREAK' }
  | { type: 'RESET_STREAK' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'TOGGLE_REDUCED_MOTION' }
  | { type: 'RESTART_GAME' }
  | { type: 'LOAD_SAVED_GAME'; payload: GameState };

