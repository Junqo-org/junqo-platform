import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Camera, Mail, User as UserIcon, Building, Plus } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { apiService } from '@/services/api'
import { ProfileCompletionCard } from '@/components/profile/ProfileCompletionCard'
import { ExperienceCard } from '@/components/profile/ExperienceCard'
import { ExperienceModal } from '@/components/profile/ExperienceModal'
import { Experience } from '@/types'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)

  const isStudent = user?.type === 'STUDENT'

  useEffect(() => {
    loadProfile()
    if (isStudent) {
      loadExperiences()
    }
  }, [])

  const loadProfile = async () => {
    try {
      if (!user) return
      const data = isStudent
        ? await apiService.getMyStudentProfile()
        : await apiService.getMyCompanyProfile()
      setProfile(data)
    } catch (error) {
      console.error('Failed to load profile', error)
      toast.error('Failed to load profile')
    }
  }

  const loadExperiences = async () => {
    try {
      const data = await apiService.getMyExperiences()
      setExperiences(data)
    } catch (error) {
      console.error('Failed to load experiences', error)
    }
  }

  const handleAddExperience = () => {
    setEditingExperience(null)
    setIsExperienceModalOpen(true)
  }

  const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience)
    setIsExperienceModalOpen(true)
  }

  const handleDeleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return
    try {
      await apiService.deleteExperience(id)
      await loadExperiences()
      setRefreshTrigger(prev => prev + 1)
      toast.success('Experience deleted successfully')
    } catch (error) {
      console.error('Failed to delete experience', error)
      toast.error('Failed to delete experience')
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
      
      // Filter only the fields that can be updated
      const updateData = isStudent
        ? {
            avatar: profile?.avatar,
            bio: profile?.bio,
            phoneNumber: profile?.phoneNumber,
            linkedinUrl: profile?.linkedinUrl,
            educationLevel: profile?.educationLevel,
            skills: profile?.skills,
          }
        : {
            avatar: profile?.avatar,
            description: profile?.description,
            phoneNumber: profile?.phoneNumber,
            address: profile?.address,
            websiteUrl: profile?.websiteUrl,
            logoUrl: profile?.logoUrl,
            industry: profile?.industry,
          }
      
      // Update using the 'my' endpoint
      const updatedProfile = isStudent
        ? await apiService.updateStudentProfile(updateData)
        : await apiService.updateCompanyProfile(updateData)
      setProfile(updatedProfile)
      toast.success('Profile updated successfully')
      setIsEditing(false)
      // Trigger profile completion refresh
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Failed to update profile')
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
                <AvatarImage src={profile?.profilePicture || profile?.logo} />
                <AvatarFallback className="text-2xl">
                  {user ? getInitials(user.name || user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">
                {isStudent
                  ? user?.name
                  : profile?.companyName || 'Company Name'}
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
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
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
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            {isEditing ? 'Update your profile information' : 'Your profile details'}
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
                    placeholder="Tell us about yourself and your career goals..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={profile?.phoneNumber || ''}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      placeholder="+33612345678"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.phoneNumber || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Education Level</Label>
                  {isEditing ? (
                    <Input
                      value={profile?.educationLevel || ''}
                      onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                      placeholder="e.g., Bachelor in Computer Science"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.educationLevel || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>LinkedIn Profile</Label>
                {isEditing ? (
                  <Input
                    type="url"
                    value={profile?.linkedinUrl || ''}
                    onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.linkedinUrl ? (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.linkedinUrl}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Skills</Label>
                {isEditing ? (
                  <Input
                    value={profile?.skills?.join(', ') || ''}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="JavaScript, React, Node.js (comma separated)"
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
                      <p className="text-sm text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
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
                    placeholder="Describe your company and what you do..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.description || 'No description added yet'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={profile?.phoneNumber || ''}
                      onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                      placeholder="+33123456789"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.phoneNumber || 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  {isEditing ? (
                    <Input
                      value={profile?.industry || ''}
                      onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                      placeholder="e.g., Technology, Finance"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.industry || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                {isEditing ? (
                  <Input
                    value={profile?.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="123 Main St, Paris, France"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.address || 'Not specified'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={profile?.websiteUrl || ''}
                      onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
                      placeholder="https://www.example.com"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.websiteUrl ? (
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.websiteUrl}
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  {isEditing ? (
                    <Input
                      type="url"
                      value={profile?.logoUrl || ''}
                      onChange={(e) => setProfile({ ...profile, logoUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {profile?.logoUrl ? (
                        <a href={profile.logoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Logo
                        </a>
                      ) : (
                        'Not specified'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Experiences Section - Only for Students */}
      {isStudent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Your professional experience and internships</CardDescription>
              </div>
              <Button onClick={handleAddExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
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
                  onDelete={handleDeleteExperience}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No experiences added yet. Click "Add Experience" to get started!</p>
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
    </div>
  )
}

