import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

interface ProfileCompletionData {
  percentage: number
  completedFields: string[]
  missingFields: string[]
}

interface ProfileCompletionCardProps {
  refreshTrigger?: number
}

const fieldLabels: Record<string, string> = {
  bio: 'Bio',
  phoneNumber: 'Numéro de téléphone',
  linkedinUrl: 'Profil LinkedIn',
  educationLevel: 'Niveau d\'études',
  skills: 'Compétences',
  experiences: 'Expériences professionnelles',
  description: 'Description de l\'entreprise',
  address: 'Adresse',
  websiteUrl: 'Site web',
  logoUrl: 'Logo de l\'entreprise',
  industry: 'Secteur d\'activité',
}

export function ProfileCompletionCard({ refreshTrigger }: ProfileCompletionCardProps) {
  const { user } = useAuthStore()
  const [completion, setCompletion] = useState<ProfileCompletionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isStudent = user?.type === 'STUDENT'

  useEffect(() => {
    loadCompletion()
  }, [refreshTrigger])

  const loadCompletion = async () => {
    try {
      setIsLoading(true)
      const data = isStudent
        ? await apiService.getStudentProfileCompletion()
        : await apiService.getCompanyProfileCompletion()
      setCompletion(data)
    } catch (error) {
      console.error('Failed to load profile completion', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complétion du profil</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!completion) return null

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletionStatus = (percentage: number) => {
    if (percentage === 100) return 'Terminé ! 🎉'
    if (percentage >= 80) return 'Presque terminé !'
    if (percentage >= 50) return 'Bonne progression'
    return 'Début prometteur'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Complétion du profil</CardTitle>
            <CardDescription>{getCompletionStatus(completion.percentage)}</CardDescription>
          </div>
          <Badge variant={completion.percentage === 100 ? 'default' : 'secondary'} className="text-lg">
            {completion.percentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={completion.percentage} className="h-3" />

        {completion.missingFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Complétez votre profil en ajoutant :
            </h4>
            <div className="space-y-1">
              {completion.missingFields.map((field) => (
                <div key={field} className="flex items-center gap-2 text-sm">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                  <span>{fieldLabels[field] || field}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {completion.completedFields.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Complété :</h4>
            <div className="flex flex-wrap gap-2">
              {completion.completedFields.map((field) => (
                <Badge key={field} variant="outline" className="gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  {fieldLabels[field] || field}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

