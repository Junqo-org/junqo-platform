import { useState, useEffect, useCallback } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
    Building,
    Phone,
    Globe,
    MapPin,
    ExternalLink,
    Loader2
} from 'lucide-react'
import { apiService } from '@/services/api'
import { getInitials } from '@/lib/utils'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface CompanyProfileModalProps {
    open: boolean
    onClose: () => void
    companyId: string | null
}

interface CompanyProfile {
    userId: string
    name: string
    description?: string
    logoUrl?: string
    websiteUrl?: string
    phoneNumber?: string
    address?: string
    industry?: string
    email?: string // Might come from user join
}

export function CompanyProfileModal({
    open,
    onClose,
    companyId
}: CompanyProfileModalProps) {
    const [profile, setProfile] = useState<CompanyProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadProfile = useCallback(async () => {
        if (!companyId) return

        setIsLoading(true)
        setError(null)

        try {
            const data = await apiService.getCompanyProfile(companyId)
            setProfile(data)
        } catch (err: unknown) {
            console.error('Failed to load company profile:', err)
            setError('Impossible de charger le profil de l\'entreprise')
            toast.error('Échec du chargement du profil')
        } finally {
            setIsLoading(false)
        }
    }, [companyId])

    useEffect(() => {
        if (open && companyId) {
            loadProfile()
        }
    }, [open, companyId, loadProfile])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Profil de l'entreprise
                    </DialogTitle>
                    <DialogDescription>
                        Informations sur l'entreprise
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
                        {/* Company Header */}
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 rounded-md">
                                <AvatarImage src={profile.logoUrl} alt={profile.name} />
                                <AvatarFallback className="rounded-md text-lg">
                                    {getInitials(profile.name || 'Unknown')}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold">{profile.name}</h3>
                                {profile.industry && (
                                    <Badge variant="secondary" className="mt-1">
                                        {profile.industry}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {profile.description && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-2">À propos</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                                        {profile.description}
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Contact & Info */}
                        {(profile.address || profile.websiteUrl || profile.phoneNumber) && (
                            <>
                                <Separator />
                                <div>
                                    <h4 className="font-medium mb-3">Coordonnées</h4>
                                    <div className="space-y-3">
                                        {profile.address && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                <span>{profile.address}</span>
                                            </div>
                                        )}
                                        {profile.phoneNumber && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span>{profile.phoneNumber}</span>
                                            </div>
                                        )}
                                        {profile.websiteUrl && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <a
                                                    href={profile.websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                                >
                                                    Site web
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        )}
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
