import { Hono } from 'hono';
import { rateLimiter } from 'hono-rate-limiter';
import { zValidator } from '@hono/zod-validator';
import { loginSchema } from './auth.schema.js';
import { authController } from './auth.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const authRoutes = new Hono();

const loginRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-6',
  keyGenerator: (c) => {
    return c.req.header('x-forwarded-for') ?? 'unknown';
  },
});

authRoutes.post('/login', loginRateLimiter, zValidator('json', loginSchema), authController.login);
authRoutes.post('/refresh', authController.refresh);
authRoutes.post('/logout', authMiddleware, authController.logout);

export default authRoutes;
