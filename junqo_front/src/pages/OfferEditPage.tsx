import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft, Plus, X, Loader2, Edit } from 'lucide-react'
import { apiService } from '@/services/api'

const offerSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']),
  offerType: z.enum(['INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT']),
  workLocationType: z.enum(['ON_SITE', 'TELEWORKING', 'HYBRID']),
  duration: z.string().optional(),
  salary: z.string().optional(),
  educationLevel: z.string().optional(),
})

type OfferFormData = z.infer<typeof offerSchema>

interface OfferUpdateData {
  title: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  offerType: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
  workLocationType: 'ON_SITE' | 'TELEWORKING' | 'HYBRID'
  duration?: number
  salary?: number
  educationLevel?: number
  skills?: string[]
  benefits?: string[]
}

interface AxiosErrorResponse {
  response?: {
    data?: { message?: string }
  }
}

export default function OfferEditPage() {
  const [searchParams] = useSearchParams()
  const offerId = searchParams.get('id')
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [benefits, setBenefits] = useState<string[]>([])
  const [benefitInput, setBenefitInput] = useState('')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
  })

  const offerType = watch('offerType')

  const loadOffer = useCallback(async () => {
    if (!offerId) return

    setIsLoading(true)
    try {
      const offer = await apiService.getOffer(offerId)

      reset({
        title: offer.title,
        description: offer.description,
        status: offer.status,
        offerType: offer.offerType,
        workLocationType: offer.workLocationType,
        duration: offer.duration?.toString() || '',
        salary: offer.salary?.toString() || '',
        educationLevel: offer.educationLevel?.toString() || '',
      })

      if (offer.skills) setSkills(offer.skills)
      if (offer.benefits) setBenefits(offer.benefits)
    } catch (error: unknown) {
      console.error('Failed to load offer:', error)
      toast.error('Erreur lors du chargement de l\'offre')
      navigate('/offers')
    } finally {
      setIsLoading(false)
    }
  }, [offerId, reset, navigate])

  useEffect(() => {
    if (offerId) {
      loadOffer()
    } else {
      toast.error('ID de l\'offre manquant')
      navigate('/offers')
    }
  }, [offerId, loadOffer, navigate])

  const onSubmit = async (data: OfferFormData) => {
    if (!offerId) return

    setIsSubmitting(true)
    try {
      const offerData: OfferUpdateData = {
        title: data.title,
        description: data.description,
        status: data.status,
        offerType: data.offerType,
        workLocationType: data.workLocationType,
      }

      if (data.duration && data.duration.trim()) {
        offerData.duration = parseInt(data.duration)
      }
      if (data.salary && data.salary.trim()) {
        offerData.salary = parseInt(data.salary)
      }
      if (data.educationLevel && data.educationLevel.trim()) {
        offerData.educationLevel = parseInt(data.educationLevel)
      }
      if (skills.length > 0) {
        offerData.skills = skills
      }
      if (benefits.length > 0) {
        offerData.benefits = benefits
      }

      await apiService.updateOffer(offerId, offerData)
      toast.success('Offre modifiée avec succès!')
      navigate(`/offers/details?id=${offerId}`)
    } catch (error: unknown) {
      const axiosError = error as AxiosErrorResponse
      console.error('Failed to update offer:', error)
      toast.error(axiosError.response?.data?.message || 'Erreur lors de la modification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const addBenefit = () => {
    if (benefitInput.trim() && !benefits.includes(benefitInput.trim())) {
      setBenefits([...benefits, benefitInput.trim()])
      setBenefitInput('')
    }
  }

  const removeBenefit = (benefit: string) => {
    setBenefits(benefits.filter(b => b !== benefit))
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/offers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/offers/details?id=${offerId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Edit className="h-8 w-8" />
            Modifier l'offre
          </h1>
          <p className="text-muted-foreground">Champs avec * sont obligatoires</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations obligatoires *</CardTitle>
              <CardDescription>Ces informations sont requises</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du poste *</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" rows={6} {...register('description')} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Type d'offre *</Label>
                  <Controller
                    name="offerType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INTERNSHIP">Stage</SelectItem>
                          <SelectItem value="FULL_TIME">CDI</SelectItem>
                          <SelectItem value="PART_TIME">Temps partiel</SelectItem>
                          <SelectItem value="CONTRACT">Contrat</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Lieu de travail *</Label>
                  <Controller
                    name="workLocationType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ON_SITE">Sur site</SelectItem>
                          <SelectItem value="TELEWORKING">Télétravail</SelectItem>
                          <SelectItem value="HYBRID">Hybride</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Statut *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="CLOSED">Fermée</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Détails optionnels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Salaire mensuel (€)</Label>
                  <Input type="number" {...register('salary')} />
                </div>
                {offerType === 'INTERNSHIP' && (
                  <div className="space-y-2">
                    <Label>Durée (mois)</Label>
                    <Input type="number" {...register('duration')} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Niveau d'études (BAC+X)</Label>
                  <Input type="number" min="0" max="8" {...register('educationLevel')} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compétences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ex: React, TypeScript..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Avantages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ex: Tickets restaurant..."
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                />
                <Button type="button" onClick={addBenefit} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {benefit}
                      <button type="button" onClick={() => removeBenefit(benefit)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(`/offers/details?id=${offerId}`)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
