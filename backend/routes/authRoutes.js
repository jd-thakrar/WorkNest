import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { registerUser, loginUser, updateUserProfile, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limit for login: 3 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs:   6 * 1000,
  max: 3,
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
