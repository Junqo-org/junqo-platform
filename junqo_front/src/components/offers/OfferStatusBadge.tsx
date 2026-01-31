import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OfferStatusBadgeProps {
  status: string
  className?: string
}

export function OfferStatusBadge({ status, className }: OfferStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Actif',
          className: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
          icon: <CheckCircle className="mr-1 h-3 w-3 text-green-600" />
        }
      case 'INACTIVE':
        return {
          label: 'Inactif',
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200',
          icon: <AlertCircle className="mr-1 h-3 w-3 text-yellow-600" />
        }
      case 'CLOSED':
        return {
          label: 'Fermée',
          className: 'bg-red-100 text-red-800 hover:bg-red-100 border-red-200',
          icon: <AlertCircle className="mr-1 h-3 w-3 text-red-600" />
        }
      default:
        return {
          label: status,
          className: 'bg-muted text-foreground border-border',
          icon: null
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
