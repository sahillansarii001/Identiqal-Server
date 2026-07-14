import jwt from 'jsonwebtoken';
import env from '../config/env.config.js';
import RefreshToken from '../models/RefreshToken.js';

export const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
    subscriptionTier: user.subscriptionTier,
  };

  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES,
  });
};

export const generateRefreshToken = async (userId) => {
  // Determine duration from config (e.g., '7d')
  // Parse expiration days for database expiresAt
  const durationMatch = env.REFRESH_TOKEN_EXPIRES.match(/^(\d+)([dhm])$/);
  let days = 7; // Default fallback
  if (durationMatch) {
    const value = parseInt(durationMatch[1], 10);
    const unit = durationMatch[2];
    if (unit === 'd') days = value;
    else if (unit === 'h') days = value / 24;
    else if (unit === 'm') days = value / (24 * 60);
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const payload = {
    id: userId,
    jti: Math.random().toString(36).substring(2, 15) + Date.now(),
  };
  const token = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES,
  });

  // Save to DB
  await RefreshToken.create({
    userId,
    token,
    expiresAt,
  });

  return token;
};
