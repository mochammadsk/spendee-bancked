const { authenticate } = require('../middlewares/auth');
const { limiter } = require('../middlewares/rateLimit');
const { signupValidator } = require('../validators/authValidator');
const auth = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const router = require('express').Router();

router.post('/signup', limiter, validate(signupValidator), auth.signup);
router.post('/verify-otp', limiter, auth.verifyOtp);
router.post('/resend-otp', limiter, auth.resendOtp);
router.post('/signin', limiter, auth.signin);
router.get('/keep-signed-in', authenticate, auth.keepSignedIn);

module.exports = router;
