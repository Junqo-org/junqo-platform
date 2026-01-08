import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  TrendingUp,
  Plus,
  Grid3x3,
  Layers,
  ChevronRight
} from 'lucide-react'
import { apiService } from '@/services/api'
import { Offer } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { SwipeStack } from '@/components/swipe/SwipeStack'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

export default function OffersPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isCompany = user?.type === 'COMPANY'
  const isStudent = user?.type === 'STUDENT'

  const [offers, setOffers] = useState<Offer[]>([])
  const [totalOffers, setTotalOffers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(12) // 12 items for grid layout (divisible by 2, 3, 4)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'swipe'>('grid')

  // Disable body scroll when in swipe mode
  useEffect(() => {
    if (viewMode === 'swipe') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [viewMode])

  useEffect(() => {
    // Reset to page 1 when filters change (except when user just changes page)
    setCurrentPage(1)
    loadOffers(1)
  }, [user, searchQuery, typeFilter, locationFilter])

  useEffect(() => {
    // When page changes, reload offers
    loadOffers(currentPage)
  }, [currentPage])

  useEffect(() => {
    const handleFocus = () => {
      loadOffers(currentPage)
    }
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadOffers(currentPage)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentPage])

  const loadOffers = async (page = 1) => {
    setIsLoading(true)
    try {
      const offset = (page - 1) * itemsPerPage
      let query: any = { limit: itemsPerPage, offset }

      // Apply filters to backend query if possible, but frontend filtering is also used.
      // Ideally move all filtering to backend for true pagination.
      // For now, we follow the existing pattern but respecting pagination for the initial fetch.
      // Note: If filtering is done purely on frontend, pagination won't work correctly with backend limits.
      // However, the `getOffers` seems to support some params.
      // IMPORTANT: To make "real pagination" work with filters, we should pass filters to backend.
      // Assuming backend supports these standard filters:
      if (searchQuery) query.title = searchQuery
      if (typeFilter !== 'all') query.offerType = typeFilter
      if (locationFilter !== 'all') query.workLocationType = locationFilter

      // For companies: load their own offers (usually all, then paginated if backend supports)
      const data = user?.type === 'COMPANY'
        ? await apiService.getMyOffers()
        : await apiService.getOffers(query)

      let offersArray: Offer[] = []
      let total = 0

      if (Array.isArray(data)) {
        offersArray = data
        total = data.length
      } else if (data.rows && Array.isArray(data.rows)) {
        offersArray = data.rows
        total = data.count || data.rows.length
      } else if (data.items) {
        offersArray = data.items
        total = data.total || data.items.length
      } else if (data.data) {
        offersArray = data.data
        total = data.total || data.data.length
      }

      setOffers(offersArray)
      setTotalOffers(total)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || ''
      if (!errorMessage.includes('not found') && !errorMessage.includes('No offers')) {
        toast.error('Erreur lors du chargement des offres')
      }
      setOffers([])
      setTotalOffers(0)
    } finally {
      setIsLoading(false)
    }
  }


  // Note: For students, filtering is done on backend. For companies (my offers), we might still need frontend filtering 
  // if backend endpoint doesn't support it, but for now we assume consistent behavior or Company uses "all" mostly.
  // Actually, companies use `getMyOffers` which might not support search/filter params in the same way yet.
  // We keep frontend filtering logic ONLY if it's a company (since we loaded all their offers)
  // OR as a fallback if `totalOffers` logic implies we got a subset. 
  // BUT the robust way is: if Student -> use `offers` directly (it's already filtered/paginated). 
  // If Company -> use `offers` filtering (since we loaded everything).

  const displayOffers = (user?.type === 'COMPANY')
    ? offers.filter(offer => {
      const title = offer.title || ''
      const description = offer.description || ''
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = title.toLowerCase().includes(searchLower) || description.toLowerCase().includes(searchLower)
      return matchesSearch
    })
    : offers

  const totalPages = Math.ceil(totalOffers / itemsPerPage)

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(c => c - 1); }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            // Simple logic for small number of pages. For many pages, would need ellipsis logic.
            if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
              return (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === p}
                    onClick={(e) => { e.preventDefault(); setCurrentPage(p); }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            } else if (p === currentPage - 2 || p === currentPage + 2) {
              return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
            }
            return null
          })}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(c => c + 1); }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const getOfferTypeBadge = (type: string) => {
    const badges = {
      'INTERNSHIP': { label: 'Stage', color: 'bg-muted text-foreground border-border' },
      'FULL_TIME': { label: 'Temps plein', color: 'bg-muted text-foreground border-border' },
      'PART_TIME': { label: 'Temps partiel', color: 'bg-muted text-foreground border-border' },
      'CONTRACT': { label: 'Contrat', color: 'bg-muted text-foreground border-border' },
    }
    return badges[type as keyof typeof badges] || { label: type, color: 'bg-muted text-foreground border-border' }
  }

  const getLocationBadge = (location: string) => {
    const badges = {
      'ON_SITE': { label: 'Sur site', icon: '📍' },
      'TELEWORKING': { label: 'Télétravail', icon: '🌐' },
      'HYBRID': { label: 'Hybride', icon: '🔀' },
    }
    return badges[location as keyof typeof badges] || { label: location, icon: '📍' }
  }

  const [appliedOffers, setAppliedOffers] = useState<Set<string>>(new Set())
  const [isApplying, setIsApplying] = useState(false)

  const handleSwipeRight = async (offer: Offer) => {
    // Prevent duplicate applications
    if (appliedOffers.has(offer.id) || isApplying) {
      console.log('Already applied to this offer or application in progress')
      return
    }

    setIsApplying(true)
    try {
      await apiService.applyToOffer(offer.id)
      setAppliedOffers(prev => new Set([...prev, offer.id]))
      toast.success(`Candidature envoyée pour "${offer.title}"`)
    } catch (error: any) {
      console.error('Application error:', error)
      const errorMsg = error.response?.data?.message || ''
      if (errorMsg.includes('already applied') || errorMsg.includes('duplicate')) {
        toast.info('Vous avez déjà postulé à cette offre')
        setAppliedOffers(prev => new Set([...prev, offer.id]))
      } else {
        toast.error('Erreur lors de la candidature')
      }
    } finally {
      setIsApplying(false)
    }
  }

  const handleSwipeLeft = (offer: Offer) => {
    console.log('Skipped offer:', offer.title)
  }

  const renderOfferCard = (offer: Offer) => {
    const offerTypeBadge = getOfferTypeBadge(offer.offerType)
    const locationBadge = getLocationBadge(offer.workLocationType)

    return (
      <Card
        className="h-full bg-card border-border shadow-xl"
      >
        <CardContent className="p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-semibold text-foreground mb-2 line-clamp-2">
                {offer.title}
              </h3>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatRelativeTime(new Date(offer.createdAt))}</span>
              </p>
            </div>
            <Badge className="flex-shrink-0 bg-muted text-foreground border-border border">
              {offerTypeBadge.label}
            </Badge>
          </div>

          <p className="text-card-foreground mb-6 leading-relaxed line-clamp-4">
            {offer.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {offer.salary && offer.salary > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Salaire</div>
                  <div className="font-semibold text-foreground truncate">
                    €{offer.salary}/mo
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">Localisation</div>
                <div className="font-semibold text-foreground truncate">
                  {locationBadge.label}
                </div>
              </div>
            </div>

            {offer.duration && offer.duration > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">Durée</div>
                  <div className="font-semibold text-foreground truncate">
                    {offer.duration} mois
                  </div>
                </div>
              </div>
            )}
          </div>

          {offer.skills && offer.skills.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-foreground mb-2">
                Compétences requises
              </div>
              <div className="flex flex-wrap gap-2">
                {offer.skills.slice(0, 6).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-muted text-foreground rounded border border-border truncate max-w-[150px]"
                    title={skill}
                  >
                    {skill}
                  </span>
                ))}
                {offer.skills.length > 6 && (
                  <span className="px-2 py-1 text-xs bg-muted text-foreground rounded border border-border">
                    +{offer.skills.length - 6} de plus
                  </span>
                )}
              </div>
            </div>
          )}

          {/* View Details Button for Swipe Mode */}
          <div className="mt-6 flex justify-center">
            <Link to={`/offers/details?id=${offer.id}`} className="w-full">
              <Button
                variant="outline"
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation() // Prevent swipe
                  console.log('View details clicked for offer:', offer.id)
                }}
              >
                Voir les détails
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                Opportunités d'emploi
              </h1>
              <p className="text-muted-foreground mt-1">
                {totalOffers} position{totalOffers !== 1 ? 's' : ''} disponible{totalOffers !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              {isStudent && (
                <div className="inline-flex bg-muted rounded-lg border border-border p-1">
                  <Button
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Grid3x3 className="h-4 w-4" />
                    Grille
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setViewMode('swipe')}
                    variant={viewMode === 'swipe' ? 'default' : 'ghost'}
                    className="gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    Balayer
                  </Button>
                </div>
              )}
              {isCompany && (
                <Button
                  onClick={() => navigate('/offers/create')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Publier une offre
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters - Only in grid mode */}
        {viewMode === 'grid' && (
          <Card className="bg-card border-border shadow-md">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher des offres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="INTERNSHIP">Stage</SelectItem>
                    <SelectItem value="FULL_TIME">Temps plein</SelectItem>
                    <SelectItem value="PART_TIME">Temps partiel</SelectItem>
                    <SelectItem value="CONTRACT">Contrat</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Work Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les localisations</SelectItem>
                    <SelectItem value="ON_SITE">Sur site</SelectItem>
                    <SelectItem value="TELEWORKING">Télétravail</SelectItem>
                    <SelectItem value="HYBRID">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border shadow-md">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayOffers.length === 0 ? (
          <Card className="bg-card border-border shadow-md">
            <CardContent className="py-20 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Aucune offre trouvée
              </h3>
              <p className="text-muted-foreground">
                Essayez d'ajuster vos filtres pour voir plus de résultats
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'swipe' && isStudent ? (
          <div className="max-w-2xl mx-auto overflow-hidden">
            <SwipeStack
              offers={displayOffers}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              renderCard={renderOfferCard}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayOffers.map((offer) => {
                const offerTypeBadge = getOfferTypeBadge(offer.offerType)
                const locationBadge = getLocationBadge(offer.workLocationType)

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link
                      to={`/offers/details?id=${offer.id}`}
                      className="block h-full"
                      onClick={() => console.log('Link clicked for offer:', offer.id)}
                    >
                      <Card
                        className="h-full bg-card border-border hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer shadow-md"
                      >
                        <CardContent className="p-6 flex flex-col h-full">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {offer.title}
                              </h3>
                              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{formatRelativeTime(new Date(offer.createdAt))}</span>
                              </p>
                            </div>
                            <Badge variant="secondary" className="flex-shrink-0">
                              {offerTypeBadge.label}
                            </Badge>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-card-foreground mb-4 flex-1 leading-relaxed line-clamp-3">
                            {offer.description}
                          </p>

                          {/* Details */}
                          <div className="space-y-2 mb-4">
                            {offer.salary && offer.salary > 0 && (
                              <div className="flex items-center text-sm gap-2">
                                <div className="h-6 w-6 rounded bg-muted border border-border flex items-center justify-center flex-shrink-0">
                                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="font-medium text-foreground truncate">
                                  €{offer.salary}/mois
                                </span>
                              </div>
                            )}

                            <div className="flex items-center text-sm text-foreground gap-2">
                              <div className="h-6 w-6 rounded bg-muted border border-border flex items-center justify-center flex-shrink-0">
                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="truncate">{locationBadge.label}</span>
                            </div>

                            {offer.duration && offer.duration > 0 && (
                              <div className="flex items-center text-sm text-foreground gap-2">
                                <div className="h-6 w-6 rounded bg-muted border border-border flex items-center justify-center flex-shrink-0">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="truncate">{offer.duration} mois</span>
                              </div>
                            )}
                          </div>

                          {/* Skills */}
                          {offer.skills && offer.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {offer.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 text-xs bg-muted text-foreground border border-border rounded truncate max-w-[100px]"
                                  title={skill}
                                >
                                  {skill}
                                </span>
                              ))}
                              {offer.skills.length > 3 && (
                                <span className="px-2 py-0.5 text-xs bg-muted text-foreground border border-border rounded">
                                  +{offer.skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* View Button */}
                          <div className="flex items-center justify-between text-sm text-muted-foreground font-medium group-hover:text-primary pointer-events-none">
                            <span>Voir les détails</span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  )
}

