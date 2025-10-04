const router = require('express').Router();
const account = require('../controllers/account.controller');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate('owner'));

router.get('/', account.index);
router.get('/:id', account.detail);
router.post('/', account.store);
router.put('/:id', account.update);
router.delete('/:id', account.delete);

module.exports = router;
