import QRCode from 'qrcode';

/**
 * Generates a QR Code as a Data URL for the given card slug.
 * @param {string} url - The absolute URL of the public card.
 * @returns {Promise<string>} The QR Code data URL.
 */
export const generateQrCodeDataUrl = async (url) => {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
    });
    return dataUrl;
  } catch (error) {
    throw new Error(`Failed to generate QR Code: ${error.message}`);
  }
};
