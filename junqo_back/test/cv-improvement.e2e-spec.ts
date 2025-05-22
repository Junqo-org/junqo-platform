import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { UserType } from '../src/users/dto/user-type.enum';

describe('CvImprovement E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();
    app = testEnv.app;

    const authService = app.get(AuthService);

    const userEmail = `cv-user-${Date.now()}@example.com`;
    const userPassword = 'password123';
    const userName = 'CV Test User';

    const signUpResponse = await authService.signUp({
      name: userName,
      email: userEmail,
      password: userPassword,
      type: UserType.STUDENT, // Assuming STUDENT user is appropriate
    });
    authToken = signUpResponse.token;
    userId = signUpResponse.user.id;
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  // Before each test, reset the database if needed
  // beforeEach(async () => {
  // await testEnv.resetDatabase();
  // });

  describe('POST /cv-improvement/analyze', () => {
    it('should analyze CV content and return recommendations for an authenticated user', async () => {
      const cvData = {
        cvContent: "Ceci est le contenu de mon CV. J'ai de l'expérience en développement web et mobile.",
        jobContext: "Développeur Fullstack Senior"
      };

      const response = await request(app.getHttpServer())
        .post('/cv-improvement/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cvData)
        .expect(HttpStatus.CREATED); // Or HttpStatus.OK if your API returns 200

      expect(response.body).toBeDefined();
      expect(response.body.recommendations).toBeDefined();
      expect(typeof response.body.recommendations).toBe('string');
    });

    it('should return 400 for invalid request (e.g., empty cvContent)', async () => {
      const cvData = {
        cvContent: "", 
        jobContext: "Développeur Fullstack"
      };

      await request(app.getHttpServer())
        .post('/cv-improvement/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cvData)
        .expect(HttpStatus.BAD_REQUEST);
    });
    
    it('should return 401 if no auth token is provided', async () => {
        const cvData = {
            cvContent: "Valid CV content for testing authorization.",
            jobContext: "Software Engineer"
        };

        await request(app.getHttpServer())
            .post('/cv-improvement/analyze')
            .send(cvData)
            .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
