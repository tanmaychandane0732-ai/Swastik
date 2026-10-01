import { Router } from 'express';
import {
  AssessmentController,
  evaluateAssessmentSchema,
  submitAssessmentSchema,
  computeDeltaSchema,
} from '../controllers/assessmentController';
import { validateRequest } from '../middleware/validateRequest';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/evaluate', validateRequest({ body: evaluateAssessmentSchema }), AssessmentController.evaluate);
router.post('/submit', optionalAuth, validateRequest({ body: submitAssessmentSchema }), AssessmentController.submit);
router.post('/delta', validateRequest({ body: computeDeltaSchema }), AssessmentController.computeDelta);
router.get('/user', optionalAuth, AssessmentController.listUserAssessments);
router.get('/', optionalAuth, AssessmentController.listUserAssessments);

export default router;

