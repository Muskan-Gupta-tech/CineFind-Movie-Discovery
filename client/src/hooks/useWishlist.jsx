import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { wishlistApi } from '../services/api';

// A small context so any component (movie card, details page, wishlist
// page) can check/toggle wishlist status without prop-drilling.
const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await wishlistApi.getAll();
      const items = res.data.data;
      setWishlistItems(items);
      setWishlistIds(new Set(items.map((item) => item.movieId)));
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const isWishlisted = useCallback((movieId) => wishlistIds.has(movieId), [wishlistIds]);

  const addToWishlist = useCallback(async (movie) => {
    // Optimistic update so the UI feels instant.
    setWishlistIds((prev) => new Set(prev).add(movie.movieId));
    try {
      await wishlistApi.add(movie);
    } catch (err) {
      // Roll back on failure (e.g. duplicate, network error).
      if (err.response?.status !== 409) {
        setWishlistIds((prev) => {
          const next = new Set(prev);
          next.delete(movie.movieId);
          return next;
        });
      }
    } finally {
      loadWishlist();
    }
  }, [loadWishlist]);

  const removeFromWishlist = useCallback(async (movieId) => {
    setWishlistIds((prev) => {
      const next = new Set(prev);
      next.delete(movieId);
      return next;
    });
    try {
      await wishlistApi.remove(movieId);
    } finally {
      loadWishlist();
    }
  }, [loadWishlist]);

  const toggleWishlist = useCallback(
    (movie) => {
      if (isWishlisted(movie.movieId)) {
        removeFromWishlist(movie.movieId);
      } else {
        addToWishlist(movie);
      }
    },
    [isWishlisted, addToWishlist, removeFromWishlist]
  );

  const value = {
    wishlistItems,
    loading,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    refresh: loadWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside a WishlistProvider');
  return ctx;
}
