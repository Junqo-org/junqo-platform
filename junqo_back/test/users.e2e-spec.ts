/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { UserType } from '../src/users/dto/user-type.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';

const baseRoute = '/api/v1/users';
const authBaseRoute = '/api/v1/auth';

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

describe('Users E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    environment: any;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };
  let adminToken: string;
  let studentToken: string;
  let companyToken: string;
  let adminUserId: string;
  let studentUserId: string;
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

  // Optionally reset database between test blocks if needed
  afterEach(async () => {
    // Comment this out if you want persistent data between tests in the same file
    // await testEnv.resetDatabase();
  });

  describe('Query Users', () => {
    it('should get current user profile when authenticated', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/me`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(adminUserId);
      expect(response.body.name).toBe(adminUser.name);
      expect(response.body.email).toBe(adminUser.email);
      expect(response.body.type).toBe(UserType.ADMIN);
      // Password should not be returned
      expect(response.body.hashedPassword).toBeUndefined();
    });

    it('should not allow access to user profile without authentication', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/me`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Update User', () => {
    it('should update user profile details', async () => {
      const newName = `SelfUpdated-${Date.now()}`;
      const newEmail = `updated-${Date.now()}@example.com`;

      const response = await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/me`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          name: newName,
          email: newEmail,
        })
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: studentUserId,
        name: newName,
        email: newEmail,
      });
    });

    it('should validate email format when updating profile', async () => {
      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/me`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          email: 'invalid-email',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should validate name format when updating profile', async () => {
      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/me`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          name: '',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should update user password', async () => {
      const newPassword = 'newPassword123';

      // Update password
      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/me`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send({
          password: newPassword,
        })
        .expect(HttpStatus.OK);

      // Try to sign in with new password
      // Assuming you have a sign-in endpoint
      const signInResponse = await request(testEnv.app.getHttpServer())
        .post(`${authBaseRoute}/login`)
        .send({
          email: companyUser.email,
          password: newPassword,
        })
        .expect(HttpStatus.CREATED);

      expect(signInResponse.body.token).toBeDefined();
    });
  });

  describe('Delete User', () => {
    let tempUserId: string;
    let tempUserToken: string;

    beforeEach(async () => {
      const authService = testEnv.app.get(AuthService);

      const tempEmail = `temp-${Date.now()}@test.com`;
      const tempName = `TempUser-${Date.now()}`;
      const tempPassword = 'password123';

      const tempUserPayload = await authService.signUp({
        name: tempName,
        email: tempEmail,
        type: UserType.STUDENT,
        password: tempPassword,
      });
      tempUserId = tempUserPayload.user.id;
      tempUserToken = tempUserPayload.token;
    });

    it('should allow users to delete their own account', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/me`)
        .set('Authorization', `Bearer ${tempUserToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);

      // Verify user was deleted by trying to access
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/me`)
        .set('Authorization', `Bearer ${tempUserToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
