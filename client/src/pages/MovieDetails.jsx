import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieApi } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';
import { formatFullDate, formatRuntime } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    movieApi
      .getDetails(id)
      .then((res) => setMovie(res.data.data))
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not load movie details.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner label="Loading movie details..." />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page">
        <ErrorMessage message={error} onRetry={load} />
      </div>
    );
  }

  const wishlisted = isWishlisted(movie.id);

  return (
    <div className="page movie-details">
      <button type="button" className="back-link" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div
        className="movie-details__backdrop"
        style={movie.backdropUrl ? { backgroundImage: `url(${movie.backdropUrl})` } : undefined}
      >
        <div className="movie-details__backdrop-overlay" />
      </div>

      <div className="movie-details__content">
        <div className="movie-details__poster">
          {movie.posterUrl ? (
            <img src={movie.posterUrl} alt={movie.title} />
          ) : (
            <div className="movie-card__no-poster">No poster available</div>
          )}
        </div>

        <div className="movie-details__info">
          <h1>{movie.title}</h1>

          <div className="movie-details__meta-row">
            <span>{formatFullDate(movie.releaseDate)}</span>
            {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
            {movie.rating != null && <span>★ {movie.rating.toFixed(1)}</span>}
            {movie.language && <span>{movie.language.toUpperCase()}</span>}
          </div>

          {movie.genres?.length > 0 && (
            <div className="movie-details__genres">
              {movie.genres.map((g) => (
                <span key={g} className="genre-pill">
                  {g}
                </span>
              ))}
            </div>
          )}

          <p className="movie-details__overview">{movie.overview}</p>

          {movie.director && (
            <p className="movie-details__crew">
              <strong>Director:</strong> {movie.director}
            </p>
          )}
          {movie.cast?.length > 0 && (
            <p className="movie-details__crew">
              <strong>Cast:</strong> {movie.cast.join(', ')}
            </p>
          )}

          <button
            type="button"
            className={`btn ${wishlisted ? 'btn--secondary' : 'btn--primary'}`}
            onClick={() =>
              toggleWishlist({
                movieId: movie.id,
                title: movie.title,
                posterUrl: movie.posterUrl,
                releaseDate: movie.releaseDate,
                rating: movie.rating,
              })
            }
          >
            {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
