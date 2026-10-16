const express = require('express');
const { requireAuth, isAdminEmail } = require('../middleware/auth');

const router = express.Router();

// The frontend calls this after login to find out if the user is an admin
router.get('/me', requireAuth, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    isAdmin: isAdminEmail(req.user.email),
  });
});

module.exports = router;
