const db = require('../config/db');
const { pool } = db;

const toggleLike = async (videoId, userId) => {
  const client = await pool.connect();
  try {
    // Check if video exists
    const videoCheck = await client.query('SELECT id, like_count FROM videos WHERE id = $1', [videoId]);
    if (videoCheck.rows.length === 0) {
      const err = new Error('Video not found');
      err.status = 404;
      throw err;
    }

    await client.query('BEGIN');

    // Check if like exists
    const likeCheck = await client.query(
      'SELECT 1 FROM likes WHERE video_id = $1 AND user_id = $2',
      [videoId, userId]
    );

    let liked = false;
    let likeDiff = 0;

    if (likeCheck.rows.length === 0) {
      // Like does not exist, insert it
      await client.query(
        'INSERT INTO likes (video_id, user_id) VALUES ($1, $2)',
        [videoId, userId]
      );
      liked = true;
      likeDiff = 1;
    } else {
      // Like exists, delete it
      await client.query(
        'DELETE FROM likes WHERE video_id = $1 AND user_id = $2',
        [videoId, userId]
      );
      liked = false;
      likeDiff = -1;
    }

    // Update video like count
    const updateRes = await client.query(
      'UPDATE videos SET like_count = like_count + $1 WHERE id = $2 RETURNING like_count',
      [likeDiff, videoId]
    );

    await client.query('COMMIT');

    const updatedLikeCount = updateRes.rows[0].like_count;
    return { liked, like_count: updatedLikeCount };
  } catch (err) {
    await client.query('ROLLBACK');
    if (!err.status) err.status = 500;
    throw err;
  } finally {
    client.release();
  }
};

const toggleBookmark = async (videoId, userId) => {
  const client = await pool.connect();
  try {
    // Check if video exists
    const videoCheck = await client.query('SELECT id FROM videos WHERE id = $1', [videoId]);
    if (videoCheck.rows.length === 0) {
      const err = new Error('Video not found');
      err.status = 404;
      throw err;
    }

    await client.query('BEGIN');

    // Check if bookmark exists
    const bookmarkCheck = await client.query(
      'SELECT 1 FROM bookmarks WHERE video_id = $1 AND user_id = $2',
      [videoId, userId]
    );

    let bookmarked = false;

    if (bookmarkCheck.rows.length === 0) {
      await client.query(
        'INSERT INTO bookmarks (video_id, user_id) VALUES ($1, $2)',
        [videoId, userId]
      );
      bookmarked = true;
    } else {
      await client.query(
        'DELETE FROM bookmarks WHERE video_id = $1 AND user_id = $2',
        [videoId, userId]
      );
      bookmarked = false;
    }

    await client.query('COMMIT');
    return { bookmarked };
  } catch (err) {
    await client.query('ROLLBACK');
    if (!err.status) err.status = 500;
    throw err;
  } finally {
    client.release();
  }
};

const addComment = async (videoId, userId, content) => {
  try {
    if (!content || content.trim() === '') {
      const err = new Error('Comment content cannot be empty');
      err.status = 400;
      throw err;
    }

    // Check if video exists
    const videoCheck = await db.query('SELECT id FROM videos WHERE id = $1', [videoId]);
    if (videoCheck.rows.length === 0) {
      const err = new Error('Video not found');
      err.status = 404;
      throw err;
    }

    const insertQuery = `
      INSERT INTO comments (video_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, video_id, content, created_at
    `;
    const res = await db.query(insertQuery, [videoId, userId, content.trim()]);
    return res.rows[0];
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const getComments = async (videoId) => {
  try {
    // Check if video exists
    const videoCheck = await db.query('SELECT id FROM videos WHERE id = $1', [videoId]);
    if (videoCheck.rows.length === 0) {
      const err = new Error('Video not found');
      err.status = 404;
      throw err;
    }

    const selectQuery = `
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        u.id AS user_id, 
        u.username
      FROM comments c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.video_id = $1
      ORDER BY c.created_at DESC
    `;
    const res = await db.query(selectQuery, [videoId]);

    // Map rows into requested shape: [{ id, content, created_at, user: { id, username } }]
    return res.rows.map(row => ({
      id: row.id,
      content: row.content,
      created_at: row.created_at,
      user: {
        id: row.user_id,
        username: row.username
      }
    }));
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

module.exports = {
  toggleLike,
  toggleBookmark,
  addComment,
  getComments
};
