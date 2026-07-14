import analyticsService from '../services/analyticsService.js';
import Card from '../models/Card.js';

export const logEvent = async (req, res) => {
  try {
    const event = await analyticsService.logEvent(req.body);
    return res.status(201).json({
      success: true,
      message: 'Analytics event logged successfully',
      data: event,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getCardAnalytics = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Check ownership
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }

    if (card.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not own this card',
      });
    }

    const stats = await analyticsService.getCardStats(cardId);
    return res.status(200).json({
      success: true,
      message: 'Analytics stats retrieved successfully',
      data: stats,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
