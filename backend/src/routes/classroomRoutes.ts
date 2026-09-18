import { Router } from 'express';
import {
  ClassroomController,
  createClassroomSchema,
  joinClassroomSchema,
} from '../controllers/classroomController';
import { validateRequest } from '../middleware/validateRequest';
import { optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/create', optionalAuth, validateRequest({ body: createClassroomSchema }), ClassroomController.create);
router.post('/join', optionalAuth, validateRequest({ body: joinClassroomSchema }), ClassroomController.join);
router.get('/cohort/summary', optionalAuth, ClassroomController.getSummary);
router.get('/:id', optionalAuth, ClassroomController.getCohort);

export default router;

