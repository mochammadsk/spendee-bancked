const { Router } = require('express');
const auth = require('./auth.route');
const router = Router({ caseSensitive: false, strict: false });

// Auth routes
router.use('/auth', auth);

// 404 & Error handlers
router.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

module.exports = router;
