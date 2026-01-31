import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Application } from '@/types'
import { Building2, Calendar, ChevronRight, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ApplicationInterviewCardProps {
  application: Application
  onClick: (application: Application) => void
}

export function ApplicationInterviewCard({ application, onClick }: ApplicationInterviewCardProps) {
  const offer = application.offer
  const company = application.company

  if (!offer || !company) return null

  const handleActivate = () => onClick(application)
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleActivate()
    }
  }

  return (
    <Card 
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer hover:border-purple-400 transition-all hover:shadow-md dark:hover:border-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={handleActivate}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className="w-fit mb-2">
              {application.status === 'ACCEPTED' ? 'Acceptée' : 
               application.status === 'PENDING' ? 'En attente' : 
               application.status === 'NOT_OPENED' ? 'Non lue' : 'Refusée'}
            </Badge>
            <CardTitle className="text-lg font-semibold group-hover:text-purple-600 transition-colors">
              {offer.title}
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground group-hover:text-purple-600"
            aria-label="Voir la candidature"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="font-medium text-foreground">{company.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {offer.workLocationType === 'ON_SITE' ? 'Sur site' : 
                 offer.workLocationType === 'TELEWORKING' ? 'Télétravail' : 'Hybride'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Candidaté le {format(new Date(application.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
