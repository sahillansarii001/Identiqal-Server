import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Card from '../models/Card.js';

class AnalyticsService {
  async logEvent({ cardId, type, metadata }) {
    // Validate card exists
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    return await AnalyticsEvent.create({
      cardId,
      type,
      metadata: {
        linkId: metadata?.linkId || '',
        referrer: metadata?.referrer || '',
        deviceType: metadata?.deviceType || '',
      },
    });
  }

  async getCardStats(cardId) {
    const card = await Card.findById(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    // Run aggregation to get counts of each event type
    const stats = await AnalyticsEvent.aggregate([
      { $match: { cardId: card._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format output as a key-value object
    const result = {
      view: 0,
      click: 0,
      scan: 0,
      save: 0,
    };

    stats.forEach((item) => {
      if (item._id in result) {
        result[item._id] = item.count;
      }
    });

    // Also get breakdown by device type and referrer for clicks/views
    const deviceBreakdown = await AnalyticsEvent.aggregate([
      { $match: { cardId: card._id } },
      {
        $group: {
          _id: '$metadata.deviceType',
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: '' } } },
    ]);

    const referrerBreakdown = await AnalyticsEvent.aggregate([
      { $match: { cardId: card._id } },
      {
        $group: {
          _id: '$metadata.referrer',
          count: { $sum: 1 },
        },
      },
      { $match: { _id: { $ne: '' } } },
    ]);

    return {
      totals: result,
      devices: deviceBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      referrers: referrerBreakdown.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
    };
  }
}

export default new AnalyticsService();
