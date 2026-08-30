import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateBody } from '../middleware/validationMiddleware';
import { authenticate } from '../middleware/authMiddleware';
import { registerSchema, loginSchema, profileUpdateSchema } from '../schemas/authSchema';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validateBody(profileUpdateSchema), authController.updateProfile);

export default router;
