import mongoose from 'mongoose';
import { ROLE_ENUM, ROLES } from '../constants/roles.constants.js';
import { PLAN_ENUM, PLANS } from '../constants/plans.constants.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function() {
        return this.authProvider === 'local';
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    role: {
      type: String,
      enum: ROLE_ENUM,
      default: ROLES.MEMBER,
    },
    subscriptionTier: {
      type: String,
      enum: PLAN_ENUM,
      default: PLANS.FREE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
