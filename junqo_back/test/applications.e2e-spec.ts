/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { UserType } from '../src/users/dto/user-type.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
import { ApplicationsService } from '../src/applications/applications.service';
import { ApplicationStatus } from '../src/applications/dto/application-status.enum';
import { OfferStatus } from '../src/offers/dto/offer-status.enum';
import { OfferType } from '../src/offers/dto/offer-type.enum';
import { WorkContext } from '../src/offers/dto/work-context.enum';
import { OffersService } from '../src/offers/offers.service';
import { OfferDTO } from '../src/offers/dto/offer.dto';

const baseRoute = '/api/v1/applications';
const authBaseRoute = '/api/v1/auth';

// Test users data
const adminUser = {
  type: UserType.ADMIN,
  email: 'admin-applications@test.com',
  name: 'AdminUserApplications',
  password: 'password123',
};

const studentUser = {
  type: UserType.STUDENT,
  email: 'student-applications@test.com',
  name: 'StudentUserApplications',
  password: 'password123',
};

const companyUser = {
  type: UserType.COMPANY,
  email: 'company-applications@test.com',
  name: 'CompanyUserApplications',
  password: 'password123',
};

const testOfferData = {
  title: 'Software Engineer Intern',
  description: 'Exciting internship opportunity',
  status: OfferStatus.ACTIVE,
  skills: ['JavaScript', 'Node.js'],
  offerType: OfferType.INTERNSHIP,
  duration: 6,
  salary: 600,
  benefits: ['Coffee'],
  educationLevel: 5,
  workLocationType: WorkContext.HYBRID,
};

describe('Applications E2E Tests', () => {
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
  let testOffer: OfferDTO;
  let testApplication;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();

    const usersRepository = testEnv.app.get(UsersRepository);
    const authService = testEnv.app.get(AuthService);
    const offersService = testEnv.app.get(OffersService);
    const applicationsService = testEnv.app.get(ApplicationsService);

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

    const companyUserAuth = {
      id: companyUserId,
      name: companyUser.name,
      email: companyUser.email,
      type: UserType.COMPANY,
    };

    const studentUserAuth = {
      id: studentUserId,
      name: studentUser.name,
      email: studentUser.email,
      type: UserType.STUDENT,
    };

    testOffer = await offersService.createOffer(companyUserAuth, {
      ...testOfferData,
      userId: companyUserId,
    });

    testApplication = await applicationsService.create(
      studentUserAuth,
      testOffer.id,
    );
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  describe('Query Applications', () => {
    it('applications query empty', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it('complete applications query', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query(
          `companyId=${companyUserId}&studentId=${studentUserId}&offerId=${testOffer.id}&status=NOT_OPENED&offset=0&limit=1`,
        )
        .expect(HttpStatus.OK);

      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBe(1);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Create Application', () => {
    it('should create a new application as student', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/apply/${testOffer.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        studentId: studentUserId,
        companyId: companyUserId,
        offerId: testOffer.id,
        status: 'NOT_OPENED',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should prevent company from creating applications', async () => {
      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/apply/${testOffer.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Update Application', () => {
    it('should update an application as the related company', async () => {
      const updateData = {
        status: ApplicationStatus.PENDING,
      };

      const response = await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testApplication.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        studentId: studentUserId,
        companyId: companyUserId,
        offerId: testOffer.id,
        status: 'PENDING',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
    it('should prevent students from updating applications', async () => {
      const updateData = {
        status: ApplicationStatus.PENDING,
      };

      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testApplication.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        status: 'INVALID_STATUS',
      };

      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testApplication.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send(invalidUpdateData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
