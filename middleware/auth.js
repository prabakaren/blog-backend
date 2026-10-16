const { getFirebaseAdmin } = require('../config/firebase');

function adminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  return !!email && adminEmails().includes(email.toLowerCase());
}

async function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const decoded = await getFirebaseAdmin().auth().verifyIdToken(header.slice(7));
  return { uid: decoded.uid, email: decoded.email, name: decoded.name };
}

// Token is optional (used for public routes that can personalise the response)
async function optionalAuth(req, res, next) {
  try {
    req.user = await readToken(req);
  } catch (err) {
    req.user = null;
  }
  next();
}

// Token is required
async function requireAuth(req, res, next) {
  try {
    const user = await readToken(req);
    if (!user) return res.status(401).json({ message: 'Please log in first' });
    req.user = user;
    next();
  } catch (err) {
    console.error('Token check failed:', err.message);
    res.status(401).json({ message: 'Your session is invalid or has expired' });
  }
}

// Token is required and the email must be in ADMIN_EMAILS
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!isAdminEmail(req.user.email)) {
      return res.status(403).json({ message: 'Admin access only' });
    }
    next();
  });
}

module.exports = { optionalAuth, requireAuth, requireAdmin, isAdminEmail };
