import app from '../backend/src/app';
import { connectDB } from '../backend/src/config/db';

let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Failed to connect to MongoDB in serverless function:', err);
    }
  }
  return app(req, res);
}
