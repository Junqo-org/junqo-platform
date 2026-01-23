import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Lightbulb, AlertCircle } from 'lucide-react'

export default function InterviewPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="h-10 w-10 text-purple-600" />
          Simulation d'Entretien IA
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Pratiquez vos entretiens avec notre IA conversationnelle. 
          Posez vos questions, répondez aux siennes et obtenez des conseils en temps réel.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/50 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Comment ça marche ?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Démarrez la conversation</p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur "Démarrer l'Entretien" pour commencer
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Discutez avec l'IA</p>
                <p className="text-sm text-muted-foreground">
                  L'IA vous posera des questions et répondra aux vôtres
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Obtenez des conseils</p>
                <p className="text-sm text-muted-foreground">
                  L'IA vous donnera des retours constructifs pour vous améliorer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <Link to="/interview/chat">
          <Button size="lg" className="text-lg px-8 py-6">
            <Sparkles className="mr-2 h-5 w-5" />
            Démarrer l'Entretien
          </Button>
        </Link>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Conseils pour réussir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Soyez précis et détaillé dans vos réponses</li>
              <li>✓ Utilisez des exemples concrets de votre expérience</li>
              <li>✓ Restez professionnel et positif</li>
              <li>✓ N'hésitez pas à poser des questions sur le poste</li>
              <li>✓ Prenez votre temps pour réfléchir avant de répondre</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-900 dark:text-orange-200">
                Cette simulation utilise l'IA pour vous aider à vous préparer. 
                Les conversations ne sont pas enregistrées et servent uniquement à l'entraînement.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
