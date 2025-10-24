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
import { Camera, Mail, User as UserIcon, Building } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { apiService } from '@/services/api'
import { ProfileCompletionCard } from '@/components/profile/ProfileCompletionCard'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const isStudent = user?.type === 'STUDENT'

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      if (!user) return
      const data = isStudent
        ? await apiService.getStudentProfile(user.id)
        : await apiService.getCompanyProfile(user.id)
      setProfile(data)
    } catch (error) {
      console.error('Failed to load profile', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (!user) return
      isStudent
        ? await apiService.updateStudentProfile(user.id, profile)
        : await apiService.updateCompanyProfile(user.id, profile)
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Profile Completion Card */}
      {user && (
        <ProfileCompletionCard 
          userId={user.id} 
          userType={user.type} 
        />
      )}

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
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.bio || 'No bio added yet'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Education</Label>
                {isEditing ? (
                  <Input
                    value={profile?.education || ''}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    placeholder="Your education background"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.education || 'No education added yet'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Looking For</Label>
                {isEditing ? (
                  <Input
                    value={profile?.lookingFor || ''}
                    onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
                    placeholder="e.g., Internship, Full-time job"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.lookingFor || 'Not specified'}
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
                        skills: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    placeholder="JavaScript, React, Node.js (comma separated)"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    )) || <p className="text-sm text-muted-foreground">No skills added yet</p>}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Company Name</Label>
                {isEditing ? (
                  <Input
                    value={profile?.companyName || ''}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    placeholder="Your company name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.companyName || 'Not specified'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={profile?.description || ''}
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    placeholder="Describe your company..."
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.description || 'No description added yet'}
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

              <div className="space-y-2">
                <Label>Website</Label>
                {isEditing ? (
                  <Input
                    value={profile?.website || ''}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {profile?.website || 'Not specified'}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

