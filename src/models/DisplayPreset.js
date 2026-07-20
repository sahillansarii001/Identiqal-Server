import mongoose from 'mongoose';

const displayPresetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
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
    previewThumbnail: {
      type: String,
      default: '',
    },
    headerStyle: {
      type: String,
      enum: ['Solid Color', 'Gradient', 'Curved Wave', 'Diagonal Split', 'Rounded', 'Organic Blob', 'Glass', 'Full Image', 'Full Video'],
      default: 'Solid Color',
    },
    headerHeight: {
      type: String,
      default: '200px', // e.g. 200px, 30vh, etc.
    },
    backgroundType: {
      type: String,
      enum: ['Solid Color', 'Gradient', 'Pattern', 'Texture', 'Image', 'Animated Gradient', 'Video'],
      default: 'Solid Color',
    },
    profilePhotoStyle: {
      type: String,
      enum: ['Circle', 'Rounded Square', 'Square', 'Glass Border', 'Gradient Border', 'Shadow', 'No Border'],
      default: 'Circle',
    },
    profilePhotoPosition: {
      type: String,
      enum: ['Left', 'Center', 'Right', 'Floating', 'Overlapping Header'],
      default: 'Center',
    },
    cardShape: {
      type: String,
      enum: ['Rounded', 'Sharp', 'Glass', 'Floating', 'Soft Shadow', 'Border', 'Borderless'],
      default: 'Rounded',
    },
    animationStyle: {
      type: String,
      enum: ['None', 'Fade', 'Slide', 'Scale', 'Glow', 'Bounce', 'Parallax'],
      default: 'Fade',
    },
    buttonStyle: {
      type: String,
      enum: ['Rectangular', 'Rounded', 'Pill', 'Outline', 'Ghost'],
      default: 'Rounded',
    },
    dividerStyle: {
      type: String,
      enum: ['Solid', 'Dashed', 'Subtle', 'None'],
      default: 'Subtle',
    },
    sectionSpacing: {
      type: String,
      enum: ['Compact', 'Normal', 'Spacious'],
      default: 'Normal',
    },
    typography: {
      type: String,
      enum: ['Modern Sans', 'Elegant Serif', 'Monospace', 'Display'],
      default: 'Modern Sans',
    },
    badgePosition: {
      type: String,
      enum: ['Top Right', 'Inline', 'Hidden'],
      default: 'Top Right',
    },
    // Optional default styling values if we want presets to have embedded colors/fonts
    defaultColors: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    defaultTypography: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

const DisplayPreset = mongoose.model('DisplayPreset', displayPresetSchema);
export default DisplayPreset;
