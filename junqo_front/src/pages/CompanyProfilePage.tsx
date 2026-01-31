
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Globe,
  Phone,
  AlertCircle
} from 'lucide-react'
import { apiService } from '@/services/api'
import { CompanyProfile } from '@/types'
import { toast } from 'sonner'

export default function CompanyProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCompany = useCallback(async () => {
    if (!id) return

    setIsLoading(true)
    try {
      const data = await apiService.getCompanyProfile(id)
      setCompany(data)
    } catch (error) {
      console.error('Failed to load company profile:', error)
      toast.error('Impossible de charger le profil de l\'entreprise')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadCompany()
    } else {
      toast.error('Identifiant d\'entreprise manquant')
      navigate(-1)
    }
  }, [id, loadCompany, navigate])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Button variant="ghost" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Profil introuvable</h3>
        <p className="text-muted-foreground mb-4">
          L'entreprise demandée n'existe pas ou a été supprimée.
        </p>
        <Button onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Button onClick={() => navigate(-1)} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5"></div>
            <CardHeader className="relative pt-0">
                <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-4 px-2">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                        <AvatarImage src={company.logoUrl || company.avatar} alt={company.name || 'Company Logo'} />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {(company.name || 'C').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 mb-2">
                        <CardTitle className="text-3xl font-bold">{company.name}</CardTitle>
                         {company.industry && (
                            <Badge variant="secondary" className="text-sm">
                                {company.industry}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8">
                
                {/* Description */}
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        À propos
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {company.description || "Aucune description disponible pour cette entreprise."}
                    </p>
                </div>

                {/* Contact & Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {company.address && (
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">Adresse</p>
                                <p className="text-muted-foreground">{company.address}</p>
                            </div>
                        </div>
                    )}
                    
                     {company.websiteUrl && (
                        <div className="flex items-start gap-3">
                            <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">Site Web</p>
                                <a 
                                    href={company.websiteUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline break-all"
                                >
                                    {company.websiteUrl}
                                </a>
                            </div>
                        </div>
                    )}

                    {company.phoneNumber && (
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="font-medium">Téléphone</p>
                                <p className="text-muted-foreground">{company.phoneNumber}</p>
                            </div>
                        </div>
                    )}
                     {/* Email is often not public in company profile interface but if available in future could go here */}
                </div>

            </CardContent>
        </Card>
      </div>
    </div>
  )
}
