import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired pending users after 15 minutes
pendingUserSchema.index({ otpExpiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);
export default PendingUser;
