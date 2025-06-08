import { TestBed, Mocked } from '@suites/unit';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { UserType } from '../users/dto/user-type.enum';
import { plainToInstance } from 'class-transformer';
import { CreateMessageDTO, MessageDTO } from './dto/message.dto';
import { MessageQueryOutputDTO } from './dto/message-query.dto';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../auth/socket-auth.middleware';

const mockMessagesList: MessageDTO[] = [
  plainToInstance(MessageDTO, {
    id: 'm69cc25b-0cc4-4032-83c2-0d34c84318ba',
    senderId: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
    conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
    content: 'Hello, this is a test message',
  }),
  plainToInstance(MessageDTO, {
    id: 'm69cc25b-0cc4-4032-83c2-0d34c84318bb',
    senderId: 's69cc25b-0cc4-4032-83c2-0d34c84318bb',
    conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318bb',
    content: 'Another test message',
  }),
];

const mockUser: AuthUserDTO = plainToInstance(AuthUserDTO, {
  id: 's69cc25b-0cc4-4032-83c2-0d34c84318ba',
  type: UserType.STUDENT,
  email: 'student@test.com',
  name: 'Student User',
});

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let messagesService: Mocked<MessagesService>;
  let socketAuthMiddleware: Mocked<SocketAuthMiddleware>;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(async () => {
    // Mock Server methods
    mockServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
      use: jest.fn(), // Mock the middleware use method
      sockets: {
        adapter: {
          rooms: new Map(),
        },
      } as any,
    };

    // Mock Socket methods with proper authentication data
    mockSocket = {
      id: 'socket-id-1',
      data: {
        userId: mockUser.id,
        user: mockUser,
        isAuthenticated: true,
      },
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
      disconnect: jest.fn(),
    };

    const { unit, unitRef } = await TestBed.solitary(MessagesGateway).compile();

    gateway = unit;
    messagesService = unitRef.get(MessagesService);
    socketAuthMiddleware = unitRef.get(SocketAuthMiddleware);

    // Mock the middleware creation method
    socketAuthMiddleware.createAuthMiddleware.mockReturnValue(jest.fn());

    // Set up the server mock
    gateway.server = mockServer as Server;

    // Mock logger to avoid console output in tests
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
    };
    (gateway as any).logger = mockLogger;
  });

  afterEach(() => {
    // Clear internal maps between tests
    (gateway as any)['connectedUsers'].clear();
    (gateway as any)['userSockets'].clear();
    (gateway as any)['typingUsers'].clear();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle successful connection', async () => {
      await gateway.handleConnection(mockSocket as Socket);

      expect(gateway['connectedUsers'].get(mockSocket.id)).toEqual({
        userId: mockUser.id,
        rooms: [],
      });
      expect(gateway['userSockets'].get(mockUser.id)).toContain(mockSocket.id);
      expect(mockServer.emit).toHaveBeenCalledWith('userStatus', {
        userId: mockUser.id,
        status: 'online',
        timestamp: expect.any(Date),
      });
    });

    it('should handle connection error', async () => {
      const mockSocketWithoutUserId = {
        ...mockSocket,
        data: {},
        disconnect: jest.fn(),
      };

      await gateway.handleConnection(
        mockSocketWithoutUserId as unknown as Socket,
      );

      expect(mockSocketWithoutUserId.disconnect).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDisconnect', () => {
    beforeEach(async () => {
      // Set up a connected user first
      await gateway.handleConnection(mockSocket as Socket);
    });

    it('should handle disconnection', () => {
      gateway.handleDisconnect(mockSocket as Socket);

      expect(gateway['connectedUsers'].has(mockSocket.id)).toBe(false);
      expect(gateway['userSockets'].has(mockUser.id)).toBe(false);
      expect(mockServer.emit).toHaveBeenCalledWith('userStatus', {
        userId: mockUser.id,
        status: 'offline',
        timestamp: expect.any(Date),
      });
    });

    it('should handle disconnection with multiple connections', async () => {
      const secondSocket = {
        ...mockSocket,
        id: 'socket-id-2',
        data: { userId: mockUser.id },
      };

      await gateway.handleConnection(secondSocket as Socket);

      // Disconnect first socket
      gateway.handleDisconnect(mockSocket as Socket);

      expect(gateway['connectedUsers'].has(mockSocket.id)).toBe(false);
      expect(gateway['userSockets'].get(mockUser.id)).toEqual(['socket-id-2']);
      // Should not emit offline status as user still has another connection
      expect(mockServer.emit).toHaveBeenCalledTimes(2); // Only the initial online status calls
    });
  });

  describe('handleSendMessage', () => {
    const createMessageDto: CreateMessageDTO = plainToInstance(
      CreateMessageDTO,
      {
        senderId: mockUser.id,
        conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
        content: 'Test message',
      },
    );

    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
    });

    it('should handle send message successfully', async () => {
      messagesService.create.mockResolvedValue(mockMessagesList[0]);

      await gateway.handleSendMessage(
        mockSocket as Socket,
        mockUser,
        createMessageDto,
      );

      expect(messagesService.create).toHaveBeenCalledWith(
        mockUser,
        createMessageDto,
      );
      expect(mockServer.to).toHaveBeenCalledWith(
        createMessageDto.conversationId,
      );
      expect(mockServer.emit).toHaveBeenCalledWith(
        'receiveMessage',
        mockMessagesList[0],
      );
    });

    it('should handle send message error', async () => {
      messagesService.create.mockRejectedValue(new Error('Service error'));

      // Since the exception will be caught by WsExceptionFilter, we won't get a return value
      // Instead, we need to mock the filter behavior or test that the exception is thrown
      await expect(
        gateway.handleSendMessage(
          mockSocket as Socket,
          mockUser,
          createMessageDto,
        ),
      ).rejects.toThrow('Service error');
    });
  });

  describe('handleJoinRoom', () => {
    const payload = { conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba' };

    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
    });

    it('should handle join room successfully', async () => {
      const result = await gateway.handleJoinRoom(
        mockSocket as Socket,
        payload,
      );

      expect(mockSocket.join).toHaveBeenCalledWith(payload.conversationId);
      expect(gateway['connectedUsers'].get(mockSocket.id).rooms).toContain(
        payload.conversationId,
      );
      expect(mockServer.to).toHaveBeenCalledWith(payload.conversationId);
      expect(mockSocket.emit).toHaveBeenCalledWith('joinRoomSuccess', {
        conversationId: payload.conversationId,
      });
      expect(result).toEqual({
        success: true,
        conversationId: payload.conversationId,
      });
    });

    it('should handle join room error for unknown user', async () => {
      gateway['connectedUsers'].delete(mockSocket.id);

      await expect(
        gateway.handleJoinRoom(mockSocket as Socket, payload),
      ).rejects.toThrow('User not found');
    });
  });

  describe('handleLeaveRoom', () => {
    const payload = { conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba' };

    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
      await gateway.handleJoinRoom(mockSocket as Socket, payload);
    });

    it('should handle leave room successfully', async () => {
      const result = await gateway.handleLeaveRoom(
        mockSocket as Socket,
        payload,
      );

      expect(mockSocket.leave).toHaveBeenCalledWith(payload.conversationId);
      expect(gateway['connectedUsers'].get(mockSocket.id).rooms).not.toContain(
        payload.conversationId,
      );
      expect(mockServer.to).toHaveBeenCalledWith(payload.conversationId);
      expect(mockSocket.emit).toHaveBeenCalledWith('leaveRoomSuccess', {
        conversationId: payload.conversationId,
      });
      expect(result).toEqual({
        success: true,
        conversationId: payload.conversationId,
      });
    });

    it('should handle leave room error for unknown user', async () => {
      gateway['connectedUsers'].delete(mockSocket.id);

      await expect(
        gateway.handleLeaveRoom(mockSocket as Socket, payload),
      ).rejects.toThrow('User not found');
    });
  });

  describe('handleGetMessageHistory', () => {
    const payload = {
      conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
      limit: 50,
      before: new Date(),
    };

    const mockQueryResult: MessageQueryOutputDTO = {
      rows: mockMessagesList,
      count: mockMessagesList.length,
    };

    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
    });

    it('should handle get message history successfully', async () => {
      messagesService.findByConversationId.mockResolvedValue(mockQueryResult);

      const result = await gateway.handleGetMessageHistory(
        mockSocket as Socket,
        mockUser,
        payload,
      );

      expect(messagesService.findByConversationId).toHaveBeenCalledWith(
        mockUser,
        payload.conversationId,
        expect.objectContaining({
          limit: payload.limit,
          before: payload.before,
        }),
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('messageHistory', {
        conversationId: payload.conversationId,
        messages: mockQueryResult.rows,
        count: mockQueryResult.count,
        timestamp: expect.any(Date),
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle get message history error', async () => {
      messagesService.findByConversationId.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(
        gateway.handleGetMessageHistory(
          mockSocket as Socket,
          mockUser,
          payload,
        ),
      ).rejects.toThrow('Service error');
    });
  });

  describe('handleStartTyping', () => {
    const payload = { conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba' };

    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
    });

    it('should handle start typing successfully', () => {
      const result = gateway.handleStartTyping(mockSocket as Socket, payload);

      expect(gateway['typingUsers'].get(payload.conversationId)).toContain(
        mockUser.id,
      );
      expect(mockSocket.to).toHaveBeenCalledWith(payload.conversationId);
      expect(result).toEqual({ success: true });
    });

    it('should handle start typing error for unknown user', () => {
      gateway['connectedUsers'].delete(mockSocket.id);

      expect(() => {
        gateway.handleStartTyping(mockSocket as Socket, payload);
      }).toThrow('User not found');
    });
  });

  describe('handleStopTyping', () => {
    const payload = { conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba' };

    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
      gateway.handleStartTyping(mockSocket as Socket, payload);
    });

    it('should handle stop typing successfully', () => {
      const result = gateway.handleStopTyping(mockSocket as Socket, payload);

      expect(gateway['typingUsers'].get(payload.conversationId)).not.toContain(
        mockUser.id,
      );
      expect(mockSocket.to).toHaveBeenCalledWith(payload.conversationId);
      expect(result).toEqual({ success: true });
    });

    it('should handle stop typing error for unknown user', () => {
      gateway['connectedUsers'].delete(mockSocket.id);

      expect(() => {
        gateway.handleStopTyping(mockSocket as Socket, payload);
      }).toThrow('User not found');
    });
  });

  describe('handleMarkMessageRead', () => {
    const payload = {
      messageId: mockMessagesList[0].id,
      conversationId: 'c69cc25b-0cc4-4032-83c2-0d34c84318ba',
    };

    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
    });

    it('should handle mark message as read successfully', async () => {
      messagesService.markAsRead.mockResolvedValue();

      const result = await gateway.handleMarkMessageRead(
        mockSocket as Socket,
        mockUser,
        payload,
      );

      expect(messagesService.markAsRead).toHaveBeenCalledWith(
        payload.messageId,
        mockUser.id,
      );
      expect(mockServer.to).toHaveBeenCalledWith(payload.conversationId);
      expect(mockServer.emit).toHaveBeenCalledWith('messageRead', {
        messageId: payload.messageId,
        userId: mockUser.id,
        conversationId: payload.conversationId,
        timestamp: expect.any(Date),
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle mark message as read error', async () => {
      messagesService.markAsRead.mockRejectedValue(new Error('Service error'));

      await expect(
        gateway.handleMarkMessageRead(mockSocket as Socket, mockUser, payload),
      ).rejects.toThrow('Service error');
    });

    it('should handle mark message as read error for unknown user', async () => {
      gateway['connectedUsers'].delete(mockSocket.id);

      await expect(
        gateway.handleMarkMessageRead(mockSocket as Socket, mockUser, payload),
      ).rejects.toThrow('User not found');
    });
  });

  describe('handleGetOnlineUsers', () => {
    beforeEach(async () => {
      await gateway.handleConnection(mockSocket as Socket);
    });

    it('should get all online users when no conversationId provided', () => {
      const payload = {};

      const result = gateway.handleGetOnlineUsers(
        mockSocket as Socket,
        payload,
      );

      expect(mockSocket.emit).toHaveBeenCalledWith('onlineUsers', {
        users: [mockUser.id],
        conversationId: undefined,
        timestamp: expect.any(Date),
      });
      expect(result).toEqual({ success: true });
    });

    it('should get online users for specific conversation', () => {
      const conversationId = 'c69cc25b-0cc4-4032-83c2-0d34c84318ba';
      const payload = { conversationId };

      // Mock room with socket
      const roomSockets = new Set([mockSocket.id]);
      mockServer.sockets.adapter.rooms.set(conversationId, roomSockets);

      const result = gateway.handleGetOnlineUsers(
        mockSocket as Socket,
        payload,
      );

      expect(mockSocket.emit).toHaveBeenCalledWith('onlineUsers', {
        users: [mockUser.id],
        conversationId,
        timestamp: expect.any(Date),
      });
      expect(result).toEqual({ success: true });
    });

    it('should handle get online users error', () => {
      const payload = {};

      // Force an error by temporarily replacing the connectedUsers with a broken one
      const originalConnectedUsers = (gateway as any)['connectedUsers'];
      const brokenConnectedUsers = {
        values: () => {
          throw new Error('Test error');
        },
      };
      (gateway as any)['connectedUsers'] = brokenConnectedUsers;

      expect(() => {
        gateway.handleGetOnlineUsers(mockSocket as Socket, payload);
      }).toThrow('Test error');

      // Restore the original
      (gateway as any)['connectedUsers'] = originalConnectedUsers;
    });
  });
});
