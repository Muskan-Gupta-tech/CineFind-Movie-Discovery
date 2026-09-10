import { Link } from 'react-router-dom';
import { formatYear } from '../utils/formatDate';

export default function MovieCard({ movie, isWishlisted, onWishlistToggle }) {
  const { id, title, posterUrl, releaseDate, rating } = movie;

  return (
    <div className="movie-card">
      <Link to={`/movie/${id}`} className="movie-card__poster-link">
        <div className="movie-card__poster">
          {posterUrl ? (
            <img src={posterUrl} alt={title} loading="lazy" />
          ) : (
            <div className="movie-card__no-poster">No poster available</div>
          )}
        </div>
      </Link>

      <div className="movie-card__body">
        <div className="movie-card__title-row">
          <Link to={`/movie/${id}`} className="movie-card__title" title={title}>
            {title}
          </Link>
          {rating != null && (
            <span className="movie-card__rating">★ {rating.toFixed(1)}</span>
          )}
        </div>
        <div className="movie-card__meta">
          <span>{formatYear(releaseDate)}</span>
          <button
            type="button"
            className={`wishlist-btn ${isWishlisted ? 'wishlist-btn--active' : ''}`}
            onClick={() => onWishlistToggle(movie)}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isWishlisted ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </div>
  );
}
