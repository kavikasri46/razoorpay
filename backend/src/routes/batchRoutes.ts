import { Router } from 'express';
import * as batchController from '../controllers/batchController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate); // Require authentication for all batch actions

router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatchById);
router.post('/upload', batchController.uploadBatch);
router.post('/compare', batchController.compareStatements);
router.post('/:id/import', batchController.importBatch);

export default router;
