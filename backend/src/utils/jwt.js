const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// JWT secret key - should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256'
  });
};

// Verify JWT token
const verifyToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
    return { success: true, decoded };
  } catch (error) {
    let message = 'Invalid token';
    
    if (error.name === 'TokenExpiredError') {
      message = 'Token has expired';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Invalid token format';
    } else if (error.name === 'NotBeforeError') {
      message = 'Token not active yet';
    }
    
    return { success: false, error: message };
  }
};

// Middleware to authenticate JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const result = await verifyToken(token);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.error
      });
    }

    // Add user info to request object
    req.user = result.decoded;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

// Middleware to check if user owns resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.params.id || req.params.userId;
  const isOwner = req.user.userId === userId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  }

  next();
};

// Generate refresh token (longer expiration)
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    algorithm: 'HS256'
  });
};

// Extract token from request
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies if using cookie-based auth
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
};

// Decode token without verification (useful for getting expired token info)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  generateRefreshToken,
  extractToken,
  decodeToken,
  isTokenExpired,
  JWT_SECRET,
  JWT_EXPIRES_IN
};