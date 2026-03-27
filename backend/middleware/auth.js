import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to verify JWT token and protect routes
export const protect = async (req, res, next) => {
  const token =
    req.header('x-auth-token') ||
    (req.header('Authorization')?.startsWith('Bearer ')
      ? req.header('Authorization').slice(7)
      : null);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token, authorization denied',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded.user || decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Token is not valid',
    });
  }
};

// Middleware to restrict access by role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

export default protect;