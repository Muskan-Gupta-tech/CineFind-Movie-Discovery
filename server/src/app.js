const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const movieRoutes = require('./routes/movieRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  })
);
app.use(express.json());

// Simple request logger - method, path, status, response time.
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CineFind API is running' });
});

app.use('/api/movies', movieRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 404 for anything else under /api
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found', errorCode: 'NOT_FOUND' });
});

// Must be the last middleware registered.
app.use(errorHandler);

module.exports = app;
