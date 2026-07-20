import mongoose from 'mongoose';

const colorThemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    primary: {
      type: String,
      default: '#000000',
    },
    secondary: {
      type: String,
      default: '#6c757d',
    },
    accent: {
      type: String,
      default: '#0d6efd',
    },
    background: {
      type: String,
      default: '#ffffff',
    },
    surface: {
      type: String,
      default: '#f8f9fa',
    },
    text: {
      type: String,
      default: '#212529',
    },
    border: {
      type: String,
      default: '#dee2e6',
    },
    button: {
      type: String,
      default: '#0d6efd',
    },
    icon: {
      type: String,
      default: '#495057',
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

const ColorTheme = mongoose.model('ColorTheme', colorThemeSchema);
export default ColorTheme;
