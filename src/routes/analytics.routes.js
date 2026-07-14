import express from 'express';
import { logEvent, getCardAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.middleware.js';
import { publicLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/analytics/events', publicLimiter, logEvent);
router.get('/cards/:cardId/analytics', protect, getCardAnalytics);

export default router;
