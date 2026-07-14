import express from 'express';
import { submitLead, getLeads } from '../controllers/leadController.js';
import { submitLeadSchema } from '../validators/lead.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { publicLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router({ mergeParams: true }); // Merge params to access parent cardId

router.post('/:cardId/leads', publicLimiter, validate(submitLeadSchema), submitLead);
router.get('/:cardId/leads', protect, getLeads);

export default router;
