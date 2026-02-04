import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
    User,
    Phone,
    Linkedin,
    GraduationCap,
    Briefcase,
    ExternalLink,
    Loader2,
    ArrowLeft
} from 'lucide-react'
import { apiService } from '@/services/api'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { StudentProfile } from '@/types'

export default function RecruiterStudentProfilePage() {
    const { studentId } = useParams<{ studentId: string }>()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadProfile = useCallback(async () => {
        if (!studentId) return

        setIsLoading(true)
        setError(null)

        try {
            const data = await apiService.getStudentProfile(studentId)
            setProfile(data)
        } catch (err: unknown) {
            console.error('Failed to load student profile:', err)
            setError('Impossible de charger le profil')
            toast.error('Échec du chargement du profil')
        } finally {
            setIsLoading(false)
        }
    }, [studentId])

    useEffect(() => {
        loadProfile()
    }, [loadProfile])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('fr-FR', {
            month: 'short',
            year: 'numeric'
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Retour
                    </Button>
                    <Button onClick={loadProfile}>
                        Réessayer
                    </Button>
                </div>
            </div>
        )
    }

    if (!profile) {
         return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <p className="text-muted-foreground mb-4">Aucun profil trouvé</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    Retour
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-12">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                 <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-8 pl-0 hover:bg-transparent hover:text-primary"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                </Button>

                <div className="bg-card rounded-xl border shadow-sm p-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={profile.avatar} className="object-cover" />
                            <AvatarFallback className="text-2xl">
                                {getInitials(profile.name)}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 text-center md:text-left space-y-2">
                             <div className="space-y-1">
                                <h1 className="text-3xl font-bold">{profile.name}</h1>
                                {profile.educationLevel && (
                                    <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>{profile.educationLevel}</span>
                                    </div>
                                )}
                             </div>

                             {/* Linked School - if available in type (checking previous file content it was there) */}
                             {/* Note: StudentProfile type in Modal had linkedSchool but global type file might differ. 
                                 Checking type file again: StudentProfile in index.ts DOES NOT have linkedSchool.
                                 The Modal defined its own extended interface. I will stick to what's in global type/what API returns. 
                                 If the API returns it but type is missing, TS will complain if I try to access it without casting or updating type.
                                 Safest is to omit extra fields not in global type unless I update type definition.
                                 However, Modal showed linkedSchool. Let's check Modal again. 
                                 Modal defined: interface StudentProfile { ... linkedSchool?: ... }
                                 This suggests the API might return it. I'll rely on global type for now to avoid errors.
                             */}
                        </div>
                    </div>

                    <Separator />

                    {/* Bio */}
                    {profile.bio && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <User className="h-5 w-5" />
                                À propos
                            </h2>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                                {profile.bio}
                            </p>
                        </div>
                    )}

                    {/* Contact - Only if available */}
                    {(profile.phoneNumber || profile.linkedinUrl) && (
                         <>
                            <Separator />
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Phone className="h-5 w-5" />
                                    Contact
                                </h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {profile.phoneNumber && (
                                        <div className="flex items-center gap-2 text-muted-foreground p-3 rounded-lg bg-muted/50">
                                            <Phone className="h-4 w-4" />
                                            <span>{profile.phoneNumber}</span>
                                        </div>
                                    )}
                                    {profile.linkedinUrl && (
                                        <a
                                            href={profile.linkedinUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 p-3 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                                        >
                                            <Linkedin className="h-4 w-4" />
                                            <span>Profil LinkedIn</span>
                                            <ExternalLink className="h-3 w-3 ml-auto" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Compétences
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Experiences */}
                    {profile.experiences && profile.experiences.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    Expériences
                                </h2>
                                <div className="grid gap-4">
                                    {profile.experiences.map((exp) => (
                                        <div key={exp.id} className="group border rounded-xl p-5 hover:border-primary/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg break-words">{exp.title}</h3>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <span className="font-medium text-foreground/80">{exp.company}</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="w-fit whitespace-nowrap">
                                                    {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Présent'}
                                                </Badge>
                                            </div>
                                            
                                            {exp.description && (
                                                <p className="text-muted-foreground mt-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                    {exp.description}
                                                </p>
                                            )}
                                            
                                            {exp.skills && exp.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-dashed">
                                                    {exp.skills.map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
