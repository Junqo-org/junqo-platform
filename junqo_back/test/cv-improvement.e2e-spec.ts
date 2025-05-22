import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { HttpStatus, INestApplication } from '@nestjs/common';

describe('CvImprovement E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };
  let app: INestApplication;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();
    app = testEnv.app;
  }, 60000); // Increased timeout for setup

  afterAll(async () => {
    await testEnv.tearDown();
  });

  // Before each test, reset the database if needed
  // beforeEach(async () => {
  // await testEnv.resetDatabase();
  // });

  describe('POST /cv-improvement/analyze', () => {
    it('should analyze CV content and return recommendations', async () => {
      const cvData = {
        cvContent: "Ceci est le contenu de mon CV. J'ai de l'expérience en développement web.",
        jobContext: "Développeur Fullstack"
      };

      // TODO: Replace 'YOUR_AUTH_TOKEN' with a valid JWT token or token retrieval logic
      const authToken = 'YOUR_AUTH_TOKEN';

      const response = await request(app.getHttpServer())
        .post('/cv-improvement/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cvData)
        .expect(HttpStatus.CREATED); // Or HttpStatus.OK depending on your API design for POST

      expect(response.body).toBeDefined();
      expect(response.body.recommendations).toBeDefined();
      expect(typeof response.body.recommendations).toBe('string');
    });

    it('should return 400 for invalid request (e.g., empty cvContent)', async () => {
      const cvData = {
        cvContent: "", // Empty content
        jobContext: "Développeur Fullstack"
      };
      const authToken = 'YOUR_AUTH_TOKEN'; // TODO: Replace with actual token

      await request(app.getHttpServer())
        .post('/cv-improvement/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cvData)
        .expect(HttpStatus.BAD_REQUEST);
    });
    
    it('should return 401 if no auth token is provided', async () => {
        const cvData = {
            cvContent: "Valid CV content.",
            jobContext: "Software Engineer"
        };

        await request(app.getHttpServer())
            .post('/cv-improvement/analyze')
            .send(cvData)
            .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
