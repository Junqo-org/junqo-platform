import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';
import { UsersService } from '../src/users/users.service';
import { UserType } from '../src/users/dto/user-type.enum';
import { Sequelize } from 'sequelize-typescript';
import { plainToInstance } from 'class-transformer';
import { AuthUserDTO } from '../src/shared/dto/auth-user.dto';

const SignUpQuery = {
  query: `mutation signup(
      $type: UserType!
      $email: Email!
      $name: String!
      $password: String!
    ) {
      signUp(type: $type, email: $email, name: $name, password: $password) {
        token
        user {
          ...data
        }
      }
    }

    fragment data on User {
      id
      name
      email
      type
    }`,
  variables: {
    type: 'SCHOOL',
    email: 'email@email.com',
    name: 'testUser',
    password: 'password',
  },
};

const SignInQuery = {
  query: `mutation signin($email: Email!, $password: String!) {
      signIn(email: $email, password: $password) {
        token
        user {
          ...data
        }
      }
    }

    fragment data on User {
      id
      name
      email
      type
    }`,
  variables: {
    email: 'email@email.com',
    password: 'password',
  },
};

describe('end to end testing', () => {
  let environment: StartedDockerComposeEnvironment;
  let app: INestApplication;

  beforeAll(async () => {
    const composeFilePath = './test';
    const composeFile = 'docker-compose.test.yaml';
    const requiredEnvVars = {
      DATABASE_PASSWORD_FILE: 'db_password_test.conf',
      DATABASE_NAME: process.env.DATABASE_NAME,
      DATABASE_USER: process.env.DATABASE_USER,
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        throw new Error(`Required environment variable ${key} is not set`);
      }
    }

    environment = await new DockerComposeEnvironment(
      composeFilePath,
      composeFile,
    )
      .withEnvironment({ ...requiredEnvVars })
      .withWaitStrategy('junqo_db_test', Wait.forHealthCheck())
      .up(['db']);

    // Wait for the environment to be fully ready
    const dbContainer = environment.getContainer('junqo_db_test');
    if (!dbContainer) {
      throw new Error('Database container not found');
    }

    console.log('Database container is ready.');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 60000);

  afterEach(async () => {
    const sequelize = app.get(Sequelize);
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await app.close();
    await environment.down({ timeout: 10000 });
  });

  it('Health check', async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: 'query{__typename}' })
      .expect(200);
  });

  describe('Sign Up', () => {
    it('SignUp User', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(SignUpQuery)
        .expect(200);

      expect(response.body).toMatchObject({
        data: {
          signUp: {
            token: expect.anything(),
            user: {
              email: SignUpQuery.variables.email,
              id: expect.anything(),
              name: SignUpQuery.variables.name,
              type: SignUpQuery.variables.type,
            },
          },
        },
      });
    });

    it('SignUp with invalid email format', async () => {
      const invalidEmailQuery = {
        ...SignUpQuery,
        variables: { ...SignUpQuery.variables, email: 'invalidEmail' },
      };
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(invalidEmailQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain(
        'Validation isEmail on email failed',
      );
    });

    it('SignUp with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send(SignUpQuery)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(SignUpQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain('Email already exists');
    });

    it('SignUp with invalid password', async () => {
      const invalidPasswordQuery = {
        ...SignUpQuery,
        variables: {
          ...SignUpQuery.variables,
          email: 'email2@mail.com',
          password: '',
        },
      };
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(invalidPasswordQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain(
        'Password must be at least 8 characters',
      );
    });

    it('SignUp with invalid user type', async () => {
      const invalidUserTypeQuery = {
        ...SignUpQuery,
        variables: {
          ...SignUpQuery.variables,
          email: 'email3@mail.com',
          type: 'INVALID_TYPE',
        },
      };
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(invalidUserTypeQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain('invalid value');
    });
  });

  describe('Sign In', () => {
    it('SignIn User', async () => {
      await app.get(UsersService).create(
        plainToInstance(AuthUserDTO, {
          name: 'testUser',
          email: SignInQuery.variables.email,
          type: UserType.SCHOOL,
        }),
        {
          type: UserType.SCHOOL,
          name: 'testUser',
          email: SignInQuery.variables.email,
          password: SignInQuery.variables.password,
        },
      );

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(SignInQuery)
        .expect(200);

      expect(response.body).toMatchObject({
        data: {
          signIn: {
            token: expect.anything(),
            user: {
              email: SignInQuery.variables.email,
              id: expect.anything(),
              name: 'testUser',
              type: 'SCHOOL',
            },
          },
        },
      });
    });

    it('SignIn with invalid email', async () => {
      await app.get(UsersService).create(
        plainToInstance(AuthUserDTO, {
          name: 'testUser',
          email: SignInQuery.variables.email,
          type: UserType.SCHOOL,
        }),
        {
          type: UserType.SCHOOL,
          name: 'testUser',
          email: SignInQuery.variables.email,
          password: SignInQuery.variables.password,
        },
      );

      const invalidEmailQuery = {
        ...SignInQuery,
        variables: { ...SignInQuery.variables, email: 'invalidEmail' },
      };
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(invalidEmailQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain(
        'Invalid email or password',
      );
    });

    it('SignIn with invalid password', async () => {
      await app.get(UsersService).create(
        plainToInstance(AuthUserDTO, {
          name: 'testUser',
          email: SignInQuery.variables.email,
          type: UserType.SCHOOL,
        }),
        {
          type: UserType.SCHOOL,
          name: 'testUser',
          email: SignInQuery.variables.email,
          password: SignInQuery.variables.password,
        },
      );

      const invalidPasswordQuery = {
        ...SignInQuery,
        variables: { ...SignInQuery.variables, password: '' },
      };
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send(invalidPasswordQuery)
        .expect(200);

      expect(response.body.errors[0].message).toContain(
        'Invalid email or password',
      );
    });
  });

  describe('IsLoggedIn', () => {
    it('IsLoggedIn without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: 'query{isLoggedIn}' })
        .expect(200);

      expect(response.body.errors[0].message).toContain('Unauthorized');
    });

    it('IsLoggedIn with token', async () => {
      const signUpResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send(SignUpQuery)
        .expect(200);

      const token = signUpResponse.body.data.signUp.token;

      const response = await request(app.getHttpServer())
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
