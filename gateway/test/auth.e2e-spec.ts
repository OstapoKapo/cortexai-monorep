import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

import { Client } from 'pg';
import { AppModule } from 'src/app.module';
import request, { Response as SupertestResponse } from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/login (POST) should return 400 for empty body', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);
    expect(typeof res.body === 'object' && 'message' in res.body).toBe(true);
    expect((res.body as { message?: string }).message).toBeDefined();
  });

  it('/auth/register (POST) should return 400 for empty body', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400);
    expect(typeof res.body === 'object' && 'message' in res.body).toBe(true);
    expect((res.body as { message?: string }).message).toBeDefined();
  });
});

describe('AuthController (e2e, gateway+auth)', () => {
  let app: INestApplication;
  const testUser = {
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,
    password: 'testpass123',
  };

  beforeAll(async () => {
    const dbClient = new Client({
      connectionString: process.env.DATABASE_URL,
    });
    await dbClient.connect();

    await dbClient.query('TRUNCATE TABLE "users" CASCADE;');
    await dbClient.end();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/register (POST) should register new user', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    const data =
      typeof res.body === 'object' && 'data' in res.body
        ? (res.body as { data: { message: string } }).data
        : (res.body as { message: string });
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/registered/i);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('/auth/login (POST) should login with correct credentials', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    const data =
      typeof res.body === 'object' && 'data' in res.body
        ? (res.body as { data: { message: string } }).data
        : (res.body as { message: string });
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/logged in/i);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('/auth/login (POST) should fail with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpass' })
      .expect(401);
  });

  it('/auth/login (POST) should fail with invalid X-Internal-Secret', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .set('X-Internal-Secret', 'invalid-secret')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).not.toBe(200);
    expect([401, 403]).toContain(res.status);
    expect(typeof res.body === 'object' && 'message' in res.body).toBe(true);
  });

  it('/auth/logout (POST) should logout user and clear cookies', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Logout Test',
        email: `logout_test_${Date.now()}@example.com`,
        password: 'logoutpass123',
      })
      .expect(201);
    expect(registerRes.body).toBeDefined();
   const cookies = registerRes.headers['set-cookie'];

  const logoutRes = await request(app.getHttpServer())
    .post('/auth/logout')
    .set('Cookie', cookies)
    .expect(200);


  const setCookies = logoutRes.headers['set-cookie'] as unknown as string[];
  expect(setCookies).toBeDefined();

  const accessTokenCookie = setCookies.find(c => c.includes('accessToken'));
  expect(accessTokenCookie).toBeDefined();
  
  expect(accessTokenCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);

  const refreshTokenCookie = setCookies.find(c => c.includes('refreshToken'));
  expect(refreshTokenCookie).toBeDefined();
  expect(refreshTokenCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
});

  it('/auth/me (GET) should return user info for logged in user', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Me Test',
        email: `me_test_${Date.now()}@example.com`,
        password: 'mepass123',
      })
      .expect(201);
    const cookies = registerRes.headers['set-cookie'];
    expect(cookies).toBeDefined();

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200);
    expect(meRes.text.length).toBeGreaterThan(0);
  });
});
