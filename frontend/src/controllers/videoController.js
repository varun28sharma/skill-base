const videoService = require('../services/videoService');
const { sendSuccess } = require('../utils/response');

const create = async (req, res) => {
  const { title, description, category } = req.body;
  if (!req.file) {
    const err = new Error('Video file is required');
    err.status = 400;
    throw err;
  }
  const file_path = `/uploads/${req.file.filename}`;
  const loggedInUserId = req.user.id;
  const video = await videoService.createVideo({ title, description, category, file_path }, loggedInUserId);
  return sendSuccess(res, video, 201);
};

const getAll = async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const videos = await videoService.getAllVideos(userId);
  return sendSuccess(res, videos, 200);
};

const getById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null;
  const video = await videoService.getVideoById(id, userId);
  return sendSuccess(res, video, 200);
};

module.exports = {
  create,
  getAll,
  getById
};
