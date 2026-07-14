import cardService from '../services/cardService.js';

export const getCards = async (req, res) => {
  try {
    const cards = await cardService.getCardsByUser(req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Cards retrieved successfully',
      data: cards,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const createCard = async (req, res) => {
  try {
    const card = await cardService.createCard(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Card draft created successfully',
      data: card,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCard = async (req, res) => {
  try {
    const card = await cardService.updateCard(req.params.cardId, req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Card updated successfully',
      data: card,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const publishCard = async (req, res) => {
  try {
    const { isPublished } = req.body;
    const card = await cardService.setPublishStatus(req.params.cardId, req.user.id, isPublished);
    return res.status(200).json({
      success: true,
      message: isPublished ? 'Card published successfully' : 'Card unpublished successfully',
      data: card,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCard = async (req, res) => {
  try {
    const result = await cardService.deleteCard(req.params.cardId, req.user.id);
    return res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getPublicCard = async (req, res) => {
  try {
    const resolvedCard = await cardService.getPublicCardBySlug(req.params.slug);
    return res.status(200).json({
      success: true,
      message: 'Public card resolved successfully',
      data: resolvedCard,
    });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
