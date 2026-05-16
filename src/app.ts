import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('*', logger());

app.use(
  '*',
  cors({
    origin: '*',
    credentials: true,
  })
);

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'API running',
  });
});

export default app;
