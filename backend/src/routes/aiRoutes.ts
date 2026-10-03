import { Router } from 'express';
import { AIController, aiCoachSchema } from '../controllers/aiController';
import { validateRequest } from '../middleware/validateRequest';

import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/status', AIController.status);
router.get('/', AIController.status);
router.post('/coach', optionalAuth, validateRequest({ body: aiCoachSchema }), AIController.explain);

export default router;

