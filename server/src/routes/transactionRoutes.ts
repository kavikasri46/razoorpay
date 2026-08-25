import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { validateBody } from '../middleware/validationMiddleware';
import { authenticate } from '../middleware/authMiddleware';
import { transactionCreateSchema, transactionUpdateSchema } from '../schemas/transactionSchema';

const router = Router();

router.use(authenticate); // Require authentication for all transaction actions

router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.post('/', validateBody(transactionCreateSchema), transactionController.createTransaction);
router.put('/:id', validateBody(transactionUpdateSchema), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
