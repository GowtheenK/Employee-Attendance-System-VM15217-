import { Router } from 'express';
import { protect, managerOnly } from '../middleware/auth.middleware.js';
import { employeeDashboard, managerDashboard } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(protect);

router.get('/employee', employeeDashboard);
router.get('/manager', managerOnly, managerDashboard);

export default router;
