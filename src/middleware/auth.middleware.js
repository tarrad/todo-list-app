const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      maxAge: process.env.JWT_EXPIRES_IN,
      clockTolerance: 30 // Allow 30 seconds of clock skew
    });

    // Additional validation for token claims
    if (!decoded.iat || decoded.iat > Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ message: 'Invalid token issue time' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      maxAge: process.env.JWT_EXPIRES_IN,
      clockTolerance: 30
    });

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new Error('User not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Token has expired'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Invalid token'));
    }
    next(new Error('Authentication error'));
  }
};

module.exports = {
  authMiddleware,
  authenticateSocket
}; 