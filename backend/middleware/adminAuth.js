/**
 * Admin Auth Middleware
 * Validates the Authorization header: "Basic <base64(username:password)>"
 * or a simple Bearer token stored in session via X-Admin-Token header.
 */

const adminAuth = (req, res, next) => {
  const token = req.headers['x-admin-token'];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin access required.' });
  }

  try {
    // token is base64(username:password)
    const decoded  = Buffer.from(token, 'base64').toString('utf-8');
    const [user, pass] = decoded.split(':');

    if (
      user === process.env.ADMIN_USERNAME &&
      pass === process.env.ADMIN_PASSWORD
    ) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Invalid admin credentials.' });
  } catch {
    return res.status(403).json({ success: false, message: 'Invalid token format.' });
  }
};

module.exports = adminAuth;
