import mongoose from 'mongoose';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
