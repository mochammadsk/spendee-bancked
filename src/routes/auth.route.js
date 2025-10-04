const auth = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { limiter } = require('../middlewares/rateLimit');
const router = require('express').Router();

router.post('/signin', limiter, auth.signin);
router.get('/keep-signed-in', authenticate('owner'), auth.keepSignedIn);

module.exports = router;
