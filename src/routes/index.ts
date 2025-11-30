import { Request, Response, Router } from 'express';
import auth from './auth.route';

const router = Router({ caseSensitive: false, strict: false });

// Auth routes
router.use('/auth', auth);

// 404 handler
router.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

export default router;
