import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

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
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/login (POST) should return 400 for empty body', async () => {
    const res: SupertestResponse = await request(app.getHttpServer() as any)
      .post('/auth/login')
      .send({})
      .expect(400);
    expect(typeof res.body === 'object' && res.body !== null && 'message' in (res.body as object)).toBe(true);
    expect((res.body as { message?: string }).message).toBeDefined();
  });

  it('/auth/register (POST) should return 400 for empty body', async () => {
    const res: SupertestResponse = await request(app.getHttpServer() as any)
      .post('/auth/register')
      .send({})
      .expect(400);
    expect(typeof res.body === 'object' && res.body !== null && 'message' in (res.body as object)).toBe(true);
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

    app.use(cookieParser());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/register (POST) should register new user', async () => {
    const res: SupertestResponse = await request(app.getHttpServer() as any)
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    const data =
      typeof res.body === 'object' && res.body !== null && 'data' in res.body
        ? (res.body as { data: { message: string } }).data
        : (res.body as { message: string });
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/registered/i);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('/auth/login (POST) should login with correct credentials', async () => {
    const res: SupertestResponse = await request(app.getHttpServer() as any)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    const data =
      typeof res.body === 'object' && res.body !== null && 'data' in res.body
        ? (res.body as { data: { message: string } }).data
        : (res.body as { message: string });
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/logged in/i);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('/auth/login (POST) should fail with wrong password', async () => {
    await request(app.getHttpServer() as any)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpass' })
      .expect(401);
  });

  it('/auth/logout (POST) should logout user and clear cookies', async () => {
    const registerRes = await request(app.getHttpServer() as any)
      .post('/auth/register')
      .send({
        name: 'Logout Test',
        email: `logout_test_${Date.now()}@example.com`,
        password: 'logoutpass123',
      })
      .expect(201);
    expect(registerRes.body).toBeDefined();
    const cookies = registerRes.headers['set-cookie'] as unknown as string[];

    const logoutRes = await request(app.getHttpServer() as any)
      .post('/auth/logout')
      .set('Cookie', cookies)
      .expect(200);

    const setCookies = logoutRes.headers['set-cookie'] as unknown as string[];
    expect(setCookies).toBeDefined();

    const accessTokenCookie = setCookies.find((c) => c.includes('accessToken'));
    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);

    const refreshTokenCookie = setCookies.find((c) => c.includes('refreshToken'));
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });

  it('/auth/me (GET) should return user info for logged in user', async () => {
    const registerRes = await request(app.getHttpServer() as any)
      .post('/auth/register')
      .send({
        name: 'Me Test',
        email: `me_test_${Date.now()}@example.com`,
        password: 'mepass123',
      })
      .expect(201);
    const cookies = registerRes.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();

    const meRes = await request(app.getHttpServer() as any)
      .get('/auth/me')
      .set('Cookie', cookies)
      .expect(200);
    expect(meRes.text.length).toBeGreaterThan(0);
  });

  it('/auth/refresh-token (POST) should refresh tokens for valid refreshToken cookie', async () => {
    const registerRes = await request(app.getHttpServer() as any)
      .post('/auth/register')
      .send({
        name: 'Refresh Test',
        email: `refresh_test_${Date.now()}@example.com`,
        password: 'refreshpass123',
      })
      .expect(201);
    const cookies = registerRes.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();

    const refreshRes = await request(app.getHttpServer() as any)
      .post('/auth/refresh-token')
      .set('Cookie', cookies)
      .expect(200);

    const setCookies = refreshRes.headers['set-cookie'] as unknown as string[];
    expect(setCookies).toBeDefined();
    const accessTokenCookie = setCookies.find((c) => c.includes('accessToken'));
    const refreshTokenCookie = setCookies.find((c) => c.includes('refreshToken'));
    
    expect(accessTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshRes.body).toBeDefined();
    
    const data =
      typeof refreshRes.body === 'object' && refreshRes.body !== null && 'data' in refreshRes.body
        ? (refreshRes.body as { data: { message: string } }).data
        : (refreshRes.body as { message: string });

    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/refreshed/i);
  });

  it('/auth/refresh-token (POST) should fail with no refreshToken cookie', async () => {
    const res = await request(app.getHttpServer() as any)
      .post('/auth/refresh-token')
      .expect(401);
    expect(res.body).toBeDefined();
    expect((res.body as { message: string }).message).toMatch(/refresh token/i);
  });

  it('/auth/refresh-token (POST) should fail with invalid refreshToken', async () => {
    const fakeCookie = 'refreshToken=invalidtoken; Path=/auth/refresh-token; HttpOnly';
    const res = await request(app.getHttpServer() as any)
      .post('/auth/refresh-token')
      .set('Cookie', fakeCookie)
      .expect(401);
    expect(res.body).toBeDefined();
    expect((res.body as { message: string }).message).toMatch(/invalid|refresh token/i);
  });

  it('/auth/refresh-token (POST) should fail with expired refreshToken', async () => {
    const registerRes = await request(app.getHttpServer() as any)
      .post('/auth/register')
      .send({
        name: 'Expired Token Test',
        email: `expired_test_${Date.now()}@example.com`,
        password: 'expiredpass123',
      })
      .expect(201);

    const cookies = registerRes.headers['set-cookie'] as unknown as string[];
    expect(cookies).toBeDefined();

    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxMDAwLCJleHAiOjEwMDAwfQ.signature';
    const fakeCookie = `refreshToken=${expiredToken}; Path=/auth/refresh-token; HttpOnly`;

    const res = await request(app.getHttpServer() as any)
      .post('/auth/refresh-token')
      .set('Cookie', fakeCookie)
      .expect(401); 

    expect(res.body).toBeDefined();
    expect((res.body as { message: string }).message).toMatch(/invalid|refresh|expired/i);
  });
});