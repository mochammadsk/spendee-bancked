const router = require('express').Router();
const auth = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');

router.post('/signin', auth.signin);
router.get('/keep-signed-in', authenticate('owner'), auth.keepSignedIn);

module.exports = router;
