import express from 'express';
import { createOrUpdateTheme, getUserTheme } from '../controllers/themeController.js';
import { themeSchema } from '../validators/theme.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', validate(themeSchema), createOrUpdateTheme);
router.get('/', getUserTheme);

export default router;
