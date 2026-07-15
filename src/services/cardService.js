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

    // Get user's theme (or create a default one)
    const theme = await themeService.getUserTheme(userId);

    const card = await Card.create({
      userId,
      organizationId: user.organizationId || null,
      slug,
      title,
      themeId: theme._id,
      isPublished: false,
      sections: [],
      seo: {
        metaTitle: title,
        metaDescription: `Digital identity card for ${title}`,
        ogImageUrl: '',
      },
    });

    return card;
  }

  async getCardsByUser(userId) {
    return await Card.find({ userId }).sort({ createdAt: -1 });
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

    await card.save();

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

    const card = await Card.findOne({ slug, isPublished: true });
    if (!card) {
      throw new Error('Card not found or is currently private');
    }

    // Populate theme details
    let theme = null;
    const user = await User.findById(card.userId);
    
    if (user && user.organizationId) {
      const org = await Organization.findById(user.organizationId).populate('lockedThemeId');
      if (org && org.lockedThemeId) {
        theme = org.lockedThemeId;
      }
    }

    if (!theme) {
      theme = await Theme.findById(card.themeId);
    }

    // Merge card and theme data into payload
    const resolvedCard = {
      card,
      theme: theme || {},
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
