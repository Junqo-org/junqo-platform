import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  FileText,
  MessageSquare,
  Users,
  PlusCircle,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Loader2,
  Eye,
  CheckCircle
} from 'lucide-react'
import { apiService } from '@/services/api'
import { DashboardStatistics } from '@/types'
import { toast } from 'sonner'

export default function HomePage() {
  const user = useAuthStore((state) => state.user)
  const isStudent = user?.type === 'STUDENT'
  const isCompany = user?.type === 'COMPANY'
  const isSchool = user?.type === 'SCHOOL'
  const [stats, setStats] = useState<DashboardStatistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    setIsLoading(true)
    try {
      const data = await apiService.getDashboardStatistics()
      setStats(data)
    } catch (error: unknown) {
      console.error('Failed to load statistics:', error)
      toast.error('Échec du chargement des statistiques')
    } finally {
      setIsLoading(false)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Bon retour, <span className="text-primary">{user?.name?.split(' ')[0] || 'Utilisateur'}</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {isStudent && "Trouvons votre prochaine opportunité"}
            {isCompany && "Gérez vos activités de recrutement"}
            {isSchool && "Gérez vos étudiants et suivez leur parcours"}
          </p>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isStudent && (
            <>
              <motion.div variants={item}>
                <Link to="/offers" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-border transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            Parcourir les offres
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Explorer les opportunités
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to="/cv" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                            Analyse de CV
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Conseils par IA
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to="/interview" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                            Simuler un entretien
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Gagner en confiance
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to="/applications" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="h-6 w-6 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            Mes candidatures
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Suivre votre progression
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item} className="md:col-span-2">
                <Link to="/messaging" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-border transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              Messages
                            </CardTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Restez en contact avec les recruteurs
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            </>
          )}

          {isCompany && (
            <>
              <motion.div variants={item}>
                <Link to="/offers/create" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-border transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                          <PlusCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            Publier une offre
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Créer une nouvelle opportunité
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to="/offers" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                            Mes offres d'emploi
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Gérer vos annonces
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item}>
                <Link to="/recruiter/applications" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                            Candidatures
                          </CardTitle>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            Examiner les candidats
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>

              <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
                <Link to="/messaging" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-border transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              Messages
                            </CardTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Communiquer avec les candidats
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            </>
          )}

          {isSchool && (
            <>
              <motion.div variants={item} className="md:col-span-2 lg:col-span-3">
                <Link to="/school/dashboard" className="block h-full">
                  <Card className="h-full border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-border transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                            <Users className="h-7 w-7 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              Mes Étudiants
                            </CardTitle>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Gérez vos étudiants et les demandes de liaison
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Quick Stats - Only for Students and Companies */}
        {(isStudent || isCompany) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Votre activité</h2>
              {isLoading && <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        {isStudent ? "Candidatures envoyées" : "Annonces actives"}
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : (stats?.totalActive || 0)}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
                      {isStudent ? <Briefcase className="h-6 w-6 text-primary" /> : <TrendingUp className="h-6 w-6 text-primary" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        {isStudent ? "Acceptées" : "Vues"}
                      </p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : (isStudent ? (stats?.acceptedApplications || 0) : (stats?.totalViews || 0))}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                      {isStudent ? <CheckCircle className="h-6 w-6 text-emerald-600" /> : <Eye className="h-6 w-6 text-emerald-600" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Messages</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin" /> : (stats?.totalConversations || 0)}
                      </p>
                      {!isLoading && stats && stats.unreadMessages > 0 && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          {stats.unreadMessages} non lus
                        </p>
                      )}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12"
        >
          <Card className="border-slate-200 dark:border-slate-700 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                    {isStudent ? "Prêt à trouver votre emploi idéal ?" : isCompany ? "Vous cherchez des talents ?" : "Gérez vos étudiants"}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {isStudent
                      ? "Parcourez des milliers d'opportunités et postulez en un clic"
                      : isCompany
                        ? "Publiez votre offre d'emploi et connectez-vous avec des candidats qualifiés"
                        : "Suivez le parcours de vos étudiants et approuvez les nouvelles demandes"}
                  </p>
                </div>
                <Link to={isStudent ? "/offers" : isCompany ? "/offers/create" : "/school/dashboard"}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    {isStudent ? "Voir les offres" : isCompany ? "Publier une offre" : "Accéder au tableau de bord"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            {isStudent ? "Conseils rapides" : isCompany ? "Bonnes pratiques" : "Conseils pour les écoles"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  {isStudent ? "Optimisez votre profil" : isCompany ? "Rédigez des descriptions claires" : "Suivez vos étudiants"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  {isStudent
                    ? "Gardez votre profil à jour avec vos dernières compétences et expériences pour attirer plus d'opportunités."
                    : isCompany
                      ? "Incluez des exigences et responsabilités spécifiques pour attirer les bons candidats."
                      : "Consultez régulièrement les demandes de liaison des étudiants pour les valider rapidement."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                  </div>
                  {isStudent ? "La pratique rend parfait" : isCompany ? "Répondez rapidement" : "Accompagnez vos étudiants"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-400">
                  {isStudent
                    ? "Utilisez notre outil d'entraînement aux entretiens par IA pour vous préparer."
                    : isCompany
                      ? "Des réponses rapides aux candidatures montrent le professionnalisme et maintiennent l'engagement des candidats."
                      : "Suivez le parcours de vos étudiants et assurez-vous qu'ils mettent à jour leurs profils régulièrement."}
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
