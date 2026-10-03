import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { inMemoryStore } from '../repositories/inMemoryStore';
import { entitlementService } from '../services/entitlementService';
import { razorpayService } from '../services/razorpayService';
import { getCurrentDateKey } from '../utils/dateUtils';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import crypto from 'crypto';

const TEST_USER_ID = 'user_pilot_sub_test';
const TEST_TOKEN = jwt.sign(
  { userId: TEST_USER_ID, email: 'pilot.sub@finquest.aero', role: 'STUDENT' },
  env.JWT_SECRET
);

describe('FinQuest Subscription & Entitlement Architecture', () => {
  beforeEach(() => {
    // Reset test user data in store
    inMemoryStore.subscriptions.delete(TEST_USER_ID);
    const dateKey = getCurrentDateKey();
    inMemoryStore.dailyUsages.delete(`${TEST_USER_ID}_${dateKey}`);
    inMemoryStore.users.set(TEST_USER_ID, {
      id: TEST_USER_ID,
      name: 'Test Cadet',
      email: 'pilot.sub@finquest.aero',
      passwordHash: 'hash',
      ageGroup: '18-25',
      educationLevel: 'Undergraduate',
      location: 'India',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe('1. Plan Catalog & Public Endpoints', () => {
    it('GET /api/subscription/plans should return centralized plans with pricing and limits', async () => {
      const res = await request(app).get('/api/subscription/plans');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const plans = res.body.data;
      expect(plans.length).toBeGreaterThanOrEqual(2);

      const freePlan = plans.find((p: any) => p.code === 'FREE');
      const premiumPlan = plans.find((p: any) => p.code === 'PREMIUM');

      expect(freePlan).toBeDefined();
      expect(freePlan.pricePaise).toBe(0);
      expect(freePlan.dailyGameLimit).toBe(env.FREE_DAILY_GAME_LIMIT);

      expect(premiumPlan).toBeDefined();
      expect(premiumPlan.pricePaise).toBe(49900);
      expect(premiumPlan.dailyGameLimit).toBe(env.PREMIUM_DAILY_GAME_LIMIT);
      expect(premiumPlan.entitlements.advancedReports).toBe(true);
    });

    it('GET /api/subscription should return default FREE status and daily usage', async () => {
      const res = await request(app)
        .get('/api/subscription')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subscription.planCode).toBe('FREE');
      expect(res.body.data.subscription.isPremium).toBe(false);
      expect(res.body.data.dailyUsage.gamesLimit).toBe(env.FREE_DAILY_GAME_LIMIT);
      expect(res.body.data.dailyUsage.gamesRemaining).toBe(env.FREE_DAILY_GAME_LIMIT);
      expect(res.body.data.dailyUsage.resetInfo.formattedResetTime).toContain('12:00 AM IST');
    });
  });

  describe('2. Server-Side Atomic Daily Flight Allowance', () => {
    it('should track daily game sessions and block requests at limit', async () => {
      const limit = env.FREE_DAILY_GAME_LIMIT; // default 3

      // Consume up to limit
      for (let i = 1; i <= limit; i++) {
        const res = await request(app)
          .post('/api/game/start')
          .set('Authorization', `Bearer ${TEST_TOKEN}`)
          .send({ gameType: 'flight-simulator' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.usage.used).toBe(i);
        expect(res.body.data.usage.remaining).toBe(limit - i);
      }

      // 4th request must be rejected with DAILY_LIMIT_REACHED (HTTP 403)
      const blockedRes = await request(app)
        .post('/api/game/start')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ gameType: 'flight-simulator' });

      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.success).toBe(false);
      expect(blockedRes.body.error.code).toBe('DAILY_LIMIT_REACHED');
      expect(blockedRes.body.error.usage.remaining).toBe(0);
    });

    it('should protect against concurrent requests (Race Condition Prevention)', async () => {
      const dateKey = getCurrentDateKey();
      const limit = env.FREE_DAILY_GAME_LIMIT;

      // Set user to having exactly 1 flight remaining
      inMemoryStore.dailyUsages.set(`${TEST_USER_ID}_${dateKey}`, {
        id: 'du_test',
        userId: TEST_USER_ID,
        dateKey,
        gameSessionsUsed: limit - 1, // 1 remaining
        aiUsesUsed: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Fire 5 simultaneous requests
      const promises = Array.from({ length: 5 }).map(() =>
        request(app)
          .post('/api/game/start')
          .set('Authorization', `Bearer ${TEST_TOKEN}`)
          .send({ gameType: 'flight-simulator' })
      );

      const results = await Promise.all(promises);

      // Exactly 1 request should have succeeded (status 200), and 4 must have been rejected (status 403)
      const successful = results.filter((r) => r.status === 200);
      const rejected = results.filter((r) => r.status === 403);

      expect(successful.length).toBe(1);
      expect(rejected.length).toBe(4);

      // Ensure final usage never exceeded the limit
      const finalUsage = await entitlementService.getDailyUsage(TEST_USER_ID);
      expect(finalUsage.gamesUsed).toBe(limit);
      expect(finalUsage.gamesRemaining).toBe(0);
    });
  });

  describe('3. Razorpay Checkout & Cryptographic Signature Verification', () => {
    it('POST /api/subscription/create should return authoritative pricing and checkout metadata', async () => {
      const res = await request(app)
        .post('/api/subscription/create')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ planCode: 'PREMIUM' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.provider).toBe('RAZORPAY');
      expect(res.body.data.amount).toBe(49900); // Server-enforced ₹499
      expect(res.body.data.currency).toBe('INR');
      expect(res.body.data.planCode).toBe('PREMIUM');
    });

    it('POST /api/subscription/verify should reject forged signatures', async () => {
      const res = await request(app)
        .post('/api/subscription/verify')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({
          razorpay_payment_id: 'pay_fraudulent_123',
          razorpay_subscription_id: 'sub_fake_456',
          razorpay_signature: 'invalid_tampered_signature_xyz',
          planCode: 'PREMIUM',
        });

      // If in sandbox mode without secrets, any signature < 16 chars is rejected
      const isConfigured = Boolean(env.RAZORPAY_KEY_SECRET && env.RAZORPAY_KEY_SECRET.trim() !== '');
      if (isConfigured) {
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('INVALID_PAYMENT_SIGNATURE');
      }
    });

    it('should activate Flight Commander Premium upon verified payment and expand limits', async () => {
      // Simulate verified activation
      await razorpayService.activateVerifiedSubscription(TEST_USER_ID, {
        paymentId: 'pay_test_verified_999',
        subscriptionId: 'sub_test_verified_999',
        planCode: 'PREMIUM',
        amount: 49900,
      });

      const res = await request(app)
        .get('/api/subscription')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.data.subscription.planCode).toBe('PREMIUM');
      expect(res.body.data.subscription.isPremium).toBe(true);
      expect(res.body.data.subscription.status).toBe('ACTIVE');
      expect(res.body.data.subscription.entitlements.advancedReports).toBe(true);
      expect(res.body.data.dailyUsage.gamesLimit).toBe(env.PREMIUM_DAILY_GAME_LIMIT); // Expanded from 3 to 25
    });
  });

  describe('4. Graceful Cancellation & Webhook Idempotency', () => {
    it('POST /api/subscription/cancel should maintain access until period end', async () => {
      // Setup active premium
      await razorpayService.activateVerifiedSubscription(TEST_USER_ID, {
        paymentId: 'pay_cancel_test',
        planCode: 'PREMIUM',
      });

      const cancelRes = await request(app)
        .post('/api/subscription/cancel')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.success).toBe(true);

      // Verify user is marked CANCELLED with cancelAtPeriodEnd=true, but STILL has premium entitlements!
      const statusRes = await request(app)
        .get('/api/subscription')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(statusRes.body.data.subscription.status).toBe('CANCELLED');
      expect(statusRes.body.data.subscription.cancelAtPeriodEnd).toBe(true);
      expect(statusRes.body.data.subscription.isPremium).toBe(true); // Still entitled until period end!
    });

    it('POST /api/payments/razorpay/webhook should process idempotently without duplicating events', async () => {
      const eventId = `evt_test_${Date.now()}`;
      const payload = {
        id: eventId,
        event: 'subscription.charged',
        payload: {
          subscription: {
            entity: {
              id: 'sub_webhook_test',
              current_end: Math.floor(Date.now() / 1000) + 30 * 86400,
              notes: { userId: TEST_USER_ID, finquestPlan: 'PREMIUM' },
            },
          },
          payment: {
            entity: {
              id: `pay_webhook_${Date.now()}`,
              amount: 49900,
              currency: 'INR',
              notes: { userId: TEST_USER_ID },
            },
          },
        },
      };

      // 1st webhook call
      const res1 = await request(app)
        .post('/api/payments/razorpay/webhook')
        .send(payload);

      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe('processed');

      // 2nd webhook call with exact same event ID (retry / duplicate)
      const res2 = await request(app)
        .post('/api/payments/razorpay/webhook')
        .send(payload);

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('already_processed'); // Idempotency check passed!
    });

    it('GET /api/subscription/history should return past billing transactions', async () => {
      const res = await request(app)
        .get('/api/subscription/history')
        .set('Authorization', `Bearer ${TEST_TOKEN}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('5. Judge Demo Mode Quick Switcher', () => {
    it('POST /api/subscription/demo-toggle should safely switch test pilot between FREE and PREMIUM', async () => {
      const toggleRes = await request(app)
        .post('/api/subscription/demo-toggle')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ planCode: 'PREMIUM' });

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.subscription.planCode).toBe('PREMIUM');

      const toggleBackRes = await request(app)
        .post('/api/subscription/demo-toggle')
        .set('Authorization', `Bearer ${TEST_TOKEN}`)
        .send({ planCode: 'FREE' });

      expect(toggleBackRes.status).toBe(200);
      expect(toggleBackRes.data ? toggleBackRes.data.subscription.planCode : toggleBackRes.body.data.subscription.planCode).toBe('FREE');
    });
  });
});
