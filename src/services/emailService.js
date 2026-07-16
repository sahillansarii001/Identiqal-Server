import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const OAuth2 = google.auth.OAuth2;

/**
 * Creates the Nodemailer transporter configured with Google OAuth2
 */
const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI
    );

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN,
    });

    // Get a fresh access token
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          console.error("Failed to create access token", err);
          reject(err);
        }
        resolve(token);
      });
    });

    // Create the nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        accessToken,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (error) {
    console.error("Error setting up email transporter:", error);
    throw error;
  }
};

/**
 * Sends an OTP email to the specified address.
 * @param {string} toEmail - The recipient's email address
 * @param {string} otpCode - The OTP code to send
 */
export const sendOtpEmail = async (toEmail, otpCode) => {
  try {
    const emailTransporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: "Your Identiqal Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Authentication Required</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #4F46E5; letter-spacing: 5px;">${otpCode}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
        </div>
      `,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
