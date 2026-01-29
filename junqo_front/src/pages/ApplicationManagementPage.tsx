import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Calendar,
  Briefcase,
  Eye,
  Phone,
  Linkedin,
  User,
  MessageSquare
} from 'lucide-react'
import { apiService } from '@/services/api'
import { Application } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StudentProfileModal } from '@/components/candidates/StudentProfileModal'

export default function ApplicationManagementPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [offerFilter, setOfferFilter] = useState<string>('ALL')
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set())
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [selectedStudentName, setSelectedStudentName] = useState<string | undefined>(undefined)
  const [showHistory, setShowHistory] = useState(false)

  const filterApplications = useCallback(() => {
    let filtered = applications

    // Filter by status/history
    if (!showHistory && statusFilter === 'ALL') {
      filtered = filtered.filter(app => app.status !== 'ACCEPTED' && app.status !== 'DENIED')
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.status === statusFilter)
    }

    // Filter by offer
    if (offerFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.offer?.id === offerFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.offer?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredApplications(filtered)
  }, [applications, searchQuery, statusFilter, offerFilter, showHistory])

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    filterApplications()
  }, [filterApplications])

  // Get unique offers for filter dropdown
  const uniqueOffers = useMemo(() => {
    const offers = new Map<string, { id: string; title: string }>()
    applications.forEach((app) => {
      if (app.offer?.id && app.offer?.title) {
        offers.set(app.offer.id, { id: app.offer.id, title: app.offer.title })
      }
    })
    return Array.from(offers.values())
  }, [applications])

  const loadApplications = async () => {
    try {
      const data = await apiService.getMyApplications()
      setApplications(data)
    } catch (error) {
      console.error('Failed to load applications:', error)
      toast.error('Échec du chargement des candidatures')
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewProfile = (studentId: string, studentName?: string) => {
    setSelectedStudentId(studentId)
    setSelectedStudentName(studentName)
    setProfileModalOpen(true)
  }

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      setIsUpdating(true)
      await apiService.updateApplication(applicationId, { status: newStatus })

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId ? { ...app, status: newStatus as Application['status'] } : app
        )
      )

      if (newStatus === 'ACCEPTED') {
        // Find studentId for the application 
        const app = applications.find(a => a.id === applicationId)

        toast.success('Candidature acceptée', {
          action: {
            label: 'Ouvrir la conversation',
            onClick: () => {
              if (app?.studentId) {
                navigate('/messaging', { state: { studentId: app.studentId } })
              }
            }
          },
          duration: 5000,
        })
      } else {
        toast.success(`Candidature ${newStatus === 'ACCEPTED' ? 'acceptée' : 'refusée'}`)
      }

    } catch (error) {
      console.error('Failed to update application:', error)
      toast.error('Échec de la mise à jour')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleBulkUpdate = async (status: string) => {
    if (selectedApplications.size === 0) {
      toast.error('Veuillez sélectionner au moins une candidature')
      return
    }

    try {
      setIsUpdating(true)
      const applicationIds = Array.from(selectedApplications)
      await apiService.bulkUpdateApplications(applicationIds, status)

      // Update local state
      setApplications(prev =>
        prev.map(app =>
          selectedApplications.has(app.id) ? { ...app, status: status as Application['status'] } : app
        )
      )

      setSelectedApplications(new Set())
      toast.success(`${applicationIds.length} candidature(s) mise(s) à jour`)
    } catch (error) {
      console.error('Failed to bulk update:', error)
      toast.error('Échec de la mise à jour groupée')
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleSelection = (applicationId: string) => {
    // Find the application to check its status
    const application = applications.find(app => app.id === applicationId)
    // Don't allow selecting finalized applications (ACCEPTED or DENIED)
    if (application && (application.status === 'ACCEPTED' || application.status === 'DENIED')) {
      toast.error('Cette candidature a déjà été traitée')
      return
    }

    setSelectedApplications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId)
      } else {
        newSet.add(applicationId)
      }
      return newSet
    })
  }



  const toggleSelectAll = () => {
    // Only select potentially actionable applications (not ACCEPTED or DENIED)
    const actionableApplications = filteredApplications.filter(
      app => app.status !== 'ACCEPTED' && app.status !== 'DENIED'
    )

    if (selectedApplications.size === actionableApplications.length && actionableApplications.length > 0) {
      setSelectedApplications(new Set())
    } else {
      setSelectedApplications(new Set(actionableApplications.map(app => app.id)))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOT_OPENED':
        return { label: 'Non lue', color: 'bg-muted text-muted-foreground border-border' }
      case 'PENDING':
        return { label: 'En attente', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' }
      case 'ACCEPTED':
        return { label: 'Acceptée', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' }
      case 'DENIED':
        return { label: 'Refusée', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700' }
      default:
        return { label: status, color: 'bg-muted text-muted-foreground border-border' }
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Chargement des candidatures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Gestion des Candidatures
            </h1>
            <p className="text-muted-foreground mt-1">
              Examinez et gérez les candidatures reçues
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card border-border shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">{stats.notOpened}</div>
                  <p className="text-xs text-muted-foreground mt-1">Non lues</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-card border-amber-500 dark:border-amber-500/60 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.pending}</div>
                  <p className="text-xs text-muted-foreground mt-1">En attente</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-card border-emerald-500 dark:border-emerald-500/60 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.accepted}</div>
                  <p className="text-xs text-muted-foreground mt-1">Acceptées</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-card border-red-500 dark:border-red-500/60 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.denied}</div>
                  <p className="text-xs text-muted-foreground mt-1">Refusées</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par candidat ou poste..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tous les statuts</SelectItem>
                    <SelectItem value="NOT_OPENED">Non lues</SelectItem>
                    <SelectItem value="PENDING">En attente</SelectItem>
                    <SelectItem value="ACCEPTED">Acceptées</SelectItem>
                    <SelectItem value="DENIED">Refusées</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={offerFilter} onValueChange={setOfferFilter}>
                  <SelectTrigger className="w-[250px]">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrer par offre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Toutes les offres</SelectItem>
                    {uniqueOffers.map((offer) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.title.length > 30 ? offer.title.substring(0, 30) + '...' : offer.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="show-history"
                checked={showHistory}
                onCheckedChange={(checked) => setShowHistory(checked as boolean)}
              />
              <label
                htmlFor="show-history"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Afficher l'historique (acceptées/refusées)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedApplications.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border shadow-md">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground whitespace-nowrap">
                    {selectedApplications.size} candidature(s) sélectionnée(s)
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleBulkUpdate('ACCEPTED')}
                      disabled={isUpdating}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                    <Button
                      onClick={() => handleBulkUpdate('DENIED')}
                      disabled={isUpdating}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                    <Button
                      onClick={() => setSelectedApplications(new Set())}
                      variant="outline"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Applications List */}
        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-foreground">
                Candidatures ({filteredApplications.length})
              </CardTitle>
              {filteredApplications.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedApplications.size === filteredApplications.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-foreground whitespace-nowrap">Tout sélectionner</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Aucune candidature trouvée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application, index) => {
                  const statusBadge = getStatusBadge(application.status)
                  return (
                    <motion.div
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-card border-border hover:border-primary transition-colors shadow-sm">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <Checkbox
                              checked={selectedApplications.has(application.id)}
                              onCheckedChange={() => toggleSelection(application.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3 gap-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-lg text-foreground break-all">
                                    {application.student?.name || 'Candidat inconnu'}
                                  </h3>
                                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1 break-all">
                                    <Briefcase className="h-4 w-4 flex-shrink-0" />
                                    <span className="break-all">{application.offer?.title || 'Offre inconnue'}</span>
                                  </p>
                                </div>
                                <Badge className={`${statusBadge.color} flex items-center gap-1 flex-shrink-0 whitespace-nowrap`}>
                                  {getStatusIcon(application.status)}
                                  {statusBadge.label}
                                </Badge>
                              </div>

                              {application.student && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm text-muted-foreground">
                                  {application.student.phoneNumber && (
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Phone className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{application.student.phoneNumber}</span>
                                    </div>
                                  )}
                                  {application.student.linkedinUrl && (
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Linkedin className="h-3 w-3 flex-shrink-0" />
                                      <a
                                        href={application.student.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline truncate"
                                      >
                                        Profil LinkedIn
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span className="whitespace-nowrap">Postulé {formatRelativeTime(application.createdAt)}</span>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewProfile(application.studentId, application.student?.name)}
                                  >
                                    <User className="h-3 w-3 mr-1" />
                                    Voir profil
                                  </Button>
                                  {application.status === 'ACCEPTED' && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="bg-blue-600 hover:bg-blue-700"
                                      onClick={() => navigate('/messaging', { state: { studentId: application.studentId } })}
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Contacter
                                    </Button>
                                  )}
                                  {application.status !== 'ACCEPTED' && application.status !== 'DENIED' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateStatus(application.id, 'ACCEPTED')}
                                        disabled={isUpdating}
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Accepter
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleUpdateStatus(application.id, 'DENIED')}
                                        disabled={isUpdating}
                                      >
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Refuser
                                      </Button>
                                    </>
                                  )}
                                  {application.status === 'NOT_OPENED' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleUpdateStatus(application.id, 'PENDING')}
                                      disabled={isUpdating}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Marquer comme vue
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
      />
    </div>
  )
}

