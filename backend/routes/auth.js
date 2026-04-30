const express = require('express');
const router  = express.Router();

// POST /api/auth/login — returns a base64 token for admin use
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return res.json({ success: true, token, message: 'Login successful.' });
  }
  res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

// GET /api/auth/verify — verify admin token
router.get('/verify', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (!token) return res.status(401).json({ success: false });
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [user, pass] = decoded.split(':');
    if (user === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD) {
      return res.json({ success: true, message: 'Token valid.' });
    }
  } catch {}
  res.status(403).json({ success: false, message: 'Invalid token.' });
});

module.exports = router;
