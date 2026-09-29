import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../utils/validation';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/clerk-sync', authController.syncClerkUser);
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authController.logout);

export default router;
