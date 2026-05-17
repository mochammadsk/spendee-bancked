import mongoose from 'mongoose';
import { env } from '../config/env.js';

let isConnected = false;

export const connectDatabase = async () => {
  if (isConnected) {
    return;
  }

  await mongoose.connect(env.MONGODB_URI);

  isConnected = true;

  console.log('> Database connected');
};
