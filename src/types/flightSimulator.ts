export type FlightStatus = 'smooth' | 'turbulent' | 'crash';

export type DecisionArchetype =
  | 'Strategic Flight Captain'
  | 'Calculated Risk-Taker'
  | 'Vigilant Scam-Proof Navigator'
  | 'Impulsive High-Altitude Flyer'
  | 'Debt-Trapped Glider'
  | 'Conservative Parachute Holder';

export interface TraitScore {
  name: string;
  score: number; // 0 - 100
  label: string;
  description: string;
}

export interface DecisionDNAProfile {
  archetype: DecisionArchetype;
  tagline: string;
  badgeIcon: string;
  summary: string;
  traits: {
    patience: number;          // delayed gratification
    riskIntelligence: number;  // calculated risk vs gambling
    debtDiscipline: number;    // avoiding predatory debt
    scamImmunity: number;      // spotting phishing / scams
    emergencyReadiness: number;// maintaining runway buffer
  };
  primaryStrength: string;
  dangerBlindSpot: string;
  recommendedFlightCheck: string;
}

export interface RiskRadarMetrics {
  debtRisk: number;          // 0 (low) to 100 (critical)
  emergencyVulnerability: number; // 0 (safe) to 100 (zero cash buffer)
  lifestyleCreep: number;    // 0 (disciplined) to 100 (runaway burn)
  volatilityExposure: number;// 0 (diversified) to 100 (speculative)
  scamExposure: number;      // 0 (immune) to 100 (vulnerable)
  creditFragility: number;   // 0 (robust) to 100 (bad CIBIL)
}

export interface DiagnosticQuestion {
  id: string;
  category: 'budget' | 'debt' | 'scam' | 'investing' | 'insurance';
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    points: number;
  }[];
}

export interface DiagnosticResult {
  totalScore: number;       // 0 - 100
  categoryScores: {
    budget: number;
    debt: number;
    scam: number;
    investing: number;
    insurance: number;
  };
  tier: 'Pre-Flight Cadet' | 'Co-Pilot in Training' | 'Licensed Financial Aviator' | 'Elite Squadron Commander';
  completedAt: string;
}

export interface FinancialIQDelta {
  preFlightIQ: number;
  postFlightIQ: number;
  deltaPoints: number;
  percentageGain: number;
  strongestImprovementArea: string;
  verifiedAt: string;
}

export interface FlightLogEntry {
  month: number;
  scenarioTitle: string;
  choiceSelected: string;
  cashDelta: number;
  debtDelta: number;
  netWorthResult: number;
  isOptimal: boolean;
  turbulenceReason?: string;
}

export interface FlightReportData {
  flightStatus: FlightStatus;
  captainName: string;
  flightDurationMonths: number;
  finalAltitude: number;       // Net worth
  fuelRemaining: number;       // Liquid cash
  airspeed: number;            // Monthly free cashflow
  totalDebt: number;
  cibilScore: number;
  overallScore: number;
  decisionDNA: DecisionDNAProfile;
  iqDelta?: FinancialIQDelta;
  flightLogs: FlightLogEntry[];
  keyLessons: string[];
}

export interface AICoachExplanation {
  headline: string;
  whyThisHappened: string;
  mathematicalTruth: string;
  indianRegulatoryContext: string; // e.g. RBI guidelines, SEBI regulations, 1930 Cyber helpline
  coachAdvice: string;
}

export interface WhatIfProjection {
  currentChoiceOutcome: {
    year1NetWorth: number;
    year5NetWorth: number;
    interestPaid5Years: number;
    stressLevel: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  };
  alternativeChoiceOutcome: {
    year1NetWorth: number;
    year5NetWorth: number;
    interestPaid5Years: number;
    stressLevel: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  };
  divergenceSummary: string;
}

export interface AcademyModule {
  id: string;
  title: string;
  wing: 'Foundation' | 'Aerodynamics' | 'Defense Shield' | 'Hypersonic Wealth';
  readTime: string;
  aviationAnalogy: string;
  coreConcept: string;
  practicalAction: string;
  proTip: string;
  quickCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    takeaway: string;
  };
}

export interface DailyDilemma {
  id: string;
  date: string;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    isOptimal: boolean;
    communityVotePercent: number;
    consequence: string;
  }[];
}

export interface ClassroomStudent {
  id: string;
  name: string;
  preFlightIQ: number;
  postFlightIQ: number;
  deltaIQ: number;
  archetype: DecisionArchetype;
  flightStatus: FlightStatus;
  resilienceScore: number;
  completedAt: string;
}

export interface ClassroomCohort {
  cohortName: string;
  institution: string;
  totalStudents: number;
  averagePreIQ: number;
  averagePostIQ: number;
  averageDeltaPercent: number;
  topFailureTrap: string;
  riskDistribution: {
    lowRisk: number;
    moderateRisk: number;
    highRisk: number;
    criticalDebt: number;
  };
  students: ClassroomStudent[];
}

