import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Briefcase, Calendar } from 'lucide-react'
import { Experience } from '@/types'
import { format } from 'date-fns'

interface ExperienceCardProps {
  experience: Experience
  onEdit: (experience: Experience) => void
  onDelete: (id: string) => void
  isEditable?: boolean
}

export function ExperienceCard({ experience, onEdit, onDelete, isEditable = true }: ExperienceCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present'
    try {
      return format(new Date(dateString), 'MMM yyyy')
    } catch {
      return dateString
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{experience.title}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">{experience.company}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                </span>
              </div>
            </div>
          </div>
          {isEditable && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(experience)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(experience.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      {(experience.description || (experience.skills && experience.skills.length > 0)) && (
        <CardContent className="space-y-3">
          {experience.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {experience.description}
            </p>
          )}
          {experience.skills && experience.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {experience.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

