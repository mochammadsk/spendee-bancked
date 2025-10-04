const { Router } = require('express');
const auth = require('./auth.route');
const account = require('./account.route');
const router = Router({ caseSensitive: false, strict: false });

// Auth routes
router.use('/auth', auth);

// Account routes
router.use('/accounts', account);

// 404 & Error handlers
router.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = router;
