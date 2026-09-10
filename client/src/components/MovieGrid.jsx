import MovieCard from './MovieCard';
import { useWishlist } from '../hooks/useWishlist';

export default function MovieGrid({ movies }) {
  const { isWishlisted, toggleWishlist } = useWishlist();

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isWishlisted={isWishlisted(movie.id)}
          onWishlistToggle={(m) =>
            toggleWishlist({
              movieId: m.id,
              title: m.title,
              posterUrl: m.posterUrl,
              releaseDate: m.releaseDate,
              rating: m.rating,
            })
          }
        />
      ))}
    </div>
  );
}
