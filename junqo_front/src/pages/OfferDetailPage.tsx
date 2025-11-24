import { useState, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'
import { apiService } from '@/services/api'
import { Offer } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

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

  useEffect(() => {
    console.log('=== OfferDetailPage mounted ===')
    console.log('Search params:', Object.fromEntries(searchParams.entries()))
    console.log('Offer ID from params:', offerId)
    console.log('User:', user)
    
    if (offerId) {
      console.log('Loading offer...')
      loadOffer()
    } else {
      console.error('No offer ID in params!')
      toast.error('No offer ID provided')
      navigate('/offers')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offerId])

  const loadOffer = async () => {
    if (!offerId) return
    
    setIsLoading(true)
    try {
      console.log('Loading offer with id:', offerId)
      const data = await apiService.getOffer(offerId)
      console.log('Received offer data:', data)
      setOffer(data)
      
      // Check if already applied
      if (isStudent && offerId) {
        try {
          const applications = await apiService.getMyApplications()
          console.log('User applications:', applications)
          const applicationsArray = Array.isArray(applications) ? applications : (applications.items || applications.data || [])
          const hasAppliedToThis = applicationsArray.some((app: any) => app.offerId === offerId)
          setHasApplied(hasAppliedToThis)
        } catch (appError) {
          console.error('Failed to load applications:', appError)
          // Don't show error to user, just assume not applied
        }
      }
    } catch (error: any) {
      console.error('Failed to load offer:', error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.message || 'Erreur lors du chargement de l\'offre')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApply = async () => {
    if (!offerId) return
    
    setIsApplying(true)
    try {
      await apiService.applyToOffer(offerId)
      setHasApplied(true)
      toast.success('Candidature envoyée avec succès!')
    } catch (error: any) {
      console.error('Failed to apply:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de la candidature')
    } finally {
      setIsApplying(false)
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
      'ONSITE': '🏢 Sur site',
      'REMOTE': '🏠 Télétravail',
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
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Back Button */}
        <Button onClick={() => navigate('/offers')} className="text-white hover:bg-gray-800 bg-transparent border-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-black text-white border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-gray-800 text-white border border-gray-700">
                    {offerTypeBadge.label}
                  </Badge>
                  {offer.status === 'ACTIVE' && (
                    <Badge className="bg-gray-800 text-white border border-gray-700">
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      Active
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-3">{offer.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 text-base text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Posted {formatRelativeTime(new Date(offer.createdAt))}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {offer.viewCount || 0} views
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Key Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-black rounded-lg border border-gray-800">
                <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400">Location</div>
                  <p className="font-semibold text-white">{getLocationLabel(offer.workLocationType)}</p>
                </div>
              </div>

              {offer.salary && offer.salary > 0 && (
                <div className="flex items-center gap-3 p-4 bg-black rounded-lg border border-gray-800">
                  <TrendingUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Salary</div>
                    <p className="font-semibold text-white">€{offer.salary}/month</p>
                  </div>
                </div>
              )}

              {offer.duration && offer.duration > 0 && (
                <div className="flex items-center gap-3 p-4 bg-black rounded-lg border border-gray-800">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400">Duration</div>
                    <p className="font-semibold text-white">{offer.duration} months</p>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-gray-700" />

            {/* Description */}
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Job Description</h3>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {offer.description}
              </p>
            </div>

            {/* Skills */}
            {offer.skills && offer.skills.length > 0 && (
              <>
                <Separator className="bg-gray-700" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {offer.skills.map((skill, index) => (
                      <Badge key={index} className="bg-gray-800 text-gray-200 border border-gray-700 px-3 py-1">
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
                  <h3 className="text-lg font-semibold mb-3">Avantages</h3>
                  <ul className="space-y-2">
                    {offer.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
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
                  <h3 className="text-lg font-semibold mb-2">Niveau d'études requis</h3>
                  <p className="text-muted-foreground">
                    Bac +{offer.educationLevel}
                  </p>
                </div>
              </>
            )}
          </CardContent>

          <CardFooter className="flex gap-4 bg-black border-t border-gray-800">
            {isStudent && (
              hasApplied ? (
                <Button disabled className="flex-1 bg-gray-800 text-gray-400 cursor-not-allowed border-gray-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Already Applied
                </Button>
              ) : (
                <Button 
                  onClick={handleApply} 
                  disabled={isApplying || offer.status !== 'ACTIVE'}
                  className="flex-1 bg-black hover:bg-gray-800 text-white border-gray-700"
                  size="lg"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Apply Now
                    </>
                  )}
                </Button>
              )
            )}
            {/* Companies cannot edit offers as per API specifications */}
          </CardFooter>
        </Card>
      </motion.div>
      </div>
    </div>
  )
}
