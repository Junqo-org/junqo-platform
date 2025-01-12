import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

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

describe('z', () => {
  let environment: StartedDockerComposeEnvironment;
  let app: INestApplication;

  beforeAll(async () => {
    const composeFilePath = './test';
    const composeFile = 'docker-compose.test.yaml';

    environment = await new DockerComposeEnvironment(
      composeFilePath,
      composeFile,
    )
      .withEnvironment({
        DATABASE_PASSWORD_FILE: 'db_password_test.conf',
        DATABASE_NAME: process.env.DATABASE_NAME,
        DATABASE_USER: process.env.DATABASE_USER,
      })
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
  }, 30000);

  afterAll(async () => {
    app.close();
    await environment.down({ timeout: 10000 });
  });

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
});
