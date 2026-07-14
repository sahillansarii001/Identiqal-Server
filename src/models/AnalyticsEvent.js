import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true,
  },
  type: {
    type: String,
    enum: ['view', 'click', 'scan', 'save'],
    required: true,
  },
  metadata: {
    linkId: { type: String, default: '' },
    referrer: { type: String, default: '' },
    deviceType: { type: String, default: '' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 90 * 24 * 60 * 60, // 90 days TTL
  },
});

// Index to aggregate analytics quickly
analyticsEventSchema.index({ cardId: 1, type: 1, createdAt: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
