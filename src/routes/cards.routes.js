import express from 'express';
import { getCards, createCard, updateCard, publishCard, deleteCard, getPublicCard } from '../controllers/cardController.js';
import { createCardSchema, updateCardSchema } from '../validators/card.validator.js';
import validate from '../middleware/validate.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getCards);
router.post('/', protect, validate(createCardSchema), createCard);
router.put('/:cardId', protect, validate(updateCardSchema), updateCard);
router.put('/:cardId/publish', protect, publishCard);
router.delete('/:cardId', protect, deleteCard);

export default router;
