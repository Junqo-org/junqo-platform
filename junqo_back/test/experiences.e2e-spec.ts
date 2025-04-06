import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { UserType } from '../src/users/dto/user-type.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';

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

describe('Experiences E2E Tests', () => {
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
    await request(testEnv.app.getHttpServer())
      .patch(baseRoute + '/my')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        avatar: 'https://example.com/avatar1.jpg',
        skills: ['JavaScript', 'React', 'Node.js'],
      });

    await request(testEnv.app.getHttpServer())
      .patch(baseRoute + '/my')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({
        avatar: 'https://example.com/avatar2.jpg',
        skills: ['Python', 'Django', 'JavaScript'],
      });
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  describe('Experience Management', () => {
    let experienceId: string;

    it('should add experience to student profile', async () => {
      const experienceData = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        startDate: '2022-01-01',
        endDate: '2023-01-01',
        description: 'Worked on various web projects',
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/api/v1/experiences/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(experienceData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toMatchObject(experienceData);

      experienceId = response.body.id;
    });

    it('should get all experiences for current user', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get('/api/v1/experiences/my')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should update an experience', async () => {
      const updateData = {
        title: 'Senior Software Engineer',
        description: 'Led team projects and mentored junior developers',
      };

      const response = await request(testEnv.app.getHttpServer())
        .patch(`/api/v1/experiences/my/${experienceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: experienceId,
        ...updateData,
      });
    });

    it('should delete an experience', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .delete(`/api/v1/experiences/my/${experienceId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);

      // Verify it's deleted
      const profileResponse = await request(testEnv.app.getHttpServer())
        .get(`/api/v1/experiences/my`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      const experienceStillExists = profileResponse.body.some(
        (exp) => exp.id === experienceId,
      );
      expect(experienceStillExists).toBe(false);
    });
  });
});
