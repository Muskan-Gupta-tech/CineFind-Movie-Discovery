const movieApi = require('../services/movieApiService');
const cache = require('../services/cacheService');
const { mapPaginatedResponse, mapMovieDetails } = require('../utils/responseMapper');

/**
 * Small helper so every "list" endpoint follows the same
 * cache -> fetch -> transform -> cache -> respond flow.
 */
async function handleListRequest(res, cacheKey, fetchFn, page) {
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ success: true, data: cached });
  }

  const genreMap = await movieApi.getGenreMap();
  const { data } = await fetchFn(page);
  const mapped = mapPaginatedResponse(data, genreMap);

  cache.set(cacheKey, mapped);
  res.json({ success: true, data: mapped });
}

async function getPopular(req, res, next) {
  try {
    await handleListRequest(res, `popular:${req.page}`, movieApi.getPopularMovies, req.page);
  } catch (err) {
    next(err);
  }
}

async function getTopRated(req, res, next) {
  try {
    await handleListRequest(res, `top-rated:${req.page}`, movieApi.getTopRatedMovies, req.page);
  } catch (err) {
    next(err);
  }
}

async function getNowPlaying(req, res, next) {
  try {
    await handleListRequest(res, `now-playing:${req.page}`, movieApi.getNowPlayingMovies, req.page);
  } catch (err) {
    next(err);
  }
}

async function getUpcoming(req, res, next) {
  try {
    await handleListRequest(res, `upcoming:${req.page}`, movieApi.getUpcomingMovies, req.page);
  } catch (err) {
    next(err);
  }
}

async function search(req, res, next) {
  try {
    const cacheKey = `search:${req.searchQuery.toLowerCase()}:${req.page}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const genreMap = await movieApi.getGenreMap();
    const { data } = await movieApi.searchMovies(req.searchQuery, req.page);
    const mapped = mapPaginatedResponse(data, genreMap);

    cache.set(cacheKey, mapped);
    res.json({ success: true, data: mapped });
  } catch (err) {
    next(err);
  }
}

async function discover(req, res, next) {
  try {
    const { genre, year, minRating, language, sortBy } = req.query;
    const filters = { genre, year, minRating, language, sortBy, page: req.page };

    const cacheKey = `discover:${JSON.stringify(filters)}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const genreMap = await movieApi.getGenreMap();
    const { data } = await movieApi.discoverMovies(filters);
    const mapped = mapPaginatedResponse(data, genreMap);

    cache.set(cacheKey, mapped);
    res.json({ success: true, data: mapped });
  } catch (err) {
    next(err);
  }
}

async function getDetails(req, res, next) {
  try {
    const cacheKey = `details:${req.movieId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    const { data } = await movieApi.getMovieDetails(req.movieId);
    const mapped = mapMovieDetails(data);

    cache.set(cacheKey, mapped, 30 * 60 * 1000); // details change rarely, cache a bit longer
    res.json({ success: true, data: mapped });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  search,
  discover,
  getDetails,
};
