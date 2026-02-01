import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface OfferTypeBadgeProps {
  type: string
  className?: string
}

export function OfferTypeBadge({ type, className }: OfferTypeBadgeProps) {
  const getTypeConfig = (type: string) => {
    const badges = {
      'INTERNSHIP': { label: 'Stage', className: 'bg-muted text-foreground border-border' },
      'APPRENTICESHIP': { label: 'Alternance', className: 'bg-muted text-foreground border-border' },
      'FULL_TIME': { label: 'Temps plein', className: 'bg-muted text-foreground border-border' },
      'PART_TIME': { label: 'Temps partiel', className: 'bg-muted text-foreground border-border' },
    }
    return badges[type as keyof typeof badges] || { label: type, className: 'bg-muted text-foreground border-border' }
  }

  const config = getTypeConfig(type)

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
