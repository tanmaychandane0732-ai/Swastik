import { Router } from 'express';
import {
  SubscriptionController,
  createCheckoutSchema,
  verifyPaymentSchema,
} from '../controllers/subscriptionController';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Public Plan Catalog
router.get('/plans', SubscriptionController.getPlans);

// User Subscription & Usage Telemetry
router.get('/', optionalAuth, SubscriptionController.getSubscription);
router.get('/usage', optionalAuth, SubscriptionController.getUsage);

// Checkout & Payment Verification
router.post('/create', optionalAuth, validateRequest({ body: createCheckoutSchema }), SubscriptionController.createCheckout);
router.post('/verify', optionalAuth, validateRequest({ body: verifyPaymentSchema }), SubscriptionController.verifyPayment);

// Subscription Lifecycle
router.post('/cancel', optionalAuth, SubscriptionController.cancelSubscription);
router.get('/history', optionalAuth, SubscriptionController.getBillingHistory);

// Razorpay Webhook Endpoint
router.post('/webhook', SubscriptionController.handleWebhook);

// Hackathon Judge Demo Mode Switcher
router.post('/demo-toggle', optionalAuth, SubscriptionController.demoToggle);

export default router;
