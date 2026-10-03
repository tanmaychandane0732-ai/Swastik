import { env } from './env';

export type PlanCode = 'FREE' | 'PREMIUM';

export type SubscriptionStatus =
  | 'NONE'
  | 'ACTIVE'
  | 'PENDING'
  | 'PAUSED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'PAYMENT_FAILED';

export interface PlanEntitlements {
  gameAccess: boolean;
  advancedReports: boolean;
  aiCoach: boolean;
  decisionDnaInsights: boolean;
  premiumScenarios: boolean;
  unlimitedSimulations: boolean;
  priorityFlightDeck: boolean;
}

export interface PlanConfig {
  code: PlanCode;
  name: string;
  tagline: string;
  description: string;
  pricePaise: number; // in paise: 49900 = ₹499
  displayPrice: string;
  currency: string;
  billingInterval: 'free' | 'monthly' | 'yearly';
  dailyGameLimit: number;
  dailyAiLimit: number;
  entitlements: PlanEntitlements;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<PlanCode, PlanConfig> = {
  FREE: {
    code: 'FREE',
    name: 'Cadet Pilot',
    tagline: 'Foundational Financial Flight Training',
    description: 'Essential cockpit simulators and daily scenario challenges for beginner pilots.',
    pricePaise: 0,
    displayPrice: '₹0',
    currency: 'INR',
    billingInterval: 'free',
    get dailyGameLimit() {
      return env.FREE_DAILY_GAME_LIMIT;
    },
    get dailyAiLimit() {
      return env.FREE_DAILY_AI_LIMIT;
    },
    entitlements: {
      gameAccess: true,
      advancedReports: false,
      aiCoach: true, // within daily limit
      decisionDnaInsights: false,
      premiumScenarios: false,
      unlimitedSimulations: false,
      priorityFlightDeck: false,
    },
    features: [
      `${env.FREE_DAILY_GAME_LIMIT} Daily Flight Missions`,
      `${env.FREE_DAILY_AI_LIMIT} AI Co-Pilot Queries / Day`,
      'Standard Budgeting & Debt Games',
      'Community Leaderboard Access',
      'Cadet Flight Pilot Certificate',
    ],
  },
  PREMIUM: {
    code: 'PREMIUM',
    name: 'Flight Commander',
    tagline: 'Unrestricted Financial Altitude & Deep Simulation',
    description: 'Full-spectrum access to advanced financial turbulence, deep decision DNA, and expanded AI mentorship.',
    pricePaise: 49900, // ₹499/month
    displayPrice: '₹499',
    currency: 'INR',
    billingInterval: 'monthly',
    get dailyGameLimit() {
      return env.PREMIUM_DAILY_GAME_LIMIT;
    },
    get dailyAiLimit() {
      return env.PREMIUM_DAILY_AI_LIMIT;
    },
    entitlements: {
      gameAccess: true,
      advancedReports: true,
      aiCoach: true,
      decisionDnaInsights: true,
      premiumScenarios: true,
      unlimitedSimulations: true,
      priorityFlightDeck: true,
    },
    features: [
      `${env.PREMIUM_DAILY_GAME_LIMIT} Daily Flight Missions (Expanded)`,
      `${env.PREMIUM_DAILY_AI_LIMIT} AI Co-Pilot Queries / Day`,
      'Deep Decision DNA Behavioral Analytics',
      'Advanced Aeronautical Flight Reports',
      'Financial Turbulence & Emergency Scenarios',
      'Commander Gold Verified Certificate',
      'Priority Flight Deck Execution',
    ],
  },
};

export const getPlanConfig = (code?: string): PlanConfig => {
  const normalized = (code || 'FREE').toUpperCase() as PlanCode;
  return SUBSCRIPTION_PLANS[normalized] || SUBSCRIPTION_PLANS.FREE;
};
