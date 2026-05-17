import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  quiet: true,
});

const envSchema = z.object({
  PORT: z.string(),

  MONGODB_URI: z.string(),

  JWT_SECRET: z.string().min(1),

  JWT_REFRESH_SECRET: z.string().min(1),
});

export const env = envSchema.parse(process.env);
