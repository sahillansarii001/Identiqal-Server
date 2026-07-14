import express from 'express';
import { startCheckout, handleWebhook, getMockCheckoutPortal } from '../controllers/billingController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/checkout', protect, startCheckout);
router.post('/webhook', handleWebhook);
router.get('/mock-checkout-portal', getMockCheckoutPortal);

export default router;
