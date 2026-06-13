const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

const register = async (req, res) => {
  const { email, password } = req.body;
  // Fallback to name if username is not provided (frontend registers with name)
  const username = req.body.username || req.body.name;
  const result = await authService.register(email, username, password);
  return sendSuccess(res, result, 201); // result = { user, token }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  return sendSuccess(res, result, 200);
};

const getMe = async (req, res) => {
  // req.user was attached by authMiddleware.requireAuth
  return sendSuccess(res, { user: req.user }, 200);
};

const googleLogin = async (req, res) => {
  const { email } = req.body;
  const username = req.body.username || req.body.name;
  const result = await authService.googleLogin(email, username);
  return sendSuccess(res, result, 200);
};

module.exports = {
  register,
  login,
  getMe,
  googleLogin
};
