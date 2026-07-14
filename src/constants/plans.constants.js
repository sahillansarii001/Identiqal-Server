export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  BUSINESS: 'business',
};

export const PLAN_ENUM = [PLANS.FREE, PLANS.PRO, PLANS.BUSINESS];

export const PLAN_LIMITS = {
  [PLANS.FREE]: {
    seatLimit: 1,
    canLockTheme: false,
  },
  [PLANS.PRO]: {
    seatLimit: 1,
    canLockTheme: false,
  },
  [PLANS.BUSINESS]: {
    seatLimit: 10, // default limit, can be customized
    canLockTheme: true,
  },
};
