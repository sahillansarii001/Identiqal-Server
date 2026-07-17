import express from 'express';
import { updateOnboarding, completeOnboarding } from '../controllers/onboardingController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/update', protect, updateOnboarding);
router.post('/complete', protect, completeOnboarding);

export default router;
