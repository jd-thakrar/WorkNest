import express from 'express';
import { 
  getEmployees, 
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee 
} from '../controllers/employeeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, admin, addEmployee);
router.put('/:id', protect, admin, updateEmployee);
router.delete('/:id', protect, admin, deleteEmployee);

export default router;
