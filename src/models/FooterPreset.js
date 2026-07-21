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
    // Style archetype
    style: {
      type: String,
      enum: ['Minimal', 'Glass', 'Gradient', 'Corporate', 'CTA', 'Social', 'Custom'],
      default: 'Minimal',
    },
    // Layout
    footerHeight: { type: String, default: '56px' },
    padding: { type: String, default: '16px 24px' },
    borderRadius: { type: String, default: '0px' },
    // Background
    backgroundType: {
      type: String,
      enum: ['Solid', 'Gradient', 'Glass', 'Transparent'],
      default: 'Solid',
    },
    background: { type: String, default: '#F8FAFC' },
    backgroundEnd: { type: String, default: '#E2E8F0' },
    gradientDirection: { type: String, default: 'to right' },
    // Divider
    divider: { type: Boolean, default: true },
    dividerColor: { type: String, default: '#E2E8F0' },
    // CTA Button
    ctaEnabled: { type: Boolean, default: false },
    ctaText: { type: String, default: 'Save Contact' },
    ctaColor: { type: String, default: '#2563EB' },
    ctaTextColor: { type: String, default: '#FFFFFF' },
    ctaStyle: {
      type: String,
      enum: ['Pill', 'Rounded', 'Square'],
      default: 'Pill',
    },
    // Social icons
    socialLayout: {
      type: String,
      enum: ['Row', 'Grid', 'Hidden'],
      default: 'Row',
    },
    socialIconStyle: {
      type: String,
      enum: ['Circle', 'Square', 'Flat'],
      default: 'Circle',
    },
    // QR Code
    qrPosition: {
      type: String,
      enum: ['Left', 'Right', 'Center', 'Hidden'],
      default: 'Hidden',
    },
    // Branding
    copyright: { type: Boolean, default: true },
    copyrightText: { type: String, default: 'Powered by Identiqal' },
    // Legacy field (kept for backwards compat)
    contentTemplate: { type: String, default: 'Powered by Identiqal' },
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

