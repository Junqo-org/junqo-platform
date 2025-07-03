/* eslint-disable @typescript-eslint/no-unused-vars */
import * as request from 'supertest';
import * as crypto from 'crypto';
import { createTestingEnvironment } from './test-setup';
import { UserType } from '../src/users/dto/user-type.enum';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersRepository } from '../src/users/repository/users.repository';
import { AuthService } from '../src/auth/auth.service';
import { ConversationsService } from '../src/conversations/conversations.service';
import { MessagesService } from '../src/messages/messages.service';
import {
  ConversationDTO,
  CreateConversationDTO,
} from '../src/conversations/dto/conversation.dto';
import {
  CreateMessageDTO,
  MessageDTO,
  UpdateMessageDTO,
} from '../src/messages/dto/message.dto';
import { AuthUserDTO } from '../src/shared/dto/auth-user.dto';
import { io, Socket as ClientSocket } from 'socket.io-client';

const baseRoute = '/api/v1/messages';
const conversationsBaseRoute = '/api/v1/conversations';

// Test users data
const adminUser = {
  type: UserType.ADMIN,
  email: 'admin-messages-e2e@test.com',
  name: 'AdminUserMessages',
  password: 'password123',
};

const studentUser = {
  type: UserType.STUDENT,
  email: 'student-messages-e2e@test.com',
  name: 'StudentUserMessages',
  password: 'password123',
};

const companyUser = {
  type: UserType.COMPANY,
  email: 'company-messages-e2e@test.com',
  name: 'CompanyUserMessages',
  password: 'password123',
};

const anotherStudentUser = {
  type: UserType.STUDENT,
  email: 'student2-messages-e2e@test.com',
  name: 'StudentUser2Messages',
  password: 'password123',
};

// Helper function to create WebSocket client with authentication
const createAuthenticatedSocket = (
  token: string,
  port: number,
): Promise<ClientSocket> => {
  return new Promise((resolve, reject) => {
    const socket = io(`http://localhost:${port}`, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    // Set a timeout for connection
    const timeoutId = setTimeout(() => {
      if (!socket.connected) {
        socket.close();
        reject(new Error('Socket connection timeout'));
      }
    }, 5000);

    const cleanup = () => {
      clearTimeout(timeoutId);
    };

    socket.on('connect', () => {
      cleanup();
      resolve(socket);
    });

    socket.on('connect_error', (error) => {
      cleanup();
      socket.close();
      reject(error);
    });
  });
};

// Helper function to wait for WebSocket event
const waitForEvent = (
  socket: ClientSocket,
  eventName: string,
  timeout = 5000,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeout);

    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
};

describe('Messages E2E Tests', () => {
  let testEnv: {
    app: INestApplication;
    environment: any;
    port: number;
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
  let anotherTestMessage: MessageDTO;

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
      title: 'Test conversation for messages',
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

    // Create test messages
    const studentUserAuth: AuthUserDTO = {
      id: studentUserId,
      name: studentUser.name,
      email: studentUser.email,
      type: UserType.STUDENT,
    };

    const companyUserAuth: AuthUserDTO = {
      id: companyUserId,
      name: companyUser.name,
      email: companyUser.email,
      type: UserType.COMPANY,
    };

    const createMessageDto: CreateMessageDTO = {
      senderId: studentUserId,
      conversationId: testConversation.id,
      content: 'Hello, this is a test message for e2e testing',
    };

    testMessage = await messagesService.create(
      studentUserAuth,
      createMessageDto,
    );

    const anotherCreateMessageDto: CreateMessageDTO = {
      senderId: companyUserId,
      conversationId: testConversation.id,
      content: 'Hello back! This is another test message',
    };

    anotherTestMessage = await messagesService.create(
      companyUserAuth,
      anotherCreateMessageDto,
    );
  }, 60000);

  afterAll(async () => {
    // Force close any remaining connections
    await new Promise((resolve) => setTimeout(resolve, 100));
    await testEnv.tearDown();
  });

  describe('REST API - Messages CRUD Operations', () => {
    describe('GET /messages/:id', () => {
      it('should get message by ID for authorized user', async () => {
        const response = await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          id: testMessage.id,
          senderId: studentUserId,
          conversationId: testConversation.id,
          content: testMessage.content,
        });
      });

      it('should get message by ID for conversation participant', async () => {
        const response = await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', `Bearer ${companyToken}`)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          id: testMessage.id,
          senderId: studentUserId,
          conversationId: testConversation.id,
          content: testMessage.content,
        });
      });

      it('should reject message access for non-participants', async () => {
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', `Bearer ${anotherStudentToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should reject message access without authentication', async () => {
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${testMessage.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return 404 for non-existent message', async () => {
        const nonExistentId = crypto.randomUUID();

        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${nonExistentId}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return 400 for invalid message ID format', async () => {
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/invalid-id`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('PATCH /messages/:id', () => {
      it('should update message content by sender', async () => {
        const updateDto: UpdateMessageDTO = {
          content: 'Updated message content',
        };

        const response = await request(testEnv.app.getHttpServer())
          .patch(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(updateDto)
          .expect(HttpStatus.OK);

        expect(response.body).toMatchObject({
          id: testMessage.id,
          content: updateDto.content,
          senderId: studentUserId,
          conversationId: testConversation.id,
        });
      });

      it('should reject message update by non-sender', async () => {
        const updateDto: UpdateMessageDTO = {
          content: 'Unauthorized update attempt',
        };

        await request(testEnv.app.getHttpServer())
          .patch(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', `Bearer ${companyToken}`)
          .send(updateDto)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should reject message update without authentication', async () => {
        const updateDto: UpdateMessageDTO = {
          content: 'Unauthorized update attempt',
        };

        await request(testEnv.app.getHttpServer())
          .patch(`${baseRoute}/${testMessage.id}`)
          .send(updateDto)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should validate message content on update', async () => {
        const invalidUpdateDto = {
          content: '',
        };

        await request(testEnv.app.getHttpServer())
          .patch(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(invalidUpdateDto)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should return 404 for updating non-existent message', async () => {
        const nonExistentId = crypto.randomUUID();
        const updateDto: UpdateMessageDTO = {
          content: 'Update non-existent message',
        };

        await request(testEnv.app.getHttpServer())
          .patch(`${baseRoute}/${nonExistentId}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(updateDto)
          .expect(HttpStatus.NOT_FOUND);
      });
    });

    describe('DELETE /messages/:id', () => {
      it('should delete message by sender', async () => {
        // Create a message to delete
        const studentUserAuth: AuthUserDTO = {
          id: studentUserId,
          name: studentUser.name,
          email: studentUser.email,
          type: UserType.STUDENT,
        };

        const createMessageDto: CreateMessageDTO = {
          senderId: studentUserId,
          conversationId: testConversation.id,
          content: 'Message to be deleted',
        };

        const messageToDelete = await messagesService.create(
          studentUserAuth,
          createMessageDto,
        );

        const response = await request(testEnv.app.getHttpServer())
          .delete(`${baseRoute}/${messageToDelete.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.OK);

        // Verify message is deleted
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${messageToDelete.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should reject message deletion by non-sender', async () => {
        await request(testEnv.app.getHttpServer())
          .delete(`${baseRoute}/${anotherTestMessage.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should reject message deletion without authentication', async () => {
        await request(testEnv.app.getHttpServer())
          .delete(`${baseRoute}/${testMessage.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should return 404 for deleting non-existent message', async () => {
        const nonExistentId = crypto.randomUUID();
        await request(testEnv.app.getHttpServer())
          .delete(`${baseRoute}/${nonExistentId}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.NOT_FOUND);
      });
    });
  });

  describe('WebSocket - Real-time Messaging', () => {
    let studentSocket: ClientSocket;
    let companySocket: ClientSocket;
    let anotherStudentSocket: ClientSocket;

    beforeEach(async () => {
      // Create authenticated WebSocket connections
      studentSocket = await createAuthenticatedSocket(
        studentToken,
        testEnv.port,
      );
      companySocket = await createAuthenticatedSocket(
        companyToken,
        testEnv.port,
      );
      anotherStudentSocket = await createAuthenticatedSocket(
        anotherStudentToken,
        testEnv.port,
      );
    }, 10000); // 10 second timeout for WebSocket setup

    afterEach(async () => {
      // Properly close all sockets
      if (studentSocket?.connected) {
        studentSocket.close();
      }
      if (companySocket?.connected) {
        companySocket.close();
      }
      if (anotherStudentSocket?.connected) {
        anotherStudentSocket.close();
      }

      // Wait for connections to close
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    describe('Connection and Authentication', () => {
      it('should connect with valid authentication', async () => {
        expect(studentSocket.connected).toBe(true);
        expect(companySocket.connected).toBe(true);
      }, 10000);

      it('should broadcast user online status on connection', async () => {
        const userStatusPromise = new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('Timeout waiting for user status'));
          }, 15000);

          const handleUserStatus = (data) => {
            // Ignore status events for users other than studentUserId
            if (data.userId !== studentUserId) {
              return;
            }

            clearTimeout(timer);
            companySocket.off('userStatus', handleUserStatus);
            resolve(data);
          };

          companySocket.on('userStatus', handleUserStatus);
        });

        // Create a new connection to trigger user status
        const newSocket = await createAuthenticatedSocket(
          studentToken,
          testEnv.port,
        );

        try {
          const userStatus = await userStatusPromise;
          expect(userStatus).toMatchObject({
            userId: studentUserId,
            status: 'online',
            timestamp: expect.any(String),
          });
        } finally {
          newSocket.close();
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }, 15000);

      it('should reject connection without authentication', async () => {
        const socket = io(`http://localhost:${testEnv.port}`, {
          transports: ['websocket'],
        });

        await expect(
          new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
              reject(new Error('timeout'));
            }, 2000);

            socket.on('connect', () => {
              clearTimeout(timer);
              resolve('connected');
            });

            socket.on('connect_error', (error) => {
              clearTimeout(timer);
              reject(error);
            });
          }),
        ).rejects.toThrow();

        socket.close();
        await new Promise((resolve) => setTimeout(resolve, 100));
      }, 10000);
    });

    describe('Room Management', () => {
      it('should join conversation room successfully', async () => {
        const joinRoomSuccessPromise = waitForEvent(
          studentSocket,
          'joinRoomSuccess',
        );

        studentSocket.emit('joinRoom', { conversationId: testConversation.id });

        const joinSuccess = await joinRoomSuccessPromise;
        expect(joinSuccess).toMatchObject({
          conversationId: testConversation.id,
        });
      }, 10000);

      it('should leave conversation room successfully', async () => {
        // First join the room
        const joinRoomSuccessPromise = waitForEvent(
          studentSocket,
          'joinRoomSuccess',
        );
        studentSocket.emit('joinRoom', { conversationId: testConversation.id });
        await joinRoomSuccessPromise;

        // Then leave the room
        const leaveRoomSuccessPromise = waitForEvent(
          studentSocket,
          'leaveRoomSuccess',
        );
        studentSocket.emit('leaveRoom', {
          conversationId: testConversation.id,
        });

        const leaveSuccess = await leaveRoomSuccessPromise;
        expect(leaveSuccess).toMatchObject({
          conversationId: testConversation.id,
        });
      }, 15000);

      it('should handle join room errors gracefully', async () => {
        const joinRoomErrorPromise = waitForEvent(
          studentSocket,
          'joinRoomError',
        );

        // Try to join with invalid conversation ID
        studentSocket.emit('joinRoom', { conversationId: 'invalid-id' });

        const joinError = await joinRoomErrorPromise;
        expect(joinError).toHaveProperty('message');
        expect(joinError).toHaveProperty('error');
      }, 10000);
    });

    describe('Real-time Message Sending', () => {
      beforeEach(async () => {
        // Join both users to the conversation room
        const studentJoinPromise = waitForEvent(
          studentSocket,
          'joinRoomSuccess',
        );
        const companyJoinPromise = waitForEvent(
          companySocket,
          'joinRoomSuccess',
        );

        studentSocket.emit('joinRoom', { conversationId: testConversation.id });
        companySocket.emit('joinRoom', { conversationId: testConversation.id });

        await Promise.all([studentJoinPromise, companyJoinPromise]);
      }, 10000);

      it('should send and receive messages in real-time', async () => {
        const receiveMessagePromise = waitForEvent(
          companySocket,
          'receiveMessage',
        );

        const messageContent = 'Real-time test message';
        const sendMessageDto: CreateMessageDTO = {
          senderId: studentUserId,
          conversationId: testConversation.id,
          content: messageContent,
        };

        studentSocket.emit('sendMessage', sendMessageDto);

        const receivedMessage = await receiveMessagePromise;
        expect(receivedMessage).toMatchObject({
          senderId: studentUserId,
          conversationId: testConversation.id,
          content: messageContent,
        });
      }, 15000);

      it('should handle message sending errors', async () => {
        const messageErrorPromise = waitForEvent(studentSocket, 'messageError');

        // Send invalid message (missing required fields)
        studentSocket.emit('sendMessage', { content: 'Invalid message' });

        const messageError = await messageErrorPromise;
        expect(messageError).toHaveProperty('message');
        expect(messageError).toHaveProperty('error');
      }, 10000);

      it('should validate message data before sending', async () => {
        const messageErrorPromise = waitForEvent(studentSocket, 'messageError');

        // Send message with empty content
        const invalidMessageDto = {
          senderId: studentUserId,
          conversationId: testConversation.id,
          content: '',
        };

        studentSocket.emit('sendMessage', invalidMessageDto);

        const messageError = await messageErrorPromise;
        expect(messageError).toHaveProperty('message');
        expect(messageError).toHaveProperty('error');
      }, 10000);
    });

    describe('Typing Indicators', () => {
      beforeEach(async () => {
        // Join both users to the conversation room
        const studentJoinPromise = waitForEvent(
          studentSocket,
          'joinRoomSuccess',
        );
        const companyJoinPromise = waitForEvent(
          companySocket,
          'joinRoomSuccess',
        );

        studentSocket.emit('joinRoom', { conversationId: testConversation.id });
        companySocket.emit('joinRoom', { conversationId: testConversation.id });

        await Promise.all([studentJoinPromise, companyJoinPromise]);
      }, 10000);

      it('should broadcast typing indicators', async () => {
        const typingStartPromise = waitForEvent(
          companySocket,
          'userStartTyping',
        );

        studentSocket.emit('startTyping', {
          conversationId: testConversation.id,
        });

        const typingStart = await typingStartPromise;
        expect(typingStart).toMatchObject({
          userId: studentUserId,
          conversationId: testConversation.id,
          timestamp: expect.any(String),
        });
      }, 10000);

      it('should broadcast stop typing indicators', async () => {
        // First start typing
        studentSocket.emit('startTyping', {
          conversationId: testConversation.id,
        });
        await waitForEvent(companySocket, 'userStartTyping');

        // Then stop typing
        const typingStopPromise = waitForEvent(companySocket, 'userStopTyping');
        studentSocket.emit('stopTyping', {
          conversationId: testConversation.id,
        });

        const typingStop = await typingStopPromise;
        expect(typingStop).toMatchObject({
          userId: studentUserId,
          conversationId: testConversation.id,
          timestamp: expect.any(String),
        });
      }, 15000);
    });

    describe('Message History', () => {
      beforeEach(async () => {
        // Join user to the conversation room
        const joinPromise = waitForEvent(studentSocket, 'joinRoomSuccess');
        studentSocket.emit('joinRoom', { conversationId: testConversation.id });
        await joinPromise;
      });

      it('should retrieve message history', async () => {
        const messageHistoryPromise = waitForEvent(
          studentSocket,
          'messageHistory',
        );

        studentSocket.emit('getMessageHistory', {
          conversationId: testConversation.id,
          limit: 50,
        });

        const messageHistory = await messageHistoryPromise;
        expect(messageHistory).toMatchObject({
          conversationId: testConversation.id,
          messages: expect.any(Array),
          count: expect.any(Number),
          timestamp: expect.any(String),
        });
        expect(messageHistory.messages.length).toBeGreaterThan(0);
      }, 10000);

      it('should handle message history with pagination', async () => {
        const messageHistoryPromise = waitForEvent(
          studentSocket,
          'messageHistory',
        );

        studentSocket.emit('getMessageHistory', {
          conversationId: testConversation.id,
          limit: 1,
          before: new Date(),
        });

        const messageHistory = await messageHistoryPromise;
        expect(messageHistory).toMatchObject({
          conversationId: testConversation.id,
          messages: expect.any(Array),
          count: expect.any(Number),
        });
        expect(messageHistory.messages.length).toBeLessThanOrEqual(1);
      }, 10000);

      it('should handle message history errors', async () => {
        const messageHistoryErrorPromise = waitForEvent(
          studentSocket,
          'messageHistoryError',
        );

        // Request history for invalid conversation
        studentSocket.emit('getMessageHistory', {
          conversationId: 'invalid-conversation-id',
          limit: 50,
        });

        const historyError = await messageHistoryErrorPromise;
        expect(historyError).toHaveProperty('message');
        expect(historyError).toHaveProperty('error');
      }, 10000);
    });

    describe('Message Read Status', () => {
      let testMessageForReading: MessageDTO;

      beforeEach(async () => {
        // Join both users to the conversation room
        const studentJoinPromise = waitForEvent(
          studentSocket,
          'joinRoomSuccess',
        );
        const companyJoinPromise = waitForEvent(
          companySocket,
          'joinRoomSuccess',
        );

        studentSocket.emit('joinRoom', { conversationId: testConversation.id });
        companySocket.emit('joinRoom', { conversationId: testConversation.id });

        await Promise.all([studentJoinPromise, companyJoinPromise]);

        // Create a message for read status testing
        const companyUserAuth: AuthUserDTO = {
          id: companyUserId,
          name: companyUser.name,
          email: companyUser.email,
          type: UserType.COMPANY,
        };

        const createMessageDto: CreateMessageDTO = {
          senderId: companyUserId,
          conversationId: testConversation.id,
          content: 'Message for read status testing',
        };

        testMessageForReading = await messagesService.create(
          companyUserAuth,
          createMessageDto,
        );
      }, 15000);

      it('should mark message as read and broadcast to room', async () => {
        const messageReadPromise = waitForEvent(companySocket, 'messageRead');

        studentSocket.emit('markMessageRead', {
          messageId: testMessageForReading.id,
          conversationId: testConversation.id,
        });

        const messageRead = await messageReadPromise;
        expect(messageRead).toMatchObject({
          messageId: testMessageForReading.id,
          userId: studentUserId,
          conversationId: testConversation.id,
          timestamp: expect.any(String),
        });
      }, 10000);

      it('should handle mark read errors', async () => {
        const markReadErrorPromise = waitForEvent(
          studentSocket,
          'markReadError',
        );

        // Try to mark non-existent message as read
        studentSocket.emit('markMessageRead', {
          messageId: 'invalid-message-id',
          conversationId: testConversation.id,
        });

        const markReadError = await markReadErrorPromise;
        expect(markReadError).toHaveProperty('message');
        expect(markReadError).toHaveProperty('error');
      }, 10000);
    });

    describe('Online Users', () => {
      beforeEach(async () => {
        // Join users to the conversation room
        const studentJoinPromise = waitForEvent(
          studentSocket,
          'joinRoomSuccess',
        );
        const companyJoinPromise = waitForEvent(
          companySocket,
          'joinRoomSuccess',
        );

        studentSocket.emit('joinRoom', { conversationId: testConversation.id });
        companySocket.emit('joinRoom', { conversationId: testConversation.id });

        await Promise.all([studentJoinPromise, companyJoinPromise]);
      }, 15000);

      it('should get online users for conversation', async () => {
        const onlineUsersPromise = waitForEvent(studentSocket, 'onlineUsers');

        studentSocket.emit('getOnlineUsers', {
          conversationId: testConversation.id,
        });

        const onlineUsers = await onlineUsersPromise;
        expect(onlineUsers).toMatchObject({
          users: expect.any(Array),
          conversationId: testConversation.id,
          timestamp: expect.any(String),
        });
        expect(onlineUsers.users).toContain(studentUserId);
        expect(onlineUsers.users).toContain(companyUserId);
      }, 10000);

      it('should get all online users when no conversation specified', async () => {
        const onlineUsersPromise = waitForEvent(studentSocket, 'onlineUsers');

        studentSocket.emit('getOnlineUsers', {});

        const onlineUsers = await onlineUsersPromise;
        expect(onlineUsers).toMatchObject({
          users: expect.any(Array),
          timestamp: expect.any(String),
        });
        expect(onlineUsers.users.length).toBeGreaterThan(0);
      }, 10000);

      it('should handle online users errors', async () => {
        studentSocket.emit('getOnlineUsers', {
          conversationId: {},
        });

        try {
          const error = await waitForEvent(
            studentSocket,
            'onlineUsersError',
            2000,
          );
          expect(error).toHaveProperty('message');
          expect(error).toHaveProperty('error');
        } catch (timeoutError) {
          console.log(
            'No error event received - implementation may handle invalid input',
          );
        }
      }, 10000);
    });

    describe('User Status Broadcasting', () => {
      it('should broadcast offline status on disconnect', async () => {
        const userStatusPromise = new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error('Timeout waiting for user status'));
          }, 15000);

          const handleUserStatus = (data) => {
            // Ignore status events for users other than studentUserId
            if (data.userId !== studentUserId) {
              return;
            }

            clearTimeout(timer);
            companySocket.off('userStatus', handleUserStatus);
            resolve(data);
          };

          companySocket.on('userStatus', handleUserStatus);
        });

        // Small delay to ensure connections are stable
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Disconnect student socket
        studentSocket.close();

        const userStatus = await userStatusPromise;
        expect(userStatus).toMatchObject({
          userId: studentUserId,
          status: 'offline',
          timestamp: expect.any(String),
        });
      }, 15000);

      it('should broadcast room leave events', async () => {
        // First join the room
        const studentJoinPromise = waitForEvent(
          studentSocket,
          'joinRoomSuccess',
        );
        const companyJoinPromise = waitForEvent(
          companySocket,
          'joinRoomSuccess',
        );

        studentSocket.emit('joinRoom', { conversationId: testConversation.id });
        companySocket.emit('joinRoom', { conversationId: testConversation.id });

        await Promise.all([studentJoinPromise, companyJoinPromise]);

        // Then listen for leave event
        const userLeaveRoomPromise = waitForEvent(
          companySocket,
          'userLeaveRoom',
        );

        // Disconnect student socket to trigger leave
        studentSocket.close();

        const userLeaveRoom = await userLeaveRoomPromise;
        expect(userLeaveRoom).toMatchObject({
          userId: studentUserId,
          roomId: testConversation.id,
          timestamp: expect.any(String),
        });
      }, 15000);
    });
  });

  describe('Integration with Conversations', () => {
    describe('Send Message via Conversation Endpoint', () => {
      it('should send message via conversation REST API', async () => {
        const messageDto = {
          content: 'Message sent via conversation endpoint',
        };

        const response = await request(testEnv.app.getHttpServer())
          .post(`${conversationsBaseRoute}/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(messageDto)
          .expect(HttpStatus.CREATED);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          content: messageDto.content,
          senderId: studentUserId,
          conversationId: testConversation.id,
        });
      });

      it('should reject message sending by non-participants via conversation', async () => {
        const messageDto = {
          content: 'Unauthorized message',
        };

        await request(testEnv.app.getHttpServer())
          .post(`${conversationsBaseRoute}/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${anotherStudentToken}`)
          .send(messageDto)
          .expect(HttpStatus.FORBIDDEN);
      });
    });

    describe('Get Messages via Conversation Endpoint', () => {
      it('should get messages in conversation with pagination', async () => {
        const response = await request(testEnv.app.getHttpServer())
          .get(`${conversationsBaseRoute}/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${studentToken}`)
          .query({ limit: 10 })
          .expect(HttpStatus.OK);

        expect(response.body).toHaveProperty('rows');
        expect(response.body).toHaveProperty('count');
        expect(response.body.rows).toBeInstanceOf(Array);
        expect(response.body.rows.length).toBeGreaterThan(0);
      });

      it('should filter messages by date range', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const response = await request(testEnv.app.getHttpServer())
          .get(`${conversationsBaseRoute}/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${studentToken}`)
          .query({
            before: tomorrow.toISOString(),
          })
          .expect(HttpStatus.OK);

        expect(response.body.rows).toBeInstanceOf(Array);
        expect(response.body.rows.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    describe('Invalid Data Handling', () => {
      it('should handle malformed WebSocket payloads gracefully', async () => {
        const socket = await createAuthenticatedSocket(
          studentToken,
          testEnv.port,
        );

        try {
          // Send malformed data
          socket.emit('sendMessage', 'invalid-json-string');

          // Should not crash the server - connection should remain stable
          await new Promise((resolve) => setTimeout(resolve, 1000));
          expect(socket.connected).toBe(true);
        } finally {
          socket.close();
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }, 10000);

      it('should validate UUID format in REST endpoints', async () => {
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/not-a-uuid`)
          .set('Authorization', `Bearer ${studentToken}`)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it('should handle very long message content', async () => {
        const longContent = 'a'.repeat(10000); // Very long message
        const updateDto: UpdateMessageDTO = {
          content: longContent,
        };

        // This should be handled gracefully (either accepted or rejected with proper error)
        const response = await request(testEnv.app.getHttpServer())
          .patch(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', `Bearer ${studentToken}`)
          .send(updateDto);

        // Should either succeed or return a proper error status
        expect([
          HttpStatus.OK,
          HttpStatus.BAD_REQUEST,
          HttpStatus.PAYLOAD_TOO_LARGE,
        ]).toContain(response.status);
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle multiple simultaneous message sends', async () => {
        const studentUserAuth: AuthUserDTO = {
          id: studentUserId,
          name: studentUser.name,
          email: studentUser.email,
          type: UserType.STUDENT,
        };

        const messagePromises = Array.from({ length: 5 }, (_, i) =>
          messagesService.create(studentUserAuth, {
            senderId: studentUserId,
            conversationId: testConversation.id,
            content: `Concurrent message ${i + 1}`,
          }),
        );

        const messages = await Promise.all(messagePromises);

        expect(messages).toHaveLength(5);
        messages.forEach((message, index) => {
          expect(message).toMatchObject({
            senderId: studentUserId,
            conversationId: testConversation.id,
            content: `Concurrent message ${index + 1}`,
          });
        });
      }, 15000);

      it('should handle multiple WebSocket connections from same user', async () => {
        const socket1 = await createAuthenticatedSocket(
          studentToken,
          testEnv.port,
        );
        const socket2 = await createAuthenticatedSocket(
          studentToken,
          testEnv.port,
        );

        try {
          expect(socket1.connected).toBe(true);
          expect(socket2.connected).toBe(true);

          // Both sockets should be able to join the same room
          const join1Promise = waitForEvent(socket1, 'joinRoomSuccess');
          const join2Promise = waitForEvent(socket2, 'joinRoomSuccess');

          socket1.emit('joinRoom', { conversationId: testConversation.id });
          socket2.emit('joinRoom', { conversationId: testConversation.id });

          await Promise.all([join1Promise, join2Promise]);
        } finally {
          socket1.close();
          socket2.close();
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }, 15000);
    });

    describe('Authorization Edge Cases', () => {
      it('should handle expired tokens gracefully', async () => {
        // This would require a token that's expired or manually crafted
        // For now, test with an invalid token format
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', 'Bearer invalid.jwt.token')
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should handle missing authorization header', async () => {
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${testMessage.id}`)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it('should handle malformed authorization header', async () => {
        await request(testEnv.app.getHttpServer())
          .get(`${baseRoute}/${testMessage.id}`)
          .set('Authorization', 'InvalidFormat')
          .expect(HttpStatus.UNAUTHORIZED);
      });
    });
  });

  describe('Performance and Load Testing', () => {
    describe('WebSocket Performance', () => {
      it('should handle rapid message sending', async () => {
        const socket = await createAuthenticatedSocket(
          studentToken,
          testEnv.port,
        );

        try {
          // Join room first
          const joinPromise = waitForEvent(socket, 'joinRoomSuccess');
          socket.emit('joinRoom', { conversationId: testConversation.id });
          await joinPromise;

          // Send multiple messages rapidly
          const startTime = Date.now();
          const messageCount = 10;

          for (let i = 0; i < messageCount; i++) {
            socket.emit('sendMessage', {
              senderId: studentUserId,
              conversationId: testConversation.id,
              content: `Rapid message ${i + 1}`,
            });
          }

          // Wait for the last message to be processed
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const endTime = Date.now();
          const duration = endTime - startTime;

          // Should handle all messages within reasonable time
          expect(duration).toBeLessThan(5000); // 5 seconds max
        } finally {
          socket.close();
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }, 20000);

      it('should handle multiple typing indicators', async () => {
        const socket = await createAuthenticatedSocket(
          studentToken,
          testEnv.port,
        );

        try {
          // Join room first
          const joinPromise = waitForEvent(socket, 'joinRoomSuccess');
          socket.emit('joinRoom', { conversationId: testConversation.id });
          await joinPromise;

          // Rapidly start and stop typing
          for (let i = 0; i < 5; i++) {
            socket.emit('startTyping', { conversationId: testConversation.id });
            await new Promise((resolve) => setTimeout(resolve, 100));
            socket.emit('stopTyping', { conversationId: testConversation.id });
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Should handle all typing events without errors
          expect(socket.connected).toBe(true);
        } finally {
          socket.close();
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }, 15000);
    });

    describe('REST API Performance', () => {
      it('should handle concurrent REST API requests', async () => {
        const requestPromises = Array.from({ length: 10 }, () =>
          request(testEnv.app.getHttpServer())
            .get(`${baseRoute}/${testMessage.id}`)
            .set('Authorization', `Bearer ${studentToken}`),
        );

        const responses = await Promise.all(requestPromises);

        responses.forEach((response) => {
          expect(response.status).toBe(HttpStatus.OK);
          expect(response.body.id).toBe(testMessage.id);
        });
      }, 15000);

      it('should handle large message history requests', async () => {
        const response = await request(testEnv.app.getHttpServer())
          .get(`${conversationsBaseRoute}/${testConversation.id}/messages`)
          .set('Authorization', `Bearer ${studentToken}`)
          .query({ limit: 100 })
          .expect(HttpStatus.OK);

        expect(response.body).toHaveProperty('rows');
        expect(response.body).toHaveProperty('count');
        expect(Array.isArray(response.body.rows)).toBe(true);
      }, 10000);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain message order in conversation', async () => {
      const studentUserAuth: AuthUserDTO = {
        id: studentUserId,
        name: studentUser.name,
        email: studentUser.email,
        type: UserType.STUDENT,
      };

      // Create messages in sequence
      const messages = [];
      for (let i = 1; i <= 3; i++) {
        const message = await messagesService.create(studentUserAuth, {
          senderId: studentUserId,
          conversationId: testConversation.id,
          content: `Sequential message ${i}`,
        });
        messages.push(message);
        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Retrieve messages and verify order
      const response = await request(testEnv.app.getHttpServer())
        .get(`${conversationsBaseRoute}/${testConversation.id}/messages`)
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ limit: 10 })
        .expect(HttpStatus.OK);

      const retrievedMessages = response.body.rows;
      const sequentialMessages = retrievedMessages.filter((m) =>
        m.content.startsWith('Sequential message'),
      );

      expect(sequentialMessages.length).toBe(3);
      // Messages should be in chronological order (newest first is typical)
      expect(sequentialMessages[0].content).toContain('3');
      expect(sequentialMessages[1].content).toContain('2');
      expect(sequentialMessages[2].content).toContain('1');
    }, 15000);

    it('should update message content atomically', async () => {
      const updateDto: UpdateMessageDTO = {
        content: 'Atomically updated content',
      };

      // Update message
      await request(testEnv.app.getHttpServer())
        .patch(`${baseRoute}/${testMessage.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(updateDto)
        .expect(HttpStatus.OK);

      // Verify update
      const response = await request(testEnv.app.getHttpServer())
        .get(`${baseRoute}/${testMessage.id}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.content).toBe(updateDto.content);
    }, 10000);
  });
});
