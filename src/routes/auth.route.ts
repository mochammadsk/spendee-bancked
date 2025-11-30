import { Router } from 'express';
import authenticateDefault, * as authMiddleware from '../middlewares/authenticate';
import { limiter } from '../middlewares/limiter';
import { signupValidator } from '../validators/authValidator';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';

const router = Router();

const authenticate =
  (authMiddleware as any).default ??
  (authMiddleware as any).authenticate ??
  authenticateDefault;

router.post(
  '/signup',
  limiter,
  validate(signupValidator),
  (authController as any).signup
);
router.post('/otp/verify', limiter, (authController as any).verifyOtp);
router.post('/otp/resend', limiter, (authController as any).resendOtp);
router.post('/signin', limiter, (authController as any).signin);
router.get(
  '/keep-signed-in',
  authenticate,
  (authController as any).keepSignedIn
);
router.post('/forgot-password', (authController as any).forgotPassword);
router.post('/reset-password', (authController as any).resetPassword);
router.post('/signout', authenticate, (authController as any).signout);

export default router;
