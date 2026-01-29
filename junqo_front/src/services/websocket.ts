import { io, Socket } from 'socket.io-client'
import { config } from '@/config/env'
import { useAuthStore } from '@/store/authStore'
import { Message } from '@/types'

export interface MessagePayload {
  conversationId: string
  senderId: string
  content: string
}

export interface TypingPayload {
  conversationId: string
}

export interface JoinRoomPayload {
  conversationId: string
}

export interface UserStatusPayload {
  userId: string
  status: 'online' | 'offline'
  timestamp: Date
}

class WebSocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isConnecting = false

  connect() {
    // Si déjà connecté, retourner la socket existante
    if (this.socket?.connected) {
      return this.socket
    }

    // Si en cours de connexion, retourner la socket en cours
    if (this.isConnecting && this.socket) {
      return this.socket
    }

    const token = useAuthStore.getState().token

    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      return null
    }

    this.isConnecting = true

    this.socket = io(config.wsUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0
      this.isConnecting = false
    })

    this.socket.on('disconnect', () => {
      this.isConnecting = false
    })

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error)
      this.reconnectAttempts++
      this.isConnecting = false

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
        this.disconnect()
      }
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnecting = false
    }
  }

  // Join a conversation room
  joinRoom(conversationId: string) {
    this.socket?.emit('joinRoom', { conversationId })
  }

  // Leave a conversation room
  leaveRoom(conversationId: string) {
    this.socket?.emit('leaveRoom', { conversationId })
  }

  // Send a message
  sendMessage(payload: MessagePayload) {
    this.socket?.emit('sendMessage', payload)
  }

  // Listen for incoming messages
  onMessage(callback: (message: Message) => void) {
    this.socket?.on('receiveMessage', callback)
  }

  // Remove message listener
  offMessage(callback?: (message: Message) => void) {
    this.socket?.off('receiveMessage', callback)
  }

  // Start typing indicator
  startTyping(conversationId: string) {
    this.socket?.emit('startTyping', { conversationId })
  }

  // Stop typing indicator
  stopTyping(conversationId: string) {
    this.socket?.emit('stopTyping', { conversationId })
  }

  // Listen for typing indicators
  onTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.on('userStartTyping', callback)
  }

  // Remove typing listener
  offTyping(callback?: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.off('userStartTyping', callback)
  }

  // Listen for stop typing
  onStopTyping(callback: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.on('userStopTyping', callback)
  }

  // Remove stop typing listener
  offStopTyping(callback?: (data: { userId: string; conversationId: string }) => void) {
    this.socket?.off('userStopTyping', callback)
  }

  // Listen for user status changes
  onUserStatus(callback: (data: UserStatusPayload) => void) {
    this.socket?.on('userStatus', callback)
  }

  // Remove user status listener
  offUserStatus(callback?: (data: UserStatusPayload) => void) {
    this.socket?.off('userStatus', callback)
  }

  // Mark message as read
  markMessageRead(messageId: string, conversationId: string) {
    this.socket?.emit('markMessageRead', { messageId, conversationId })
  }

  // Listen for message read events
  onMessageRead(callback: (data: { messageId: string; userId: string }) => void) {
    this.socket?.on('messageRead', callback)
  }

  // Remove message read listener
  offMessageRead(callback?: (data: { messageId: string; userId: string }) => void) {
    this.socket?.off('messageRead', callback)
  }

  // Update a message
  updateMessage(messageId: string, content: string, conversationId: string) {
    this.socket?.emit('updateMessage', { messageId, content, conversationId })
  }

  // Listen for message updates
  onMessageUpdated(callback: (message: Message) => void) {
    this.socket?.on('messageUpdated', callback)
  }

  // Remove message updated listener
  offMessageUpdated(callback?: (message: Message) => void) {
    this.socket?.off('messageUpdated', callback)
  }

  // Delete a message
  deleteMessage(messageId: string, conversationId: string) {
    this.socket?.emit('deleteMessage', { messageId, conversationId })
  }

  // Listen for message deletions
  onMessageDeleted(callback: (data: { messageId: string; conversationId: string }) => void) {
    this.socket?.on('messageDeleted', callback)
  }

  // Remove message deleted listener
  offMessageDeleted(callback?: (data: { messageId: string; conversationId: string }) => void) {
    this.socket?.off('messageDeleted', callback)
  }

  // Get message history
  getMessageHistory(conversationId: string, limit?: number, before?: Date) {
    return new Promise((resolve) => {
      this.socket?.emit('getMessageHistory', { conversationId, limit, before })
      this.socket?.once('messageHistory', resolve)
    })
  }

  // Get online users
  getOnlineUsers(conversationId?: string) {
    return new Promise((resolve) => {
      this.socket?.emit('getOnlineUsers', { conversationId })
      this.socket?.once('onlineUsers', resolve)
    })
  }

  // Generic event listener
  on(event: string, callback: (...args: unknown[]) => void) {
    this.socket?.on(event, callback)
  }

  // Generic event remover
  off(event: string) {
    this.socket?.off(event)
  }

  // Get socket instance
  getSocket() {
    return this.socket
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false
  }
}

export const websocketService = new WebSocketService()
