import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieApi } from '../services/api';
import { useMovies } from '../hooks/useMovies';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const DEFAULT_FILTERS = { genre: '', year: '', minRating: '', sortBy: 'popularity' };

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the single source of truth for search/filter state.
  // This makes the page shareable and keeps state on refresh.
  const query = searchParams.get('query') || '';
  const filters = {
    genre: searchParams.get('genre') || DEFAULT_FILTERS.genre,
    year: searchParams.get('year') || DEFAULT_FILTERS.year,
    minRating: searchParams.get('minRating') || DEFAULT_FILTERS.minRating,
    sortBy: searchParams.get('sortBy') || DEFAULT_FILTERS.sortBy,
  };

  const hasActiveFilters =
    filters.genre || filters.year || filters.minRating || filters.sortBy !== 'popularity';

  const updateParams = useCallback(
    (next) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(next).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleSearchChange = (value) => {
    updateParams({ query: value || undefined });
  };

  const handleFilterChange = (nextFilters) => {
    updateParams(nextFilters);
  };

  const handleClearFilters = () => {
    updateParams({ genre: undefined, year: undefined, minRating: undefined, sortBy: undefined });
  };

  // Choose search vs discover based on whether there's a query - both
  // return the same normalized shape, so the rest of the page doesn't care.
  const fetcher = useMemo(() => {
    if (query.trim()) {
      return (page, config) => movieApi.search(query.trim(), page, config);
    }
    return (page, config) => movieApi.discover({ ...filters, page }, config);
  }, [query, filters.genre, filters.year, filters.minRating, filters.sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  const { movies, loading, loadingMore, error, hasMore, loadMore, retry } = useMovies(fetcher, [
    query,
    filters.genre,
    filters.year,
    filters.minRating,
    filters.sortBy,
  ]);

  return (
    <div className="page">
      <div className="discover-toolbar">
        <SearchBar value={query} onChange={handleSearchChange} />
        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {loading && <LoadingSpinner label={query ? 'Searching...' : 'Loading movies...'} />}

      {!loading && error && <ErrorMessage message={error} onRetry={retry} />}

      {!loading && !error && movies.length === 0 && (
        <EmptyState
          title="No movies found"
          description="Try another title or change your filters."
        />
      )}

      {!loading && !error && movies.length > 0 && (
        <>
          <MovieGrid movies={movies} />

          <div className="load-more">
            {hasMore ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            ) : (
              <p className="load-more__end">No more movies to show.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
