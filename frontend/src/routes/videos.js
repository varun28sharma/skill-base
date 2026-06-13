const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const interactionController = require('../controllers/interactionController');
const { requireAuth, optionalAuth } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middlewares/upload');

// Video Endpoints
router.post('/', requireAuth, upload.single('video'), asyncHandler(videoController.create));
router.get('/', optionalAuth, asyncHandler(videoController.getAll));
router.get('/:id', optionalAuth, asyncHandler(videoController.getById));

// Interaction Endpoints (Protected)
router.post('/:id/like', requireAuth, asyncHandler(interactionController.like));
router.post('/:id/bookmark', requireAuth, asyncHandler(interactionController.bookmark));
router.post('/:id/comment', requireAuth, asyncHandler(interactionController.comment));
router.post('/:id/comments', requireAuth, asyncHandler(interactionController.comment));

// Comments fetching is public
router.get('/:id/comments', asyncHandler(interactionController.getComments));

module.exports = router;
