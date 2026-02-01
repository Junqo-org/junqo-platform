import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Sparkles, Lightbulb, AlertCircle, Briefcase, Loader2, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Application } from '@/types'
import { apiService } from '@/services/api'
import { ApplicationInterviewCard } from '@/components/interview/ApplicationInterviewCard'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default function InterviewPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Setup state
  const [customContext, setCustomContext] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appsData = await apiService.getMyApplications()
        setApplications(appsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Impossible de charger les données')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStartGeneralInterview = () => {
    let finalContext = 'general'

    if (customContext.trim()) {
      finalContext = customContext.trim()
    }

    navigate('/interview/chat', { 
      state: { 
        context: finalContext
      } 
    })
  }

  const handleApplicationClick = (application: Application) => {
    navigate('/interview/chat', { 
      state: { 
        context: `Entretien pour le poste de ${application.offer?.title} chez ${application.company?.name}` 
      } 
    })
  }

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

      {/* Configuration Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Démarrer une nouvelle simulation
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="context">Contexte du poste / Situation (Optionnel)</Label>
                        <Input 
                            id="context"
                            placeholder="ex: Développeur React Senior chez TechCorp, Entretien RH..."
                            value={customContext}
                            onChange={(e) => setCustomContext(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                            Laissez vide pour un entretien général sans contexte spécifique.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto"
                            onClick={handleStartGeneralInterview}
                        >
                            <Sparkles className="mr-2 h-4 w-4" />
                            Commencer l'entretien
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      </motion.div>

      {/* Mes Candidatures Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Mes Candidatures</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : applications.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {applications.map((app) => (
              <ApplicationInterviewCard 
                key={app.id} 
                application={app} 
                onClick={handleApplicationClick} 
              />
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
              <p className="font-medium text-muted-foreground">Aucune candidature trouvée</p>
              <p className="text-sm text-muted-foreground/80 mt-1">Postulez à des offres pour vous entraîner spécifiquement pour elles.</p>
              <Link to="/offers" className="mt-4">
                <Button variant="outline" size="sm">
                  Voir les offres
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
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
