import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthService } from '../src/auth/auth.service';
import { UserType } from '../src/users/dto/user-type.enum';

describe('InterviewSimulation E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };
  let app: INestApplication;
  let authToken: string; // Variable to store the auth token
  let userId: string;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();
    app = testEnv.app;

    const authService = app.get(AuthService);

    // Create a test user and get a token
    const userEmail = `interview-user-${Date.now()}@example.com`;
    const userPassword = 'password123';
    const userName = 'Interview Test User';

    const signUpResponse = await authService.signUp({
      name: userName,
      email: userEmail,
      password: userPassword,
      type: UserType.STUDENT, // Assuming STUDENT user type is appropriate
    });
    authToken = signUpResponse.token;
    userId = signUpResponse.user.id;
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  // beforeEach(async () => {
  //   await testEnv.resetDatabase();
  // });

  describe('POST /interview-simulation', () => {
    it('should generate an interview response for an authenticated user', async () => {
      const interviewData = {
        message: "Bonjour, pouvez-vous me parler de vos expériences passées ?",
        context: "Entretien pour un poste de développeur logiciel senior"
      };

      const response = await request(app.getHttpServer())
        .post('/interview-simulation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(interviewData)
        .expect(HttpStatus.CREATED); // Or HttpStatus.OK if your API returns 200

      expect(response.body).toBeDefined();
      expect(response.body.response).toBeDefined();
      expect(typeof response.body.response).toBe('string');
    });

    it('should return 400 for invalid request (e.g., empty message)', async () => {
      const interviewData = {
        message: "", 
        context: "Entretien pour un poste de développeur logiciel"
      };

      await request(app.getHttpServer())
        .post('/interview-simulation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(interviewData)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 401 if no auth token is provided', async () => {
        const interviewData = {
            message: "What are your salary expectations?",
            context: "Software Engineer interview"
        };

        await request(app.getHttpServer())
            .post('/interview-simulation')
            .send(interviewData)
            .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
