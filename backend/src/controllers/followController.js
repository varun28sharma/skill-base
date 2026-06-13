const followService = require('../services/followService');
const { sendSuccess } = require('../utils/response');

const toggleFollow = async (req, res) => {
  const followerId = req.user.id;
  const followingId = req.params.id;
  const result = await followService.toggleFollow(followerId, followingId);
  return sendSuccess(res, result, 200);
};

const getNetwork = async (req, res) => {
  const userId = req.user.id;
  const network = await followService.getNetwork(userId);
  return sendSuccess(res, network, 200);
};

const acceptRequest = async (req, res) => {
  const receiverId = req.user.id;
  const senderId = req.params.id;
  const result = await followService.acceptRequest(receiverId, senderId);
  return sendSuccess(res, result, 200);
};

const rejectRequest = async (req, res) => {
  const receiverId = req.user.id;
  const senderId = req.params.id;
  const result = await followService.rejectRequest(receiverId, senderId);
  return sendSuccess(res, result, 200);
};

module.exports = {
  toggleFollow,
  getNetwork,
  acceptRequest,
  rejectRequest
};
