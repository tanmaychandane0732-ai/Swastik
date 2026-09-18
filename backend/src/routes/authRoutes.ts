import { Router } from 'express';
import { AuthController, registerSchema, loginSchema, guestSchema } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', validateRequest({ body: registerSchema }), AuthController.register);
router.post('/login', validateRequest({ body: loginSchema }), AuthController.login);
router.post('/guest', validateRequest({ body: guestSchema }), AuthController.guest);
router.get('/me', requireAuth, AuthController.me);

export default router;

