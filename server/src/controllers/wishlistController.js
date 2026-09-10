const { WishlistMovie } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

async function getWishlist(req, res, next) {
  try {
    const items = await WishlistMovie.findAll({ order: [['createdAt', 'DESC']] });

    const data = items.map((item) => ({
      movieId: item.movieId,
      title: item.title,
      posterUrl: item.posterUrl,
      releaseDate: item.releaseDate,
      rating: item.rating,
      addedAt: item.createdAt,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const { movieId, title, posterUrl, releaseDate, rating } = req.body;

    const existing = await WishlistMovie.findOne({ where: { movieId } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Movie already exists in wishlist',
        errorCode: 'DUPLICATE_WISHLIST_ITEM',
      });
    }

    const created = await WishlistMovie.create({
      movieId,
      title,
      posterUrl: posterUrl || null,
      releaseDate: releaseDate || null,
      rating: typeof rating === 'number' ? rating : null,
    });

    res.status(201).json({
      success: true,
      data: {
        movieId: created.movieId,
        title: created.title,
        posterUrl: created.posterUrl,
        releaseDate: created.releaseDate,
        rating: created.rating,
      },
    });
  } catch (err) {
    // A race condition (two rapid double-clicks) could hit the DB's unique
    // constraint even after our findOne check - handle that gracefully too.
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Movie already exists in wishlist',
        errorCode: 'DUPLICATE_WISHLIST_ITEM',
      });
    }
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const movieId = Number(req.params.movieId);
    if (!Number.isInteger(movieId) || movieId <= 0) {
      throw new ApiError(400, 'Invalid movie id.', 'INVALID_MOVIE_ID');
    }

    const deletedCount = await WishlistMovie.destroy({ where: { movieId } });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in wishlist',
        errorCode: 'WISHLIST_ITEM_NOT_FOUND',
      });
    }

    res.json({ success: true, data: { movieId } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
