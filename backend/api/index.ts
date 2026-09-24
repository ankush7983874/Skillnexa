import app from '../src/app';
import { connectDB } from '../src/config/db';

let isConnecting = false;

export default async function handler(req: any, res: any) {
  // Initiate MongoDB connection non-blockingly for high serverless throughput
  if (process.env.MONGODB_URI && !isConnecting) {
    isConnecting = true;
    connectDB().catch((err) => {
      console.warn('Background MongoDB connection error:', err?.message || err);
      isConnecting = false;
    });
  }

  // Handle CORS pre-flight OPTIONS immediately
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    return res.status(200).end();
  }

  return app(req, res);
}
