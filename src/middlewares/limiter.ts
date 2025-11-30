import { Request } from 'express';
import { rateLimit } from 'express-rate-limit';

function getClientIp(req: Request): string {
  if (req.ip) return req.ip;

  const forwardedHeader = req.headers['x-forwarded-for'];
  if (typeof forwardedHeader === 'string' && forwardedHeader.length > 0) {
    const first = forwardedHeader.split(',')[0]?.trim();
    if (first) return first;
  }

  const socketAddr = req.socket?.remoteAddress;
  if (socketAddr) return socketAddr;

  const connAddr = (req.connection as any)?.remoteAddress;
  if (connAddr) return connAddr as string;

  return '';
}

export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 4,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 1 minute.' },

  keyGenerator: (req: Request) => {
    const ip = getClientIp(req);
    const user = (req.body?.user_name || '').toString().toLowerCase();
    return `${ip}:${user}`;
  },
});
