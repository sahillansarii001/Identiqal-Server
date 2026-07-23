import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  sectionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

const cardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
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
    sections: {
      type: [sectionSchema],
      default: [],
    },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImageUrl: { type: String, default: '' },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    isVideo: {
      type: Boolean,
      default: false,
    },
    imageScale: {
      type: Number,
      default: 100,
    },
    imagePositionX: {
      type: Number,
      default: 0,
    },
    imagePositionY: {
      type: Number,
      default: 0,
    },
    imageOpacity: {
      type: Number,
      default: 80,
    },
    overlayType: {
      type: String,
      default: 'None',
    },
    imageRotation: {
      type: Number,
      default: 0,
    },
    imagePlacement: {
      type: String,
      default: 'Inside Header',
    },
    containerStyle: {
      type: String,
      default: 'None',
    },
    containerSize: {
      type: Number,
      default: 100,
    },
    containerBorder: {
      type: Boolean,
      default: false,
    },
    containerShadow: {
      type: Boolean,
      default: false,
    },
    containerPadding: {
      type: Number,
      default: 0,
    },
    imageFit: {
      type: String,
      default: 'Cover',
    },
    imageBlur: {
      type: Number,
      default: 0,
    },
    imageBrightness: {
      type: Number,
      default: 100,
    },
    imageContrast: {
      type: Number,
      default: 100,
    },
    imageSaturation: {
      type: Number,
      default: 100,
    },
    showQRCode: {
      type: Boolean,
      default: false,
    },
    qrType: {
      type: String,
      default: 'generated', // 'generated' | 'uploaded'
    },
    qrImage: {
      type: String,
      default: '',
    },
    qrTitle: {
      type: String,
      default: '',
    },
    qrDescription: {
      type: String,
      default: '',
    },
    qrSettings: {
      type: mongoose.Schema.Types.Mixed,
      default: { 
        bgColor: '#ffffff', 
        borderRadius: 16, 
        shadow: true, 
        border: true, 
        padding: 16, 
        width: 200 
      },
    },
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model('Card', cardSchema);
export default Card;
