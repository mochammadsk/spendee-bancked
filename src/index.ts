import { serve } from '@hono/node-server';
import app from '@/app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = Number(process.env.PORT);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on port ${port}`);
