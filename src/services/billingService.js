import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { PLANS } from '../constants/plans.constants.js';

class BillingService {
  async createCheckoutSession(userId, tier) {
    if (![PLANS.PRO, PLANS.BUSINESS].includes(tier)) {
      throw new Error('Invalid plan tier selected for upgrade');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Mock checkout session URL
    // In production, this would be a Stripe or Razorpay checkout session URL
    const mockSessionId = `mock_sess_${Math.random().toString(36).substring(2, 15)}`;
    const mockCheckoutUrl = `http://localhost:5000/api/billing/mock-checkout-portal?sessionId=${mockSessionId}&userId=${userId}&tier=${tier}`;

    return {
      sessionId: mockSessionId,
      checkoutUrl: mockCheckoutUrl,
    };
  }

  async handlePaymentWebhook(payload, signature) {
    // Verify mock webhook signature
    // In production, we'd use payment provider's SDK to verify signature (e.g. stripe.webhooks.constructEvent)
    if (signature !== 'mock-valid-signature') {
      throw new Error('Invalid webhook signature');
    }

    const { userId, tier } = payload;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found for payment webhook');
    }

    // Update user subscription
    user.subscriptionTier = tier;
    await user.save();

    // If upgrading to business and user already belongs to an organization, update organization limit
    if (tier === PLANS.BUSINESS && user.organizationId) {
      await Organization.findByIdAndUpdate(user.organizationId, {
        subscriptionTier: PLANS.BUSINESS,
        seatLimit: 10, // Pro limit or standard business seats
      });
    }

    return {
      userId,
      subscriptionTier: tier,
      status: 'success',
    };
  }
}

export default new BillingService();
