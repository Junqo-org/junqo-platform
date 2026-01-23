import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
  Building,
  MapPin,
  Eye
} from 'lucide-react'
import { apiService } from '@/services/api'
import { Application } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function ApplicationsTrackingPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [applications, searchQuery, statusFilter])

  const loadApplications = async () => {
    try {
      const data = await apiService.getMyApplications()
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.offer?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.company?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOT_OPENED':
        return { label: 'Non vue', color: 'bg-slate-100 text-slate-700 border-slate-200' }
      case 'PENDING':
        return { label: 'En cours d\'examen', color: 'bg-amber-100 text-amber-700 border-amber-200' }
      case 'ACCEPTED':
        return { label: 'Acceptée', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
      case 'DENIED':
        return { label: 'Refusée', color: 'bg-red-100 text-red-700 border-red-200' }
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NOT_OPENED':
        return <Clock className="h-4 w-4" />
      case 'PENDING':
        return <Eye className="h-4 w-4" />
      case 'ACCEPTED':
        return <CheckCircle className="h-4 w-4" />
      case 'DENIED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const stats = {
    total: applications.length,
    notOpened: applications.filter((a) => a.status === 'NOT_OPENED').length,
    pending: applications.filter((a) => a.status === 'PENDING').length,
    accepted: applications.filter((a) => a.status === 'ACCEPTED').length,
    denied: applications.filter((a) => a.status === 'DENIED').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Chargement des candidatures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Mes candidatures
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Suivez l'état de vos candidatures
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600">{stats.notOpened}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Non vues</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">En cours</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{stats.accepted}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Acceptées</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{stats.denied}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Refusées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Rechercher par titre ou entreprise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ALL')}
                  size="sm"
                >
                  Tous
                </Button>
                <Button
                  variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('PENDING')}
                  size="sm"
                >
                  En cours
                </Button>
                <Button
                  variant={statusFilter === 'ACCEPTED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ACCEPTED')}
                  size="sm"
                  className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                >
                  Acceptées
                </Button>
                <Button
                  variant={statusFilter === 'DENIED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('DENIED')}
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Refusées
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
                  Aucune candidature trouvée
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Essayez d\'ajuster vos filtres'
                    : "Vous n'avez pas encore postulé à des offres"}
                </p>
                {!searchQuery && statusFilter === 'ALL' && (
                  <Button asChild>
                    <Link to="/offers">Voir les offres</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application, index) => {
              const statusBadge = getStatusBadge(application.status)
              const statusIcon = getStatusIcon(application.status)

              return (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/offers/details?id=${application.offerId}`}>
                    <Card className="hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Left: Offer Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 line-clamp-1">
                                {application.offer?.title || 'Offre sans titre'}
                              </h3>
                              <Badge className={statusBadge.color}>
                                <span className="flex items-center gap-1">
                                  {statusIcon}
                                  {statusBadge.label}
                                </span>
                              </Badge>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Building className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {application.company?.companyName || 'Entreprise inconnue'}
                                </span>
                              </div>

                              {application.offer?.workLocationType && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{application.offer.workLocationType}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>
                                  Postulé {formatRelativeTime(new Date(application.createdAt))}
                                </span>
                              </div>
                            </div>

                            {/* Progress Timeline */}
                            <div className="mt-4 flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${application.status !== 'NOT_OPENED' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              <div className={`h-0.5 flex-1 ${application.status === 'PENDING' || application.status === 'ACCEPTED' || application.status === 'DENIED' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              <div className={`h-2 w-2 rounded-full ${application.status === 'PENDING' || application.status === 'ACCEPTED' || application.status === 'DENIED' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              <div className={`h-0.5 flex-1 ${application.status === 'ACCEPTED' || application.status === 'DENIED' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                              <div className={`h-2 w-2 rounded-full ${application.status === 'ACCEPTED' ? 'bg-emerald-600' : application.status === 'DENIED' ? 'bg-red-600' : 'bg-slate-300'}`} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

