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
    themeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
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
  },
  {
    timestamps: true,
  }
);

const Card = mongoose.model('Card', cardSchema);
export default Card;
