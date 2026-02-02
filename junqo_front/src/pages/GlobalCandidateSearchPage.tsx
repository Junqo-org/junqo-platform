import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Users,
    Search,
    ArrowLeft,
    User,
    GraduationCap,
    Loader2,
    CheckCircle,
    X,
} from 'lucide-react'
import { apiService } from '@/services/api'
import { StudentProfile, Offer } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { StudentProfileModal } from '@/components/candidates/StudentProfileModal'

interface StudentSearchResult {
    rows: StudentProfile[]
    count: number
}

const EDUCATION_LEVELS = [
    { value: 'ALL', label: 'Tous les niveaux' },
    { value: 'BAC', label: 'Baccalauréat' },
    { value: 'BAC+2', label: 'BAC+2 (BTS, DUT)' },
    { value: 'BAC+3', label: 'BAC+3 (Licence)' },
    { value: 'BAC+5', label: 'BAC+5 (Master)' },
    { value: 'BAC+8', label: 'BAC+8 (Doctorat)' },
]

const COMMON_SKILLS = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'Java', 'C++', 'SQL', 'Git', 'Docker',
    'AWS', 'Azure', 'MongoDB', 'PostgreSQL', 'GraphQL',
]

export default function GlobalCandidateSearchPage() {
    const navigate = useNavigate()

    // Search state
    const [nameSearch, setNameSearch] = useState('')
    const [educationLevel, setEducationLevel] = useState('ALL')
    const [selectedSkills, setSelectedSkills] = useState<string[]>([])
    const [skillInput, setSkillInput] = useState('')

    // Results state
    const [candidates, setCandidates] = useState<StudentProfile[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Offers for pre-accept
    const [offers, setOffers] = useState<Offer[]>([])
    const [isLoadingOffers, setIsLoadingOffers] = useState(true)

    // Pre-accept dialog state
    const [preAcceptDialogOpen, setPreAcceptDialogOpen] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState<StudentProfile | null>(null)
    const [selectedOfferId, setSelectedOfferId] = useState<string>('')
    const [isPreAccepting, setIsPreAccepting] = useState(false)

    // Profile modal state
    const [profileModalOpen, setProfileModalOpen] = useState(false)
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
    const [selectedStudentName, setSelectedStudentName] = useState<string | undefined>(undefined)

    // Load company's offers and all candidates on mount
    useEffect(() => {
        loadOffers()
        // Auto-load all candidates when page opens
        searchCandidates()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const loadOffers = async () => {
        try {
            setIsLoadingOffers(true)
            // Use getMyOffers for companies (CASL permission)
            const data = await apiService.getMyOffers()
            setOffers(data.rows || data || [])
        } catch (error) {
            console.error('Failed to load offers:', error)
            toast.error('Échec du chargement des offres')
        } finally {
            setIsLoadingOffers(false)
        }
    }

    const searchCandidates = useCallback(async () => {
        try {
            setIsLoading(true)
            setHasSearched(true)

            const query: {
                name?: string
                educationLevel?: string
                skills?: string[]
                limit: number
                offset: number
            } = {
                limit: 50,
                offset: 0,
            }

            if (nameSearch.trim()) {
                query.name = nameSearch.trim()
            }

            if (educationLevel && educationLevel !== 'ALL') {
                query.educationLevel = educationLevel
            }

            if (selectedSkills.length > 0) {
                query.skills = selectedSkills
            }

            const result: StudentSearchResult = await apiService.searchStudentProfiles(query)
            setCandidates(result.rows || [])
            setTotalCount(result.count || 0)
        } catch (error) {
            console.error('Failed to search candidates:', error)
            toast.error('Échec de la recherche de candidats')
            setCandidates([])
            setTotalCount(0)
        } finally {
            setIsLoading(false)
        }
    }, [nameSearch, educationLevel, selectedSkills])

    const handleAddSkill = (skill: string) => {
        const normalizedSkill = skill.trim()
        if (normalizedSkill && !selectedSkills.includes(normalizedSkill)) {
            setSelectedSkills([...selectedSkills, normalizedSkill])
        }
        setSkillInput('')
    }

    const handleRemoveSkill = (skill: string) => {
        setSelectedSkills(selectedSkills.filter(s => s !== skill))
    }

    const handleViewProfile = (studentId: string, studentName?: string) => {
        setSelectedStudentId(studentId)
        setSelectedStudentName(studentName)
        setProfileModalOpen(true)
    }

    const handleOpenPreAcceptDialog = (candidate: StudentProfile) => {
        if (offers.length === 0) {
            toast.error('Vous devez d\'abord créer une offre active')
            return
        }
        setSelectedCandidate(candidate)
        setSelectedOfferId(offers[0]?.id || '')
        setPreAcceptDialogOpen(true)
    }

    const handlePreAccept = async () => {
        if (!selectedCandidate || !selectedOfferId) {
            toast.error('Veuillez sélectionner une offre')
            return
        }

        try {
            setIsPreAccepting(true)
            await apiService.preAcceptCandidate(selectedCandidate.userId, selectedOfferId)
            toast.success(`${selectedCandidate.name} a été pré-accepté(e) avec succès !`)
            setPreAcceptDialogOpen(false)
            setSelectedCandidate(null)
        } catch (error) {
            console.error('Failed to pre-accept candidate:', error)
            toast.error('Échec de la pré-acceptation')
        } finally {
            setIsPreAccepting(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (skillInput.trim()) {
                handleAddSkill(skillInput)
            } else {
                searchCandidates()
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/recruiter/applications')}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour aux candidatures
                    </Button>

                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Recherche de Candidats
                            </h1>
                            <p className="text-muted-foreground">
                                Trouvez les talents qui correspondent à vos besoins
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Search Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Filtres de recherche
                            </CardTitle>
                            <CardDescription>
                                Affinez votre recherche pour trouver les meilleurs candidats
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Name Search */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom du candidat</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher par nom..."
                                        value={nameSearch}
                                        onChange={(e) => setNameSearch(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Education Level */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    Niveau d'études
                                </label>
                                <Select value={educationLevel} onValueChange={setEducationLevel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un niveau" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EDUCATION_LEVELS.map(level => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Skills */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Compétences</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedSkills.map(skill => (
                                        <Badge
                                            key={skill}
                                            variant="secondary"
                                            className="flex items-center gap-1 px-3 py-1"
                                        >
                                            {skill}
                                            <button
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Ajouter une compétence..."
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddSkill(skillInput)}
                                        disabled={!skillInput.trim()}
                                    >
                                        Ajouter
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    <span className="text-xs text-muted-foreground mr-2">Suggestions:</span>
                                    {COMMON_SKILLS.filter(s => !selectedSkills.includes(s)).slice(0, 8).map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => handleAddSkill(skill)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            +{skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Button */}
                            <Button
                                onClick={searchCandidates}
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Recherche en cours...
                                    </>
                                ) : (
                                    <>
                                        <Search className="h-4 w-4 mr-2" />
                                        Rechercher des candidats
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results */}
                {hasSearched && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">
                                {totalCount} candidat{totalCount !== 1 ? 's' : ''} trouvé{totalCount !== 1 ? 's' : ''}
                            </h2>
                        </div>

                        {candidates.length === 0 && !isLoading ? (
                            <Card className="p-12 text-center">
                                <User className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">
                                    Aucun candidat trouvé
                                </h3>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Essayez de modifier vos critères de recherche
                                </p>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <AnimatePresence>
                                    {candidates.map((candidate, index) => (
                                        <motion.div
                                            key={candidate.userId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="h-full hover:shadow-lg transition-shadow">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start gap-4 mb-4">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                            {candidate.avatar ? (
                                                                <img
                                                                    src={candidate.avatar}
                                                                    alt={candidate.name}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <User className="h-6 w-6 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold truncate">{candidate.name}</h3>
                                                            {candidate.educationLevel && (
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <GraduationCap className="h-3 w-3" />
                                                                    {candidate.educationLevel}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {candidate.bio && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                            {candidate.bio}
                                                        </p>
                                                    )}

                                                    {candidate.skills && candidate.skills.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-4">
                                                            {candidate.skills.slice(0, 5).map(skill => (
                                                                <Badge key={skill} variant="outline" className="text-xs">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                            {candidate.skills.length > 5 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{candidate.skills.length - 5}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2 mt-auto">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handleViewProfile(candidate.userId, candidate.name)}
                                                        >
                                                            <User className="h-4 w-4 mr-1" />
                                                            Voir profil
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handleOpenPreAcceptDialog(candidate)}
                                                            disabled={isLoadingOffers || offers.length === 0}
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Pré-accepter
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Initial state */}
                {!hasSearched && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="p-12 text-center">
                            <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">
                                Lancez une recherche
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Utilisez les filtres ci-dessus pour trouver des candidats correspondant à vos critères
                            </p>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Pre-Accept Dialog */}
            <Dialog open={preAcceptDialogOpen} onOpenChange={setPreAcceptDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pré-accepter un candidat</DialogTitle>
                        <DialogDescription>
                            Sélectionnez une offre pour pré-accepter {selectedCandidate?.name}.
                            Le candidat sera notifié de votre intérêt.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">Sélectionner une offre</label>
                        <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir une offre..." />
                            </SelectTrigger>
                            <SelectContent>
                                {offers.map(offer => (
                                    <SelectItem key={offer.id} value={offer.id}>
                                        {offer.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPreAcceptDialogOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handlePreAccept}
                            disabled={!selectedOfferId || isPreAccepting}
                        >
                            {isPreAccepting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Pré-acceptation...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Pré-accepter
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Student Profile Modal */}
            <StudentProfileModal
                open={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
                studentId={selectedStudentId}
                studentName={selectedStudentName}
            />
        </div>
    )
}
