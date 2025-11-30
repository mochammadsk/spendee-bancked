import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

type MongooseCached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  namespace NodeJS {
    interface Global {
      _mongoose?: MongooseCached;
    }
  }
}

const globalWithMongoose = global as unknown as NodeJS.Global & {
  _mongoose?: MongooseCached;
};

let cached: MongooseCached =
  globalWithMongoose._mongoose ||
  (globalWithMongoose._mongoose = { conn: null, promise: null });

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment');
    }
    cached.promise = mongoose
      .connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default { connectDB };
