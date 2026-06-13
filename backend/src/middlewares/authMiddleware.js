const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next({ status: 401, message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next({ status: 401, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return next({ status: 401, message: 'Unauthorized' });
    }

    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      return next({ status: 401, message: 'Unauthorized' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username
    };

    return next();
  } catch (err) {
    const status = err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' ? 401 : (err.status || 500);
    const message = status === 401 ? 'Unauthorized' : err.message;
    return next({ status, message });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.userId) {
          const user = await authService.getUserById(decoded.userId);
          if (user) {
            req.user = {
              id: user.id,
              email: user.email,
              username: user.username
            };
          }
        }
      }
    }
    return next();
  } catch (err) {
    // Proceed without attaching user if invalid
    return next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};
