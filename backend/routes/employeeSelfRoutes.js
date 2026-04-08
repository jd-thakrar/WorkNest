import express from 'express';
import { getEmployeeDashboard, getEmployeeTasks, punchAttendance, getEmployeeAttendance, toggleBreak, updateNotes, updateTaskStatus } from '../controllers/employeeSelfController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, getEmployeeDashboard);
router.get('/tasks', protect, getEmployeeTasks);
router.put('/tasks/:id', protect, updateTaskStatus);
router.post('/punch', protect, punchAttendance);
router.get('/attendance', protect, getEmployeeAttendance);
router.post('/break', protect, toggleBreak);
router.post('/notes', protect, updateNotes);

export default router;
