import mongoose from 'mongoose';
import logger from '../utils/logger';

let cachedConnection: typeof mongoose | null = null;

export const connectDB = async (): Promise<void> => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return;
  }

  const connStr = process.env.MONGODB_URI;

  if (!connStr) {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      logger.warn('MONGODB_URI is not set. Non-database API services (Health, CAPTCHA, AI) will continue working.');
      return;
    }
  }

  const targetUri = connStr || 'mongodb://127.0.0.1:27017/skillnexa';

  try {
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 3500,
      connectTimeoutMS: 3500,
      bufferCommands: false,
    });
    cachedConnection = conn;
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    logger.warn(`MongoDB Connection Warning: ${error.message}. Non-database API services will continue working.`);
  }
};
