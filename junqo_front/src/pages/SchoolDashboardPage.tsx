import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
    Users,
    UserPlus,
    Check,
    X,
    School,
    GraduationCap,
    Phone,
    ExternalLink,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { apiService } from '@/services/api'
import { getInitials } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface SchoolLinkRequest {
    id: string
    studentId: string
    schoolId: string
    status: string
    message?: string
    createdAt: string
    student?: {
        userId: string
        name: string
        avatar?: string
        bio?: string
        educationLevel?: string
        skills?: string[]
    }
}

interface LinkedStudent {
    userId: string
    name: string
    avatar?: string
    bio?: string
    phoneNumber?: string
    linkedinUrl?: string
    educationLevel?: string
    skills?: string[]
}

export default function SchoolDashboardPage() {
    const navigate = useNavigate()
    const [pendingRequests, setPendingRequests] = useState<SchoolLinkRequest[]>([])
    const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [requests, students] = await Promise.all([
                apiService.getPendingSchoolLinkRequests(),
                apiService.getMyLinkedStudents(),
            ])
            setPendingRequests(requests || [])
            setLinkedStudents(students || [])
        } catch (error) {
            console.error('Failed to load dashboard data', error)
            toast.error('Échec du chargement des données')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await apiService.acceptSchoolLinkRequest(requestId)
            toast.success('Demande de l\'étudiant acceptée !')
            await loadData()
        } catch (error) {
            console.error('Failed to accept request', error)
            toast.error('Échec de l\'acceptation de la demande')
        }
    }

    const handleRejectRequest = async (requestId: string) => {
        try {
            await apiService.rejectSchoolLinkRequest(requestId)
            toast.success('Demande de l\'étudiant refusée')
            await loadData()
        } catch (error) {
            console.error('Failed to reject request', error)
            toast.error('Échec du rejet de la demande')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <School className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Tableau de bord École</h1>
                    <p className="text-muted-foreground">Gérez vos étudiants et demandes</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Étudiants</p>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{linkedStudents.length}</p>
                            </div>
                            <Users className="h-10 w-10 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Demandes en attente</p>
                                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">{pendingRequests.length}</p>
                            </div>
                            <UserPlus className="h-10 w-10 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Actifs ce mois</p>
                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{linkedStudents.length}</p>
                            </div>
                            <GraduationCap className="h-10 w-10 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Requests */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-yellow-500" />
                        <CardTitle>Demandes en attente</CardTitle>
                    </div>
                    <CardDescription>Étudiants qui veulent rejoindre votre école</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingRequests.length > 0 ? (
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <motion.div
                                    key={request.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={request.student?.avatar} />
                                            <AvatarFallback>{getInitials(request.student?.name || 'S')}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{request.student?.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {request.student?.educationLevel || 'Étudiant'}
                                            </p>
                                            {request.message && (
                                                <p className="text-sm text-muted-foreground mt-1 italic">
                                                    "{request.message}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRejectRequest(request.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Refuser
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAcceptRequest(request.id)}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Accepter
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune demande en attente</p>
                            <p className="text-sm">Les étudiants apparaîtront ici lorsqu'ils demanderont à rejoindre votre école</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Linked Students */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <CardTitle>Mes Étudiants</CardTitle>
                    </div>
                    <CardDescription>Étudiants liés à votre école</CardDescription>
                </CardHeader>
                <CardContent>
                    {linkedStudents.length > 0 ? (
                        <div className="space-y-2">
                            {linkedStudents.map((student) => (
                                <div key={student.userId} className="border rounded-lg overflow-hidden">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => setExpandedStudent(expandedStudent === student.userId ? null : student.userId)}
                                    >
                                        <div
                                            className="flex items-center gap-4 cursor-pointer"
                                            onClick={() => navigate(`/school/student/${student.userId}`)}
                                        >
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={student.avatar} />
                                                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium hover:underline">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {student.educationLevel || 'Étudiant'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {student.skills && student.skills.length > 0 && (
                                                <div className="hidden md:flex gap-1">
                                                    {student.skills.slice(0, 3).map((skill, i) => (
                                                        <Badge key={i} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                    {student.skills.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{student.skills.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                            {expandedStudent === student.userId ? (
                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedStudent === student.userId && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t bg-muted/30"
                                            >
                                                <div className="p-4 space-y-4">
                                                    {student.bio && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-1">Bio</p>
                                                            <p className="text-sm">{student.bio}</p>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-4">
                                                        {student.phoneNumber && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                                <span>{student.phoneNumber}</span>
                                                            </div>
                                                        )}
                                                        {student.linkedinUrl && (
                                                            <a
                                                                href={student.linkedinUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                <span>Profil LinkedIn</span>
                                                            </a>
                                                        )}
                                                    </div>

                                                    {student.skills && student.skills.length > 0 && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-2">Compétences</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {student.skills.map((skill, i) => (
                                                                    <Badge key={i} variant="secondary">
                                                                        {skill}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucun étudiant pour le moment</p>
                            <p className="text-sm">Les étudiants apparaîtront ici une fois qu'ils auront rejoint votre école</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
