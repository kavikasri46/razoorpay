import { Router } from 'express';
import multer from 'multer';
import * as batchController from '../controllers/batchController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
});

router.use(authenticate); // Require authentication for all batch actions

router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatchById);
router.post('/upload', upload.single('file'), batchController.uploadBatch);
router.post('/compare', batchController.compareStatements);
router.post('/:id/import', batchController.importBatch);

export default router;

