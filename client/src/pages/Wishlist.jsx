import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { formatYear } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function Wishlist() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner label="Loading wishlist..." />
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="page">
        <EmptyState
          title="Your wishlist is empty."
          description="Start discovering movies and save the ones you want to watch later."
          actionLabel="Browse Movies"
          actionTo="/discover"
        />
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Your Wishlist</h1>
      <div className="movie-grid">
        {wishlistItems.map((item) => (
          <div className="movie-card" key={item.movieId}>
            <Link to={`/movie/${item.movieId}`} className="movie-card__poster-link">
              <div className="movie-card__poster">
                {item.posterUrl ? (
                  <img src={item.posterUrl} alt={item.title} loading="lazy" />
                ) : (
                  <div className="movie-card__no-poster">No poster available</div>
                )}
              </div>
            </Link>
            <div className="movie-card__body">
              <div className="movie-card__title-row">
                <Link to={`/movie/${item.movieId}`} className="movie-card__title" title={item.title}>
                  {item.title}
                </Link>
                {item.rating != null && (
                  <span className="movie-card__rating">★ {item.rating.toFixed(1)}</span>
                )}
              </div>
              <div className="movie-card__meta">
                <span>{formatYear(item.releaseDate)}</span>
                <button
                  type="button"
                  className="wishlist-btn wishlist-btn--active"
                  onClick={() => removeFromWishlist(item.movieId)}
                  aria-label="Remove from wishlist"
                  title="Remove from wishlist"
                >
                  ♥
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
