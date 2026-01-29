import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Camera, Mail, Plus, School, Search, X, Check, Clock, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getInitials } from '@/lib/utils'
import { apiService } from '@/services/api'
import { ProfileCompletionCard } from '@/components/profile/ProfileCompletionCard'
import { ExperienceCard } from '@/components/profile/ExperienceCard'
import { ExperienceModal } from '@/components/profile/ExperienceModal'
import { Experience } from '@/types'

interface ProfileData {
  id?: string
  avatar?: string
  profilePicture?: string
  logo?: string
  bio?: string
  description?: string
  phoneNumber?: string
  linkedinUrl?: string
  websiteUrl?: string
  logoUrl?: string
  educationLevel?: string
  skills?: string[]
  address?: string
  industry?: string
  companyName?: string
  lookingFor?: string
  linkedSchool?: { id: string; name: string }
  User?: { firstName?: string; lastName?: string; email?: string }
  name?: string
}

interface SchoolResult {
  id: string
  userId?: string
  name: string
  description?: string
  avatar?: string
}

interface SchoolLinkRequest {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  School?: { id: string; name: string }
  school?: { id: string; name: string }
}

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null)

  // School linking state
  const [schoolSearch, setSchoolSearch] = useState('')
  const [schoolSearchResults, setSchoolSearchResults] = useState<SchoolResult[]>([])
  const [isSearchingSchools, setIsSearchingSchools] = useState(false)
  const [schoolLinkRequests, setSchoolLinkRequests] = useState<SchoolLinkRequest[]>([])
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isStudent = user?.type === 'STUDENT'

  const loadProfile = useCallback(async () => {
    try {
      if (!user) return
      let data
      if (user.type === 'STUDENT') {
        data = await apiService.getMyStudentProfile()
      } else if (user.type === 'SCHOOL') {
        data = await apiService.getMySchoolProfile()
      } else {
        data = await apiService.getMyCompanyProfile()
      }
      setProfile(data)
    } catch (error) {
      console.error('Failed to load profile', error)
      toast.error('Erreur lors du chargement du profil')
    }
  }, [user])

  const loadExperiences = useCallback(async () => {
    try {
      const data = await apiService.getMyExperiences()
      setExperiences(data)
    } catch (error) {
      console.error('Failed to load experiences', error)
    }
  }, [])

  const loadSchoolLinkRequests = useCallback(async () => {
    try {
      const data = await apiService.getMySchoolLinkRequests()
      setSchoolLinkRequests(data)
    } catch (error) {
      console.error('Failed to load school link requests', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadProfile()
      if (isStudent) {
        loadExperiences()
        loadSchoolLinkRequests()
      }
    }
  }, [loadProfile, loadExperiences, loadSchoolLinkRequests, isStudent, user])



  const handleSearchSchools = async (query: string) => {
    setSchoolSearch(query)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length < 2) {
      setSchoolSearchResults([])
      setIsSearchingSchools(false)
      return
    }

    setIsSearchingSchools(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await apiService.searchSchools(query)
        if (query === setSchoolSearch.name) return // Basic stale check (not perfect but debounce helps)
        setSchoolSearchResults(results || [])
      } catch (error) {
        console.error('Failed to search schools', error)
        setSchoolSearchResults([])
      } finally {
        setIsSearchingSchools(false)
      }
    }, 300)
  }

  const handleSendSchoolRequest = async (schoolId: string) => {
    setIsSendingRequest(true)
    try {
      await apiService.createSchoolLinkRequest(schoolId)
      toast.success('Request sent to school!')
      setSchoolSearch('')
      setSchoolSearchResults([])
      await loadSchoolLinkRequests()
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      console.error('Failed to send request', error)
      toast.error(axiosError.response?.data?.message || 'Failed to send request')
    } finally {
      setIsSendingRequest(false)
    }
  }

  const handleCancelSchoolRequest = async (requestId: string) => {
    try {
      await apiService.cancelSchoolLinkRequest(requestId)
      toast.success('Request cancelled')
      await loadSchoolLinkRequests()
    } catch (error) {
      console.error('Failed to cancel request', error)
      toast.error('Failed to cancel request')
    }
  }

  const pendingRequest = schoolLinkRequests.find(r => r.status === 'PENDING')

  const handleAddExperience = () => {
    setEditingExperience(null)
    setIsExperienceModalOpen(true)
  }

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience)
    setIsExperienceModalOpen(true)
  }

  const confirmDeleteExperience = (id: string) => {
    setExperienceToDelete(id)
  }

  const handleDeleteExperience = async () => {
    if (!experienceToDelete) return
    
    try {
      await apiService.deleteExperience(experienceToDelete)
      await loadExperiences()
      setRefreshTrigger(prev => prev + 1)
      toast.success('Expérience supprimée avec succès')
    } catch (error) {
      console.error('Failed to delete experience', error)
      toast.error("Erreur lors de la suppression de l'expérience")
    } finally {
      setExperienceToDelete(null)
    }
  }

  const handleSaveExperience = async (data: Partial<Experience>) => {
    try {
      if (editingExperience) {
        await apiService.updateExperience(editingExperience.id, data)
        toast.success('Experience updated successfully')
      } else {
        await apiService.createExperience(data)
        toast.success('Experience added successfully')
      }
      await loadExperiences()
      setIsExperienceModalOpen(false)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to save experience', error)
      toast.error('Failed to save experience')
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (!user) return

      // Helper to clean data - removes undefined and empty string URL values
      const cleanData = (data: Record<string, string | string[] | undefined>) => {
        const cleaned: Record<string, string | string[]> = {}
        for (const [key, value] of Object.entries(data)) {
          // Skip undefined values
          if (value === undefined) continue
          // For URL fields, skip empty strings
          if (['avatar', 'linkedinUrl', 'websiteUrl', 'logoUrl'].includes(key) && typeof value === 'string' && value.trim() === '') {
            continue
          }
          cleaned[key] = value
        }
        return cleaned
      }

      // Filter only the fields that can be updated based on user type
      let updateData: Record<string, string | string[]>
      if (user.type === 'STUDENT') {
        updateData = cleanData({
          avatar: profile?.avatar,
          bio: profile?.bio,
          phoneNumber: profile?.phoneNumber,
          linkedinUrl: profile?.linkedinUrl,
          educationLevel: profile?.educationLevel,
          skills: profile?.skills,
        })
      } else if (user.type === 'SCHOOL') {
        updateData = cleanData({
          avatar: profile?.avatar,
          description: profile?.description,
          websiteUrl: profile?.websiteUrl,
        })
      } else {
        // COMPANY
        updateData = cleanData({
          avatar: profile?.avatar,
          description: profile?.description,
          phoneNumber: profile?.phoneNumber,
          address: profile?.address,
          websiteUrl: profile?.websiteUrl,
          logoUrl: profile?.logoUrl,
          industry: profile?.industry,
        })
      }

      // Update using the 'my' endpoint
      let updatedProfile
      if (user.type === 'STUDENT') {
        updatedProfile = await apiService.updateStudentProfile(updateData)
      } else if (user.type === 'SCHOOL') {
        updatedProfile = await apiService.updateSchoolProfile(updateData)
      } else {
        updatedProfile = await apiService.updateCompanyProfile(updateData)
      }
      setProfile(updatedProfile)
      toast.success('Profil mis à jour avec succès')
      setIsEditing(false)
      // Trigger profile completion refresh
      setRefreshTrigger(prev => prev + 1)
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string | string[] } } }
      console.error('Failed to update profile', error)
      // Check if error is URL validation related
      const errorMessage = axiosError.response?.data?.message
      if (errorMessage && (
        (typeof errorMessage === 'string' && (errorMessage.includes('URL') || errorMessage.includes('url'))) ||
        (Array.isArray(errorMessage) && errorMessage.some((m: string) => m.toLowerCase().includes('url')))
      )) {
        toast.error('URL invalide')
      } else {
        toast.error('Erreur lors de la mise à jour du profil')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Profile Completion Card */}
      <ProfileCompletionCard refreshTrigger={refreshTrigger} />

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar || profile?.logoUrl || profile?.profilePicture} />
                <AvatarFallback className="text-2xl">
                  {user ? getInitials(user.name || user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => toast.info('La modification de photo sera bientôt disponible')}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {isStudent
                  ? user?.name
                  : profile?.companyName || 'Nom de l\'entreprise'}
              </h2>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <div className="flex gap-2 mt-3 justify-center md:justify-start">
                <Badge variant="secondary">{user?.type}</Badge>
                {isStudent && profile?.lookingFor && (
                  <Badge>{profile.lookingFor}</Badge>
                )}
              </div>
            </div>

            <div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Modifier le profil</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du profil</CardTitle>
          <CardDescription>
            {isEditing ? 'Mettez à jour vos informations' : 'Vos détails de profil'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isStudent ? (
            <>
              <div className="space-y-2">
                <Label>Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Parlez-nous de vous et de vos objectifs de carrière..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.bio || 'Aucune bio ajoutée'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Numéro de téléphone</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={profile?.phoneNumber || ''}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      placeholder="+33612345678"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.phoneNumber || 'Non spécifié'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Niveau d'études</Label>
                  {isEditing ? (
                    <Input
                      value={profile?.educationLevel || ''}
                      onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                      placeholder="ex: Licence en informatique"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.educationLevel || 'Non spécifié'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profil LinkedIn</Label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={profile?.linkedinUrl || ''}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/votreprofil"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.linkedinUrl ? (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.linkedinUrl}
                      </a>
                    ) : (
                      'Non spécifié'
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Compétences</Label>
                {isEditing ? (
                  <Input
                    value={profile?.skills?.join(', ') || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="JavaScript, React, Node.js (séparés par des virgules)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune compétence ajoutée</p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : user?.type === 'SCHOOL' ? (
            <>
              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={profile?.description || ''}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Décrivez votre école et vos programmes..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.description || 'Aucune description ajoutée'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>URL du site web</Label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={profile?.websiteUrl || ''}
                    onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                    placeholder="https://www.exemple.com"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.websiteUrl ? (
                      <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.websiteUrl}
                      </a>
                    ) : (
                      'Non spécifié'
                    )}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={profile?.description || ''}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Décrivez votre entreprise et ce que vous faites..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.description || 'Aucune description ajoutée'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Numéro de téléphone</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={profile?.phoneNumber || ''}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      placeholder="+33123456789"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.phoneNumber || 'Non spécifié'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Secteur d'activité</Label>
                  {isEditing ? (
                    <Input
                      value={profile?.industry || ''}
                      onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                      placeholder="ex: Technologie, Finance"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.industry || 'Non spécifié'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adresse</Label>
                {isEditing ? (
                  <Input
                    value={profile?.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="123 Rue Principale, Paris, France"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.address || 'Non spécifié'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>URL du site web</Label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={profile?.websiteUrl || ''}
                      onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                      placeholder="https://www.exemple.com"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.websiteUrl ? (
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.websiteUrl}
                        </a>
                      ) : (
                        'Non spécifié'
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>URL du logo</Label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={profile?.logoUrl || ''}
                      onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                      placeholder="https://exemple.com/logo.png"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.logoUrl ? (
                        <a href={profile.logoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Voir le logo
                        </a>
                      ) : (
                        'Non spécifié'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* My School Section - Only for Students */}
      {isStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <School className="h-5 w-5" />
              <div>
                <CardTitle>Mon école</CardTitle>
                <CardDescription>Liez votre profil à votre école</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Already linked to a school */}
            {profile?.linkedSchool ? (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">{profile.linkedSchool.name}</p>
                    <p className="text-sm text-muted-foreground">Vous êtes lié à cette école</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">Lié</Badge>
              </div>
            ) : pendingRequest ? (
              /* Pending request */
              <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium">{pendingRequest.school?.name || 'École'}</p>
                    <p className="text-sm text-muted-foreground">Demande en attente d'approbation</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelSchoolRequest(pendingRequest.id)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            ) : (
              /* Search and request to link */
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher votre école..."
                    value={schoolSearch}
                    onChange={(e) => handleSearchSchools(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Search results */}
                {schoolSearchResults.length > 0 && (
                  <div className="border rounded-lg divide-y">
                    {schoolSearchResults.map((school) => (
                      <div
                        key={school.userId}
                        className="flex items-center justify-between p-3 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={school.avatar} />
                            <AvatarFallback>{getInitials(school.name)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{school.name}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => school.userId && handleSendSchoolRequest(school.userId)}
                          disabled={isSendingRequest || !school.userId}
                        >
                          Demander à rejoindre
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {schoolSearch.length >= 2 && schoolSearchResults.length === 0 && !isSearchingSchools && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune école trouvée pour "{schoolSearch}"
                  </p>
                )}

                {isSearchingSchools && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Recherche...
                  </p>
                )}
              </div>
            )}

            {/* Show rejected requests */}
            {schoolLinkRequests.filter(r => r.status === 'REJECTED').length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-2">Demandes précédentes</p>
                {schoolLinkRequests.filter(r => r.status === 'REJECTED').map((request) => (
                  <div key={request.id} className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle className="h-4 w-4" />
                    <span>{request.school?.name || 'École'} - Refusée</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experiences Section - Only for Students */}
      {isStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Expérience professionnelle</CardTitle>
                <CardDescription>Vos expériences professionnelles et stages</CardDescription>
              </div>
              <Button onClick={handleAddExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une expérience
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {experiences.length > 0 ? (
              experiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onEdit={handleEditExperience}
                  onDelete={confirmDeleteExperience}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune expérience ajoutée. Cliquez sur "Ajouter une expérience" pour commencer !</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experience Modal */}
      <ExperienceModal
        open={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        onSave={handleSaveExperience}
        experience={editingExperience}
      />

      <Dialog open={!!experienceToDelete} onOpenChange={(open) => !open && setExperienceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'expérience</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette expérience ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExperienceToDelete(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteExperience}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

