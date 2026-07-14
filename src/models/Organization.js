import mongoose from 'mongoose';
import { ROLE_ENUM } from '../constants/roles.constants.js';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ROLE_ENUM,
          required: true,
        },
        status: {
          type: String,
          enum: ['invited', 'active'],
          default: 'invited',
        },
      },
    ],
    lockedThemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      default: null,
    },
    subscriptionTier: {
      type: String,
      default: 'business',
    },
    seatLimit: {
      type: Number,
      default: 10,
    },
    seatsUsed: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
