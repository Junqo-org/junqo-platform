import * as request from 'supertest';
import { UserType } from '../src/users/dto/user-type.enum';
import { createTestingEnvironment } from './test-setup';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { SignUpDTO } from '../src/auth/dto/sign-up.dto';
import { SignInDTO } from '../src/auth/dto/sign-in.dto';
import { AuthService } from '../src/auth/auth.service';
import { AuthPayloadDTO } from '../src/auth/dto/auth-payload.dto';

const baseRoute = '/api/v1/auth/';

const signUpDto: SignUpDTO = {
  name: 'testUser',
  email: 'email@email.com',
  password: 'password',
  type: UserType.SCHOOL,
};

describe('Auth E2E Tests', () => {
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

  // Optionally reset database between test blocks
  afterEach(async () => {
    await testEnv.resetDatabase();
  });

  describe('Sign Up', () => {
    it('SignUp User', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'register')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        token: expect.anything(),
        user: {
          email: signUpDto.email,
          id: expect.anything(),
          name: signUpDto.name,
          type: signUpDto.type,
        },
      });
    });

    it('SignUp with invalid email format', async () => {
      const invalidEmailPayload = {
        ...signUpDto,
        email: 'invalidEmail',
      };
      await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'register')
        .send(invalidEmailPayload)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('SignUp with duplicate email', async () => {
      await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'register')
        .send(signUpDto)
        .expect(HttpStatus.CREATED);

      await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'register')
        .send(signUpDto)
        .expect(HttpStatus.CONFLICT);
    });

    it('SignUp with invalid password', async () => {
      const invalidPasswordPayload = {
        ...signUpDto,
        email: 'email2@mail.com',
        password: '',
      };
      await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'register')
        .send(invalidPasswordPayload)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('SignUp with invalid user type', async () => {
      const invalidUserTypePayload = {
        ...signUpDto,
        email: 'email3@mail.com',
        type: 'INVALID_TYPE',
      };
      await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'register')
        .send(invalidUserTypePayload)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Sign In', () => {
    const signInTestUser: SignUpDTO = {
      name: 'testUser',
      email: 'sigin.email@email.com',
      password: 'password',
      type: UserType.SCHOOL,
    };
    const signInDto: SignInDTO = {
      email: signInTestUser.email,
      password: signInTestUser.password,
    };
    let signInTestPayload;

    beforeAll(async () => {
      signInTestPayload = await testEnv.app
        .get(AuthService)
        .signUp(signInTestUser);
    });

    it('SignIn User', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'login')
        .send(signInDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        ...signInTestPayload,
        token: expect.anything(),
      });
    });

    it('SignIn with invalid email', async () => {
      const invalidEmailPayload = {
        ...signInDto,
        email: 'invalidEmail',
      };
      await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'login')
        .send(invalidEmailPayload)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('SignIn with invalid password', async () => {
      const invalidPasswordPayload = {
        ...signInDto,
        password: 'invalid password',
      };
      await request(testEnv.app.getHttpServer())
        .post(baseRoute + 'login')
        .send(invalidPasswordPayload)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('IsLoggedIn', () => {
    const isLoggedInTestUser: SignUpDTO = {
      name: 'testUser',
      email: 'sigin.email@email.com',
      password: 'password',
      type: UserType.SCHOOL,
    };
    let isLoggedInTestPayload: AuthPayloadDTO;

    beforeAll(async () => {
      isLoggedInTestPayload = await testEnv.app
        .get(AuthService)
        .signUp(isLoggedInTestUser);
    });

    it('IsLoggedIn with valid token should return true', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute + 'is-logged-in')
        .set('Authorization', `Bearer ${isLoggedInTestPayload.token}`)
        .expect(HttpStatus.OK);

      expect(response.body.isLoggedIn).toBe(true);
    });

    it('IsLoggedIn without token should return false', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute + 'is-logged-in')
        .expect(HttpStatus.OK);

      expect(response.body.isLoggedIn).toBe(false);
    });

    it('IsLoggedIn with invalid token should return false', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute + 'is-logged-in')
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.OK);

      expect(response.body.isLoggedIn).toBe(false);
    });
  });
});
