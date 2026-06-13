const db = require('../config/db');

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

const runSeed = async () => {
  console.log('Starting database seeding...');
  const { pool } = db;
  try {
    // Verify database connection
    await db.query('SELECT NOW()');
    console.log('Database connection verified.');

    // Delete old placeholder seed records if they exist
    const oldPaths = ['/uploads/video1.mp4', '/uploads/video2.mp4', '/uploads/video3.mp4'];
    for (const oldPath of oldPaths) {
      await db.query('DELETE FROM videos WHERE file_path = $1', [oldPath]);
    }
    console.log('Cleared placeholder video seed entries.');

    for (const video of seedVideos) {
      // Check for duplicate path to avoid adding same video multiple times
      const checkRes = await db.query('SELECT 1 FROM videos WHERE file_path = $1', [video.file_path]);
      if (checkRes.rows.length === 0) {
        await db.query(
          'INSERT INTO videos (title, description, category, file_path) VALUES ($1, $2, $3, $4)',
          [video.title, video.description, video.category, video.file_path]
        );
        console.log(`Seeded video: "${video.title}"`);
      } else {
        console.log(`Video with path "${video.file_path}" already exists, skipping.`);
      }
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
