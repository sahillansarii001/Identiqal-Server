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
    // Visual / theme defaults pre-filled by this template
    colors: {
      primary:    { type: String, default: '#5A3045' },
      secondary:  { type: String, default: '#D4A45B' },
      background: { type: String, default: '#FFFFFF' },
      text:       { type: String, default: '#1E1520' },
      accent:     { type: String, default: '#D4A45B' },
    },
    font: {
      family:  { type: String, default: 'Inter' },
      heading: { type: String, default: 'Inter' },
      body:    { type: String, default: 'Inter' },
    },
    layoutStyle: {
      type: String,
      enum: ['minimal', 'bold', 'corporate', 'creative'],
      default: 'minimal',
    },
    buttonStyle: {
      type: String,
      enum: ['rounded', 'square', 'outline'],
      default: 'rounded',
    },
    // Default card sections to apply when a user picks this template
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    // Usage tracking
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
