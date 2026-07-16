import express from 'express';
import { signup, login, refresh, logout, verifyOtp, forgotPassword, resetPassword } from '../controllers/authController.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);

router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
export default router;
