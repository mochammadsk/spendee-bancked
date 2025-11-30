import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/authenticate';
import { limiter } from '../middlewares/limiter';
import { validate } from '../middlewares/validate';
import { signupValidator } from '../validators/authValidator';

const router = Router();

router.post(
  '/signup',
  limiter,
  validate(signupValidator),
  authController.signup
);
router.post('/otp/verify', limiter, authController.verifyOtp);
router.post('/otp/resend', limiter, authController.resendOtp);
router.post('/signin', limiter, authController.signin);
router.get('/keep-signed-in', authenticate, authController.keepSignedIn);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/signout', authenticate, authController.signout);

export default router;
