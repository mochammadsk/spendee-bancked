import dotenv from 'dotenv';
import { serve } from '@hono/node-server';
import app from './app.js';
import { connectDatabase } from './database/mongodb.js';

dotenv.config({
  quiet: true,
});

const port = Number(process.env.PORT);

const startServer = async () => {
  try {
    await connectDatabase();

    console.log('> Database connected');

    serve({
      fetch: app.fetch,
      port,
    });

    console.log(`> Server running on port ${port}`);
  } catch (error) {
    console.error('! Failed to start server:', error);

    process.exit(1);
  }
};

startServer();
