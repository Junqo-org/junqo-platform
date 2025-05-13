import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { CurrentUser } from '../users/users.decorator';
import { AuthUserDTO } from '../shared/dto/auth-user.dto';
import { CreateMessageDTO } from './dto/message.dto';
import { SocketValidationPipe } from '../shared/websockets/socket-validation-pipe';
import { Logger } from '@nestjs/common';

// TODO
@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to your domains
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
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

  constructor(private readonly messagesService: MessagesService) {}

  async handleConnection(client: Socket) {
    try {
      // Authenticate user (assuming token is passed in handshake)
      const token = client.handshake.auth.token;
      if (!token) {
        throw new WsException('Authentication failed - token missing');
      }

      // In a real implementation, verify the token and extract user info
      // For now, using a simple mock example
      const userId =
        client.handshake.auth.userId ||
        'guest-' + Math.random().toString(36).substr(2, 9);

      // Store connection information
      client.data.userId = userId;

      // Add to connected users map
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
      this.logger.error(`Connection error: ${error.message}`);
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
      } else {
        this.userSockets.set(userId, updatedSocketIds);
      }

      // Clear from connected users map
      this.connectedUsers.delete(client.id);

      this.logger.log(`Client disconnected: ${client.id}, userId: ${userId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @CurrentUser() currentUser: AuthUserDTO,
    @MessageBody(new SocketValidationPipe()) payload: CreateMessageDTO,
  ) {
    try {
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
    } catch (error) {
      // Send error back to the client who sent the message
      client.emit('messageError', {
        message: 'Invalid message format',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const { conversationId } = payload;
      const userInfo = this.connectedUsers.get(client.id);

      if (!userInfo) {
        throw new WsException('User not found');
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
    } catch (error) {
      client.emit('joinRoomError', {
        message: 'Failed to join room',
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const { conversationId } = payload;
      const userInfo = this.connectedUsers.get(client.id);

      if (!userInfo) {
        throw new WsException('User not found');
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
    } catch (error) {
      client.emit('leaveRoomError', {
        message: 'Failed to leave room',
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  // @SubscribeMessage('getMessageHistory')
  // async handleGetMessageHistory(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody()
  //   payload: { conversationId: string; limit?: number; before?: Date },
  // ) {
  //   try {
  //     const { conversationId, limit = 50, before } = payload;

  //     // Get message history from service
  //     const messages = await this.messagesService.findAll({
  //       conversationId,
  //       limit,
  //       before,
  //     });

  //     // Send message history back to the client
  //     client.emit('messageHistory', {
  //       conversationId,
  //       messages,
  //       timestamp: new Date(),
  //     });

  //     return { success: true };
  //   } catch (error) {
  //     client.emit('messageHistoryError', {
  //       message: 'Failed to fetch message history',
  //       error: error.message,
  //     });
  //     return { success: false, error: error.message };
  //   }
  // }

  @SubscribeMessage('startTyping')
  handleStartTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const { conversationId } = payload;
      const userInfo = this.connectedUsers.get(client.id);

      if (!userInfo) {
        throw new WsException('User not found');
      }

      // Add user to typing set for this conversation
      if (!this.typingUsers.has(conversationId)) {
        this.typingUsers.set(conversationId, new Set());
      }

      this.typingUsers.get(conversationId).add(userInfo.userId);

      // Notify others in the room
      client.to(conversationId).emit('userTyping', {
        userId: userInfo.userId,
        conversationId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId: string },
  ) {
    try {
      const { conversationId } = payload;
      const userInfo = this.connectedUsers.get(client.id);

      if (!userInfo) {
        throw new WsException('User not found');
      }

      // Remove user from typing set for this conversation
      if (this.typingUsers.has(conversationId)) {
        this.typingUsers.get(conversationId).delete(userInfo.userId);
      }

      // Notify others in the room
      client.to(conversationId).emit('userStoppedTyping', {
        userId: userInfo.userId,
        conversationId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markMessageRead')
  async handleMarkMessageRead(
    @ConnectedSocket() client: Socket,
    @CurrentUser() currentUser: AuthUserDTO,
    @MessageBody() payload: { messageId: string; conversationId: string },
  ) {
    try {
      const { messageId, conversationId } = payload;
      const userInfo = this.connectedUsers.get(client.id);

      if (!userInfo) {
        throw new WsException('User not found');
      }

      // Update message read status via service
      await this.messagesService.markAsRead(messageId, userInfo.userId);

      // Notify conversation members about read status
      this.server.to(conversationId).emit('messageRead', {
        messageId,
        userId: userInfo.userId,
        conversationId,
        timestamp: new Date(),
      });

      return { success: true };
    } catch (error) {
      client.emit('markReadError', {
        message: 'Failed to mark message as read',
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { conversationId?: string },
  ) {
    try {
      const { conversationId } = payload;
      const userIds = new Set<string>();

      if (conversationId) {
        // Get online users in a specific conversation
        const roomSockets =
          this.server.sockets.adapter.rooms.get(conversationId);

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
    } catch (error) {
      client.emit('onlineUsersError', {
        message: 'Failed to get online users',
        error: error.message,
      });
      return { success: false, error: error.message };
    }
  }
}
