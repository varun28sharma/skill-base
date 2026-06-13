/**
 * Consistent response shape:
 * Success: { data: ... }
 * Failure: { error: { message, status } }
 */

const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json({ data });
};

const sendError = (res, message, status = 500) => {
  return res.status(status).json({
    error: {
      message,
      status
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};
