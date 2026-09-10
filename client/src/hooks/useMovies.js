import { useCallback, useEffect, useRef, useState } from 'react';
export function useMovies(fetcher, deps = []) {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true); // initial/reset load
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const requestIdRef = useRef(0);

  const fetchPage = useCallback(
    async (pageToFetch, { append }) => {
      // Cancel any in-flight request for this hook before starting a new one.
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      const requestId = ++requestIdRef.current;

      if (append) setLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await fetcher(pageToFetch, { signal: controller.signal });

        // If a newer request has started since this one, drop this result.
        if (requestId !== requestIdRef.current) return;

        const { results, hasMore: more } = res.data.data;
        setMovies((prev) => (append ? [...prev, ...results] : results));
        setHasMore(more);
        setPage(pageToFetch);
        setError(null);
      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        if (requestId !== requestIdRef.current) return;

        const message =
          err.response?.data?.message || 'Something went wrong while loading movies.';
        setError(message);
        if (!append) setMovies([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [fetcher]
  );

  // Reset to page 1 whenever the search/filter dependencies change.
  useEffect(() => {
    fetchPage(1, { append: false });
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPage(page + 1, { append: true });
    }
  }, [fetchPage, page, hasMore, loadingMore]);

  const retry = useCallback(() => {
    fetchPage(page === 1 ? 1 : 1, { append: false });
  }, [fetchPage, page]);

  return { movies, loading, loadingMore, error, hasMore, loadMore, retry };
}
