import { Router } from 'express';
import * as aiController from '../controllers/aiController';
import { validateBody } from '../middleware/validationMiddleware';
import { authenticate } from '../middleware/authMiddleware';
import { aiChatSchema } from '../schemas/aiSchema';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.use(authenticate);

router.post('/chat', validateBody(aiChatSchema), aiController.chat);
router.post('/analyze', aiController.analyze);
router.get('/insights', aiController.getInsights);
router.post('/analyze-image', upload.single('image'), aiController.analyzeImage);

export default router;
