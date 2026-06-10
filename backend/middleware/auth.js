const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getJwtSecret } = require('../utils/jwtSecret');

// Base Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing.' });
    }

    // Verify JWT and catch specific expiration errors
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired. Please log in again.' });
      }
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    // Fetch user and make sure they are active
    const user = await User.findOne({ _id: decoded.userId, isActive: { $ne: false } });

    if (!user) {
      return res.status(401).json({ error: 'User account is inactive or does not exist.' });
    }

    // Attach token and user object to request
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

// Admin Authorization Middleware (Reuses the verified req.user)
const adminAuth = async (req, res, next) => {
  // 1. Run the base auth middleware first to ensure the user is logged in
  auth(req, res, () => {
    // 2. Check if the user has admin privileges
    // NOTE: Change 'admin' to 'coordinator' here if your system treats coordinators as admins
    if (req.user.role !== 'admin') { 
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    next();
  });
};

module.exports = {
  auth,
  adminAuth
};