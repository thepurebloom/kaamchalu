// src/middleware/auth.js
const supabase = require('../config/supabase');

/**
 * Middleware that extracts the Bearer token, fetches the user from Supabase, 
 * and attaches the user data to req.user.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid Bearer token' });
    }

    const token = authHeader.split(' ')[1];
    
    // Validates the JWT with Supabase and fetches the user object
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    res.status(500).json({ success: false, error: 'Internal server error during authentication' });
  }
};

module.exports = authMiddleware;
