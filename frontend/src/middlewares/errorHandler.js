const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Handler Logs]:', err);
  }

  // Never leak stack traces to client, format as { error: { message, status } }
  return sendError(res, message, status);
};

module.exports = errorHandler;
