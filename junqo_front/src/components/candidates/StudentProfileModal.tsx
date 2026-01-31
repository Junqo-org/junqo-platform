import { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
    Loader2
} from 'lucide-react'
import { apiService } from '@/services/api'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'

interface StudentProfileModalProps {
    open: boolean
    onClose: () => void
    studentId: string | null
    studentName?: string
}

interface StudentProfile {
    userId: string
    name: string
    avatar?: string
    bio?: string
    phoneNumber?: string
    linkedinUrl?: string
    educationLevel?: string
    skills?: string[]
    experiences?: {
        id: string
        title: string
        company: string
        startDate: string
        endDate?: string
        description?: string
        skills?: string[]
    }[]
    linkedSchool?: {
        id: string
        name: string
        avatar?: string
    }
}

export function StudentProfileModal({
    open,
    onClose,
    studentId
}: Omit<StudentProfileModalProps, 'studentName'> & { studentName?: string }) {
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
        if (open && studentId) {
            loadProfile()
        }
    }, [open, studentId, loadProfile])

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('fr-FR', {
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profil du candidat
                    </DialogTitle>
                    <DialogDescription>
                        Consultez les informations détaillées du candidat
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={loadProfile}
                        >
                            Réessayer
                        </Button>
                    </div>
                ) : profile ? (
                    <div className="space-y-6 py-4">
                        {/* Profile Header */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={profile.avatar} />
                                <AvatarFallback className="text-lg">
                                    {getInitials(profile.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">{profile.name}</h3>
                                {profile.educationLevel && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                        <GraduationCap className="h-4 w-4" />
                                        {profile.educationLevel}
                                    </p>
                                )}
                                {profile.linkedSchool && (
                                    <div className="flex items-center gap-2 mt-2 w-fit">
                                        <div className="h-5 w-5 rounded-full overflow-hidden flex-shrink-0 bg-background border">
                                            {profile.linkedSchool.avatar ? (
                                                <img 
                                                    src={profile.linkedSchool.avatar} 
                                                    alt={profile.linkedSchool.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-[10px] font-bold">
                                                    {getInitials(profile.linkedSchool.name)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">{profile.linkedSchool.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        {profile.bio && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-2">À propos</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {profile.bio}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Contact Info */}
                        {(profile.phoneNumber || profile.linkedinUrl) && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-3">Contact</h4>
                                    <div className="space-y-2">
                                        {profile.phoneNumber && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{profile.phoneNumber}</span>
                                            </div>
                                        )}
                                        {profile.linkedinUrl && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Linkedin className="h-4 w-4 text-muted-foreground" />
                                                <a
                                                    href={profile.linkedinUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    Profil LinkedIn
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-3">Compétences</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.skills.map((skill, index) => (
                                            <Badge key={index} variant="secondary">
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
                                <div>
                                    <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Expériences
                                    </h4>
                                    <div className="space-y-4">
                                        {profile.experiences.map((exp) => (
                                            <div key={exp.id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h5 className="font-medium">{exp.title}</h5>
                                                        <p className="text-sm text-muted-foreground">
                                                            {exp.company}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Présent'}
                                                    </span>
                                                </div>
                                                {exp.description && (
                                                    <p className="text-sm text-muted-foreground mt-2">
                                                        {exp.description}
                                                    </p>
                                                )}
                                                {exp.skills && exp.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {exp.skills.map((skill, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
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
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Aucun profil disponible</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
