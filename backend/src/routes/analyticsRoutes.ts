import { Router } from 'express';
import {
  AnalyticsController,
  decisionDnaSchema,
  riskRadarSchema,
  whatIfSchema,
} from '../controllers/analyticsController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get('/dashboard', AnalyticsController.getDashboard);
router.get('/', AnalyticsController.getDashboard);
router.post('/decision-dna', validateRequest({ body: decisionDnaSchema }), AnalyticsController.getDecisionDna);
router.post('/risk-radar', validateRequest({ body: riskRadarSchema }), AnalyticsController.getRiskRadar);
router.post('/what-if', validateRequest({ body: whatIfSchema }), AnalyticsController.getWhatIf);

export default router;

