const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const videoRoutes = require('./src/routes/videos');
const usersRoutes = require('./src/routes/users');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// CORS configuration: Allow all in development, restrict in production
if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : [];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or matching origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
} else {
  app.use(cors());
}

app.use(express.json());

// Serve videos statically from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/auth', authRoutes);
app.use('/videos', videoRoutes);
app.use('/users', usersRoutes);

// Register centralized error handler last (signature with 4 parameters is loaded inside errorHandler)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
