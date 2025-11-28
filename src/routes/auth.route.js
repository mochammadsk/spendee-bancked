const auth = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { limiter } = require('../middlewares/rateLimit');
const { validate } = require('../middlewares/validate');
const { signupValidator } = require('../validators/authValidator');
const router = require('express').Router();

router.post('/signup', limiter, validate(signupValidator), auth.signup);
router.post('/signin', limiter, auth.signin);
router.get('/keep-signed-in', authenticate, auth.keepSignedIn);

module.exports = router;
