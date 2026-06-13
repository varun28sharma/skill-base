const db = require('../config/db');

const toggleFollow = async (followerId, followingId) => {
  try {
    if (followerId === followingId) {
      const err = new Error('You cannot follow yourself');
      err.status = 400;
      throw err;
    }

    const userCheck = await db.query('SELECT id FROM users WHERE id = $1', [followingId]);
    if (userCheck.rows.length === 0) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    // 1. Check if already following (accepted)
    const followCheck = await db.query(
      'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );

    if (followCheck.rows.length > 0) {
      // Unfollow
      await db.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [followerId, followingId]
      );
      return { isFollowing: false };
    }

    // 2. Check if follow request is pending
    const reqCheck = await db.query(
      'SELECT 1 FROM follow_requests WHERE sender_id = $1 AND receiver_id = $2',
      [followerId, followingId]
    );

    if (reqCheck.rows.length > 0) {
      // Cancel follow request
      await db.query(
        'DELETE FROM follow_requests WHERE sender_id = $1 AND receiver_id = $2',
        [followerId, followingId]
      );
      return { isFollowing: false };
    } else {
      // Send new follow request
      await db.query(
        'INSERT INTO follow_requests (sender_id, receiver_id) VALUES ($1, $2)',
        [followerId, followingId]
      );
      return { isFollowing: 'requested' };
    }
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const getPendingRequests = async (userId) => {
  try {
    const query = `
      SELECT u.id, u.username, u.email
      FROM users u
      JOIN follow_requests r ON r.sender_id = u.id
      WHERE r.receiver_id = $1
      ORDER BY r.created_at DESC
    `;
    const res = await db.query(query, [userId]);
    return res.rows.map(attachAvatar);
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const acceptRequest = async (receiverId, senderId) => {
  try {
    // Verify request exists
    const check = await db.query(
      'SELECT 1 FROM follow_requests WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );

    if (check.rows.length === 0) {
      const err = new Error('Follow request not found');
      err.status = 404;
      throw err;
    }

    // Insert follow relationship & delete request in a transaction
    await db.query('BEGIN');
    
    // Add to follows
    await db.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [senderId, receiverId]
    );
    
    // Delete follow request
    await db.query(
      'DELETE FROM follow_requests WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );

    await db.query('COMMIT');
    return { accepted: true };
  } catch (err) {
    await db.query('ROLLBACK');
    if (!err.status) err.status = 500;
    throw err;
  }
};

const rejectRequest = async (receiverId, senderId) => {
  try {
    await db.query(
      'DELETE FROM follow_requests WHERE sender_id = $1 AND receiver_id = $2',
      [senderId, receiverId]
    );
    return { rejected: true };
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const getNetwork = async (userId) => {
  try {
    // 1. Followers (people following us)
    const followersQuery = `
      SELECT u.id, u.username, u.email,
             EXISTS(
               SELECT 1 FROM follows f2 
               WHERE f2.follower_id = $1 AND f2.following_id = u.id
             ) AS is_following
      FROM users u
      JOIN follows f ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
    `;
    const followersRes = await db.query(followersQuery, [userId]);

    // 2. Following (people we follow)
    const followingQuery = `
      SELECT u.id, u.username, u.email, true AS is_following
      FROM users u
      JOIN follows f ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `;
    const followingRes = await db.query(followingQuery, [userId]);

    // 3. Suggestions (other users, not us, whom we do NOT follow and do NOT have a pending request to)
    const suggestedQuery = `
      SELECT u.id, u.username, u.email, false AS is_following
      FROM users u
      WHERE u.id <> $1
        AND NOT EXISTS(
          SELECT 1 FROM follows f 
          WHERE f.follower_id = $1 AND f.following_id = u.id
        )
        AND NOT EXISTS(
          SELECT 1 FROM follow_requests r 
          WHERE r.sender_id = $1 AND r.receiver_id = u.id
        )
      LIMIT 10
    `;
    const suggestedRes = await db.query(suggestedQuery, [userId]);

    // 4. Pending Requests (incoming follow requests)
    const requests = await getPendingRequests(userId);

    return {
      followers: followersRes.rows.map(attachAvatar),
      following: followingRes.rows.map(attachAvatar),
      suggested: suggestedRes.rows.map(attachAvatar),
      requests
    };
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const attachAvatar = (user) => {
  const index = (user.username.charCodeAt(0) || 0) % 5;
  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60'
  ];
  return {
    ...user,
    avatar: avatars[index],
    name: user.username.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  };
};

module.exports = {
  toggleFollow,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  getNetwork
};
