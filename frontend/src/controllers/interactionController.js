const interactionService = require('../services/interactionService');
const { sendSuccess } = require('../utils/response');

const like = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await interactionService.toggleLike(id, userId);
  return sendSuccess(res, result, 200);
};

const bookmark = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const result = await interactionService.toggleBookmark(id, userId);
  return sendSuccess(res, result, 200);
};

const comment = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const content = req.body.content || req.body.text;
  const result = await interactionService.addComment(id, userId, content);
  return sendSuccess(res, result, 201);
};

const getComments = async (req, res) => {
  const { id } = req.params;
  const comments = await interactionService.getComments(id);
  return sendSuccess(res, comments, 200);
};

module.exports = {
  like,
  bookmark,
  comment,
  getComments
};
