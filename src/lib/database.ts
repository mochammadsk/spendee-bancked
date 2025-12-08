import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ quiet: true });

let connPromise: Promise<typeof mongoose> | null = null;

export async function connectDB() {
  if (connPromise) return connPromise;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  connPromise = mongoose
    .connect(process.env.MONGODB_URI)
    .then((m) => {
      console.log('[INFO] MongoDB connected');
      return m;
    })
    .catch((err) => {
      connPromise = null;
      console.error('[INFO] MongoDB Connection error:', err);
      throw err;
    });

  return connPromise;
}

export default { connectDB };
