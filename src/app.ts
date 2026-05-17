import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import authRoutes from './modules/auth/auth.routes.js';

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

// Routes
app.route('/api/auth', authRoutes);

export default app;
