import Card from '../models/Card.js';
import Theme from '../models/Theme.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import themeService from './themeService.js';
import { CACHE_TTL } from '../constants/api.constants.js';

// In-memory cache for public card slugs
const publicCardCache = new Map();

class CardService {
  async createCard(userId, { slug, title }) {
    // Check if slug is unique
    const existingCard = await Card.findOne({ slug });
    if (existingCard) {
      throw new Error('Slug is already in use. Please select a different one.');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's default presets (or null if none)
    // We will let the frontend explicitly set these when they pick a template.
    // For now, we initialize them as null.
    
    const card = await Card.create({
      userId,
      organizationId: user.organizationId || null,
      slug,
      title,
      isPublished: false,
      sections: [],
      displayPresetId: null,
      colorThemeId: null,
      footerPresetId: null,
      seo: {
        metaTitle: title,
        metaDescription: `Digital identity card for ${title}`,
        ogImageUrl: '',
      },
    });

    return card;
  }

  async getCardsByUser(userId) {
    return await Card.find({ userId })
      .populate('displayPresetId')
      .populate('colorThemeId')
      .populate('footerPresetId')
      .sort({ createdAt: -1 });
  }

  async updateCard(cardId, userId, updateData) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    if (card.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized to modify this card');
    }

    if (updateData.title) card.title = updateData.title;
    if (updateData.sections) {
      card.sections = updateData.sections;
      card.markModified('sections');
    }
    if (updateData.seo) card.seo = { ...card.seo, ...updateData.seo };
    if (updateData.displayPresetId !== undefined) card.displayPresetId = updateData.displayPresetId;
    if (updateData.colorThemeId !== undefined) card.colorThemeId = updateData.colorThemeId;
    if (updateData.footerPresetId !== undefined) card.footerPresetId = updateData.footerPresetId;

    await card.save();
    await card.populate('displayPresetId');
    await card.populate('colorThemeId');
    await card.populate('footerPresetId');

    // Invalidate public cache for this card
    this.invalidateCache(card.slug);

    return card;
  }

  async setPublishStatus(cardId, userId, isPublished) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    if (card.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized to modify this card');
    }

    card.isPublished = isPublished;
    await card.save();
    await card.populate('displayPresetId');
    await card.populate('colorThemeId');
    await card.populate('footerPresetId');

    // Invalidate public cache
    this.invalidateCache(card.slug);

    return card;
  }

  async deleteCard(cardId, userId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    if (card.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized to delete this card');
    }

    const slug = card.slug;
    await Card.findByIdAndDelete(cardId);

    // Invalidate public cache
    this.invalidateCache(slug);

    return { id: cardId, deleted: true };
  }

  async getPublicCardBySlug(slug) {
    const cached = publicCardCache.get(slug);
    if (cached && cached.expiry > Date.now()) {
      return cached.data;
    }

    const card = await Card.findOne({ slug, isPublished: true })
      .populate('displayPresetId')
      .populate('colorThemeId')
      .populate('footerPresetId');
      
    if (!card) {
      throw new Error('Card not found or is currently private');
    }

    // Prepare response data with populated items
    const resolvedCard = {
      card,
      displayPreset: card.displayPresetId || {},
      colorTheme: card.colorThemeId || {},
      footerPreset: card.footerPresetId || {},
    };

    // Cache the resolved data
    publicCardCache.set(slug, {
      data: resolvedCard,
      expiry: Date.now() + CACHE_TTL,
    });

    return resolvedCard;
  }

  invalidateCache(slug) {
    publicCardCache.delete(slug);
  }
}

export default new CardService();
