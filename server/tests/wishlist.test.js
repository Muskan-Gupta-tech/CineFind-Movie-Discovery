const request = require('supertest');

// Mock the Sequelize model so these tests don't need a real MySQL database.
jest.mock('../src/models', () => {
  const records = [];
  return {
    WishlistMovie: {
      findAll: jest.fn(() => Promise.resolve(records.map((r) => ({ ...r, createdAt: r.createdAt })))),
      findOne: jest.fn(({ where }) =>
        Promise.resolve(records.find((r) => r.movieId === where.movieId) || null)
      ),
      create: jest.fn((payload) => {
        const record = { ...payload, createdAt: new Date().toISOString() };
        records.push(record);
        return Promise.resolve(record);
      }),
      destroy: jest.fn(({ where }) => {
        const index = records.findIndex((r) => r.movieId === where.movieId);
        if (index === -1) return Promise.resolve(0);
        records.splice(index, 1);
        return Promise.resolve(1);
      }),
    },
  };
});

const app = require('../src/app');

describe('Wishlist endpoints', () => {
  it('starts empty', async () => {
    const res = await request(app).get('/api/wishlist');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('adds a movie to the wishlist', async () => {
    const res = await request(app).post('/api/wishlist').send({
      movieId: 155,
      title: 'The Dark Knight',
      posterUrl: '/poster.jpg',
      releaseDate: '2008-07-16',
      rating: 8.5,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.movieId).toBe(155);
  });

  it('rejects a duplicate wishlist entry with 409', async () => {
    const res = await request(app).post('/api/wishlist').send({
      movieId: 155,
      title: 'The Dark Knight',
    });
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe('Movie already exists in wishlist');
  });

  it('rejects an invalid payload with 400', async () => {
    const res = await request(app).post('/api/wishlist').send({ title: 'No id' });
    expect(res.statusCode).toBe(400);
  });

  it('removes a movie from the wishlist', async () => {
    const res = await request(app).delete('/api/wishlist/155');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.movieId).toBe(155);
  });

  it('returns 404 when removing a movie that is not in the wishlist', async () => {
    const res = await request(app).delete('/api/wishlist/999');
    expect(res.statusCode).toBe(404);
  });
});
