import express from 'express';
import { getPayroll, processPayroll, markPaid, getAllClaims, updateClaimStatus, overridePayrollRow } from '../controllers/payrollController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/claims')
  .get(protect, getAllClaims);

router.put('/claims/:id', protect, updateClaimStatus);

router.route('/')
  .get(protect, getPayroll)
  .post(protect, processPayroll);

router.put('/:id/pay', protect, markPaid);
router.put('/:id/override', protect, overridePayrollRow);

export default router;
