const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seedVideos = [
  {
    title: 'Introduction to German',
    description: 'Learn the basics of the German language, greetings, and common phrases.',
    category: 'German',
    file_path: '/uploads/Introduction_German.mp4'
  },
  {
    title: 'Learning German Basics',
    description: 'Understanding grammar structure and key vocabulary in German.',
    category: 'German',
    file_path: '/uploads/Learning_German.mp4'
  },
  {
    title: 'German Short Story Practice',
    description: 'Improve your German listening comprehension with a short story reading.',
    category: 'German',
    file_path: '/uploads/Story_German.mp4'
  }
];

const dummyUsers = [
  { email: 'dsa_mentor@skillbase.edu', username: 'dsa_mentor' },
  { email: 'react_wizard@skillbase.edu', username: 'react_wizard' },
  { email: 'german_native@skillbase.edu', username: 'german_native' },
  { email: 'ai_researcher@skillbase.edu', username: 'ai_researcher' }
];

const runSeed = async () => {
  console.log('Starting database seeding...');
  const { pool } = db;
  try {
    // Verify database connection
    await db.query('SELECT NOW()');
    console.log('Database connection verified.');

    // Seed dummy users
    const hash = await bcrypt.hash('password123', 10);
    console.log('Seeding dummy users...');
    const userMap = {};

    for (const user of dummyUsers) {
      const checkRes = await db.query('SELECT id FROM users WHERE email = $1 OR username = $2', [user.email, user.username]);
      let userId;
      if (checkRes.rows.length === 0) {
        const insertRes = await db.query(
          'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id',
          [user.email, user.username, hash]
        );
        userId = insertRes.rows[0].id;
        console.log(`Seeded user: "${user.username}"`);
      } else {
        userId = checkRes.rows[0].id;
        console.log(`User already exists: "${user.username}"`);
      }
      userMap[user.username] = userId;
    }

    // Delete old placeholder seed records if they exist
    const oldPaths = ['/uploads/video1.mp4', '/uploads/video2.mp4', '/uploads/video3.mp4'];
    for (const oldPath of oldPaths) {
      await db.query('DELETE FROM videos WHERE file_path = $1', [oldPath]);
    }
    console.log('Cleared placeholder video seed entries.');

    // Seed videos
    for (const video of seedVideos) {
      // Find creator ID based on category
      let creatorUsername = 'ai_researcher';
      const cat = video.category.toLowerCase();
      if (cat.includes('german')) {
        creatorUsername = 'german_native';
      } else if (cat.includes('react') || cat.includes('web')) {
        creatorUsername = 'react_wizard';
      } else if (cat.includes('dsa') || cat.includes('design')) {
        creatorUsername = 'dsa_mentor';
      }
      
      const creatorId = userMap[creatorUsername] || null;

      const checkRes = await db.query('SELECT id FROM videos WHERE file_path = $1', [video.file_path]);
      if (checkRes.rows.length === 0) {
        await db.query(
          'INSERT INTO videos (title, description, category, file_path, user_id) VALUES ($1, $2, $3, $4, $5)',
          [video.title, video.description, video.category, video.file_path, creatorId]
        );
        console.log(`Seeded video: "${video.title}" (creator: ${creatorUsername})`);
      } else {
        // Update user_id of existing video if missing
        await db.query(
          'UPDATE videos SET user_id = $1 WHERE file_path = $2 AND user_id IS NULL',
          [creatorId, video.file_path]
        );
        console.log(`Video with path "${video.file_path}" already exists, updated creator.`);
      }
    }

    // Clean up any remaining videos that have NULL user_id (e.g. from prior runs/tests)
    const defaultCreatorId = userMap['react_wizard'] || Object.values(userMap)[0];
    if (defaultCreatorId) {
      const updateNullRes = await db.query(
        'UPDATE videos SET user_id = $1 WHERE user_id IS NULL',
        [defaultCreatorId]
      );
      console.log(`Updated ${updateNullRes.rowCount} videos with NULL creator to default creator ID (react_wizard).`);
    }

    console.log('Database seeding completed successfully.');
  } catch (err) {
    console.error('Database seeding failed:', err);
  } finally {
    // End the pool connection to release event loop and allow script to exit
    await pool.end();
    process.exit(0);
  }
};

runSeed();
