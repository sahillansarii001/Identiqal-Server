import mongoose from 'mongoose';

const cardTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Template',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    badge: {
      type: String,
      enum: ['NEW', 'PREMIUM', 'POPULAR', 'TRENDING', 'AI PICK', ''],
      default: '',
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },

    // ─── Reusable module references ────────────────────────────────────
    displayPresetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DisplayPreset',
      default: null,
    },
    colorThemeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ColorTheme',
      default: null,
    },
    footerPresetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FooterPreset',
      default: null,
    },

    // ─── Template-level overrides (not stored in any reusable module) ──
    typography: {
      fontFamily: { type: String, default: 'Inter' },
      headingFont: { type: String, default: 'Inter' },
      bodyFont: { type: String, default: 'Inter' },
      headingWeight: { type: String, default: '700' },
      bodyWeight: { type: String, default: '400' },
      letterSpacing: { type: String, default: 'normal' },
    },
    profileSettings: {
      position: {
        type: String,
        enum: ['Top', 'Overlap', 'Floating', 'Hidden', 'Center', 'Left', 'Right'],
        default: 'Center',
      },
      shape: {
        type: String,
        enum: ['Circle', 'Rounded', 'Square'],
        default: 'Circle',
      },
    },
    spacing: {
      cardRadius: { type: String, default: '24px' },
      sectionPadding: { type: String, default: 'Normal' },
      cardShadow: { type: String, default: 'Medium' },
      dividers: { type: String, default: 'Subtle' },
    },
    animationStyle: {
      type: String,
      enum: ['None', 'Fade', 'Slide', 'Scale', 'Glow', 'Bounce'],
      default: 'Fade',
    },

    // ─── Default card sections to apply when a user picks this template ─
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    // ─── Usage tracking ─────────────────────────────────────────────────
    usageCount: {
      type: Number,
      default: 0,
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

const CardTemplate = mongoose.model('CardTemplate', cardTemplateSchema);
export default CardTemplate;

