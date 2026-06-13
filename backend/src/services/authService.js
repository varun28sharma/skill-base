const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (email, username, password) => {
  try {
    if (!email || !username || !password) {
      const err = new Error('Missing required fields: email, username, and password are required');
      err.status = 400;
      throw err;
    }

    // Check if user already exists
    const checkUserQuery = 'SELECT id, email, username FROM users WHERE email = $1 OR username = $2';
    const checkUserRes = await db.query(checkUserQuery, [email, username]);

    if (checkUserRes.rows.length > 0) {
      const existing = checkUserRes.rows[0];
      const err = new Error(
        existing.email === email ? 'Email already exists' : 'Username already exists'
      );
      err.status = 409;
      throw err;
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into DB
    const insertQuery = `
      INSERT INTO users (email, username, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, email, username
    `;
    const insertRes = await db.query(insertQuery, [email, username, passwordHash]);
    return insertRes.rows[0];
  } catch (err) {
    if (!err.status) {
      if (err.code === '23505') {
        err.status = 409;
        if (err.detail && err.detail.includes('email')) {
          err.message = 'Email already exists';
        } else if (err.detail && err.detail.includes('username')) {
          err.message = 'Username already exists';
        } else {
          err.message = 'User already exists';
        }
      } else {
        err.status = 500;
      }
    }
    throw err;
  }
};

const login = async (email, password) => {
  try {
    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.status = 400;
      throw err;
    }

    const selectQuery = 'SELECT id, email, username, password_hash FROM users WHERE email = $1';
    const selectRes = await db.query(selectQuery, [email]);

    if (selectRes.rows.length === 0) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    const user = selectRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const getUserById = async (id) => {
  try {
    const selectQuery = 'SELECT id, email, username FROM users WHERE id = $1';
    const selectRes = await db.query(selectQuery, [id]);
    return selectRes.rows[0] || null;
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

const googleLogin = async (email, username) => {
  try {
    if (!email) {
      const err = new Error('Email is required');
      err.status = 400;
      throw err;
    }

    // Check if user exists by email
    const checkQuery = 'SELECT id, email, username FROM users WHERE email = $1';
    const checkRes = await db.query(checkQuery, [email]);

    let user;

    if (checkRes.rows.length > 0) {
      user = checkRes.rows[0];
    } else {
      // Create user with dummy password hash
      const dummyPasswordHash = 'GOOGLE_AUTH_EXTERNAL_USER';
      const finalUsername = username || email.split('@')[0];
      
      // Ensure username is unique
      const checkUsernameRes = await db.query('SELECT 1 FROM users WHERE username = $1', [finalUsername]);
      let uniqueUsername = finalUsername;
      if (checkUsernameRes.rows.length > 0) {
        uniqueUsername = `${finalUsername}_${Math.floor(Math.random() * 1000)}`;
      }

      const insertQuery = `
        INSERT INTO users (email, username, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, username
      `;
      const insertRes = await db.query(insertQuery, [email, uniqueUsername, dummyPasswordHash]);
      user = insertRes.rows[0];
    }

    // Generate local JWT token signed with JWT_SECRET
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };
  } catch (err) {
    if (!err.status) err.status = 500;
    throw err;
  }
};

module.exports = {
  register,
  login,
  getUserById,
  googleLogin
};
