import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getEmployeeDashboard, getEmployeeTasks, punchAttendance, getEmployeeAttendance, 
  toggleBreak, updateNotes, updateTaskStatus, getEmployeeLeaves, applyLeave, 
  applyReimbursement, getFinanceData // New controller
} from '../controllers/employeeSelfController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Multer Storage for Finance Receipts
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `receipt-${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only Images and PDFs allowed'));
  }
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

export default router;
