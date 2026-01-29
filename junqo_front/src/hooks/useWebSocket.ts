import { useEffect, useRef, useCallback } from 'react'
import { websocketService, MessagePayload } from '@/services/websocket'
import { useAuthStore } from '@/store/authStore'
import { Message } from '@/types'

interface UseWebSocketOptions {
  onMessage?: (message: Message) => void
  onTyping?: (data: { userId: string; conversationId: string }) => void
  onStopTyping?: (data: { userId: string; conversationId: string }) => void
  onUserStatus?: (data: { userId: string; status: 'online' | 'offline' }) => void
  onMessageRead?: (data: { messageId: string; userId: string }) => void
  onMessageUpdated?: (message: Message) => void
  onMessageDeleted?: (data: { messageId: string; conversationId: string }) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  // Use refs to keep the latest callbacks without recreating listeners
  const optionsRef = useRef(options)

  // Update ref when options change
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Set up event listeners with useCallback to stabilize references
  // These callbacks use the ref to always call the latest version
  const onMessage = useCallback((message: Message) => {
    optionsRef.current.onMessage?.(message)
  }, [])

  const onTyping = useCallback((data: { userId: string; conversationId: string }) => {
    optionsRef.current.onTyping?.(data)
  }, [])

  const onStopTyping = useCallback((data: { userId: string; conversationId: string }) => {
    optionsRef.current.onStopTyping?.(data)
  }, [])

  const onUserStatus = useCallback((data: { userId: string; status: 'online' | 'offline' }) => {
    optionsRef.current.onUserStatus?.(data)
  }, [])

  const onMessageRead = useCallback((data: { messageId: string; userId: string }) => {
    optionsRef.current.onMessageRead?.(data)
  }, [])

  const onMessageUpdated = useCallback((message: Message) => {
    optionsRef.current.onMessageUpdated?.(message)
  }, [])

  const onMessageDeleted = useCallback((data: { messageId: string; conversationId: string }) => {
    optionsRef.current.onMessageDeleted?.(data)
  }, [])

  // Set up event listeners (connexion gérée par useWebSocketConnection dans App.tsx)
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    // Register all listeners using the stable callback refs
    websocketService.onMessage(onMessage)
    websocketService.onTyping(onTyping)
    websocketService.onStopTyping(onStopTyping)
    websocketService.onUserStatus(onUserStatus)
    websocketService.onMessageRead(onMessageRead)
    websocketService.onMessageUpdated(onMessageUpdated)
    websocketService.onMessageDeleted(onMessageDeleted)

    // Cleanup listeners when component unmounts or auth changes
    return () => {
      websocketService.offMessage(onMessage)
      websocketService.offTyping(onTyping)
      websocketService.offStopTyping(onStopTyping)
      websocketService.offUserStatus(onUserStatus)
      websocketService.offMessageRead(onMessageRead)
      websocketService.offMessageUpdated(onMessageUpdated)
      websocketService.offMessageDeleted(onMessageDeleted)
    }
  }, [
    isAuthenticated,
    onMessage,
    onTyping,
    onStopTyping,
    onUserStatus,
    onMessageRead,
    onMessageUpdated,
    onMessageDeleted,
  ])

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
