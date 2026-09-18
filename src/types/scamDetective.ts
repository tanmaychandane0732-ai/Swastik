export type ScamClueCategory =
  | 'urgency'
  | 'suspicious_link'
  | 'otp_request'
  | 'fee_demand'
  | 'unrealistic_return'
  | 'unknown_sender'
  | 'remote_access'
  | 'permission_trap';

export interface ScamRedFlagClue {
  id: string;
  phrase: string;
  category: ScamClueCategory;
  isCorrect: boolean;
  explanation: string;
}

export interface ScamDecisionOption {
  id: string;
  label: string;
  isSafe: boolean;
  feedback: string;
}

export interface ScamScenario {
  id: string;
  difficulty: 'cadet' | 'investigator' | 'master';
  channel: 'sms' | 'whatsapp' | 'email' | 'upi' | 'telegram';
  senderName: string;
  senderHandle?: string;
  senderContact?: string;
  timestamp: string;
  avatarText: string;
  badgeLabel?: string;
  subject?: string;
  messageText: string;
  clues: ScamRedFlagClue[];
  decisionPrompt: string;
  decisionOptions: ScamDecisionOption[];
  caseAnalysis: {
    verdict: string;
    socialEngineeringTactic: string;
    whatYouLearned: string[];
    realWorldPrecedent: string; // RBI, SEBI, 1930 Cybercrime
  };
}

export type DetectiveRank =
  | 'Rookie Detective'
  | 'Alert Investigator'
  | 'Scam Hunter'
  | 'Financial Guardian'
  | 'Master Detective';

export interface DetectiveReport {
  casesInvestigated: number;
  scamsDetected: number;
  redFlagsFound: number;
  totalRedFlagsAvailable: number;
  accuracyPercent: number;
  scamShieldScore: number; // 0 - 100
  detectiveRank: DetectiveRank;
  completedAt: string;
}
