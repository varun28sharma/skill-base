const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

// POST /auth/register - Public
router.post('/register', asyncHandler(authController.register));

// POST /auth/login - Public
router.post('/login', asyncHandler(authController.login));

// POST /auth/google - Public (exchanges Google identity for a local session JWT)
router.post('/google', asyncHandler(authController.googleLogin));

// GET /auth/me - Protected
router.get('/me', requireAuth, asyncHandler(authController.getMe));

module.exports = router;
