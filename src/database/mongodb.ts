import mongoose from 'mongoose';
import { env } from '@/config/env.js';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log('> Database connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
