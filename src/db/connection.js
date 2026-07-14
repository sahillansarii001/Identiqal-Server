import mongoose from 'mongoose';
import { dbConfig } from '../config/db.config.js';

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(dbConfig.uri, dbConfig.options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
