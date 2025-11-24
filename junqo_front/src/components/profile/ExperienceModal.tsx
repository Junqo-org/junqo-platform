import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Experience } from '@/types'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ExperienceModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Experience>) => void
  experience?: Experience | null
}

export function ExperienceModal({ open, onClose, onSave, experience }: ExperienceModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
    skills: [] as string[],
  })
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || '',
        company: experience.company || '',
        startDate: experience.startDate || '',
        endDate: experience.endDate || '',
        description: experience.description || '',
        skills: experience.skills || [],
      })
    } else {
      setFormData({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: '',
        skills: [],
      })
    }
  }, [experience, open])

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim()
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmedSkill],
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Remove empty strings and empty arrays to avoid validation errors
    const cleanedData: any = {
      title: formData.title,
      company: formData.company,
      startDate: formData.startDate,
    }
    
    if (formData.endDate) {
      cleanedData.endDate = formData.endDate
    }
    
    if (formData.description) {
      cleanedData.description = formData.description
    }
    
    if (formData.skills && formData.skills.length > 0) {
      cleanedData.skills = formData.skills
    }
    
    onSave(cleanedData)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{experience ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
          <DialogDescription>
            {experience ? 'Update your work experience details' : 'Add a new work experience to your profile'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Software Engineer"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Google"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Leave empty if currently working</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a skill and press Enter"
                />
                <Button type="button" onClick={handleAddSkill} variant="secondary">
                  Add
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {experience ? 'Update' : 'Add'} Experience
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

