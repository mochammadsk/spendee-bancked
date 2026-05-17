import { handle } from 'hono/vercel';
import app from '@/app.js';
import { connectDatabase } from '@/database/mongodb.js';

await connectDatabase();

export default handle(app);
