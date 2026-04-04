import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import request, { Response as SupertestResponse } from 'supertest';
import { AppModule } from '../src/app.module';

dotenv.config({ path: '.env.test' });

describe('TemplatesController (e2e, gateway+report-service)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();

    accessToken = 'test-access-token';
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(async () => {
    const res = await request(app.getHttpServer())
      .get('/templates')
      .set('Authorization', `Bearer ${accessToken}`);
    const templates = res.body.templates || [];
    for (const t of templates) {
      if (t.id) {
        await request(app.getHttpServer())
          .delete(`/templates/${t.id}`)
          .set('Authorization', `Bearer ${accessToken}`);
      }
    }
  });

  it('/templates (GET) should return empty array', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .get('/templates')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body.templates)).toBe(true);
    expect(res.body.templates.length).toBe(0);
  });

  it('/templates/template (POST) should upload template', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .post('/templates/template')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('name', 'Test Template')
      .field('description', 'Test desc')
      .attach('file', Buffer.from('test file content'), 'test.docx')
      .expect(201);
    expect(res.body.url).toBeDefined();
    expect(res.body.message).toBeDefined();
  });

  it('/templates (GET) should return uploaded template', async () => {
    const res: SupertestResponse = await request(app.getHttpServer())
      .get('/templates')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(Array.isArray(res.body.templates)).toBe(true);
    expect(res.body.templates.length).toBe(1);
    expect(res.body.templates[0].name).toBe('Test Template');
  });

  it('/templates/:id (DELETE) should delete template', async () => {
    // Спочатку отримати id шаблону
    const getRes: SupertestResponse = await request(app.getHttpServer())
      .get('/templates')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const templateId = getRes.body.templates[0]?.id;
    expect(templateId).toBeDefined();

    // Видалити шаблон
    const delRes: SupertestResponse = await request(app.getHttpServer())
      .delete(`/templates/${templateId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(delRes.body.message).toBeDefined();
  });
});
