import * as request from 'supertest';
import { UsersService } from '../src/users/users.service';
import { UserType } from '../src/users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { AuthUserDTO } from '../src/shared/dto/auth-user.dto';
import { createTestingEnvironment } from './test-utils';
import { SIGN_IN_REQUEST, SIGN_UP_REQUEST } from './requests';
import { INestApplication } from '@nestjs/common';

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
        .post('/graphql')
        .send(SIGN_UP_REQUEST)
        .expect(200);

      expect(response.body).toMatchObject({
        data: {
          signUp: {
            token: expect.anything(),
            user: {
              email: SIGN_UP_REQUEST.variables.email,
              id: expect.anything(),
              name: SIGN_UP_REQUEST.variables.name,
              type: SIGN_UP_REQUEST.variables.type,
            },
          },
        },
      });
    });

    it('SignUp with invalid email format', async () => {
      const invalidEmailQuery = {
        ...SIGN_UP_REQUEST,
        variables: { ...SIGN_UP_REQUEST.variables, email: 'invalidEmail' },
      };
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(invalidEmailQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain(
        'Email must be a valid email address',
      );
    });

    it('SignUp with duplicate email', async () => {
      await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(SIGN_UP_REQUEST)
        .expect(200);

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(SIGN_UP_REQUEST)
        .expect(200);

      expect(response.body.errors[0].message).toContain('Email already exists');
    });

    it('SignUp with invalid password', async () => {
      const invalidPasswordQuery = {
        ...SIGN_UP_REQUEST,
        variables: {
          ...SIGN_UP_REQUEST.variables,
          email: 'email2@mail.com',
          password: '',
        },
      };
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(invalidPasswordQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain(
        'Password must be at least 8 characters',
      );
    });

    it('SignUp with invalid user type', async () => {
      const invalidUserTypeQuery = {
        ...SIGN_UP_REQUEST,
        variables: {
          ...SIGN_UP_REQUEST.variables,
          email: 'email3@mail.com',
          type: 'INVALID_TYPE',
        },
      };
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(invalidUserTypeQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain('invalid value');
    });
  });

  describe('Sign In', () => {
    it('SignIn User', async () => {
      await testEnv.app.get(UsersService).create(
        plainToInstance(AuthUserDTO, {
          name: 'testUser',
          email: SIGN_IN_REQUEST.variables.email,
          type: UserType.SCHOOL,
        }),
        {
          type: UserType.SCHOOL,
          name: 'testUser',
          email: SIGN_IN_REQUEST.variables.email,
          password: SIGN_IN_REQUEST.variables.password,
        },
      );

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(SIGN_IN_REQUEST)
        .expect(200);

      expect(response.body).toMatchObject({
        data: {
          signIn: {
            token: expect.anything(),
            user: {
              email: SIGN_IN_REQUEST.variables.email,
              id: expect.anything(),
              name: 'testUser',
              type: 'SCHOOL',
            },
          },
        },
      });
    });

    it('SignIn with invalid email', async () => {
      await testEnv.app.get(UsersService).create(
        plainToInstance(AuthUserDTO, {
          name: 'testUser',
          email: SIGN_IN_REQUEST.variables.email,
          type: UserType.SCHOOL,
        }),
        {
          type: UserType.SCHOOL,
          name: 'testUser',
          email: SIGN_IN_REQUEST.variables.email,
          password: SIGN_IN_REQUEST.variables.password,
        },
      );

      const invalidEmailQuery = {
        ...SIGN_IN_REQUEST,
        variables: { ...SIGN_IN_REQUEST.variables, email: 'invalidEmail' },
      };
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(invalidEmailQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain(
        'Email must be a valid email address',
      );
    });

    it('SignIn with invalid password', async () => {
      await testEnv.app.get(UsersService).create(
        plainToInstance(AuthUserDTO, {
          name: 'testUser',
          email: SIGN_IN_REQUEST.variables.email,
          type: UserType.SCHOOL,
        }),
        {
          type: UserType.SCHOOL,
          name: 'testUser',
          email: SIGN_IN_REQUEST.variables.email,
          password: SIGN_IN_REQUEST.variables.password,
        },
      );

      const invalidPasswordQuery = {
        ...SIGN_IN_REQUEST,
        variables: { ...SIGN_IN_REQUEST.variables, password: '' },
      };
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(invalidPasswordQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain('Password is required');
    });
  });

  describe('IsLoggedIn', () => {
    it('IsLoggedIn without token', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send({ query: 'query{isLoggedIn}' })
        .expect(200);

      expect(response.body.errors[0].message).toContain('Unauthorized');
    });

    it('IsLoggedIn with token', async () => {
      const signUpResponse = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(SIGN_UP_REQUEST)
        .expect(200);

      const token = signUpResponse.body.data.signUp.token;

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({ query: 'query{isLoggedIn}' })
        .expect(200);

      expect(response.body).toMatchObject({
        data: {
          isLoggedIn: true,
        },
      });
    });
  });
});
