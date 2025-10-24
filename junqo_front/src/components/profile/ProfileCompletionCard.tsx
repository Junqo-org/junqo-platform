import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { apiService } from '@/services/api'
import { motion } from 'framer-motion'

interface ProfileSuggestion {
  field: string
  completed: boolean
  weight: number
}

interface ProfileCompletionCardProps {
  userId: string
  userType: 'STUDENT' | 'COMPANY'
}

export function ProfileCompletionCard({ userId, userType }: ProfileCompletionCardProps) {
  const [completion, setCompletion] = useState(0)
  const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProfileCompletion()
  }, [userId])

  const loadProfileCompletion = async () => {
    try {
      const stats = await apiService.getDashboardStatistics()
      setCompletion(stats.profileCompletion || 0)

      // Calculate suggestions based on completion
      if (userType === 'STUDENT') {
        setSuggestions([
          { field: 'Bio', completed: stats.profileCompletion >= 45, weight: 15 },
          { field: 'Phone Number', completed: stats.profileCompletion >= 55, weight: 10 },
          { field: 'LinkedIn', completed: stats.profileCompletion >= 65, weight: 10 },
          { field: 'GitHub', completed: stats.profileCompletion >= 75, weight: 10 },
          { field: 'Skills', completed: stats.profileCompletion >= 90, weight: 15 },
          { field: 'Education Level', completed: stats.profileCompletion >= 100, weight: 10 },
        ])
      } else {
        setSuggestions([
          { field: 'Description', completed: stats.profileCompletion >= 50, weight: 20 },
          { field: 'Phone Number', completed: stats.profileCompletion >= 60, weight: 10 },
          { field: 'Address', completed: stats.profileCompletion >= 70, weight: 10 },
          { field: 'Website', completed: stats.profileCompletion >= 80, weight: 10 },
          { field: 'Logo', completed: stats.profileCompletion >= 90, weight: 10 },
          { field: 'Industry', completed: stats.profileCompletion >= 100, weight: 10 },
        ])
      }
    } catch (error) {
      console.error('Failed to load profile completion:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCompletionColor = () => {
    if (completion >= 80) return 'text-emerald-600'
    if (completion >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

  const getCompletionBadge = () => {
    if (completion >= 80) return { label: 'Excellent', variant: 'default' as const, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    if (completion >= 50) return { label: 'Good', variant: 'secondary' as const, color: 'bg-amber-100 text-amber-700 border-amber-200' }
    return { label: 'Incomplete', variant: 'destructive' as const, color: 'bg-red-100 text-red-700 border-red-200' }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-2 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const badge = getCompletionBadge()
  const completedCount = suggestions.filter(s => s.completed).length

  return (
    <Card className="border-2 border-blue-100 dark:border-blue-900">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Profile Completion
              <Badge className={badge.color}>
                {badge.label}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              Complete your profile to increase visibility
            </CardDescription>
          </div>
          <motion.div
            className={`text-4xl font-bold ${getCompletionColor()}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            {completion}%
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={completion} 
            className="h-3"
          />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {completedCount} of {suggestions.length} sections completed
          </p>
        </div>

        {/* Suggestions */}
        {completion < 100 && (
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <AlertCircle className="h-4 w-4" />
              <span>To complete your profile:</span>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.field}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-2 text-sm p-2 rounded transition-colors ${
                    suggestion.completed
                      ? 'text-slate-500 dark:text-slate-500'
                      : 'text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  {suggestion.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="flex-1">{suggestion.field}</span>
                  <span className="text-xs text-slate-500">+{suggestion.weight}%</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Completion Message */}
        {completion === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-medium text-emerald-900 dark:text-emerald-100">
                  Profile Complete! 🎉
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Your profile is fully optimized for maximum visibility
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

