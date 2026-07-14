import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || 'fallback_access_token_secret_321',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_token_secret_123',
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/identiqal',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  PAYMENT_PROVIDER_KEY: process.env.PAYMENT_PROVIDER_KEY || 'mock_payment_key',
  PAYMENT_PROVIDER_WEBHOOK_SECRET: process.env.PAYMENT_PROVIDER_WEBHOOK_SECRET || 'mock_webhook_secret',
  MAIL_SMTP_HOST: process.env.MAIL_SMTP_HOST || 'localhost',
  MAIL_SMTP_USER: process.env.MAIL_SMTP_USER || '',
  MAIL_SMTP_PASS: process.env.MAIL_SMTP_PASS || '',
};

export default env;
