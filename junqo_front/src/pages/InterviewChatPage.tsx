import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  TrendingUp
} from 'lucide-react'
import { apiService } from '@/services/api'
import ReactMarkdown from 'react-markdown'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  feedback?: string
}

export default function InterviewChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const context = (location.state as { context?: string })?.context || 'general'
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Bonjour ! Je suis votre recruteur virtuel pour cet entretien ${context !== 'general' ? `de ${context}` : ''}. Je vais vous poser quelques questions pour mieux vous connaître. Commençons par une question simple : Pouvez-vous vous présenter en quelques mots ?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingFeedbackId, setLoadingFeedbackId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await apiService.sendInterviewMessage(input, context)
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: unknown) {
      console.error('Interview error:', error)
      toast.error('Erreur lors de la communication avec le recruteur')
      
      // Fallback message
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Je suis désolé, j'ai rencontré un problème technique. Pouvez-vous reformuler votre réponse ?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetFeedback = async (message: Message) => {
    if (message.feedback || loadingFeedbackId) return;
    
    setLoadingFeedbackId(message.id)

    const messageIndex = messages.findIndex(m => m.id === message.id)
    if (messageIndex === -1) {
        setLoadingFeedbackId(null)
        return
    }

    const history = messages.slice(0, messageIndex + 1).map(m => ({
      role: m.role,
      content: m.content
    }))

    toast.info('Analyse de votre réponse en cours...')
    
    try {
        const response = await apiService.getInterviewFeedback(history, context)
        
        setMessages(prev => prev.map(m => {
            if (m.id === message.id) {
                return { ...m, feedback: response.response }
            }
            return m
        }))
        toast.success('Feedback reçu !')
    } catch (error) {
        console.error('Feedback error:', error)
        toast.error('Erreur lors de la récupération du feedback')
    } finally {
        setLoadingFeedbackId(null)
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const contextLabels: Record<string, string> = {
    technical: 'Entretien Technique',
    behavioral: 'Entretien Comportemental',
    'case-study': 'Étude de Cas',
    general: 'Entretien Général',
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/interview')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              {contextLabels[context] || 'Simulation d\'Entretien'}
            </h1>
            <p className="text-muted-foreground">Pratiquez avec notre IA recruteur</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <TrendingUp className="mr-1 h-3 w-3" />
          {messages.filter(m => m.role === 'user').length} réponses
        </Badge>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <Avatar className={`h-10 w-10 ${
                      message.role === 'assistant' 
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600' 
                        : 'bg-gradient-to-br from-green-600 to-teal-600'
                    }`}>
                      <AvatarFallback className="text-white">
                        {message.role === 'assistant' ? (
                          <Bot className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className={`flex flex-col max-w-[80%] ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}>
                      <div
                        className={`rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {message.timestamp.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      
                      {message.role === 'user' && !message.feedback && (
                        <Button
                          variant="ghost" 
                          size="sm" 
                          className="mt-1 h-6 text-xs text-muted-foreground hover:text-primary"
                          onClick={() => handleGetFeedback(message)}
                          disabled={!!loadingFeedbackId}
                        >
                          {loadingFeedbackId === message.id ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="mr-1 h-3 w-3" />
                          )}
                          Obtenir un feedback
                        </Button>
                      )}

                      {message.feedback && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 p-3 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900 rounded-lg text-sm text-muted-foreground"
                        >
                            <div className="flex items-center gap-2 mb-1 text-yellow-600 dark:text-yellow-500 font-semibold">
                                <Sparkles className="h-3 w-3" />
                                Feedback du coach
                            </div>
                           <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                             <ReactMarkdown>{message.feedback}</ReactMarkdown>
                           </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-600 to-blue-600">
                    <AvatarFallback className="text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-[80%] rounded-lg p-4 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p className="text-sm text-muted-foreground">Le recruteur réfléchit...</p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre réponse..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Appuyez sur Entrée pour envoyer • Shift + Entrée pour une nouvelle ligne
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Conseils pour réussir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Soyez précis et détaillé dans vos réponses</li>
            <li>• Utilisez des exemples concrets de votre expérience</li>
            <li>• Restez professionnel et positif</li>
            <li>• N'hésitez pas à poser des questions sur le poste</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

