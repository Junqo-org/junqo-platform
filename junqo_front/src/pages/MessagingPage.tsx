import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Loader2, MessageSquare, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useWebSocket } from '@/hooks/useWebSocket'
import { apiService } from '@/services/api'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

interface ConversationData {
  id: string
  participantsIds: string[]
  lastMessage?: {
    id: string
    senderId: string
    conversationId: string
    content: string
    createdAt: string
  }
  createdAt: string
  updatedAt: string
  title?: string
}

interface MessageData {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt?: string
}

export default function MessagingPage() {
  const user = useAuthStore((state) => state.user)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [conversations, setConversations] = useState<ConversationData[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const { sendMessage, joinRoom, leaveRoom, onMessage, offMessage } = useWebSocket({
    onMessage: handleNewMessage,
  })

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      joinRoom(selectedConversation.id)
      
      return () => {
        leaveRoom(selectedConversation.id)
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const data = await apiService.getConversations()
      setConversations(Array.isArray(data) ? data : data.items || [])
    } catch (error: any) {
      console.error('Failed to load conversations:', error)
      toast.error('Erreur lors du chargement des conversations')
      setConversations([])
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true)
    try {
      const data = await apiService.getMessages(conversationId)
      setMessages(Array.isArray(data) ? data : data.items || [])
    } catch (error: any) {
      console.error('Failed to load messages:', error)
      toast.error('Erreur lors du chargement des messages')
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }

  function handleNewMessage(message: MessageData) {
    if (selectedConversation && message.conversationId === selectedConversation.id) {
      setMessages((prev) => [...prev, message])
    }
    
    // Update last message in conversations list
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message, updatedAt: new Date().toISOString() }
          : conv
      )
    )
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return

    const tempMessage: MessageData = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: user.id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempMessage])
    setNewMessage('')
    setIsSending(true)

    try {
      // Send via WebSocket for real-time delivery
      sendMessage({
        conversationId: selectedConversation.id,
        senderId: user.id,
        content: tempMessage.content,
      })

      // Also send via HTTP for persistence
      await apiService.createMessage(selectedConversation.id, tempMessage.content)
    } catch (error: any) {
      console.error('Failed to send message:', error)
      toast.error('Erreur lors de l\'envoi du message')
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id))
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    const title = conv.title || 'Conversation'
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="space-y-2 p-4">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucune conversation</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-primary/10'
                      : 'hover:bg-accent'
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {conv.participantsIds.length > 0 ? '👤' : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {conv.title || 'Conversation'}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(new Date(conv.updatedAt))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <CardTitle>
                {selectedConversation.title || 'Conversation'}
              </CardTitle>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-6">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun message</p>
                  <p className="text-sm">Commencez la conversation !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => {
                      const isOwn = message.senderId === user?.id
                      
                      return (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : ''}>
                              {isOwn ? getInitials(user.name || user.email) : '👤'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className={`flex-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div
                              className={`rounded-lg p-3 ${
                                isOwn
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                            {message.createdAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(message.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  <div ref={scrollRef} />
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={isSending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm">Choisissez une conversation pour commencer</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
