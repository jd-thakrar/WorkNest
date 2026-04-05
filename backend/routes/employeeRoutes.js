import express from 'express';
import { addEmployee, getEmployees } from '../controllers/employeeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, addEmployee)
  .get(protect, admin, getEmployees);

export default router;
