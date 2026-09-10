import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { movieApi } from '../services/api';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function MovieSection({ title, fetcher, seeAllTo }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetcher(1)
      .then((res) => setMovies(res.data.data.results.slice(0, 12)))
      .catch(() => setError('Could not load this section.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="movie-section">
      <div className="movie-section__header">
        <h2>{title}</h2>
        {seeAllTo && (
          <Link to={seeAllTo} className="movie-section__see-all">
            See all
          </Link>
        )}
      </div>

      {loading && <LoadingSpinner label="Loading movies..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={load} />}
      {!loading && !error && <MovieGrid movies={movies} />}
    </section>
  );
}

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Find a movie worth watching.</h1>
        <p>Explore popular movies, discover new releases and save your favorites for later.</p>
      </section>

      <MovieSection title="Popular Movies" fetcher={movieApi.getPopular} seeAllTo="/discover" />
      <MovieSection title="Top Rated" fetcher={movieApi.getTopRated} seeAllTo="/discover?sortBy=rating" />
      <MovieSection title="Now Playing" fetcher={movieApi.getNowPlaying} />
      <MovieSection title="Upcoming" fetcher={movieApi.getUpcoming} />
    </div>
  );
}
