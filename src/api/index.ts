import { handle } from 'hono/vercel';
import { connectDatabase } from '../database/mongodb.js';
import app from '../app.js';

await connectDatabase();

export default handle(app);
