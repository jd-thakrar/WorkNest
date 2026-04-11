import express from 'express';
import multer from 'multer';

import { 
  getEmployeeDashboard, getEmployeeTasks, punchAttendance, getEmployeeAttendance, 
  toggleBreak, updateNotes, updateTaskStatus, getEmployeeLeaves, applyLeave, 
  applyReimbursement, getFinanceData, updateEmployeeProfile
} from '../controllers/employeeSelfController.js';
import { protect } from '../middleware/authMiddleware.js';

import { storage } from '../config/cloudinary.js';

const router = express.Router();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});


router.get('/dashboard', protect, getEmployeeDashboard);
router.get('/tasks', protect, getEmployeeTasks);
router.put('/tasks/:id', protect, updateTaskStatus);
router.post('/punch', protect, punchAttendance);
router.get('/attendance', protect, getEmployeeAttendance);
router.post('/break', protect, toggleBreak);
router.post('/notes', protect, updateNotes);
router.get('/leaves', protect, getEmployeeLeaves);
router.post('/apply-leave', protect, applyLeave);

// Finance Routes
router.get('/finance', protect, getFinanceData);
router.post('/finance/reimbursement', protect, upload.single('receipt'), applyReimbursement);
router.put('/profile', protect, updateEmployeeProfile);

export default router;
