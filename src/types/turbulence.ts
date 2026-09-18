export type TurbulenceSeverity = 'calm' | 'moderate' | 'severe';

export interface TurbulenceChoice {
  id: string;
  label: string;
  actionType: 'savings' | 'emi' | 'borrow' | 'delay';
  description: string;
  requiredCash?: number;
  cashDelta: number;
  debtDelta: number;
  monthlyEmiDelta: number;
  resilienceDelta: number;
  shortTermFeedback: string;
  chainEffectDescription?: string;
  chainEffectKey?: string; // e.g., 'heavy_emi_drag' | 'zero_cash_buffer'
}

export interface TurbulenceEvent {
  id: string;
  severity: TurbulenceSeverity;
  category: 'hardware' | 'medical' | 'income' | 'housing' | 'transit' | 'market' | 'social';
  title: string;
  iconName: string;
  headline: string;
  storyDescription: string;
  shockCost: number;
  choices: TurbulenceChoice[];
  whatIfAlternativeId: string;
  educationalLesson: string;
}

export interface TurbulenceFlightMetrics {
  altitudeNetWorth: number;
  fuelCash: number;
  debtDrag: number;
  monthlyEmi: number;
  resilienceScore: number;
}

export interface TurbulenceDebrief {
  eventsSurvived: number;
  totalEvents: number;
  finalResilienceScore: number;
  netWorthChange: number;
  debtAccumulated: number;
  status: 'Smooth Recovery' | 'Turbulent Holding Pattern' | 'Critical Flight Stall';
  keyTakeaways: string[];
}

