import * as request from 'supertest';
import { createTestingEnvironment } from './test-utils';
import { INestApplication } from '@nestjs/common';

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

  it('Health check', async () => {
    await request(testEnv.app.getHttpServer())
      .post('/graphql')
      .send({ query: 'query{__typename}' })
      .expect(200);
  });
});
