const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 4,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in 1 minute.' },
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const user = (req.body?.user_name || '').toLowerCase();
    return `${ip}:${user}`;
  },
});

module.exports = { limiter };
