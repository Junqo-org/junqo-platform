import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '@/services/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Briefcase, Calendar, Building2, CheckCircle2, FileText, Phone, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface StudentProfile {
    userId: string
    name: string
    avatar?: string
    bio?: string
    phoneNumber?: string
    linkedinUrl?: string
    educationLevel?: string
    skills?: string[]
    updatedAt?: string
}

interface Application {
    id: string
    status: string
    createdAt: string
    offer: {
        id: string
        title: string
        companyName: string
        location: string
    }
    company?: {
        name: string
        logoUrl?: string
    }
}

export default function SchoolStudentDashboardPage() {
    const { studentId } = useParams<{ studentId: string }>()
    const navigate = useNavigate()
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'applications' | 'accepted'>('applications')

    useEffect(() => {
        if (!studentId) return
        loadData()
    }, [studentId])

    const loadData = async () => {
        setIsLoading(true)
        try {
            // Need to implement or use existing endpoint to get specific student profile
            // Currently apiService.getStudentProfile(userId) should work if backend allows
            // For applications, we use the new query capability for schools
            const [profileData, applicationsData] = await Promise.all([
                apiService.getStudentProfile(studentId!),
                apiService.getApplications({ studentId: studentId, limit: 100 })
            ])
            
            // Handle pagination wrapper if present
            const apps = applicationsData.rows || applicationsData || []
            
            setProfile(profileData)
            setApplications(apps)
        } catch (error) {
            console.error('Failed to load student data', error)
            toast.error('Impossible de charger les données de l\'étudiant')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-muted-foreground">Étudiant introuvable</p>
                <Button variant="outline" onClick={() => navigate('/school/dashboard')}>
                    Retour au tableau de bord
                </Button>
            </div>
        )
    }

    const acceptedApplications = applications.filter(app => app.status === 'ACCEPTED')
    
    return (
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
            <Button 
                variant="ghost" 
                className="gap-2 pl-0 hover:bg-transparent hover:text-primary"
                onClick={() => navigate('/school/dashboard')}
            >
                <ArrowLeft className="h-4 w-4" />
                Retour au tableau de bord
            </Button>

            {/* Profile Header */}
            <div className="bg-card rounded-xl border p-6 flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">{profile.name}</h1>
                            <p className="text-muted-foreground">{profile.educationLevel || 'Étudiant'}</p>
                        </div>
                        {profile.updatedAt && (
                            <Badge variant="outline" className="w-fit gap-1.5 px-3 py-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Mis à jour le {format(new Date(profile.updatedAt), 'dd MMMM yyyy', { locale: fr })}
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-balance max-w-2xl">{profile.bio}</p>

                    <div className="flex flex-wrap gap-4 pt-2">
                        {profile.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                {profile.phoneNumber}
                            </div>
                        )}
                        {profile.linkedinUrl && (
                            <a 
                                href={profile.linkedinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                                <ExternalLink className="h-4 w-4" />
                                LinkedIn
                            </a>
                        )}
                    </div>

                    {profile.skills && profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {profile.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Candidatures</p>
                                <p className="text-4xl font-bold">{applications.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Candidatures Acceptées</p>
                                <p className="text-4xl font-bold text-green-600 dark:text-green-500">
                                    {acceptedApplications.length}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Tabs */}
            <div className="w-full space-y-6">
                <div className="flex items-center p-1 bg-muted rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all
                            ${activeTab === 'applications' 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
                        `}
                    >
                        <FileText className="h-4 w-4" />
                        Toutes les candidatures
                    </button>
                    <button
                        onClick={() => setActiveTab('accepted')}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all
                            ${activeTab === 'accepted' 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}
                        `}
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Acceptées
                        <Badge variant="secondary" className="ml-1 text-xs px-1.5 h-5 min-w-5">
                            {acceptedApplications.length}
                        </Badge>
                    </button>
                </div>
                
                {activeTab === 'applications' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des candidatures</CardTitle>
                            <CardDescription>Liste de toutes les offres auxquelles l'étudiant a postulé</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {applications.length > 0 ? (
                                <div className="space-y-4">
                                    {applications.map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <Briefcase className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{app.offer?.title || 'Offre sans titre'}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{app.company?.name || app.offer?.companyName || 'Entreprise inconnue'}</span>
                                                        <span>•</span>
                                                        <span>{format(new Date(app.createdAt), 'dd MMMM yyyy', { locale: fr })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant={app.status === 'ACCEPTED' ? 'default' : 'secondary'} className={app.status === 'ACCEPTED' ? 'bg-green-600 hover:bg-green-700' : ''}>
                                                {app.status === 'ACCEPTED' ? 'Acceptée' : app.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Aucune candidature trouvée</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'accepted' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Candidatures Acceptées</CardTitle>
                            <CardDescription>Détails des offres et entreprises qui ont accepté l'étudiant</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {acceptedApplications.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {acceptedApplications.map((app) => (
                                        <div key={app.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="h-12 w-12 bg-white dark:bg-background rounded-lg border flex items-center justify-center p-2">
                                                    {app.company?.logoUrl ? (
                                                        <img src={app.company.logoUrl} alt={app.company.name} className="h-full w-full object-contain" />
                                                    ) : (
                                                        <Building2 className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <Badge className="bg-green-600 hover:bg-green-700">Acceptée</Badge>
                                            </div>
                                            
                                            <h3 className="font-semibold text-lg mb-1">{app.offer?.title}</h3>
                                            <p className="text-muted-foreground font-medium mb-4">{app.company?.name || app.offer?.companyName}</p>
                                            
                                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(app.createdAt), 'dd MMM yyyy', { locale: fr })}
                                                </div>
                                                {/* Could add a button to view full offer/company details if needed */}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>Aucune candidature acceptée pour le moment</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
