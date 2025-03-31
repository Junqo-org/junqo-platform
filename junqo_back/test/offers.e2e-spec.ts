import * as request from 'supertest';
import { createTestingEnvironment } from './test-utils';
import { UserType } from '../src/users/dto/user-type.enum';
import { INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
import { OffersService } from '../src/offers/offers.service';
import {
  GET_OFFERS_REQUEST,
  GET_OFFER_BY_ID_REQUEST,
  CREATE_OFFER_REQUEST,
  UPDATE_OFFER_REQUEST,
  DELETE_OFFER_REQUEST,
} from './requests';
import { OfferStatus } from '../src/offers/dto/offer-status.enum';
import { OfferType } from '../src/offers/dto/offer-type.enum';
import { WorkContext } from '../src/offers/dto/work-context.enum';

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
  workLocationType: WorkContext.HYBRID,
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
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  describe('Query Offers', () => {
    it('should get all offers', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(GET_OFFERS_REQUEST)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.offers).toBeInstanceOf(Array);
      expect(response.body.data.offers.length).toBeGreaterThanOrEqual(1);
    });

    it('should get offer by ID', async () => {
      const getOfferRequest = {
        ...GET_OFFER_BY_ID_REQUEST,
        variables: {
          offerId: testOffer.id,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(getOfferRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.offer).toMatchObject({
        id: testOffer.id,
        ...testOfferData,
      });
    });

    it('should throw not found error for non-existent offer ID', async () => {
      const nonExistentRequest = {
        ...GET_OFFER_BY_ID_REQUEST,
        variables: {
          offerId: '00000000-0000-0000-0000-000000000000',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(nonExistentRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.status).toBe(404);
    });
  });

  describe('Create Offer', () => {
    it('should create a new offer as company', async () => {
      const createRequest = {
        ...CREATE_OFFER_REQUEST,
        variables: {
          offerInput: {
            userId: companyUserId,
            title: 'Data Science Intern',
            description: 'Work with big data and ML models',
            status: 'ACTIVE',
            skills: ['Python', 'SQL', 'Machine Learning'],
            offerType: 'INTERNSHIP',
            workLocationType: 'REMOTE',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(createRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createOffer).toMatchObject({
        title: 'Data Science Intern',
        description: 'Work with big data and ML models',
        status: 'ACTIVE',
        skills: ['Python', 'SQL', 'Machine Learning'],
        offerType: 'INTERNSHIP',
        workLocationType: 'REMOTE',
        userId: companyUserId,
      });
    });

    it('should prevent students from creating offers', async () => {
      const createRequest = {
        ...CREATE_OFFER_REQUEST,
        variables: {
          offerInput: {
            userId: companyUserId,
            title: 'Fake Internship',
            description: 'This should not work',
            status: 'ACTIVE',
            skills: ['Deception'],
            offerType: 'INTERNSHIP',
            workLocationType: 'ON_SITE',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(createRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('FORBIDDEN');
    });

    it('should validate offer data', async () => {
      const createRequest = {
        ...CREATE_OFFER_REQUEST,
        variables: {
          offerInput: {
            userId: companyUserId,
            title: '',
            description: '',
            status: 'INVALID_STATUS',
            skills: [],
            offerType: 'INVALID_TYPE',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(createRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('BAD_REQUEST');
    });
  });

  describe('Update Offer', () => {
    it('should update an offer as the company who created it', async () => {
      const updateRequest = {
        ...UPDATE_OFFER_REQUEST,
        variables: {
          offerId: testOffer.id,
          offerInput: {
            title: 'Updated Software Engineer Intern',
            description: 'Updated description',
            status: 'INACTIVE',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateOffer).toMatchObject({
        id: testOffer.id,
        title: 'Updated Software Engineer Intern',
        description: 'Updated description',
        status: 'INACTIVE',
      });
    });

    it('should allow admins to update any offer', async () => {
      const updateRequest = {
        ...UPDATE_OFFER_REQUEST,
        variables: {
          offerId: testOffer.id,
          offerInput: {
            title: 'Admin Updated Title',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateOffer).toMatchObject({
        id: testOffer.id,
        title: 'Admin Updated Title',
      });
    });

    it('should prevent students from updating offers', async () => {
      const updateRequest = {
        ...UPDATE_OFFER_REQUEST,
        variables: {
          offerId: testOffer.id,
          offerInput: {
            title: 'Student Hack Attempt',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('FORBIDDEN');
    });

    it('should validate update data', async () => {
      const updateRequest = {
        ...UPDATE_OFFER_REQUEST,
        variables: {
          offerId: testOffer.id,
          offerInput: {
            status: 'INVALID_STATUS',
          },
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(updateRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('BAD_REQUEST');
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
      const deleteRequest = {
        ...DELETE_OFFER_REQUEST,
        variables: {
          offerId: tempOfferId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${companyToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteOffer).toBe(true);

      // Verify the offer is deleted
      const getOfferRequest = {
        ...GET_OFFER_BY_ID_REQUEST,
        variables: {
          offerId: tempOfferId,
        },
      };

      const verifyResponse = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(getOfferRequest)
        .expect(200);

      expect(verifyResponse.body.errors).toBeDefined();
      expect(verifyResponse.body.errors[0].extensions.status).toBe(404);
    });

    it('should allow admin to delete any offer', async () => {
      const deleteRequest = {
        ...DELETE_OFFER_REQUEST,
        variables: {
          offerId: tempOfferId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteOffer).toBe(true);
    });

    it('should prevent students from deleting offers', async () => {
      const deleteRequest = {
        ...DELETE_OFFER_REQUEST,
        variables: {
          offerId: tempOfferId,
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toContain('FORBIDDEN');
    });

    it('should return error for non-existent offer ID', async () => {
      const deleteRequest = {
        ...DELETE_OFFER_REQUEST,
        variables: {
          offerId: '00000000-0000-0000-0000-000000000000',
        },
      };

      const response = await request(testEnv.app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(deleteRequest)
        .expect(200);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('not found');
      expect(response.body.errors[0].extensions.status).toBe(404);
    });
  });
});
