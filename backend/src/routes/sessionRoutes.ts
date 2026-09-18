import { Router } from 'express';
import { SessionController, createSessionSchema, advanceMonthSchema } from '../controllers/sessionController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', optionalAuth, validateRequest({ body: createSessionSchema }), SessionController.createSession);
router.get('/', optionalAuth, SessionController.listSessions);
router.get('/:id', optionalAuth, SessionController.getSession);
router.post('/:id/advance', optionalAuth, validateRequest({ body: advanceMonthSchema }), SessionController.advanceMonth);
router.get('/:id/report', optionalAuth, SessionController.getReport);

export default router;

