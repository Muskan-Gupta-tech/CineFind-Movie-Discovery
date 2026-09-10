const axios = require('axios');
require('dotenv').config();

/**
 * This file is the ONLY place in the whole application that talks to TMDB.
 * Routes and controllers never call TMDB directly - they call the functions
 * exported here. This keeps the external API isolated: if we ever swapped
 * TMDB for another movie API, only this file would need to change.
 */

const tmdbClient = axios.create({
  baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  timeout: 8000, // fail fast instead of hanging the request forever
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

// Genre list is small and basically static, so we cache it in memory
// after the first fetch instead of calling TMDB every time we need a name.
let genreCache = null;

async function getGenreMap() {
  if (genreCache) return genreCache;

  const { data } = await tmdbClient.get('/genre/movie/list');
  genreCache = {};
  data.genres.forEach((g) => {
    genreCache[g.id] = g.name;
  });
  return genreCache;
}

function getPopularMovies(page = 1) {
  return tmdbClient.get('/movie/popular', { params: { page } });
}

function getTopRatedMovies(page = 1) {
  return tmdbClient.get('/movie/top_rated', { params: { page } });
}

function getNowPlayingMovies(page = 1) {
  return tmdbClient.get('/movie/now_playing', { params: { page } });
}

function getUpcomingMovies(page = 1) {
  return tmdbClient.get('/movie/upcoming', { params: { page } });
}

function searchMovies(query, page = 1) {
  return tmdbClient.get('/search/movie', { params: { query, page } });
}

/**
 * Builds a TMDB "discover" request from our own filter/sort names.
 * Only filters that TMDB actually supports are exposed to the frontend.
 */
function discoverMovies({ genre, year, minRating, language, sortBy, page = 1 }) {
  const params = { page };

  if (genre) params.with_genres = genre;
  if (year) params.primary_release_year = year;
  if (minRating) params['vote_average.gte'] = minRating;
  if (language) params.with_original_language = language;

  // Map our simple sort names to TMDB's sort_by values.
  const sortMap = {
    popularity: 'popularity.desc',
    rating: 'vote_average.desc',
    release_date: 'primary_release_date.desc',
    title: 'original_title.asc',
  };
  params.sort_by = sortMap[sortBy] || 'popularity.desc';

  // TMDB's rating sort can surface obscure movies with very few votes.
  // A small minimum vote count keeps "top rated by rating" results sane.
  if (sortBy === 'rating') params['vote_count.gte'] = 50;

  return tmdbClient.get('/discover/movie', { params });
}

function getMovieDetails(id) {
  // append_to_response lets us get credits (cast/crew) in a single call
  // instead of making a second request.
  return tmdbClient.get(`/movie/${id}`, {
    params: { append_to_response: 'credits' },
  });
}

module.exports = {
  tmdbClient,
  getGenreMap,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  searchMovies,
  discoverMovies,
  getMovieDetails,
};
