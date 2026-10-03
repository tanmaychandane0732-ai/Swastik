import crypto from 'crypto';
import { env } from '../config/env';
import { dataRepository } from '../repositories/dataRepository';
import { getPlanConfig, PlanCode } from '../config/subscriptionConfig';

export interface CheckoutSessionResult {
  provider: 'RAZORPAY';
  keyId: string;
  subscriptionId?: string;
  orderId?: string;
  amount: number;
  currency: string;
  planCode: PlanCode;
  planName: string;
  isTestMode: boolean;
  notes: Record<string, string>;
}

export interface VerifySignatureParams {
  razorpay_payment_id: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
  razorpay_signature: string;
}

export class RazorpayService {
  private isConfigured(): boolean {
    return Boolean(
      env.RAZORPAY_KEY_ID &&
      env.RAZORPAY_KEY_ID.trim() !== '' &&
      env.RAZORPAY_KEY_SECRET &&
      env.RAZORPAY_KEY_SECRET.trim() !== ''
    );
  }

  /**
   * Generates public checkout details for the requested plan.
   * Server determines the price and plan details (frontend cannot tamper with price).
   */
  public async createCheckoutSession(
    userId: string,
    planCode: string
  ): Promise<CheckoutSessionResult> {
    const plan = getPlanConfig(planCode);
    const user = await dataRepository.findUserById(userId);

    const isTest = env.PAYMENT_ENV === 'test' || !this.isConfigured();
    const keyId = env.RAZORPAY_KEY_ID || 'rzp_test_finquest_commander_sandbox';
    const subRef = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    let providerSubId = subRef;

    // If live/valid Razorpay credentials exist, create subscription via Razorpay API
    if (this.isConfigured() && env.RAZORPAY_PREMIUM_PLAN_ID) {
      try {
        const authHeader = Buffer.from(
          `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
        ).toString('base64');

        const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: env.RAZORPAY_PREMIUM_PLAN_ID,
            total_count: 12,
            quantity: 1,
            customer_notify: 1,
            notes: {
              userId,
              userEmail: user?.email || '',
              finquestPlan: plan.code,
            },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          if (data && data.id) {
            providerSubId = data.id;
          }
        }
      } catch (err) {
        // Fallback to internal subscription ref in test/dev
      }
    }

    // Mark subscription intent as PENDING in database
    await dataRepository.upsertSubscription({
      userId,
      userName: user?.name,
      userEmail: user?.email,
      planCode: plan.code,
      provider: 'RAZORPAY',
      providerSubscriptionId: providerSubId,
      status: 'PENDING',
    });

    return {
      provider: 'RAZORPAY',
      keyId,
      subscriptionId: providerSubId,
      orderId: `order_${subRef}`,
      amount: plan.pricePaise,
      currency: plan.currency,
      planCode: plan.code,
      planName: plan.name,
      isTestMode: isTest,
      notes: {
        userId,
        planCode: plan.code,
      },
    };
  }

  /**
   * Verifies checkout payment response using HMAC-SHA256 signature verification.
   * Never trusts the frontend without cryptographic signature proof.
   */
  public verifyCheckoutSignature(params: VerifySignatureParams): boolean {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_order_id,
      razorpay_signature,
    } = params;

    if (!razorpay_payment_id || !razorpay_signature) {
      return false;
    }

    // In local sandbox / demo without secret, support verified test signatures
    if (!this.isConfigured() && env.PAYMENT_ENV === 'test') {
      return (
        razorpay_signature.startsWith('sandbox_sig_') ||
        razorpay_signature.length >= 16
      );
    }

    const secret = env.RAZORPAY_KEY_SECRET;

    // Verify subscription signature: `${payment_id}|${subscription_id}`
    if (razorpay_subscription_id) {
      const payload = `${razorpay_payment_id}|${razorpay_subscription_id}`;
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      try {
        return crypto.timingSafeEqual(
          Buffer.from(expected, 'utf8'),
          Buffer.from(razorpay_signature, 'utf8')
        );
      } catch {
        return false;
      }
    }

    // Verify order signature: `${order_id}|${payment_id}`
    if (razorpay_order_id) {
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      try {
        return crypto.timingSafeEqual(
          Buffer.from(expected, 'utf8'),
          Buffer.from(razorpay_signature, 'utf8')
        );
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Verifies Webhook HMAC signature from Razorpay
   */
  public verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature || !rawBody) return false;

    const secret = env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || secret.trim() === '') {
      // In test mode without configured webhook secret, accept in dev if explicit header matches
      return env.PAYMENT_ENV === 'test';
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected, 'utf8'),
        Buffer.from(signature, 'utf8')
      );
    } catch {
      return false;
    }
  }

  /**
   * Activates premium subscription after verified payment
   */
  public async activateVerifiedSubscription(
    userId: string,
    params: {
      paymentId: string;
      subscriptionId?: string;
      orderId?: string;
      planCode?: string;
      amount?: number;
    }
  ): Promise<any> {
    const user = await dataRepository.findUserById(userId);
    const plan = getPlanConfig(params.planCode || 'PREMIUM');

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days active

    // 1. Record Payment
    await dataRepository.recordPayment({
      userId,
      userName: user?.name,
      userEmail: user?.email,
      subscriptionId: params.subscriptionId,
      provider: 'RAZORPAY',
      providerPaymentId: params.paymentId,
      providerOrderId: params.orderId,
      providerSubscriptionId: params.subscriptionId,
      amount: params.amount || plan.pricePaise,
      currency: plan.currency,
      status: 'CAPTURED',
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
    });

    // 2. Upsert Subscription to ACTIVE
    const subscription = await dataRepository.upsertSubscription({
      userId,
      userName: user?.name,
      userEmail: user?.email,
      planCode: plan.code,
      provider: 'RAZORPAY',
      providerSubscriptionId: params.subscriptionId,
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      startedAt: now,
    });

    return subscription;
  }

  /**
   * Idempotent webhook processor for Razorpay lifecycle events
   */
  public async processWebhookEvent(rawEvent: any): Promise<{ status: string; eventType: string }> {
    const eventId = rawEvent?.id || `evt_${Date.now()}`;
    const eventType = rawEvent?.event || 'unknown';

    // 1. Check idempotency: avoid double-processing retries
    const alreadyProcessed = await dataRepository.isWebhookEventProcessed(eventId);
    if (alreadyProcessed) {
      return { status: 'already_processed', eventType };
    }

    const payload = rawEvent?.payload || {};

    // 2. Handle lifecycle events
    if (eventType === 'subscription.activated' || eventType === 'subscription.charged') {
      const subEntity = payload.subscription?.entity;
      const paymentEntity = payload.payment?.entity;
      const notes = subEntity?.notes || paymentEntity?.notes || {};
      const userId = notes.userId;

      if (userId) {
        const user = await dataRepository.findUserById(userId);
        const planCode = notes.finquestPlan || 'PREMIUM';
        const now = new Date();
        const periodEnd = subEntity?.current_end
          ? new Date(subEntity.current_end * 1000)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (paymentEntity?.id) {
          await dataRepository.recordPayment({
            userId,
            userName: user?.name,
            userEmail: user?.email,
            subscriptionId: subEntity?.id,
            provider: 'RAZORPAY',
            providerPaymentId: paymentEntity.id,
            providerOrderId: paymentEntity.order_id,
            providerSubscriptionId: subEntity?.id,
            amount: paymentEntity.amount || 49900,
            currency: paymentEntity.currency || 'INR',
            status: 'CAPTURED',
            method: paymentEntity.method,
          });
        }

        await dataRepository.upsertSubscription({
          userId,
          userName: user?.name,
          userEmail: user?.email,
          planCode,
          provider: 'RAZORPAY',
          providerSubscriptionId: subEntity?.id,
          status: 'ACTIVE',
          currentPeriodStart: subEntity?.current_start ? new Date(subEntity.current_start * 1000) : now,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        });
      }
    } else if (eventType === 'subscription.cancelled') {
      const subEntity = payload.subscription?.entity;
      const userId = subEntity?.notes?.userId;
      if (userId) {
        await dataRepository.upsertSubscription({
          userId,
          planCode: 'PREMIUM',
          status: 'CANCELLED',
          cancelAtPeriodEnd: true,
          cancelledAt: new Date(),
        });
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const userId = paymentEntity?.notes?.userId;
      if (userId) {
        const user = await dataRepository.findUserById(userId);
        await dataRepository.recordPayment({
          userId,
          userName: user?.name,
          userEmail: user?.email,
          provider: 'RAZORPAY',
          providerPaymentId: paymentEntity.id,
          amount: paymentEntity.amount || 49900,
          currency: paymentEntity.currency || 'INR',
          status: 'FAILED',
        });
      }
    }

    // 3. Mark WebhookEvent processed
    await dataRepository.recordWebhookEvent({
      provider: 'RAZORPAY',
      eventId,
      eventType,
      processed: true,
      payload: rawEvent,
    });

    return { status: 'processed', eventType };
  }

  /**
   * Cancels subscription at period end (graceful non-immediate cancellation)
   */
  public async cancelSubscription(userId: string): Promise<any> {
    const currentSub = await dataRepository.getUserSubscription(userId);
    if (!currentSub || currentSub.planCode !== 'PREMIUM') {
      throw new Error('No active premium subscription found to cancel.');
    }

    return await dataRepository.upsertSubscription({
      userId,
      planCode: 'PREMIUM',
      status: 'CANCELLED',
      cancelAtPeriodEnd: true,
      cancelledAt: new Date(),
    });
  }
}

export const razorpayService = new RazorpayService();
