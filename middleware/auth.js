const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fashion_boutique_secure_jwt_token_2026_xyz';

function verifyAdminToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Admin token required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = { verifyAdminToken, JWT_SECRET };
