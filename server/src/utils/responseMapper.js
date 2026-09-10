require('dotenv').config();

const IMAGE_BASE = process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

function buildImageUrl(path, size) {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/**
 * Turns a raw TMDB movie object (list form) into the shape our frontend
 * actually needs. The frontend should never have to know about TMDB's
 * field names like poster_path, vote_average, etc.
 */
function mapMovieSummary(movie, genreMap = {}) {
  return {
    id: movie.id,
    title: movie.title || movie.original_title || 'Untitled',
    overview: movie.overview || '',
    posterUrl: buildImageUrl(movie.poster_path, 'w342'),
    backdropUrl: buildImageUrl(movie.backdrop_path, 'w780'),
    releaseDate: movie.release_date || null,
    year: movie.release_date ? movie.release_date.slice(0, 4) : null,
    rating: typeof movie.vote_average === 'number' ? Math.round(movie.vote_average * 10) / 10 : null,
    genres: (movie.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
    popularity: movie.popularity || null,
  };
}

/**
 * Maps the full /movie/:id response, which has more detail than the
 * list endpoints (runtime, genres as objects, credits, etc).
 */
function mapMovieDetails(movie) {
  const director = movie.credits?.crew?.find((person) => person.job === 'Director');
  const cast = (movie.credits?.cast || []).slice(0, 8).map((person) => person.name);

  return {
    id: movie.id,
    title: movie.title || movie.original_title || 'Untitled',
    overview: movie.overview || 'No overview available.',
    posterUrl: buildImageUrl(movie.poster_path, 'w500'),
    backdropUrl: buildImageUrl(movie.backdrop_path, 'w1280'),
    releaseDate: movie.release_date || null,
    year: movie.release_date ? movie.release_date.slice(0, 4) : null,
    rating: typeof movie.vote_average === 'number' ? Math.round(movie.vote_average * 10) / 10 : null,
    runtime: movie.runtime || null,
    genres: (movie.genres || []).map((g) => g.name),
    language: movie.original_language || null,
    popularity: movie.popularity || null,
    director: director ? director.name : null,
    cast,
  };
}

/**
 * TMDB's paginated endpoints all share the same envelope shape:
 * { page, results, total_pages, total_results }
 */
function mapPaginatedResponse(tmdbData, genreMap = {}) {
  return {
    page: tmdbData.page,
    totalPages: tmdbData.total_pages,
    totalResults: tmdbData.total_results,
    hasMore: tmdbData.page < tmdbData.total_pages,
    results: tmdbData.results.map((m) => mapMovieSummary(m, genreMap)),
  };
}

module.exports = {
  mapMovieSummary,
  mapMovieDetails,
  mapPaginatedResponse,
};
