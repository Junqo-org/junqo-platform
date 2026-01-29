import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Eye,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  BarChart3
} from 'lucide-react'
import { apiService } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface DashboardStats {
  totalActive: number
  totalViews: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  profileCompletion: number
}

interface OfferAnalytics {
  offerId: string
  offerTitle?: string
  totalViews: number
  totalApplications: number
  conversionRate: number
  acceptanceRate: number
}

export default function RecruiterDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [analytics, setAnalytics] = useState<OfferAnalytics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load statistics
      const statsData = await apiService.getDashboardStatistics()
      setStats(statsData)

      // Load offers analytics
      try {
        const analyticsData = await apiService.getAllOffersAnalytics()
        if (analyticsData && analyticsData.analytics) {
          // Get offer titles
          const enrichedAnalytics = await Promise.all(
            analyticsData.analytics.slice(0, 5).map(async (analytics: OfferAnalytics) => {
              try {
                const offer = await apiService.getOffer(analytics.offerId)
                return { ...analytics, offerTitle: offer.title }
              } catch {
                return { ...analytics, offerTitle: 'Untitled Offer' }
              }
            })
          )
          setAnalytics(enrichedAnalytics)
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  const applicationStatusData = [
    { name: 'En attente', value: stats?.pendingApplications || 0, color: '#f59e0b' },
    { name: 'Acceptées', value: stats?.acceptedApplications || 0, color: '#10b981' },
    { name: 'Refusées', value: stats?.rejectedApplications || 0, color: '#ef4444' },
  ]

  const topPerformingOffers = analytics.slice(0, 5).map((a) => ({
    name: a.offerTitle?.substring(0, 20) || 'Offre',
    views: a.totalViews,
    applications: a.totalApplications,
  }))

  const conversionData = analytics.map((a) => ({
    name: a.offerTitle?.substring(0, 15) || 'Offre',
    rate: a.conversionRate,
  }))

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Tableau de bord recruteur
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Suivez vos performances de recrutement
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/offers/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Créer une offre
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/offers')}
            >
              Voir toutes les offres
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/recruiter/applications')}
            >
              <Users className="h-4 w-4 mr-2" />
              Examiner les candidats
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offres actives</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats?.totalActive || 0}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Annonces d'emploi actuellement actives
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-emerald-200 dark:border-emerald-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
                <Eye className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">{stats?.totalViews || 0}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Sur toutes vos offres
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Candidatures</CardTitle>
                <Users className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">{stats?.totalApplications || 0}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Total received
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Profile</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats?.profileCompletion || 0}%</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Completion rate
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Status Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statut des candidatures
              </CardTitle>
              <CardDescription>
                Répartition des statuts des candidatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats && stats.totalApplications > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={applicationStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {applicationStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>Aucune candidature pour le moment</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Offers Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Offres les plus performantes
              </CardTitle>
              <CardDescription>
                Comparaison Vues vs Candidatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topPerformingOffers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPerformingOffers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#3b82f6" name="Vues" />
                    <Bar dataKey="applications" fill="#10b981" name="Candidatures" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>Aucune offre créée pour le moment</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversion Rate Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5" />
                Taux de conversion
              </CardTitle>
              <CardDescription>
                Conversion des candidatures par offre
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="rate"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Taux de conversion (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p>Aucune donnée disponible</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides & Insights</CardTitle>
              <CardDescription>
                Prochaines étapes recommandées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-sm">Examens en attente</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {stats?.pendingApplications || 0} candidatures en attente
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/recruiter/applications')}>
                  Examiner
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-sm">Acceptées</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {stats?.acceptedApplications || 0} candidats acceptés
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">Rejected</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {stats?.rejectedApplications || 0} applications denied
                    </p>
                  </div>
                </div>
              </div>

              {(stats?.profileCompletion || 0) < 100 && (
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-sm">Complete Profile</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {100 - (stats?.profileCompletion || 0)}% remaining
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/profile')}>
                    Update
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
