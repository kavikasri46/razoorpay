import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/overview', analyticsController.getOverview);
router.get('/monthly', analyticsController.getMonthlyTrend);
router.get('/categories', analyticsController.getCategorySpending);
router.get('/payment-methods', analyticsController.getPaymentMethodDistribution);

export default router;
