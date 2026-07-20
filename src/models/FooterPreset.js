import mongoose from 'mongoose';

const footerPresetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    contentTemplate: {
      type: String,
      default: 'Powered by Identiqal',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const FooterPreset = mongoose.model('FooterPreset', footerPresetSchema);
export default FooterPreset;
