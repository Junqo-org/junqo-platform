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

export default function OffersPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isCompany = user?.type === 'COMPANY'
  const isStudent = user?.type === 'STUDENT'
  
  const [offers, setOffers] = useState<Offer[]>([])
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
    loadOffers()
  }, [user])

  useEffect(() => {
    const handleFocus = () => {
      loadOffers()
    }
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadOffers()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const loadOffers = async () => {
    setIsLoading(true)
    try {
      const query: Record<string, any> = {}
      
      const data = user?.type === 'COMPANY'
        ? await apiService.getMyOffers()
        : await apiService.getOffers(query)
      
      let offersArray: Offer[] = []
      if (Array.isArray(data)) {
        offersArray = data
      } else if (data.rows && Array.isArray(data.rows)) {
        offersArray = data.rows
      } else if (data.items) {
        offersArray = data.items
      } else if (data.data) {
        offersArray = data.data
      }
      
      setOffers(offersArray)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || ''
      if (!errorMessage.includes('not found') && !errorMessage.includes('No offers')) {
        toast.error('Error loading offers')
      }
      setOffers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredOffers = offers.filter(offer => {
    const title = offer.title || ''
    const description = offer.description || ''
    const skills = offer.skills || []
    const searchLower = searchQuery.toLowerCase()
    
    const matchesSearch = title.toLowerCase().includes(searchLower) ||
                         description.toLowerCase().includes(searchLower) ||
                         skills.some(skill => skill.toLowerCase().includes(searchLower))
    
    const matchesStatus = user?.type === 'COMPANY' ? true : offer.status === 'ACTIVE'
    const matchesType = typeFilter === 'all' ? true : offer.offerType === typeFilter
    const matchesLocation = locationFilter === 'all' ? true : offer.workLocationType === locationFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation
  })

  const getOfferTypeBadge = (type: string) => {
    const badges = {
      'INTERNSHIP': { label: 'Internship', color: 'bg-muted text-foreground border-border' },
      'FULL_TIME': { label: 'Full Time', color: 'bg-muted text-foreground border-border' },
      'PART_TIME': { label: 'Part Time', color: 'bg-muted text-foreground border-border' },
      'CONTRACT': { label: 'Contract', color: 'bg-muted text-foreground border-border' },
    }
    return badges[type as keyof typeof badges] || { label: type, color: 'bg-muted text-foreground border-border' }
  }

  const getLocationBadge = (location: string) => {
    const badges = {
      'ONSITE': { label: 'On-site', icon: '📍' },
      'REMOTE': { label: 'Remote', icon: '🌐' },
      'HYBRID': { label: 'Hybrid', icon: '🔀' },
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
      toast.success(`Application sent for "${offer.title}"`)
    } catch (error: any) {
      console.error('Application error:', error)
      const errorMsg = error.response?.data?.message || ''
      if (errorMsg.includes('already applied') || errorMsg.includes('duplicate')) {
        toast.info('You already applied to this position')
        setAppliedOffers(prev => new Set([...prev, offer.id]))
      } else {
        toast.error('Application error')
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
        className="h-full bg-gray-900 border-gray-700 shadow-xl"
      >
        <CardContent className="p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-semibold text-white mb-2 truncate">
                {offer.title}
              </h3>
              <p className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{formatRelativeTime(new Date(offer.createdAt))}</span>
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0 bg-gray-800 text-white border-gray-700">
              {offerTypeBadge.label}
            </Badge>
          </div>
          
          <p className="text-gray-300 mb-6 line-clamp-4 leading-relaxed">
            {offer.description}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {offer.salary && offer.salary > 0 && (
              <div className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-700">
                <TrendingUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">Salary</div>
                  <div className="font-semibold text-white truncate">
                    €{offer.salary}/mo
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-700">
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-gray-400">Location</div>
                <div className="font-semibold text-white truncate">
                  {locationBadge.label}
                </div>
              </div>
            </div>

            {offer.duration && offer.duration > 0 && (
              <div className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-700">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">Duration</div>
                  <div className="font-semibold text-white truncate">
                    {offer.duration} months
                  </div>
                </div>
              </div>
            )}
          </div>

          {offer.skills && offer.skills.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-white mb-2">
                Required Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {offer.skills.slice(0, 6).map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 text-xs bg-gray-800 text-gray-200 rounded border border-gray-700 truncate max-w-[150px]"
                    title={skill}
                  >
                    {skill}
                  </span>
                ))}
                {offer.skills.length > 6 && (
                  <span className="px-2 py-1 text-xs bg-gray-800 text-gray-200 rounded border border-gray-700">
                    +{offer.skills.length - 6} more
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
                className="w-full bg-black border-gray-700 text-white hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation() // Prevent swipe
                  console.log('View details clicked for offer:', offer.id)
                }}
              >
                View Full Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-white" />
                Job Opportunities
              </h1>
              <p className="text-gray-400 mt-1">
                {filteredOffers.length} position{filteredOffers.length !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex gap-3">
              {isStudent && (
                <div className="inline-flex bg-gray-900 rounded-lg border border-gray-700 p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'gap-2 bg-white hover:bg-gray-100 text-black' : 'gap-2 text-gray-300 hover:bg-gray-800 hover:text-white'}
                  >
                    <Grid3x3 className="h-4 w-4" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'swipe' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('swipe')}
                    className={viewMode === 'swipe' ? 'gap-2 bg-white hover:bg-gray-100 text-black' : 'gap-2 text-gray-300 hover:bg-gray-800 hover:text-white'}
                  >
                    <Layers className="h-4 w-4" />
                    Swipe
                  </Button>
                </div>
              )}
              {isCompany && (
                <Button 
                  onClick={() => navigate('/offers/create')}
                  className="bg-white hover:bg-gray-100 text-black"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Post Job
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters - Only in grid mode */}
        {viewMode === 'grid' && (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-black border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all" className="text-white hover:bg-gray-800">All Types</SelectItem>
                    <SelectItem value="INTERNSHIP" className="text-white hover:bg-gray-800">Internship</SelectItem>
                    <SelectItem value="FULL_TIME" className="text-white hover:bg-gray-800">Full Time</SelectItem>
                    <SelectItem value="PART_TIME" className="text-white hover:bg-gray-800">Part Time</SelectItem>
                    <SelectItem value="CONTRACT" className="text-white hover:bg-gray-800">Contract</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue placeholder="Work Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    <SelectItem value="all" className="text-white hover:bg-gray-800">All Locations</SelectItem>
                    <SelectItem value="ONSITE" className="text-white hover:bg-gray-800">On-site</SelectItem>
                    <SelectItem value="REMOTE" className="text-white hover:bg-gray-800">Remote</SelectItem>
                    <SelectItem value="HYBRID" className="text-white hover:bg-gray-800">Hybrid</SelectItem>
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
              <Card key={i} className="bg-gray-900 border-gray-700">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-5 w-3/4 bg-gray-800" />
                  <Skeleton className="h-4 w-1/3 bg-gray-800" />
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-8 w-full bg-gray-800" />
                    <Skeleton className="h-8 w-full bg-gray-800" />
                  </div>
                  <Skeleton className="h-20 w-full bg-gray-800" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24 bg-gray-800" />
                    <Skeleton className="h-4 w-4 bg-gray-800" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOffers.length === 0 ? (
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="py-20 text-center">
              <Briefcase className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                 No jobs found
               </h3>
              <p className="text-gray-400">
                 Try adjusting your filters to see more results
               </p>
            </CardContent>
          </Card>
        ) : viewMode === 'swipe' && isStudent ? (
          <div className="max-w-2xl mx-auto overflow-hidden">
            <SwipeStack
              offers={filteredOffers}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              renderCard={renderOfferCard}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
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
                      className="h-full bg-gray-900 border-gray-700 hover:border-gray-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                    >
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-gray-300 transition-colors">
                            {offer.title}
                          </h3>
                          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{formatRelativeTime(new Date(offer.createdAt))}</span>
                          </p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 bg-gray-800 text-white border-gray-700">
                          {offerTypeBadge.label}
                        </Badge>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-300 line-clamp-3 mb-4 flex-1 leading-relaxed">
                        {offer.description}
                      </p>
                      
                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        {offer.salary && offer.salary > 0 && (
                          <div className="flex items-center text-sm gap-2">
                            <div className="h-6 w-6 rounded bg-black border border-gray-700 flex items-center justify-center flex-shrink-0">
                              <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <span className="font-medium text-white truncate">
                              €{offer.salary}/month
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-white gap-2">
                          <div className="h-6 w-6 rounded bg-black border border-gray-700 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                          <span className="truncate">{locationBadge.label}</span>
                        </div>

                        {offer.duration && offer.duration > 0 && (
                          <div className="flex items-center text-sm text-white gap-2">
                            <div className="h-6 w-6 rounded bg-black border border-gray-700 flex items-center justify-center flex-shrink-0">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                            <span className="truncate">{offer.duration} months</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {offer.skills && offer.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {offer.skills.slice(0, 3).map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-0.5 text-xs bg-gray-800 text-gray-200 border border-gray-700 rounded truncate max-w-[100px]"
                              title={skill}
                            >
                              {skill}
                            </span>
                          ))}
                          {offer.skills.length > 3 && (
                            <span className="px-2 py-0.5 text-xs bg-gray-800 text-gray-200 border border-gray-700 rounded">
                              +{offer.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* View Button */}
                      <div className="flex items-center justify-between text-sm text-gray-400 font-medium group-hover:text-white pointer-events-none">
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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

