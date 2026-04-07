import express from 'express';
import { getEmployeeDashboard, getEmployeeTasks, punchAttendance, getEmployeeAttendance } from '../controllers/employeeSelfController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getEmployeeDashboard);
router.get('/tasks', protect, getEmployeeTasks);
router.post('/punch', protect, punchAttendance);
router.get('/attendance', protect, getEmployeeAttendance);

export default router;
