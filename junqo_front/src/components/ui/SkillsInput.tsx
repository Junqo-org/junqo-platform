import { useState, KeyboardEvent } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'

interface SkillsInputProps {
  value?: string[]
  onChange: (skills: string[]) => void
  placeholder?: string
}

export function SkillsInput({ value = [], onChange, placeholder = "Add a skill" }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleAddSkill = () => {
    const trimmedSkill = inputValue.trim()
    if (trimmedSkill && !value.includes(trimmedSkill)) {
      onChange([...value, trimmedSkill])
      setInputValue('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button 
          type="button" 
          onClick={handleAddSkill} 
          variant="secondary"
          size="icon"
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge key={skill} variant="secondary" className="pl-3 pr-1 py-1 gap-1 flex items-center">
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Remove skill ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
