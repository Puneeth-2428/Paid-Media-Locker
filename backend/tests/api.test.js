const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('API Endpoints', () => {
  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  describe('Auth & Unlock Flows', () => {
    let token;
    let userId;
    let mediaId;

    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@test.com', password: 'password123' });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('walletBalance', 100);
      token = res.body.token;
      userId = res.body._id;
    });

    it('should fail unlock if balance insufficient', async () => {
      // First, manually set the user's balance to 0 and create a media item to unlock
      const User = mongoose.model('User');
      await User.findByIdAndUpdate(userId, { walletBalance: 0 });

      const Media = mongoose.model('Media');
      const media = await Media.create({
        owner: new mongoose.Types.ObjectId(),
        price: 50,
        originalKey: 'test/orig',
        previewKey: 'test/prev'
      });
      mediaId = media._id;

      const res = await request(app)
        .post(`/api/media/${mediaId}/unlock`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Insufficient coins in wallet');
    });
  });
});
