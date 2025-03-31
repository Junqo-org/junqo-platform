import * as request from 'supertest';
import { createTestingEnvironment } from './test-utils';
import { UserType } from '../src/users/dto/user-type.enum';
import { INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
import {
  GET_STUDENT_PROFILE_REQUEST,
  UPDATE_STUDENT_PROFILE_REQUEST,
} from './requests';

const adminUser = {
  type: UserType.ADMIN,
  email: 'admin@test.com',
  name: 'AdminUser',
  password: 'password123',
};

const studentUser = {
  type: UserType.STUDENT,
  email: 'student@test.com',
  name: 'StudentUser',
  password: 'password123',
};

const companyUser = {
  type: UserType.COMPANY,
  email: 'company@test.com',
  name: 'CompanyUser',
  password: 'password123',
};

describe('Profiles E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    environment: any;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };
  let adminToken: string;
  let adminUserId: string;
  let studentToken: string;
  let studentUserId: string;
  let companyToken: string;
  let companyUserId: string;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();

    const usersRepository = testEnv.app.get(UsersRepository);
    const authService = testEnv.app.get(AuthService);

    await usersRepository.create({
      name: adminUser.name,
      email: adminUser.email,
      type: UserType.ADMIN,
      password: adminUser.password,
    });

    const adminPayload = await authService.signIn({
      email: adminUser.email,
      password: adminUser.password,
    });
    adminUserId = adminPayload.user.id;
    adminToken = adminPayload.token;

    const studentPayload = await authService.signUp({
      name: studentUser.name,
      email: studentUser.email,
      type: UserType.STUDENT,
      password: studentUser.password,
    });
    studentUserId = studentPayload.user.id;
    studentToken = studentPayload.token;

    const companyPayload = await authService.signUp({
      name: companyUser.name,
      email: companyUser.email,
      type: UserType.COMPANY,
      password: companyUser.password,
    });
    companyUserId = companyPayload.user.id;
    companyToken = companyPayload.token;
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  describe('Query Profiles', () => {
    it('should get profile by ID', async () => {
      const getProfileRequest = {
        ...GET_STUDENT_PROFILE_REQUEST,
        variables: {
          userId: studentUserId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(getProfileRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.studentProfile).toBeDefined();
      expect(response.body.data.studentProfile.userId).toBe(studentUserId);
    });

    it('should throw not found error for non-existent profile ID', async () => {
      const nonExistentRequest = {
        ...GET_STUDENT_PROFILE_REQUEST,
        variables: {
          userId: '00000000-0000-0000-0000-000000000000',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nonExistentRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.status).toBe(404);
    });
  });

  describe('Update Profile', () => {
    it('should update student profile', async () => {
      const updateRequest = {
        ...UPDATE_STUDENT_PROFILE_REQUEST,
        variables: {
          studentProfileInput: {
            avatar: 'https://example.com/updated-avatar.jpg',
            skills: ['JavaScript', 'TypeScript', 'React'],
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateStudentProfile).toMatchObject({
        userId: studentUserId,
        skills: ['JavaScript', 'TypeScript', 'React'],
      });
    });

    it('should validate profile data', async () => {
      const updateRequest = {
        ...UPDATE_STUDENT_PROFILE_REQUEST,
        variables: {
          studentProfileInput: {
            avatar: 'INVALID URL',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.data).toBeUndefined();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('BAD_REQUEST');
    });
  });
});
