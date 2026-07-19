import express from 'express';
import CardTemplate from '../models/CardTemplate.js';

const router = express.Router();

/**
 * @desc    Get all published card templates for users
 * @route   GET /api/templates
 * @access  Public (or protected depending on requirements, here public/authenticated combo is common)
 */
router.get('/', async (req, res) => {
  try {
    const templates = await CardTemplate.find({ status: 'published' }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error('Error in get public templates:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
