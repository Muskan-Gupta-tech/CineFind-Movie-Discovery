const request = require('supertest');
const app = require('../src/app');

// We mock the TMDB service so tests don't depend on network access or a
// real API key - only our own request handling logic is under test here.
jest.mock('../src/services/movieApiService', () => ({
  getGenreMap: jest.fn().mockResolvedValue({ 28: 'Action' }),
  searchMovies: jest.fn().mockResolvedValue({
    data: {
      page: 1,
      total_pages: 1,
      total_results: 1,
      results: [
        {
          id: 1,
          title: 'Batman Begins',
          overview: 'Origin story',
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: '2005-06-15',
          vote_average: 8.2,
          genre_ids: [28],
          popularity: 50,
        },
      ],
    },
  }),
}));

describe('GET /api/movies/search', () => {
  it('rejects an empty search query with 400', async () => {
    const res = await request(app).get('/api/movies/search?query=');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('MISSING_QUERY');
  });

  it('rejects an invalid page number with 400', async () => {
    const res = await request(app).get('/api/movies/search?query=batman&page=-1');
    expect(res.statusCode).toBe(400);
    expect(res.body.errorCode).toBe('INVALID_PAGE');
  });

  it('returns normalized movie data for a valid query', async () => {
    const res = await request(app).get('/api/movies/search?query=batman&page=1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results[0]).toMatchObject({
      id: 1,
      title: 'Batman Begins',
      year: '2005',
      genres: ['Action'],
    });
  });
});
