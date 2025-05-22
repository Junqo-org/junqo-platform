import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { HttpStatus, INestApplication } from '@nestjs/common';

describe('InterviewSimulation E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };
  let app: INestApplication;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();
    app = testEnv.app;
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  // beforeEach(async () => {
  //   await testEnv.resetDatabase();
  // });

  describe('POST /interview-simulation', () => {
    it('should generate an interview response', async () => {
      const interviewData = {
        message: "Bonjour, parlez-moi de vous.",
        context: "Entretien pour un poste de développeur logiciel"
      };

      // TODO: Replace 'YOUR_AUTH_TOKEN' with a valid JWT token or token retrieval logic
      const authToken = 'YOUR_AUTH_TOKEN';

      const response = await request(app.getHttpServer())
        .post('/interview-simulation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(interviewData)
        .expect(HttpStatus.CREATED); // Or HttpStatus.OK

      expect(response.body).toBeDefined();
      expect(response.body.response).toBeDefined();
      expect(typeof response.body.response).toBe('string');
    });

    it('should return 400 for invalid request (e.g., empty message)', async () => {
      const interviewData = {
        message: "", // Empty message
        context: "Entretien pour un poste de développeur logiciel"
      };
      const authToken = 'YOUR_AUTH_TOKEN'; // TODO: Replace

      await request(app.getHttpServer())
        .post('/interview-simulation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(interviewData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if no auth token is provided', async () => {
        const interviewData = {
            message: "Tell me about your weaknesses.",
            context: "Software Engineer interview"
        };

        await request(app.getHttpServer())
            .post('/interview-simulation')
            .send(interviewData)
            .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
