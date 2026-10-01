import { Router } from 'express';
import { AIController, aiCoachSchema } from '../controllers/aiController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get('/status', AIController.status);
router.get('/', AIController.status);
router.post('/coach', validateRequest({ body: aiCoachSchema }), AIController.explain);

export default router;

