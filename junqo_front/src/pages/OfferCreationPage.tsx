import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { toast } from 'sonner'
import { ArrowLeft, Plus, X, Loader2, Briefcase } from 'lucide-react'
import { apiService } from '@/services/api'

// Schema with ONLY required fields + optional fields properly handled
const offerSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'CLOSED']),
  offerType: z.enum(['INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT']),
  workLocationType: z.enum(['ON_SITE', 'TELEWORKING', 'HYBRID']),
  // Optional fields - can be empty string and will be converted
  duration: z.string().optional(),
  salary: z.string().optional(),
  educationLevel: z.string().optional(),
})

type OfferFormData = z.infer<typeof offerSchema>

interface OfferCreateData {
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

export default function OfferCreationPage() {
  const navigate = useNavigate()
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
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      status: 'ACTIVE',
      offerType: 'INTERNSHIP',
      workLocationType: 'HYBRID',
    },
  })

  const offerType = watch('offerType')

  const onSubmit = async (data: OfferFormData) => {
    setIsSubmitting(true)
    try {
      // Convert strings to numbers, handle empty values
      const offerData: OfferCreateData = {
        title: data.title,
        description: data.description,
        status: data.status,
        offerType: data.offerType,
        workLocationType: data.workLocationType,
      }

      // Add optional fields only if they have values
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

      console.log('Creating offer with data:', offerData)
      await apiService.createOffer(offerData)
      toast.success('Offre créée avec succès!')
      // Force navigation to offers page to trigger refresh
      navigate('/offers', { replace: true, state: { refresh: Date.now() } })
    } catch (error: unknown) {
      const axiosError = error as AxiosErrorResponse
      console.error('Failed to create offer:', error)
      toast.error(axiosError.response?.data?.message || 'Erreur lors de la création de l\'offre')
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/offers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            Créer une nouvelle offre
          </h1>
          <p className="text-muted-foreground">Champs avec * sont obligatoires</p>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informations obligatoires *</CardTitle>
              <CardDescription>Ces informations sont requises pour créer l'offre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du poste *</Label>
                <Input
                  id="title"
                  placeholder="ex: Développeur Full Stack Junior"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez le poste, les missions, l'équipe..."
                  rows={6}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offerType">Type d'offre *</Label>
                  <Controller
                    name="offerType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INTERNSHIP">Stage</SelectItem>
                          <SelectItem value="FULL_TIME">CDI</SelectItem>
                          <SelectItem value="PART_TIME">Temps partiel</SelectItem>
                          <SelectItem value="CONTRACT">Contrat</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.offerType && (
                    <p className="text-sm text-destructive">{errors.offerType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workLocationType">Lieu de travail *</Label>
                  <Controller
                    name="workLocationType"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ON_SITE">🏢 Sur site</SelectItem>
                          <SelectItem value="TELEWORKING">🏠 Télétravail</SelectItem>
                          <SelectItem value="HYBRID">🔀 Hybride</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut *</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
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

          {/* Optional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails optionnels</CardTitle>
              <CardDescription>Ces informations sont optionnelles mais recommandées</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary">Salaire mensuel (€)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="ex: 1800"
                    {...register('salary')}
                  />
                </div>

                {offerType === 'INTERNSHIP' && (
                  <div className="space-y-2">
                    <Label htmlFor="duration">Durée (mois)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="ex: 6"
                      {...register('duration')}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Niveau d'études (BAC+X)</Label>
                  <Input
                    id="educationLevel"
                    type="number"
                    placeholder="ex: 5"
                    min="0"
                    max="8"
                    {...register('educationLevel')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Compétences (optionnel)</CardTitle>
              <CardDescription>Ajoutez les compétences nécessaires</CardDescription>
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
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Avantages (optionnel)</CardTitle>
              <CardDescription>Les avantages offerts avec ce poste</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ex: Tickets restaurant, Télétravail..."
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
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/offers')}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Briefcase className="mr-2 h-4 w-4" />
                  Créer l'offre
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
