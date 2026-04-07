import express from 'express';
import { getPayroll, processPayroll, markPaid } from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPayroll)
  .post(protect, processPayroll);

router.put('/:id/pay', protect, markPaid);

export default router;
