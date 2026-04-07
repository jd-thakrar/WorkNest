import express from 'express';
import { getAttendance, updateAttendance, getLeaveRequests, updateLeaveRequest } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAttendance);
router.put('/:id', protect, updateAttendance);

router.get('/leaves', protect, getLeaveRequests);
router.put('/leaves/:id', protect, updateLeaveRequest);

export default router;
