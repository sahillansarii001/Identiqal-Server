import Lead from '../models/Lead.js';
import Card from '../models/Card.js';

class LeadService {
  async submitLead({ cardId, name, email, phone, message, source, consentGiven }) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    // Lead is captured by the owner of the card
    const capturedByUserId = card.userId;

    const lead = await Lead.create({
      cardId,
      capturedByUserId,
      name,
      email,
      phone,
      message,
      source,
      consentGiven,
    });

    return lead;
  }

  async getLeadsForCard(cardId, userId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    // Enforce authorization: Card must belong to the requesting user
    // (Or organization check if they are in the same org, but for now ownership check is standard)
    if (card.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized to view leads for this card');
    }

    return await Lead.find({ cardId }).sort({ createdAt: -1 });
  }
}

export default new LeadService();
