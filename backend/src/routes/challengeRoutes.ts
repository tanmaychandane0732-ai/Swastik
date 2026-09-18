import { Router } from 'express';
import { ChallengeController, attemptChallengeSchema } from '../controllers/challengeController';
import { validateRequest } from '../middleware/validateRequest';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/daily', optionalAuth, ChallengeController.getDaily);
router.post('/:id/attempt', optionalAuth, validateRequest({ body: attemptChallengeSchema }), ChallengeController.attempt);

export default router;

