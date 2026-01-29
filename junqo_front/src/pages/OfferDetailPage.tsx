import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  TrendingUp,
  Eye,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react'
import { apiService } from '@/services/api'
import { Offer } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface Application {
  id: string
  offerId: string
  status: string
}

interface AxiosErrorResponse {
  response?: {
    data?: { message?: string }
  }
}
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function OfferDetailPage() {
  const [searchParams] = useSearchParams()
  const offerId = searchParams.get('id')
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isStudent = user?.type === 'STUDENT'
  const isCompany = user?.type === 'COMPANY'

  const [offer, setOffer] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadOffer = useCallback(async () => {
    if (!offerId) return

    setIsLoading(true)
    try {
      const data = await apiService.getOffer(offerId)
      setOffer(data)

      // Check if already applied
      if (isStudent && offerId) {
        try {
          const applications = await apiService.getMyApplications()
          const applicationsArray = Array.isArray(applications) ? applications : (applications.items || applications.data || [])
          const hasAppliedToThis = applicationsArray.some((app: Application) => app.offerId === offerId)
          setHasApplied(hasAppliedToThis)
        } catch {
          // Don't show error to user, just assume not applied
        }
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosErrorResponse
      toast.error(axiosError.response?.data?.message || 'Erreur lors du chargement de l\'offre')
    } finally {
      setIsLoading(false)
    }
  }, [offerId, isStudent])

  useEffect(() => {
    if (offerId) {
      loadOffer()
    } else {
      toast.error('No offer ID provided')
      navigate('/offers')
    }
  }, [offerId, loadOffer, navigate])
  const handleApply = async () => {
    if (!offerId) return

    setIsApplying(true)
    try {
      await apiService.applyToOffer(offerId)
      setHasApplied(true)
      toast.success('Candidature envoyée avec succès!')
    } catch (error: unknown) {
      const axiosError = error as AxiosErrorResponse
      console.error('Failed to apply:', error)
      toast.error(axiosError.response?.data?.message || 'Erreur lors de la candidature')
    } finally {
      setIsApplying(false)
    }
  }

  const handleEdit = () => {
    navigate(`/offers/edit?id=${offerId}`)
  }

  const handleDelete = async () => {
    if (!offerId) return

    setIsDeleting(true)
    try {
      await apiService.deleteOffer(offerId)
      toast.success('Offre supprimée avec succès')
      setShowDeleteDialog(false)
      navigate('/offers')
    } catch (error: unknown) {
      const axiosError = error as AxiosErrorResponse
      console.error('Failed to delete offer:', error)
      toast.error(axiosError.response?.data?.message || 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const getOfferTypeBadge = (type: string) => {
    const badges = {
      'INTERNSHIP': { label: 'Stage', variant: 'default' as const },
      'FULL_TIME': { label: 'CDI', variant: 'secondary' as const },
      'PART_TIME': { label: 'Temps partiel', variant: 'outline' as const },
      'CONTRACT': { label: 'Contrat', variant: 'outline' as const },
    }
    return badges[type as keyof typeof badges] || { label: type, variant: 'secondary' as const }
  }

  const getLocationLabel = (location: string) => {
    const labels = {
      'ON_SITE': '🏢 Sur site',
      'TELEWORKING': '🏠 Télétravail',
      'HYBRID': '🔀 Hybride',
    }
    return labels[location as keyof typeof labels] || location
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-3/4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-56" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-11 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Offre non trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Cette offre n'existe pas ou a été supprimée
            </p>
            <Button onClick={() => navigate('/offers')}>
              Retour aux offres
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const offerTypeBadge = getOfferTypeBadge(offer.offerType)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Button */}
        <Button onClick={() => navigate('/offers')} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux offres
        </Button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-card border-border shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">
                      {offerTypeBadge.label}
                    </Badge>
                    {offer.status === 'ACTIVE' && (
                      <Badge variant="secondary">
                        <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                        Actif
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-3xl font-bold text-foreground mb-3 break-words break-all whitespace-normal">
                    {offer.title}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-4 text-base text-muted-foreground">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="h-4 w-4" />
                      Publié {formatRelativeTime(new Date(offer.createdAt))}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <Eye className="h-4 w-4" />
                      {offer.viewCount || 0} vues
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Key Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Localisation</div>
                    <p className="font-semibold text-foreground">{getLocationLabel(offer.workLocationType)}</p>
                  </div>
                </div>

                {offer.salary && offer.salary > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                    <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Salaire</div>
                      <p className="font-semibold text-foreground">€{offer.salary}/month</p>
                    </div>
                  </div>
                )}

                {offer.duration && offer.duration > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Durée</div>
                      <p className="font-semibold text-foreground">{offer.duration} months</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Description du poste</h3>
                <p className="text-card-foreground whitespace-pre-wrap leading-relaxed break-words">
                  {offer.description}
                </p>
              </div>

              {/* Skills */}
              {offer.skills && offer.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">Compétences requises</h3>
                    <div className="flex flex-wrap gap-2">
                      {offer.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 break-words">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Benefits */}
              {offer.benefits && offer.benefits.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Avantages</h3>
                    <ul className="space-y-2">
                      {offer.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-card-foreground">
                          <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="break-words">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Education Level */}
              {offer.educationLevel && offer.educationLevel > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Niveau d'études requis</h3>
                    <p className="text-muted-foreground">
                      Bac +{offer.educationLevel}
                    </p>
                  </div>
                </>
              )}
            </CardContent>

            <CardFooter className="flex gap-4 bg-muted/30 border-t border-border">
              {isStudent && (
                hasApplied ? (
                  <Button disabled variant="secondary" className="flex-1 cursor-not-allowed">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Déjà postulé
                  </Button>
                ) : (
                  <Button
                    onClick={handleApply}
                    disabled={isApplying || offer.status !== 'ACTIVE'}
                    className="flex-1"
                    size="lg"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Candidature en cours...
                      </>
                    ) : (
                      <>
                        <Briefcase className="mr-2 h-4 w-4" />
                        Postuler
                      </>
                    )}
                  </Button>
                )
              )}
              {isCompany && offer.userId === user?.id && (
                <>
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </Button>
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
                    variant="destructive"
                    size="lg"
                    className="flex-1"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Êtes-vous sûr ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L'offre "{offer?.title}" sera définitivement supprimée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
