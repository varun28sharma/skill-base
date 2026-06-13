const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { requireAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

// POST /users/:id/follow - Toggle follow / send follow request
router.post('/:id/follow', requireAuth, asyncHandler(followController.toggleFollow));

// GET /users/network - Get user followers, following, pending requests, and suggestions
router.get('/network', requireAuth, asyncHandler(followController.getNetwork));

// POST /users/follow-requests/:id/accept - Accept incoming follow request
router.post('/follow-requests/:id/accept', requireAuth, asyncHandler(followController.acceptRequest));

// POST /users/follow-requests/:id/reject - Reject/Ignore incoming follow request
router.post('/follow-requests/:id/reject', requireAuth, asyncHandler(followController.rejectRequest));

module.exports = router;
