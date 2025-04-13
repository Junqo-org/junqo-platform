/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { UserType } from '../src/users/dto/user-type.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
import { StudentProfilesRepository } from '../src/student-profiles/repository/student-profiles.repository';

const baseRoute = '/api/v1/student-profiles';

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

const studentUser2 = {
  type: UserType.STUDENT,
  email: 'student2@test.com',
  name: 'StudentUser2',
  password: 'password123',
};

describe('Student Profiles E2E Tests', () => {
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
  let student2Token: string;
  let student2UserId: string;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();

    const studentProfilesRepository = testEnv.app.get(
      StudentProfilesRepository,
    );
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

    const student2Payload = await authService.signUp({
      name: studentUser2.name,
      email: studentUser2.email,
      type: UserType.STUDENT,
      password: studentUser2.password,
    });
    student2UserId = student2Payload.user.id;
    student2Token = student2Payload.token;

    // Setup profiles with skills for search testing
    await studentProfilesRepository.update(studentUserId, {
      avatar: 'https://example.com/avatar1.jpg',
      skills: ['JavaScript', 'React', 'Node.js'],
    });

    await studentProfilesRepository.update(student2UserId, {
      avatar: 'https://example.com/avatar2.jpg',
      skills: ['Python', 'Django', 'JavaScript'],
    });
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  describe('Permission Tests', () => {
    it('should allow company users to view student profiles', async () => {
      await request(testEnv.app.getHttpServer())
        .get(baseRoute + '/' + studentUserId)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.OK);
    });

    it('should allow admin users to view student profiles', async () => {
      await request(testEnv.app.getHttpServer())
        .get(baseRoute + '/' + studentUserId)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);
    });

    it('should prevent student users from reading other student profiles', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute + '/' + student2UserId)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Query Student Profiles', () => {
    it('should get student profile by ID', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute + '/' + studentUserId)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.userId).toBe(studentUserId);
    });

    it('should throw not found error for non-existent student profile ID', async () => {
      const nonExistantUserId = '9d13a063-d7fc-4b74-ba55-3348b08494e1';
      await request(testEnv.app.getHttpServer())
        .get(baseRoute + '/' + nonExistantUserId)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(404);
    });

    it('should get current student profile with my endpoint', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute + '/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.userId).toBe(studentUserId);
      expect(response.body.name).toBe(studentUser.name);
    });

    it('should query students by skills', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute)
        .query('skills=JavaScript')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.rows.length).toBeGreaterThanOrEqual(2);
      expect(response.body.count).toBeGreaterThanOrEqual(2);
    });

    it('should query students by multiple skills', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute)
        .query('skills=Python,Django')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
      const hasStudent = response.body.rows.some(
        (profile) => profile.userId === student2UserId,
      );
      expect(hasStudent).toBe(true);
    });

    it('should query students with offset and limit', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute)
        .query('offset=1&limit=1')
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.rows.length).toBe(1);
      expect(response.body.count).toBe(2);
    });

    it('should query students without query parameter', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(baseRoute)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.rows.length).toBe(2);
      expect(response.body.count).toBe(2);
    });
  });

  describe('Update Student Profile', () => {
    it('should update student profile', async () => {
      const updateRequest = {
        avatar: 'https://picsum.photos/200/400',
        skills: ['JavaScript', 'TypeScript', 'React'],
        experiences: [
          {
            title: 'experience1',
            company: 'junqo',
            startDate: '2022-01-01',
            endDate: '2022-03-01',
            description: 'experience description',
            skills: ['TypeScript'],
          },
        ],
      };

      const response = await request(testEnv.app.getHttpServer())
        .patch(baseRoute + '/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        userId: studentUserId,
        name: studentUser.name,
        ...updateRequest,
      });
    });

    it('should validate student profile data', async () => {
      const updateRequest = {
        avatar: 'INVALID URL',
      };

      await request(testEnv.app.getHttpServer())
        .patch(baseRoute + '/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
