import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'Untitled Theme',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'draft',
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    colors: {
      primary: { type: String, default: '#000000' },
      secondary: { type: String, default: '#6c757d' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#212529' },
      accent: { type: String, default: '#0d6efd' },
    },
    font: {
      heading: { type: String, default: 'Inter' },
      body: { type: String, default: 'Inter' },
      family: { type: String, default: 'Inter' },
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
    isLockedByOrg: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Theme = mongoose.model('Theme', themeSchema);
export default Theme;
