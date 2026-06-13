const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const videoRoutes = require('./src/routes/videos');
const usersRoutes = require('./src/routes/users');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Firebase experimental backend: requests arrive with the /_/backend prefix
// already stripped, so the app sees clean paths like /auth/login.
// In production on Firebase Hosting, the frontend and backend share the same
// origin, so CORS is not strictly needed — but we still allow it for local dev
// and any external clients.
if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

  app.use(cors({
    origin: (origin, callback) => {
      // No origin = same-origin request (Firebase proxy) or curl — always allow
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));
} else {
  // Wide-open in dev
  app.use(cors());
}

app.use(express.json());

// Serve uploaded video files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);
app.use('/users', usersRoutes);

// Health-check endpoint (useful for Firebase / Cloud Run probes)
app.get('/_health', (req, res) => res.json({ status: 'ok' }));

// Centralized error handler
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
