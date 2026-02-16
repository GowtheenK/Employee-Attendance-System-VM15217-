import { Router } from 'express';
import { protect, managerOnly } from '../middleware/auth.middleware.js';
import {
  checkIn,
  checkOut,
  myHistory,
  mySummary,
  todayStatus,
  allAttendance,
  employeeAttendance,
  teamSummary,
  exportCsv,
  todayAttendance,
} from '../controllers/attendance.controller.js';

const router = Router();

router.use(protect);

router.post('/checkin', checkIn);
router.post('/checkout', checkOut);
router.get('/my-history', myHistory);
router.get('/my-summary', mySummary);
router.get('/today', todayStatus);

router.get('/all', managerOnly, allAttendance);
router.get('/employee/:id', managerOnly, employeeAttendance);
router.get('/summary', managerOnly, teamSummary);
router.get('/export', managerOnly, exportCsv);
router.get('/today-status', managerOnly, todayAttendance);

export default router;
