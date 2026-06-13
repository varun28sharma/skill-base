const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const runInit = async () => {
  console.log('Connecting to database and running schema.sql...');
  const schemaPath = path.join(__dirname, '../../schema.sql');
  
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Run all DDL commands in schema.sql
    await db.query(schemaSql);
    console.log('Database schema initialized successfully. All tables, indexes, and extensions created.');
  } catch (err) {
    console.error('Failed to initialize database schema:', err);
  } finally {
    // Release pool connections
    await db.pool.end();
    process.exit(0);
  }
};

runInit();
