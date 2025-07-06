import { Logger, NotFoundException, UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketAuthMiddleware } from '../auth/socket-auth.middleware';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { SocketValidationPipe } from '../shared/websockets/socket-validation-pipe';
import { WsExceptionFilter } from '../shared/websockets/ws-exception.filter';
import { WsCurrentUser } from '../users/users.ws-decorator';
import { MessageQueryDTO } from './dto/message-query.dto';
import { CreateMessageDTO } from './dto/message.dto';
import {
  DeleteMessageWebSocketDTO,
  GetMessageHistoryWebSocketDTO,
  GetOnlineUsersWebSocketDTO,
  JoinRoomWebSocketDTO,
  LeaveRoomWebSocketDTO,
  MarkMessageReadWebSocketDTO,
  StartTypingWebSocketDTO,
  StopTypingWebSocketDTO,
  UpdateMessageWebSocketDTO,
} from './dto/websocket-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('messages')
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: function (origin, callback) {
      // This function validates origins during handshake
      // We'll properly configure allowed origins in afterInit
      callback(null, true);
    },
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);
  private readonly connectedUsers = new Map<
    string,
    { userId: string; rooms: string[] }
  >();
  private readonly userSockets = new Map<string, string[]>();
  private readonly typingUsers = new Map<string, Set<string>>();
  private readonly typingTimeouts = new Map<string, NodeJS.Timeout>();
  private corsOrigins: string | string[];

  constructor(
    private readonly messagesService: MessagesService,
    private readonly socketAuthMiddleware: SocketAuthMiddleware,
    private readonly configService: ConfigService,
  ) {
    // Get CORS origins from configuration
    this.corsOrigins = this.configService.get('app.corsOrigins');
  }

  afterInit(server: Server) {
    const corsOrigins = this.corsOrigins;

    // Configure CORS enforcement directly on the Socket.IO server
    // Override the origin validation function with proper configuration
    if (server.engine && server.engine.opts) {
      server.engine.opts.cors = {
        origin: corsOrigins,
        credentials: true,
      };
    }

    // Apply authentication middleware to all socket connections
    server.use(this.socketAuthMiddleware.createAuthMiddleware());
    this.logger.log('Socket.IO authentication middleware initialized');
    this.logger.log(
      `Socket.IO CORS configured with origins: ${JSON.stringify(corsOrigins)}`,
    );
  }

  async handleConnection(client: Socket) {
    try {
      // Authentication is now handled by the middleware during handshake
      // So we can trust that the client is authenticated at this point
      const userId = SocketAuthMiddleware.getUserId(client);

      if (!userId) {
        this.logger.error(
          `Connection failed - no user ID found for client ${client.id}`,
        );
        client.disconnect(true);
        return;
      }

      // Manage the connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId).push(client.id);

      this.connectedUsers.set(client.id, {
        userId,
        rooms: [],
      });

      // Broadcast user connection status
      this.server.emit('userStatus', {
        userId,
        status: 'online',
        timestamp: new Date(),
      });

      this.logger.log(`Client connected: ${client.id}, userId: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Connection error for client ${client.id}: ${error.message}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userInfo = this.connectedUsers.get(client.id);

    if (userInfo) {
      const { userId, rooms } = userInfo;

      // Remove user from all rooms they were in
      rooms.forEach((roomId) => {
        client.leave(roomId);
        this.server.to(roomId).emit('userLeaveRoom', {
          userId,
          roomId,
          timestamp: new Date(),
        });
      });

      // Remove socket from user's sockets list
      const userSocketIds = this.userSockets.get(userId) || [];
      const updatedSocketIds = userSocketIds.filter((id) => id !== client.id);

      if (updatedSocketIds.length === 0) {
        // If this was user's last connection, remove from maps and broadcast offline status
        this.userSockets.delete(userId);
        this.server.emit('userStatus', {
          userId,
          status: 'offline',
          timestamp: new Date(),
        });

        // Clear all typing timeouts for this user to prevent memory leaks
        const timeoutKeysToDelete: string[] = [];
        this.typingTimeouts.forEach((timeout, key) => {
          if (key.endsWith(`:${userId}`)) {
            clearTimeout(timeout);
            timeoutKeysToDelete.push(key);
          }
        });
        timeoutKeysToDelete.forEach((key) => {
          this.typingTimeouts.delete(key);
        });

        // Remove user from all typing users sets
        this.typingUsers.forEach((typingSet) => {
          typingSet.delete(userId);
        });
      } else {
        this.userSockets.set(userId, updatedSocketIds);
      }

      // Clear from connected users map
      this.connectedUsers.delete(client.id);

      this.logger.log(`Client disconnected: ${client.id}, userId: ${userId}`);
    }
  }

  @ApiOperation({ summary: 'Send a message to a conversation' })
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() currentUser: AuthUserDTO,
    @MessageBody(new SocketValidationPipe('sendMessage'))
    payload: CreateMessageDTO,
  ) {
    // Save the message using the service
    const savedMessage = await this.messagesService.create(
      currentUser,
      payload,
    );

    // Emit to the specific room/conversation instead of broadcasting to everyone
    if (payload.conversationId) {
      this.server
        .to(payload.conversationId)
        .emit('receiveMessage', savedMessage);
    } else {
      // Fallback to the old behavior
      this.server.emit('receiveMessage', savedMessage);
    }

    // Clear typing indicator for this user when they send a message
    this.handleStopTyping(client, { conversationId: payload.conversationId });

    return { success: true };
  }

  @ApiOperation({ summary: 'Join a room/conversation' })
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new SocketValidationPipe('joinRoom'))
    payload: JoinRoomWebSocketDTO,
  ) {
    const { conversationId } = payload;
    const userInfo = this.connectedUsers.get(client.id);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    // Join the room
    await client.join(conversationId);

    // Update user's rooms
    if (!userInfo.rooms.includes(conversationId)) {
      userInfo.rooms.push(conversationId);
      this.connectedUsers.set(client.id, userInfo);
    }

    // Notify room of new participant
    this.server.to(conversationId).emit('userJoinRoom', {
      userId: userInfo.userId,
      conversationId,
      timestamp: new Date(),
    });

    client.emit('joinRoomSuccess', { conversationId });

    return { success: true, conversationId };
  }

  @ApiOperation({ summary: 'Leave a room/conversation' })
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody(new SocketValidationPipe('leaveRoom'))
    payload: LeaveRoomWebSocketDTO,
  ) {
    const { conversationId } = payload;
    const userInfo = this.connectedUsers.get(client.id);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    // Leave the room
    await client.leave(conversationId);

    // Update user's rooms
    userInfo.rooms = userInfo.rooms.filter((room) => room !== conversationId);
    this.connectedUsers.set(client.id, userInfo);

    // Notify room of leaving participant
    this.server.to(conversationId).emit('userLeaveRoom', {
      userId: userInfo.userId,
      conversationId,
      timestamp: new Date(),
    });

    client.emit('leaveRoomSuccess', { conversationId });

    return { success: true, conversationId };
  }

  @ApiOperation({ summary: 'Get message history for a conversation' })
  @SubscribeMessage('getMessageHistory')
  async handleGetMessageHistory(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() currentUser: AuthUserDTO,
    @MessageBody(new SocketValidationPipe('getMessageHistory'))
    payload: GetMessageHistoryWebSocketDTO,
  ) {
    const { conversationId, limit = 50, before } = payload;

    // Create query from payload
    const query: MessageQueryDTO = {
      limit,
      before,
    };

    // Get message history from service
    const messageQueryResult = await this.messagesService.findByConversationId(
      currentUser,
      conversationId,
      query,
    );

    // Send message history back to the client
    client.emit('messageHistory', {
      conversationId,
      messages: messageQueryResult.rows,
      count: messageQueryResult.count,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'Get unread messages count for a conversation' })
  @SubscribeMessage('startTyping')
  handleStartTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody(new SocketValidationPipe('startTyping'))
    payload: StartTypingWebSocketDTO,
  ) {
    const { conversationId } = payload;
    const userInfo = this.connectedUsers.get(client.id);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    // Add user to typing set for this conversation
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }

    this.typingUsers.get(conversationId).add(userInfo.userId);

    // Clear any existing timeout
    const timeoutKey = `${conversationId}:${userInfo.userId}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey));
    }

    // Set new timeout (5 seconds)
    const timeout = setTimeout(() => {
      this.typingUsers.get(conversationId)?.delete(userInfo.userId);
      this.typingTimeouts.delete(timeoutKey);

      // Notify room about stopped typing
      this.server.to(conversationId).emit('userStopTyping', {
        userId: userInfo.userId,
        conversationId,
        timestamp: new Date(),
      });
    }, 5000);

    this.typingTimeouts.set(timeoutKey, timeout);

    // Notify others in the room
    client.to(conversationId).emit('userStartTyping', {
      userId: userInfo.userId,
      conversationId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'Stop typing in a conversation' })
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody(new SocketValidationPipe('stopTyping'))
    payload: StopTypingWebSocketDTO,
  ) {
    const { conversationId } = payload;
    const userInfo = this.connectedUsers.get(client.id);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    // Remove user from typing set for this conversation
    if (this.typingUsers.has(conversationId)) {
      this.typingUsers.get(conversationId).delete(userInfo.userId);
    }

    // Clear any existing timeout for this user in this conversation
    const timeoutKey = `${conversationId}:${userInfo.userId}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey));
      this.typingTimeouts.delete(timeoutKey);
    }

    // Notify others in the room
    client.to(conversationId).emit('userStopTyping', {
      userId: userInfo.userId,
      conversationId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'Mark a message as read' })
  @SubscribeMessage('markMessageRead')
  async handleMarkMessageRead(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() currentUser: AuthUserDTO,
    @MessageBody(new SocketValidationPipe('markMessageRead'))
    payload: MarkMessageReadWebSocketDTO,
  ) {
    const { messageId, conversationId } = payload;
    const userInfo = this.connectedUsers.get(client.id);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    // Update message read status via service
    await this.messagesService.markAsRead(messageId, currentUser.id);

    // Notify conversation members about read status
    this.server.to(conversationId).emit('messageRead', {
      messageId,
      userId: userInfo.userId,
      conversationId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'Get online users in a conversation or globally' })
  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody(new SocketValidationPipe('getOnlineUsers'))
    payload: GetOnlineUsersWebSocketDTO,
  ) {
    const { conversationId } = payload;
    const userIds = new Set<string>();

    if (conversationId) {
      // Get online users in a specific conversation
      const roomSockets = this.server.sockets.adapter.rooms.get(conversationId);

      if (roomSockets) {
        for (const socketId of roomSockets) {
          const userInfo = this.connectedUsers.get(socketId);
          if (userInfo) {
            userIds.add(userInfo.userId);
          }
        }
      }
    } else {
      // Get all online users
      for (const userInfo of this.connectedUsers.values()) {
        userIds.add(userInfo.userId);
      }
    }

    client.emit('onlineUsers', {
      users: Array.from(userIds),
      conversationId,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'Update a message' })
  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() currentUser: AuthUserDTO,
    @MessageBody(new SocketValidationPipe('updateMessage'))
    payload: UpdateMessageWebSocketDTO,
  ) {
    const updatedMessage = await this.messagesService.update(
      currentUser,
      payload.messageId,
      { content: payload.content },
    );

    // Emit to the specific room/conversation
    if (payload.conversationId) {
      this.server
        .to(payload.conversationId)
        .emit('messageUpdated', updatedMessage);
    }

    client.emit('updateMessageSuccess', { messageId: payload.messageId });
    return { success: true };
  }

  @ApiOperation({ summary: 'Delete a message' })
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @ConnectedSocket() client: Socket,
    @WsCurrentUser() currentUser: AuthUserDTO,
    @MessageBody(new SocketValidationPipe('deleteMessage'))
    payload: DeleteMessageWebSocketDTO,
  ) {
    await this.messagesService.delete(currentUser, payload.messageId);

    // Emit to the specific room/conversation
    if (payload.conversationId) {
      this.server.to(payload.conversationId).emit('messageDeleted', {
        messageId: payload.messageId,
        deletedBy: currentUser.id,
        timestamp: new Date(),
      });
    }

    client.emit('deleteMessageSuccess', { messageId: payload.messageId });
    return { success: true };
  }
}
