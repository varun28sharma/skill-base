const db = require('../config/db');

const createVideo = async ({ title, description, category, file_path }) => {
  try {
    if (!title || !file_path) {
      const err = new Error('Title and file_path are required');
      err.status = 400;
      throw err;
    }

    const insertQuery = `
      INSERT INTO videos (title, description, category, file_path)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, category, file_path, like_count, created_at
    `;
    const res = await db.query(insertQuery, [title, description, category, file_path]);
    return res.rows[0];
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
          v.created_at,
          FALSE AS "isLiked",
          FALSE AS "isBookmarked"
        FROM videos v
        ORDER BY v.created_at DESC
      `;
    }

    const res = await db.query(query, params);
    const videos = res.rows;

    // Pre-load and attach comments for each video
    for (const video of videos) {
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

    // Fetch and attach comments
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
