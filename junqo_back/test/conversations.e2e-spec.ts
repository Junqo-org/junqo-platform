/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import * as crypto from 'crypto';
import { createTestingEnvironment } from './test-setup';
import { UserType } from '../src/users/dto/user-type.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
import { ConversationsService } from '../src/conversations/conversations.service';
import {
  ConversationDTO,
  CreateConversationDTO,
} from '../src/conversations/dto/conversation.dto';
import { ConversationQueryDTO } from '../src/conversations/dto/conversation-query.dto';
import { AuthUserDTO } from '../src/shared/dto/auth-user.dto';
import { CreateMessageDTO, MessageDTO } from '../src/messages/dto/message.dto';
import { MessagesService } from '../src/messages/messages.service';

const baseRoute = '/api/v1/conversations';

// Test users data
const adminUser = {
  type: UserType.ADMIN,
  email: 'admin-messaging@test.com',
  name: 'AdminUserMessaging',
  password: 'password123',
};

const studentUser = {
  type: UserType.STUDENT,
  email: 'student-messaging@test.com',
  name: 'StudentUserMessaging',
  password: 'password123',
};

const companyUser = {
  type: UserType.COMPANY,
  email: 'company-messaging@test.com',
  name: 'CompanyUserMessaging',
  password: 'password123',
};

const anotherStudentUser = {
  type: UserType.STUDENT,
  email: 'student2-messaging@test.com',
  name: 'StudentUser2Messaging',
  password: 'password123',
};

describe('Messaging System E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    environment: any;
    resetDatabase: () => Promise<void>;
    tearDown: () => Promise<void>;
  };
  let conversationsService: ConversationsService;
  let messagesService: MessagesService;

  let adminUserAuth: AuthUserDTO;
  let adminToken: string;
  let adminUserId: string;
  let studentToken: string;
  let studentUserId: string;
  let companyToken: string;
  let companyUserId: string;
  let anotherStudentToken: string;
  let anotherStudentUserId: string;
  let testConversation: ConversationDTO;
  let testMessage: MessageDTO;

  beforeAll(async () => {
    testEnv = await createTestingEnvironment();

    const usersRepository = testEnv.app.get(UsersRepository);
    const authService = testEnv.app.get(AuthService);
    conversationsService = testEnv.app.get(ConversationsService);
    messagesService = testEnv.app.get(MessagesService);

    // Create users and get tokens
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

    const anotherStudentPayload = await authService.signUp({
      name: anotherStudentUser.name,
      email: anotherStudentUser.email,
      type: UserType.STUDENT,
      password: anotherStudentUser.password,
    });
    anotherStudentUserId = anotherStudentPayload.user.id;
    anotherStudentToken = anotherStudentPayload.token;

    // Create a test conversation
    const createConversationDto: CreateConversationDTO = {
      participantsIds: [studentUserId, companyUserId],
      title: 'Default conversation title',
    };

    adminUserAuth = {
      id: adminUserId,
      name: adminUser.name,
      email: adminUser.email,
      type: UserType.ADMIN,
    };

    testConversation = await conversationsService.create(
      adminUserAuth,
      createConversationDto,
    );

    const createMessageDto: CreateMessageDTO = {
      conversationId: testConversation.id,
      senderId: adminUserId,
      content: 'Test message',
    };

    testMessage = await messagesService.create(adminUserAuth, createMessageDto);

    const createSecondConversationDto: CreateConversationDTO = {
      participantsIds: [anotherStudentUserId, companyUserId],
      title: 'Second conversation title',
    };

    await conversationsService.create(
      adminUserAuth,
      createSecondConversationDto,
    );
  }, 60000);

  afterAll(async () => {
    await testEnv.tearDown();
  });

  describe('Create Conversation', () => {
    it('should create a new conversation and include current user as participant', async () => {
      const createDto: CreateConversationDTO = {
        participantsIds: [studentUserId, companyUserId],
        title: 'Title',
      };

      const response = await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        participantsIds: expect.arrayContaining([
          ...createDto.participantsIds,
          adminUserId,
        ]),
        title: createDto.title,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should reject conversation creation without authentication', async () => {
      const createDto = {
        participantsIds: [studentUserId, companyUserId],
      };

      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}`)
        .send(createDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should reject conversation creation with invalid data', async () => {
      const invalidCreateDto = {
        participantsIds: ['invalid id'],
        title: 'more than MAX_CONVERSATION_TITLE_LENGTH currently set to 50',
      };

      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidCreateDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Delete Conversation', () => {
    let tempConversation;

    beforeEach(async () => {
      // Create a temporary conversation to delete
      const createDto = {
        participantsIds: [studentUserId, companyUserId],
      };

      const response = await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto);

      tempConversation = response.body;
    });

    it('should delete conversation as admin', async () => {
      await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${tempConversation.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      // Verify deletion
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${tempConversation.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject conversation deletion without proper permissions', async () => {
      await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${tempConversation.id}`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Get Conversations', () => {
    it('should get all conversations for authenticated user', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('rows');
      expect(response.body).toHaveProperty('count');
      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
      for (const conversation of response.body.rows) {
        expect(conversation.participantsIds).toContain(studentUserId);
      }
    });

    it('should filter conversations by query parameters', async () => {
      const query: ConversationQueryDTO = {
        limit: 5,
        offset: 0,
        participantId: companyUserId,
      };
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query(query)
        .expect(HttpStatus.OK);

      expect(response.body.rows.length).toBeLessThanOrEqual(5);
      expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
      for (const conversation of response.body.rows) {
        expect(conversation.participantsIds).toContain(studentUserId);
        expect(conversation.participantsIds).toContain(query.participantId);
      }
    });

    it('should reject conversation retrieval without authentication', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('Get Specific Conversation', () => {
    it('should get a specific conversation by ID', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('id', testConversation.id);
      expect(response.body).toHaveProperty('participantsIds');
    });

    it('should reject access to conversation by non-participant', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should return 404 for non-existent conversation', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${crypto.randomUUID()}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return Bad Request for malformed conversation id', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/malformed-id`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Add Participants', () => {
    let localTestConversation: ConversationDTO;
    let localTestConversation2: ConversationDTO;

    beforeAll(async () => {
      const createConversationDto: CreateConversationDTO = {
        participantsIds: [studentUserId, companyUserId],
        title: 'Default conversation title',
      };

      localTestConversation = await conversationsService.create(
        adminUserAuth,
        createConversationDto,
      );

      localTestConversation2 = await conversationsService.create(
        adminUserAuth,
        createConversationDto,
      );
    });

    it('should add participant to conversation', async () => {
      const addParticipantsDto = {
        participantsIds: [anotherStudentUserId],
      };

      const response = await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/${localTestConversation.id}/participants`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(addParticipantsDto)
        .expect(HttpStatus.CREATED);

      expect(response.body.participantsIds).toContain(anotherStudentUserId);
    });

    it('should reject adding participants without proper permissions', async () => {
      const addParticipantsDto = {
        participantsIds: [studentUserId],
      };

      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/${localTestConversation2.id}/participants`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .send(addParticipantsDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Remove Participants', () => {
    let localTestConversation: ConversationDTO;
    let localTestConversation2: ConversationDTO;

    beforeAll(async () => {
      const createConversationDto: CreateConversationDTO = {
        participantsIds: [studentUserId, companyUserId],
        title: 'Default conversation title',
      };

      localTestConversation = await conversationsService.create(
        adminUserAuth,
        createConversationDto,
      );

      localTestConversation2 = await conversationsService.create(
        adminUserAuth,
        createConversationDto,
      );
    });

    it('should remove participant from conversation', async () => {
      const removeParticipantsDto = {
        participantsIds: [anotherStudentUserId],
      };

      const response = await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${localTestConversation.id}/participants`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(removeParticipantsDto)
        .expect(HttpStatus.OK);

      expect(response.body.participantsIds).not.toContain(anotherStudentUserId);
    });

    it('should reject removing participants without proper permissions', async () => {
      const removeParticipantsDto = {
        participantsIds: [studentUserId],
      };

      await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${localTestConversation2.id}/participants`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .send(removeParticipantsDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Set Conversation Title', () => {
    it('should set custom title for conversation', async () => {
      const setTitleDto = {
        title: 'Test Conversation Title',
      };

      const response = await request(testEnv.app.getHttpServer())
        .put(`${baseRoute}/${testConversation.id}/title`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(setTitleDto)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty(
        'conversationId',
        testConversation.id,
      );
      expect(response.body).toHaveProperty('userId', studentUserId);
      expect(response.body).toHaveProperty('title', setTitleDto.title);
    });

    it('should reject title setting for non-participants', async () => {
      const setTitleDto = {
        title: 'Forbidden Title',
      };

      await request(testEnv.app.getHttpServer())
        .put(`${baseRoute}/${testConversation.id}/title`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .send(setTitleDto)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Get Conversation Title', () => {
    it('should get custom title for conversation', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}/title`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty(
        'conversationId',
        testConversation.id,
      );
      expect(response.body).toHaveProperty('userId', studentUserId);
      expect(response.body).toHaveProperty('title');
    });

    it('should reject title retrieval for non-participants', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}/title`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Delete Conversation Title', () => {
    it('should delete custom title for conversation', async () => {
      await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${testConversation.id}/title`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      // Verify title is deleted
      const getResponse = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}/title`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(getResponse.body.title).toBeFalsy();
    });

    it('should reject title deletion for non-participants', async () => {
      await request(testEnv.app.getHttpServer())
        .delete(`${baseRoute}/${testConversation.id}/title`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('Send Message in Conversation', () => {
    it('should send message in conversation via REST API', async () => {
      const messageDto = {
        content: 'Hello, this is a test message',
      };

      const response = await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(messageDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('content', messageDto.content);
      expect(response.body).toHaveProperty('senderId', studentUserId);
      expect(response.body).toHaveProperty(
        'conversationId',
        testConversation.id,
      );
    });

    it('should reject message sending by non-participants', async () => {
      const messageDto = {
        content: 'This message should be rejected',
      };

      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .send(messageDto)
        .expect(HttpStatus.FORBIDDEN);
    });

    it('should reject empty messages', async () => {
      const invalidMessageDto = {
        content: '',
      };

      await request(testEnv.app.getHttpServer())
        .post(`${baseRoute}/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidMessageDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('Get Messages in Conversation', () => {
    it('should get messages in conversation', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty('rows');
      expect(response.body).toHaveProperty('count');
      expect(response.body.rows).toBeInstanceOf(Array);
      expect(response.body.rows.length).toBeGreaterThanOrEqual(1);
    });

    it('should paginate messages with limit and before parameters', async () => {
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ limit: 5 })
        .expect(HttpStatus.OK);

      expect(response.body.rows.length).toBeLessThanOrEqual(5);
    });

    it('should reject message retrieval by non-participants', async () => {
      await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${anotherStudentToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });
});
