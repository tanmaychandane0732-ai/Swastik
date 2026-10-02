import { Router } from 'express';
import {
  AIController,
  aiCoachSchema,
  aiChatSchema,
  aiScenarioSchema,
  aiConceptSchema,
  aiScamSchema,
  aiWhatIfSchema,
  aiFlightReportSchema,
} from '../controllers/aiController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Diagnostics & Status
router.get('/status', AIController.status);
router.get('/', AIController.status);

// Core AI Services
router.post('/coach', validateRequest({ body: aiCoachSchema }), AIController.explain);
router.post('/chat', validateRequest({ body: aiChatSchema }), AIController.chat);
router.post('/scenario', validateRequest({ body: aiScenarioSchema }), AIController.scenario);
router.post('/concept', validateRequest({ body: aiConceptSchema }), AIController.concept);
router.post('/scam-case', validateRequest({ body: aiScamSchema }), AIController.analyzeScam);
router.post('/what-if', validateRequest({ body: aiWhatIfSchema }), AIController.whatIf);
router.post('/flight-report', validateRequest({ body: aiFlightReportSchema }), AIController.flightReport);

export default router;
