const db = require('../config/db');

const getCreatorById = async (creatorId, loggedInUserId = null) => {
  if (!creatorId) {
    return {
      id: '00000000-0000-0000-0000-000000000000',
      username: 'instructor',
      name: 'Instructor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
      isFollowing: false
    };
  }

  const res = await db.query('SELECT id, username, email FROM users WHERE id = $1', [creatorId]);
  if (res.rows.length > 0) {
    const user = res.rows[0];
    const index = (user.username.charCodeAt(0) || 0) % 5;
    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60'
    ];

    let isFollowing = false; // false | true | 'requested'
    if (loggedInUserId && loggedInUserId !== user.id) {
      // 1. Check if actually following (accepted)
      const followCheck = await db.query(
        'SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2',
        [loggedInUserId, user.id]
      );
      if (followCheck.rows.length > 0) {
        isFollowing = true;
      } else {
        // 2. Check if a request has been sent and is pending
        const reqCheck = await db.query(
          'SELECT 1 FROM follow_requests WHERE sender_id = $1 AND receiver_id = $2',
          [loggedInUserId, user.id]
        );
        if (reqCheck.rows.length > 0) {
          isFollowing = 'requested';
        }
      }
    }

    return {
      id: user.id,
      username: user.username,
      name: user.username.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      avatar: avatars[index],
      isFollowing
    };
  }

  return {
    id: creatorId,
    username: 'instructor',
    name: 'Instructor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
    isFollowing: false
  };
};

const createVideo = async ({ title, description, category, file_path }, userId) => {
  try {
    if (!title || !file_path) {
      const err = new Error('Title and file_path are required');
      err.status = 400;
      throw err;
    }

    const insertQuery = `
      INSERT INTO videos (title, description, category, file_path, user_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, description, category, file_path, like_count, user_id, created_at
    `;
    const res = await db.query(insertQuery, [title, description, category, file_path, userId]);
    const video = res.rows[0];

    video.comments = [];
    video.creator = await getCreatorById(video.user_id, userId);
    return video;
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const getAllVideos = async (userId = null) => {
  try {
    let query;
    let params = [];

    if (userId) {
      query = `
        SELECT 
          v.id, 
          v.title, 
          v.description, 
          v.category, 
          v.file_path, 
          v.like_count, 
          v.user_id,
          v.created_at,
          COALESCE(l.user_id IS NOT NULL, FALSE) AS "isLiked",
          COALESCE(b.user_id IS NOT NULL, FALSE) AS "isBookmarked"
        FROM videos v
        LEFT JOIN likes l ON v.id = l.video_id AND l.user_id = $1
        LEFT JOIN bookmarks b ON v.id = b.video_id AND b.user_id = $1
        ORDER BY v.created_at DESC
      `;
      params = [userId];
    } else {
      query = `
        SELECT 
          v.id, 
          v.title, 
          v.description, 
          v.category, 
          v.file_path, 
          v.like_count, 
          v.user_id,
          v.created_at,
          FALSE AS "isLiked",
          FALSE AS "isBookmarked"
        FROM videos v
        ORDER BY v.created_at DESC
      `;
    }

    const res = await db.query(query, params);
    const videos = res.rows;

    for (const video of videos) {
      // Fetch comments
      const commentRes = await db.query(
        `SELECT c.id, c.content, c.created_at, u.id AS user_id, u.username
         FROM comments c
         INNER JOIN users u ON c.user_id = u.id
         WHERE c.video_id = $1
         ORDER BY c.created_at DESC`,
        [video.id]
      );
      video.comments = commentRes.rows.map(row => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        user: {
          id: row.user_id,
          username: row.username
        }
      }));

      // Fetch creator
      video.creator = await getCreatorById(video.user_id, userId);
    }

    return videos;
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const getVideoById = async (id, userId = null) => {
  try {
    let query;
    let params = [];

    if (userId) {
      query = `
        SELECT 
          v.id, 
          v.title, 
          v.description, 
          v.category, 
          v.file_path, 
          v.like_count, 
          v.user_id,
          v.created_at,
          COALESCE(l.user_id IS NOT NULL, FALSE) AS "isLiked",
          COALESCE(b.user_id IS NOT NULL, FALSE) AS "isBookmarked"
        FROM videos v
        LEFT JOIN likes l ON v.id = l.video_id AND l.user_id = $1
        LEFT JOIN bookmarks b ON v.id = b.video_id AND b.user_id = $1
        WHERE v.id = $2
      `;
      params = [userId, id];
    } else {
      query = `
        SELECT 
          v.id, 
          v.title, 
          v.description, 
          v.category, 
          v.file_path, 
          v.like_count, 
          v.user_id,
          v.created_at,
          FALSE AS "isLiked",
          FALSE AS "isBookmarked"
        FROM videos v
        WHERE v.id = $1
      `;
      params = [id];
    }

    const res = await db.query(query, params);
    if (res.rows.length === 0) {
      const err = new Error('Video not found');
      err.status = 404;
      throw err;
    }
    const video = res.rows[0];

    const commentRes = await db.query(
      `SELECT c.id, c.content, c.created_at, u.id AS user_id, u.username
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.video_id = $1
       ORDER BY c.created_at DESC`,
      [video.id]
    );
    video.comments = commentRes.rows.map(row => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        username: row.username
      }
    }));

    video.creator = await getCreatorById(video.user_id, userId);

    return video;
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

module.exports = {
  createVideo,
  getAllVideos,
  getVideoById
};
