import { apiClient, ApiResponse } from './apiClient';

export interface PlanEntitlements {
  gameAccess: boolean;
  advancedReports: boolean;
  aiCoach: boolean;
  decisionDnaInsights: boolean;
  premiumScenarios: boolean;
  unlimitedSimulations: boolean;
  priorityFlightDeck: boolean;
}

export interface SubscriptionPlan {
  code: 'FREE' | 'PREMIUM';
  name: string;
  tagline: string;
  description: string;
  pricePaise: number;
  displayPrice: string;
  currency: string;
  billingInterval: 'free' | 'monthly' | 'yearly';
  dailyGameLimit: number;
  dailyAiLimit: number;
  entitlements: PlanEntitlements;
  features: string[];
}

export interface UserSubscription {
  planCode: 'FREE' | 'PREMIUM';
  planName: string;
  status: 'NONE' | 'ACTIVE' | 'PENDING' | 'PAUSED' | 'CANCELLED' | 'EXPIRED' | 'PAYMENT_FAILED';
  isPremium: boolean;
  provider: string;
  providerSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  entitlements: PlanEntitlements;
}

export interface DailyUsageInfo {
  dateKey: string;
  gamesUsed: number;
  gamesLimit: number;
  gamesRemaining: number;
  isGamesLimitReached: boolean;
  aiUsed: number;
  aiLimit: number;
  aiRemaining: number;
  isAiLimitReached: boolean;
  resetInfo: {
    dateKey: string;
    resetAtIso: string;
    secondsRemaining: number;
    formattedResetTime: string;
  };
}

export interface SubscriptionResponseData {
  subscription: UserSubscription;
  plan: SubscriptionPlan;
  dailyUsage: DailyUsageInfo;
}

export interface CheckoutSessionData {
  provider: 'RAZORPAY';
  keyId: string;
  subscriptionId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  planCode: 'FREE' | 'PREMIUM';
  planName: string;
  isTestMode: boolean;
  notes: Record<string, string>;
}

export interface BillingPayment {
  id: string;
  userId: string;
  provider: string;
  providerPaymentId: string;
  providerOrderId?: string;
  providerSubscriptionId?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  receiptNumber?: string;
  createdAt: string;
}

export class SubscriptionApi {
  public static async getSubscription(): Promise<ApiResponse<SubscriptionResponseData>> {
    return apiClient.get('/subscription');
  }

  public static async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiClient.get('/subscription/plans');
  }

  public static async getUsage(): Promise<ApiResponse<DailyUsageInfo>> {
    return apiClient.get('/subscription/usage');
  }

  public static async createCheckout(planCode: 'PREMIUM' | 'FREE' = 'PREMIUM'): Promise<ApiResponse<CheckoutSessionData>> {
    return apiClient.post('/subscription/create', { planCode });
  }

  public static async verifyPayment(payload: {
    razorpay_payment_id: string;
    razorpay_signature: string;
    razorpay_subscription_id?: string;
    razorpay_order_id?: string;
    planCode?: string;
  }): Promise<ApiResponse<{ subscription: UserSubscription; dailyUsage: DailyUsageInfo }>> {
    return apiClient.post('/subscription/verify', payload);
  }

  public static async cancelSubscription(): Promise<ApiResponse<any>> {
    return apiClient.post('/subscription/cancel');
  }

  public static async getBillingHistory(): Promise<ApiResponse<BillingPayment[]>> {
    return apiClient.get('/subscription/history');
  }

  public static async authorizeGameStart(gameType: string = 'flight-simulator'): Promise<ApiResponse<{ authorized: boolean; usage: any }>> {
    return apiClient.post('/game/start', { gameType });
  }

  public static async demoToggle(planCode: 'FREE' | 'PREMIUM'): Promise<ApiResponse<any>> {
    return apiClient.post('/subscription/demo-toggle', { planCode });
  }
}
