import * as request from 'supertest';
import { createTestingEnvironment } from './test-utils';
import {
  SIGN_IN_REQUEST,
  GET_USERS_REQUEST,
  GET_USER_BY_ID_REQUEST,
  UPDATE_USER_REQUEST,
  DELETE_USER_REQUEST,
} from './requests';
import { UserType } from '../src/users/dto/user-type.enum';
import { INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
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
    it('should get all users when authenticated as admin', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(GET_USERS_REQUEST)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.users.length).toBeGreaterThan(0);

      // Verify our created users exist in the list
      const users = response.body.data.users;
      expect(users.some((user) => user.id === adminUserId)).toBeTruthy();
      expect(users.some((user) => user.id === studentUserId)).toBeTruthy();
      expect(users.some((user) => user.id === companyUserId)).toBeTruthy();
    });

    it('should restrict access for non-admin users', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(GET_USERS_REQUEST)
        .expect(200);

      expect(response.body.errors[0].extensions.code).toContain('FORBIDDEN');
    });

    it('should get user by ID', async () => {
      const getUserRequest = {
        ...GET_USER_BY_ID_REQUEST,
        variables: {
          id: studentUserId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(getUserRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.user).toMatchObject({
        id: studentUserId,
        name: studentUser.name,
        email: studentUser.email,
        type: UserType.STUDENT,
      });
    });

    it('should throw not found error for non-existent user ID', async () => {
      const nonExistentRequest = {
        ...GET_USER_BY_ID_REQUEST,
        variables: {
          id: '00000000-0000-0000-0000-000000000000',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(nonExistentRequest)
        .expect(200);

      expect(response.body.errors[0].extensions.status).toBe(404);
    });
  });

  describe('Update User', () => {
    it('should update user details as admin', async () => {
      const newName = `Updated-${Date.now()}`;
      const newEmail = `updated-${Date.now()}@example.com`;

      const updateRequest = {
        ...UPDATE_USER_REQUEST,
        variables: {
          id: studentUserId,
          name: newName,
          email: newEmail,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateUser).toMatchObject({
        id: studentUserId,
        name: newName,
        email: newEmail,
      });
    });

    it('should allow users to update their own details', async () => {
      const newName = `SelfUpdated-${Date.now()}`;

      const updateRequest = {
        ...UPDATE_USER_REQUEST,
        variables: {
          id: studentUserId,
          name: newName,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateUser).toMatchObject({
        id: studentUserId,
        name: newName,
      });
    });

    it('should prevent updating other users without admin rights', async () => {
      const updateRequest = {
        ...UPDATE_USER_REQUEST,
        variables: {
          id: adminUserId,
          name: 'Attempted Hack',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('FORBIDDEN');
    });

    it('should validate email format', async () => {
      const updateRequest = {
        ...UPDATE_USER_REQUEST,
        variables: {
          id: studentUserId,
          email: 'invalid-email',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('email');
    });

    it('should validate name format', async () => {
      const updateRequest = {
        ...UPDATE_USER_REQUEST,
        variables: {
          id: companyUserId,
          name: '',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Name');
      expect(response.body.errors[0].extensions.code).toContain('BAD_REQUEST');
    });

    it('should update password', async () => {
      const newPassword = 'newPassword123';

      const updateRequest = {
        ...UPDATE_USER_REQUEST,
        variables: {
          id: studentUserId,
          password: newPassword,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();

      // Try to login with new password
      const signInRequest = {
        ...SIGN_IN_REQUEST,
        variables: {
          email: response.body.data.updateUser.email,
          password: newPassword,
        },
      };

      const signInResponse = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .send(signInRequest)
        .expect(200);

      expect(signInResponse.body.errors).toBeUndefined();
      expect(signInResponse.body.data.signIn).toHaveProperty('token');
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

    it('should delete user as admin', async () => {
      const deleteRequest = {
        ...DELETE_USER_REQUEST,
        variables: {
          id: tempUserId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteUser).toBe(true);

      // Verify the user is deleted
      const getUserRequest = {
        ...GET_USER_BY_ID_REQUEST,
        variables: {
          id: tempUserId,
        },
      };

      const verifyResponse = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(getUserRequest)
        .expect(200);

      expect(verifyResponse.body.data.user).toBeNull();
    });

    it('should allow users to delete their own account', async () => {
      const deleteRequest = {
        ...DELETE_USER_REQUEST,
        variables: {
          id: tempUserId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${tempUserToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteUser).toBe(true);
    });

    it('should prevent deleting other users without admin rights', async () => {
      const deleteRequest = {
        ...DELETE_USER_REQUEST,
        variables: {
          id: tempUserId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('FORBIDDEN');
    });

    it('should return error for non-existent user ID', async () => {
      const deleteRequest = {
        ...DELETE_USER_REQUEST,
        variables: {
          id: 'fb3da01e-501e-47b7-9bd0-eacb8c4e3978',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');
      expect(response.body.errors[0].extensions.status).toBe(404);
    });
  });
});
