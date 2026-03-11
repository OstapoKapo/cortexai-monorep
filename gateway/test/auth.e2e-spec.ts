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
    const data = (typeof res.body === 'object' && 'data' in res.body)
      ? (res.body as { data: { message: string } }).data
      : res.body as { message: string };
    expect(data).toHaveProperty('message');
    expect(data.message).toMatch(/registered/i);
  });

  it('/auth/login (POST) should login with correct credentials', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    const data = (typeof res.body === 'object' && 'data' in res.body)
      ? (res.body as { data: { message: string } }).data
      : res.body as { message: string };
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
});
