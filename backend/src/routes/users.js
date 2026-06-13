const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { requireAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const db = require('../config/db');

// GET /users/list — Public: return all registered user names for Google sign-in picker
router.get('/list', asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT id, username FROM users ORDER BY created_at DESC'
  );
  return sendSuccess(res, { users: result.rows });
}));

// POST /users/:id/follow - Toggle follow / send follow request
router.post('/:id/follow', requireAuth, asyncHandler(followController.toggleFollow));

// GET /users/network - Get user followers, following, pending requests, and suggestions
router.get('/network', requireAuth, asyncHandler(followController.getNetwork));

// POST /users/follow-requests/:id/accept - Accept incoming follow request
router.post('/follow-requests/:id/accept', requireAuth, asyncHandler(followController.acceptRequest));

// POST /users/follow-requests/:id/reject - Reject/Ignore incoming follow request
router.post('/follow-requests/:id/reject', requireAuth, asyncHandler(followController.rejectRequest));

module.exports = router;
