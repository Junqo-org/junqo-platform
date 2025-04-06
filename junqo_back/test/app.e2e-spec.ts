import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { HttpStatus, INestApplication } from '@nestjs/common';

describe('App E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    environment: any;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  it('hello', async () => {
    const response = await request(testEnv.app.getHttpServer())
      .get('/')
      .expect(HttpStatus.OK);
    expect(response.text).toBe('Welcome to the Junqo API !');
  });
});
