import { dataRepository } from '../repositories/dataRepository';
import { getPlanConfig, PlanCode, PlanEntitlements, SubscriptionStatus } from '../config/subscriptionConfig';
import { getCurrentDateKey, getDailyResetInfo, DailyResetInfo } from '../utils/dateUtils';

export interface NormalizedSubscription {
  planCode: PlanCode;
  planName: string;
  status: SubscriptionStatus;
  isPremium: boolean;
  provider: string;
  providerSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  entitlements: PlanEntitlements;
}

export interface UserDailyUsageSummary {
  dateKey: string;
  gamesUsed: number;
  gamesLimit: number;
  gamesRemaining: number;
  isGamesLimitReached: boolean;
  aiUsed: number;
  aiLimit: number;
  aiRemaining: number;
  isAiLimitReached: boolean;
  resetInfo: DailyResetInfo;
}

export interface EntitlementCheckResult {
  allowed: boolean;
  code?: 'DAILY_LIMIT_REACHED' | 'PREMIUM_REQUIRED' | 'ALLOWED';
  message: string;
  usage?: {
    used: number;
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

export class EntitlementService {
  /**
   * Retrieves the normalized, authoritative subscription status for a user.
   * Gracefully handles period expiry without deleting historical data.
   */
  public async getUserSubscription(userId: string): Promise<NormalizedSubscription> {
    const rawSub = await dataRepository.getUserSubscription(userId);

    if (!rawSub) {
      const freePlan = getPlanConfig('FREE');
      return {
        planCode: 'FREE',
        planName: freePlan.name,
        status: 'NONE',
        isPremium: false,
        provider: 'SYSTEM',
        cancelAtPeriodEnd: false,
        entitlements: freePlan.entitlements,
      };
    }

    const now = new Date();
    let currentStatus = (rawSub.status || 'ACTIVE').toUpperCase() as SubscriptionStatus;
    let planCode = (rawSub.planCode || 'FREE').toUpperCase() as PlanCode;

    // Check period validity for active or cancelled subscriptions
    if (rawSub.currentPeriodEnd) {
      const periodEnd = new Date(rawSub.currentPeriodEnd);
      if (periodEnd.getTime() <= now.getTime()) {
        // Entitlement period has elapsed
        currentStatus = 'EXPIRED';
        planCode = 'FREE';

        // Update record in DB asynchronously
        dataRepository.upsertSubscription({
          userId,
          planCode: 'FREE',
          status: 'EXPIRED',
        }).catch(() => {});
      }
    }

    const isPremium = planCode === 'PREMIUM' && (currentStatus === 'ACTIVE' || (currentStatus === 'CANCELLED' && rawSub.currentPeriodEnd && new Date(rawSub.currentPeriodEnd) > now));
    const activePlan = getPlanConfig(isPremium ? 'PREMIUM' : 'FREE');

    return {
      planCode: isPremium ? 'PREMIUM' : 'FREE',
      planName: activePlan.name,
      status: currentStatus,
      isPremium,
      provider: rawSub.provider || 'RAZORPAY',
      providerSubscriptionId: rawSub.providerSubscriptionId,
      currentPeriodStart: rawSub.currentPeriodStart ? new Date(rawSub.currentPeriodStart) : undefined,
      currentPeriodEnd: rawSub.currentPeriodEnd ? new Date(rawSub.currentPeriodEnd) : undefined,
      cancelAtPeriodEnd: Boolean(rawSub.cancelAtPeriodEnd),
      entitlements: activePlan.entitlements,
    };
  }

  /**
   * Authoritative daily usage overview for a user in the configured business timezone
   */
  public async getDailyUsage(userId: string): Promise<UserDailyUsageSummary> {
    const sub = await this.getUserSubscription(userId);
    const plan = getPlanConfig(sub.planCode);
    const dateKey = getCurrentDateKey();
    const resetInfo = getDailyResetInfo();

    const usageRecord = await dataRepository.getDailyUsage(userId, dateKey);

    const gamesUsed = usageRecord?.gameSessionsUsed || 0;
    const aiUsed = usageRecord?.aiUsesUsed || 0;

    const gamesLimit = plan.dailyGameLimit;
    const aiLimit = plan.dailyAiLimit;

    const gamesRemaining = Math.max(0, gamesLimit - gamesUsed);
    const aiRemaining = Math.max(0, aiLimit - aiUsed);

    return {
      dateKey,
      gamesUsed,
      gamesLimit,
      gamesRemaining,
      isGamesLimitReached: gamesRemaining <= 0,
      aiUsed,
      aiLimit,
      aiRemaining,
      isAiLimitReached: aiRemaining <= 0,
      resetInfo,
    };
  }

  /**
   * ATOMICALLY checks and consumes a game session.
   * Race-condition safe: prevents 2 or more concurrent requests from bypassing the daily limit.
   */
  public async authorizeAndConsumeGameSession(
    userId: string,
    gameType: string = 'flight-simulator'
  ): Promise<EntitlementCheckResult> {
    const sub = await this.getUserSubscription(userId);
    const plan = getPlanConfig(sub.planCode);
    const dateKey = getCurrentDateKey();
    const resetInfo = getDailyResetInfo();
    const limit = plan.dailyGameLimit;

    // Atomically increment with condition (< limit)
    const result = await dataRepository.atomicIncrementDailyUsage(
      userId,
      dateKey,
      'gameSessionsUsed',
      limit
    );

    if (!result.allowed) {
      return {
        allowed: false,
        code: 'DAILY_LIMIT_REACHED',
        message: `Today's daily flight training limit of ${limit} has been reached. Next flight unlocks tomorrow at 12:00 AM IST.`,
        usage: {
          used: result.currentUsage,
          limit,
          remaining: 0,
          resetAt: resetInfo.resetAtIso,
        },
      };
    }

    return {
      allowed: true,
      code: 'ALLOWED',
      message: `Flight mission authorized. (${result.remaining} flight${result.remaining === 1 ? '' : 's'} remaining today)`,
      usage: {
        used: result.currentUsage,
        limit,
        remaining: result.remaining,
        resetAt: resetInfo.resetAtIso,
      },
    };
  }

  /**
   * ATOMICALLY checks and consumes an AI Co-Pilot query.
   * Prevents uncontrolled costs and abuse.
   */
  public async authorizeAndConsumeAiQuery(userId: string): Promise<EntitlementCheckResult> {
    const sub = await this.getUserSubscription(userId);
    const plan = getPlanConfig(sub.planCode);
    const dateKey = getCurrentDateKey();
    const resetInfo = getDailyResetInfo();
    const limit = plan.dailyAiLimit;

    const result = await dataRepository.atomicIncrementDailyUsage(
      userId,
      dateKey,
      'aiUsesUsed',
      limit
    );

    if (!result.allowed) {
      return {
        allowed: false,
        code: 'DAILY_LIMIT_REACHED',
        message: `Today's AI Co-Pilot query allowance of ${limit} has been reached. Upgrade to Flight Commander for expanded access.`,
        usage: {
          used: result.currentUsage,
          limit,
          remaining: 0,
          resetAt: resetInfo.resetAtIso,
        },
      };
    }

    return {
      allowed: true,
      code: 'ALLOWED',
      message: 'AI Co-Pilot query authorized.',
      usage: {
        used: result.currentUsage,
        limit,
        remaining: result.remaining,
        resetAt: resetInfo.resetAtIso,
      },
    };
  }

  /**
   * Checks if user has entitlement for a specific premium feature
   */
  public async canAccessFeature(
    userId: string,
    feature: keyof PlanEntitlements
  ): Promise<boolean> {
    const sub = await this.getUserSubscription(userId);
    return Boolean(sub.entitlements[feature]);
  }
}

export const entitlementService = new EntitlementService();
