const request = require('supertest');
const app = require('../src/app');

describe('GET /api/health', () => {
  it('returns success true and a running message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('CineFind API is running');
  });
});
