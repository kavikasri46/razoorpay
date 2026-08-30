import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Protect all admin endpoints with ADMIN role check
router.use(authenticate, authorize(['ADMIN']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/transactions', adminController.getAllTransactions);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
