import { Router } from 'express';
import { AIController, aiCoachSchema } from '../controllers/aiController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post('/coach', validateRequest({ body: aiCoachSchema }), AIController.explain);

export default router;

