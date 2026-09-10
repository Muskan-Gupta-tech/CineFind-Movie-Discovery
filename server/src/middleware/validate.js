const { ApiError } = require('./errorHandler');

// Simple, explicit validators. No external validation library needed
// for a request surface this small.

function validatePage(req, res, next) {
  const page = req.query.page ? Number(req.query.page) : 1;

  if (!Number.isInteger(page) || page < 1 || page > 500) {
    return next(new ApiError(400, 'Page must be a positive integer.', 'INVALID_PAGE'));
  }

  req.page = page;
  next();
}

function validateSearchQuery(req, res, next) {
  const query = (req.query.query || '').trim();

  if (!query) {
    return next(new ApiError(400, 'Search query is required.', 'MISSING_QUERY'));
  }
  if (query.length > 200) {
    return next(new ApiError(400, 'Search query is too long.', 'QUERY_TOO_LONG'));
  }

  req.searchQuery = query;
  next();
}

function validateMovieId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return next(new ApiError(400, 'Invalid movie id.', 'INVALID_MOVIE_ID'));
  }

  req.movieId = id;
  next();
}

function validateWishlistPayload(req, res, next) {
  const { movieId, title } = req.body || {};

  if (!Number.isInteger(movieId) || movieId <= 0) {
    return next(new ApiError(400, 'A valid movieId is required.', 'INVALID_MOVIE_ID'));
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return next(new ApiError(400, 'A movie title is required.', 'MISSING_TITLE'));
  }

  next();
}

module.exports = {
  validatePage,
  validateSearchQuery,
  validateMovieId,
  validateWishlistPayload,
};
