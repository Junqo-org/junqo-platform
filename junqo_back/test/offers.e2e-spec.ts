/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import { createTestingEnvironment } from './test-setup';
import { UserType } from '../src/users/dto/user-type.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
import { OffersService } from '../src/offers/offers.service';
import { OfferStatus } from '../src/offers/dto/offer-status.enum';
import { OfferType } from '../src/offers/dto/offer-type.enum';
import { WorkContext } from '../src/offers/dto/work-context.enum';
import { RandomUuid } from 'testcontainers';

const baseRoute = '/api/v1/offers';
const authBaseRoute = '/api/v1/auth';

// Test users data
const adminUser = {
  type: UserType.ADMIN,
  email: 'admin-offers@test.com',
  name: 'AdminUserOffers',
  password: 'password123',
};

const studentUser = {
  type: UserType.STUDENT,
  email: 'student-offers@test.com',
  name: 'StudentUserOffers',
  password: 'password123',
};

const companyUser = {
  type: UserType.COMPANY,
  email: 'company-offers@test.com',
  name: 'CompanyUserOffers',
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

const secondTestOfferData = {
  title: 'Backend Developer Intern',
  description: 'Backend development opportunity',
  status: OfferStatus.ACTIVE,
  skills: ['Python', 'Django'],
  offerType: OfferType.INTERNSHIP,
  duration: 3,
  salary: 500,
  benefits: ['Flexible Hours'],
  educationLevel: 3,
  workLocationType: WorkContext.ON_SITE,
};

describe('Offers E2E Tests', () => {
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
  let testOffer;
  let secondTestOffer;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();

    const usersRepository = testEnv.app.get(UsersRepository);
    const authService = testEnv.app.get(AuthService);
    const offersService = testEnv.app.get(OffersService);

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

    const studentUserAuth = {
      id: studentUserId,
      name: studentUser.name,
      email: studentUser.email,
      type: UserType.STUDENT,
    };

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

    testOffer = await offersService.createOffer(companyUserAuth, {
      ...testOfferData,
      userId: companyUserId,
    });

    secondTestOffer = await offersService.createOffer(companyUserAuth, {
      ...secondTestOfferData,
      userId: companyUserId,
    });

    await offersService.markOfferAsViewed(studentUserAuth, testOffer.id);
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  describe('Query Offers', () => {
    it('offers query empty', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it('complete offers query', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query(
          `userId=${companyUserId}&title=Engineer&skills=JavaScript&mode=any&offerType=INTERNSHIP&duration=6&salary=600&workLocationType=HYBRID&benefits=Coffee&educationLevel=5&offset=0&limit=1`,
        )
        .expect(HttpStatus.OK);

      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
      expect(response.body.count).toBeGreaterThanOrEqual(1);
    });

    it('should filter offers by seen status - all offers (default)', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query('seen=any')
        .expect(HttpStatus.OK);

      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBeGreaterThanOrEqual(2);
      expect(response.body.count).toBeGreaterThanOrEqual(2);
    });

    it('should filter offers by seen status - unseen offers only', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query('seen=false')
        .expect(HttpStatus.OK);

      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBe(1);
      expect(response.body.count).toBe(1);
    });

    it('should filter offers by seen status - seen offers only', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query('seen=true')
        .expect(HttpStatus.OK);

      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBe(1);
      expect(response.body.count).toBe(1);
      expect(response.body.rows[0].id).toBe(testOffer.id);
    });
  });

  describe('Get Offer by ID', () => {
    it('should get offer by ID', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testOffer.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: testOffer.id,
        title: testOfferData.title,
        description: testOfferData.description,
        status: testOfferData.status,
        skills: testOfferData.skills,
        offerType: testOfferData.offerType,
        workLocationType: testOfferData.workLocationType,
      });
    });

    it('should throw not found error for non-existent offer ID', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${crypto.randomUUID()}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Create Offer', () => {
    it('should create a new offer as company', async () => {
      const newOfferData = {
        userId: companyUserId,
        title: 'Data Science Intern',
        description: 'Work with big data and ML models',
        status: OfferStatus.ACTIVE,
        skills: ['Python', 'SQL', 'Machine Learning'],
        offerType: OfferType.INTERNSHIP,
        workLocationType: WorkContext.TELEWORKING,
      };

      const response = await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send(newOfferData)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        title: 'Data Science Intern',
        description: 'Work with big data and ML models',
        status: OfferStatus.ACTIVE,
        skills: ['Python', 'SQL', 'Machine Learning'],
        offerType: OfferType.INTERNSHIP,
        workLocationType: WorkContext.TELEWORKING,
        userId: companyUserId,
      });
    });

    it('should prevent students from creating offers', async () => {
      const newOfferData = {
        userId: companyUserId,
        title: 'Fake Internship',
        description: 'This should not work',
        status: OfferStatus.ACTIVE,
        skills: ['Deception'],
        offerType: OfferType.INTERNSHIP,
        workLocationType: WorkContext.ON_SITE,
      };

      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(newOfferData)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should validate offer data', async () => {
      const invalidOfferData = {
        userId: companyUserId,
        title: '',
        description: '',
        status: 'INVALID_STATUS',
        skills: [],
        offerType: 'INVALID_TYPE',
      };

      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send(invalidOfferData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Update Offer', () => {
    it('should update an offer as the company who created it', async () => {
      const updateData = {
        title: 'Updated Software Engineer Intern',
        description: 'Updated description',
        status: OfferStatus.INACTIVE,
      };

      const response = await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testOffer.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: testOffer.id,
        title: 'Updated Software Engineer Intern',
        description: 'Updated description',
        status: OfferStatus.INACTIVE,
      });
    });

    it('should allow admins to update any offer', async () => {
      const updateData = {
        title: 'Admin Updated Title',
      };

      const response = await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testOffer.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        id: testOffer.id,
        title: 'Admin Updated Title',
      });
    });

    it('should prevent students from updating offers', async () => {
      const updateData = {
        title: 'Student Hack Attempt',
      };

      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testOffer.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateData)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should validate update data', async () => {
      const invalidUpdateData = {
        status: 'INVALID_STATUS',
      };

      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testOffer.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .send(invalidUpdateData)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Delete Offer', () => {
    let tempOfferId: string;

    beforeEach(async () => {
      // Get the service
      const offersService = testEnv.app.get(OffersService);

      // Create a temporary offer using the service directly
      const companyUserObj = {
        id: companyUserId,
        name: companyUser.name,
        email: companyUser.email,
        type: UserType.COMPANY,
      };

      const tempOffer = await offersService.createOffer(companyUserObj, {
        userId: companyUserId,
        title: 'Temporary Offer',
        description: 'This will be deleted',
        status: OfferStatus.ACTIVE,
        skills: ['Test Skill'],
        offerType: OfferType.INTERNSHIP,
        workLocationType: WorkContext.ON_SITE,
      });

      tempOfferId = tempOffer.id;
    });

    it('should delete an offer as the company who created it', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${tempOfferId}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);

      // Verify the offer is deleted
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${tempOfferId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should allow admin to delete any offer', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${tempOfferId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.isSuccessful).toBe(true);
    });

    it('should prevent students from deleting offers', async () => {
      await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${tempOfferId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return error for non-existent offer ID', async () => {
      await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${crypto.randomUUID()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('Get Company Offers', () => {
    it("should get company's own offers", async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/my`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Mark Offer as Viewed', () => {
    it('should mark an offer as viewed by student', async () => {
      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/view/${secondTestOffer.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should not allow company to mark an offer as viewed', async () => {
      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/view/${testOffer.id}`)
        .set('Authorization', `Bearer ${companyToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return error for non-existent offer ID when marking as viewed', async () => {
      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/view/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should require authentication to mark offer as viewed', async () => {
      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/view/${testOffer.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
