import { Router } from 'express';
import * as budgetController from '../controllers/budgetController';
import { validateBody } from '../middleware/validationMiddleware';
import { authenticate } from '../middleware/authMiddleware';
import { budgetCreateSchema, budgetUpdateSchema } from '../schemas/budgetSchema';

const router = Router();

router.use(authenticate);

router.get('/', budgetController.getBudgets);
router.post('/', validateBody(budgetCreateSchema), budgetController.createBudget);
router.put('/:id', validateBody(budgetUpdateSchema), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

export default router;
