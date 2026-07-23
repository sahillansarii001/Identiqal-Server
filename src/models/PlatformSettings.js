import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: 'Identiqal',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowSignups: {
      type: Boolean,
      default: true,
    },
    defaultFreeSeats: {
      type: Number,
      default: 5,
    },
    supportEmail: {
      type: String,
      default: 'support@identiqal.com',
    },
    qrFeatureEnabled: {
      type: Boolean,
      default: true,
    },
    defaultQrTitle: {
      type: String,
      default: 'Scan Me',
    },
    defaultQrDescription: {
      type: String,
      default: 'Scan to connect instantly',
    },
    defaultQrSize: {
      type: Number,
      default: 200,
    },
  },
  {
    timestamps: true,
  }
);

// We only ever need one document in this collection
const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
export default PlatformSettings;
