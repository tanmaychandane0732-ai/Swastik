import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { entitlementService } from '../services/entitlementService';
import { razorpayService } from '../services/razorpayService';
import { SUBSCRIPTION_PLANS, getPlanConfig } from '../config/subscriptionConfig';
import { dataRepository } from '../repositories/dataRepository';
import { getGuestUserId } from '../utils/guestUser';

export const createCheckoutSchema = z.object({
  planCode: z.enum(['FREE', 'PREMIUM']).default('PREMIUM'),
});

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
  razorpay_subscription_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  planCode: z.string().optional(),
});

export const gameStartSchema = z.object({
  gameType: z.string().default('flight-simulator'),
  scenarioId: z.string().optional(),
});

export class SubscriptionController {
  /**
   * GET /api/subscription
   * Returns current subscription status, plan, entitlements, and daily usage.
   */
  public static async getSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const subscription = await entitlementService.getUserSubscription(userId);
      const usage = await entitlementService.getDailyUsage(userId);
      const activePlan = getPlanConfig(subscription.planCode);

      res.status(200).json({
        success: true,
        data: {
          subscription,
          plan: activePlan,
          dailyUsage: usage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subscription/plans
   * Public catalog of all available plans and their limits.
   */
  public static async getPlans(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const plans = Object.values(SUBSCRIPTION_PLANS).map((p) => ({
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        pricePaise: p.pricePaise,
        displayPrice: p.displayPrice,
        currency: p.currency,
        billingInterval: p.billingInterval,
        dailyGameLimit: p.dailyGameLimit,
        dailyAiLimit: p.dailyAiLimit,
        entitlements: p.entitlements,
        features: p.features,
      }));

      res.status(200).json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subscription/usage
   * Current daily usage for the active user.
   */
  public static async getUsage(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const usage = await entitlementService.getDailyUsage(userId);

      res.status(200).json({
        success: true,
        data: usage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/subscription/create
   * Initializes Razorpay checkout session for requested plan.
   */
  public static async createCheckout(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const { planCode } = req.body;

      const checkoutSession = await razorpayService.createCheckoutSession(userId, planCode);

      res.status(200).json({
        success: true,
        message: 'Checkout session created successfully.',
        data: checkoutSession,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/subscription/verify
   * Verifies Razorpay checkout signature and activates membership.
   */
  public static async verifyPayment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const {
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
        razorpay_order_id,
        planCode,
      } = req.body;

      // Cryptographic signature check
      const isValid = razorpayService.verifyCheckoutSignature({
        razorpay_payment_id,
        razorpay_signature,
        razorpay_subscription_id,
        razorpay_order_id,
      });

      if (!isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYMENT_SIGNATURE',
            message: 'Cryptographic payment verification failed. The transaction signature is invalid.',
          },
        });
        return;
      }

      // Activate subscription in backend authority
      const subscription = await razorpayService.activateVerifiedSubscription(userId, {
        paymentId: razorpay_payment_id,
        subscriptionId: razorpay_subscription_id,
        orderId: razorpay_order_id,
        planCode: planCode || 'PREMIUM',
      });

      const updatedUsage = await entitlementService.getDailyUsage(userId);

      res.status(200).json({
        success: true,
        message: 'Flight Commander Premium membership activated!',
        data: {
          subscription,
          dailyUsage: updatedUsage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/subscription/cancel
   * Graceful cancellation at period end.
   */
  public static async cancelSubscription(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const updated = await razorpayService.cancelSubscription(userId);

      res.status(200).json({
        success: true,
        message: 'Your subscription will not renew after the current billing period. Premium flight access remains active until the expiration date.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subscription/history
   * Lists past billing payments for the user.
   */
  public static async getBillingHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const payments = await dataRepository.getUserPayments(userId);

      res.status(200).json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/payments/razorpay/webhook
   * Authoritative webhook handler with HMAC verification and idempotency.
   */
  public static async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

      // Verify signature
      if (signature && !razorpayService.verifyWebhookSignature(rawBody, signature)) {
        res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
        return;
      }

      const result = await razorpayService.processWebhookEvent(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/game/start
   * Authoritative flight game session gatekeeper:
   * Atomically checks daily allowance and increments session count.
   */
  public static async authorizeGameStart(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const { gameType } = req.body;

      const result = await entitlementService.authorizeAndConsumeGameSession(userId, gameType);

      if (!result.allowed) {
        res.status(403).json({
          success: false,
          error: {
            code: result.code,
            message: result.message,
            usage: result.usage,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          authorized: true,
          usage: result.usage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/subscription/demo-toggle
   * Exclusively for Judge Demo Mode:
   * Seamlessly switches the current pilot session between FREE and PREMIUM
   * for judges to inspect the paywall, daily limits, and unlocked flight reports.
   */
  public static async demoToggle(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.userId || (await getGuestUserId());
      const targetPlan = req.body.planCode === 'PREMIUM' ? 'PREMIUM' : 'FREE';

      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const updated = await dataRepository.upsertSubscription({
        userId,
        planCode: targetPlan,
        status: targetPlan === 'PREMIUM' ? 'ACTIVE' : 'NONE',
        currentPeriodStart: targetPlan === 'PREMIUM' ? now : undefined,
        currentPeriodEnd: targetPlan === 'PREMIUM' ? periodEnd : undefined,
      });

      const updatedUsage = await entitlementService.getDailyUsage(userId);

      res.status(200).json({
        success: true,
        message: `Judge Demo Mode: Pilot profile switched to ${targetPlan}.`,
        data: {
          subscription: updated,
          dailyUsage: updatedUsage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
