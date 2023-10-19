const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../app');

const { DB_HOST, PORT = 3000 } = process.env;

describe('test user login controller', () => {
  let server;
  beforeAll(async () => {
    await mongoose.connect(DB_HOST).then(() => (server = app.listen(PORT)));
  });

  afterAll(async () => {
    await mongoose.connection.close();
    await server.close();
  });

  it('should return a 200 status code when a valid user logs in, token and user object', async () => {
    const response = await request(app).post('/users/login').send({
      password: 'Test1234!',
      email: 'test@mail.com',
    });

    const {
      statusCode,
      body: { token },
    } = response;

    expect(statusCode).toBe(200);
    expect(token).toBeTruthy();
    expect(response.body).toMatchObject({
      user: {
        email: expect.any(String),
        subscription: expect.any(String),
      },
    });
  });
});
