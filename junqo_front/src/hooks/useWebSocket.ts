import { useEffect, useRef, useCallback } from 'react'
import { websocketService, MessagePayload } from '@/services/websocket'
import { useAuthStore } from '@/store/authStore'

interface UseWebSocketOptions {
  onMessage?: (message: any) => void
  onTyping?: (data: { userId: string; conversationId: string }) => void
  onStopTyping?: (data: { userId: string; conversationId: string }) => void
  onUserStatus?: (data: { userId: string; status: 'online' | 'offline' }) => void
  onMessageRead?: (data: { messageId: string; userId: string }) => void
  onMessageUpdated?: (message: any) => void
  onMessageDeleted?: (data: { messageId: string; conversationId: string }) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isConnectedRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    // Connect to WebSocket
    const socket = websocketService.connect()
    
    if (!socket) {
      console.error('Failed to connect to WebSocket')
      return
    }

    isConnectedRef.current = true

    // Set up event listeners
    if (options.onMessage) {
      websocketService.onMessage(options.onMessage)
    }

    if (options.onTyping) {
      websocketService.onTyping(options.onTyping)
    }

    if (options.onStopTyping) {
      websocketService.onStopTyping(options.onStopTyping)
    }

    if (options.onUserStatus) {
      websocketService.onUserStatus(options.onUserStatus)
    }

    if (options.onMessageRead) {
      websocketService.onMessageRead(options.onMessageRead)
    }

    if (options.onMessageUpdated) {
      websocketService.onMessageUpdated(options.onMessageUpdated)
    }

    if (options.onMessageDeleted) {
      websocketService.onMessageDeleted(options.onMessageDeleted)
    }

    // Cleanup on unmount or when auth changes
    return () => {
      websocketService.offMessage()
      websocketService.offTyping()
      websocketService.offStopTyping()
      websocketService.offUserStatus()
      websocketService.offMessageRead()
      websocketService.offMessageUpdated()
      websocketService.offMessageDeleted()
      
      if (isConnectedRef.current) {
        websocketService.disconnect()
        isConnectedRef.current = false
      }
    }
  }, [isAuthenticated, options])

  // Join a conversation room
  const joinRoom = useCallback((conversationId: string) => {
    websocketService.joinRoom(conversationId)
  }, [])

  // Leave a conversation room
  const leaveRoom = useCallback((conversationId: string) => {
    websocketService.leaveRoom(conversationId)
  }, [])

  // Send a message
  const sendMessage = useCallback((payload: MessagePayload) => {
    websocketService.sendMessage(payload)
  }, [])

  // Start typing
  const startTyping = useCallback((conversationId: string) => {
    websocketService.startTyping(conversationId)
  }, [])

  // Stop typing
  const stopTyping = useCallback((conversationId: string) => {
    websocketService.stopTyping(conversationId)
  }, [])

  // Mark message as read
  const markMessageRead = useCallback((messageId: string, conversationId: string) => {
    websocketService.markMessageRead(messageId, conversationId)
  }, [])

  // Update message
  const updateMessage = useCallback((messageId: string, content: string, conversationId: string) => {
    websocketService.updateMessage(messageId, content, conversationId)
  }, [])

  // Delete message
  const deleteMessage = useCallback((messageId: string, conversationId: string) => {
    websocketService.deleteMessage(messageId, conversationId)
  }, [])

  // Get message history
  const getMessageHistory = useCallback(async (conversationId: string, limit?: number, before?: Date) => {
    return await websocketService.getMessageHistory(conversationId, limit, before)
  }, [])

  // Get online users
  const getOnlineUsers = useCallback(async (conversationId?: string) => {
    return await websocketService.getOnlineUsers(conversationId)
  }, [])

  // Check if connected
  const isConnected = useCallback(() => {
    return websocketService.isConnected()
  }, [])

  return {
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageRead,
    updateMessage,
    deleteMessage,
    getMessageHistory,
    getOnlineUsers,
    isConnected,
  }
}
