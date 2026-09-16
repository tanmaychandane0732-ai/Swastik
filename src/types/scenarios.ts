import { DebtDecisionResult } from './game';

export interface DebtScenarioOption {
  id: string;
  label: string;
  tagline: string;
  result: DebtDecisionResult;
}

export interface DebtScenario {
  id: string;
  title: string;
  category: 'BNPL' | 'CREDIT_CARD' | 'PREDATORY_LOAN';
  badge: string;
  description: string;
  principalAmount: number;
  quotedTerms: string;
  hiddenCatch: string;
  options: DebtScenarioOption[];
}

