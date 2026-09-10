import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

export const movieApi = {
  getPopular: (page = 1, config) => api.get('/movies/popular', { params: { page }, ...config }),
  getTopRated: (page = 1, config) => api.get('/movies/top-rated', { params: { page }, ...config }),
  getNowPlaying: (page = 1, config) => api.get('/movies/now-playing', { params: { page }, ...config }),
  getUpcoming: (page = 1, config) => api.get('/movies/upcoming', { params: { page }, ...config }),

  search: (query, page = 1, config) =>
    api.get('/movies/search', { params: { query, page }, ...config }),

  discover: (filters, config) => api.get('/movies/discover', { params: filters, ...config }),

  getDetails: (id, config) => api.get(`/movies/${id}`, config),
};

export const wishlistApi = {
  getAll: () => api.get('/wishlist'),
  add: (movie) => api.post('/wishlist', movie),
  remove: (movieId) => api.delete(`/wishlist/${movieId}`),
};

export default api;
