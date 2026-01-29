import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, Heart, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'

interface Candidate {
  id: number
  name: string
  education: string
  location: string
  bio: string
  skills: string[]
  lookingFor: string
  experience?: string
}

export default function SwipingPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [candidates] = useState<Candidate[]>(() => {
    // Mock candidates
    return [
      {
        id: 1,
        name: 'Alice Johnson',
        education: 'Master in Computer Science - MIT',
        location: 'Boston, MA',
        bio: 'Passionate full-stack developer with 2 years of experience. Love building user-centric applications.',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
        lookingFor: 'Full-time Software Engineer position',
        experience: '2 years',
      },
      {
        id: 2,
        name: 'Bob Smith',
        education: 'Bachelor in Software Engineering - Stanford',
        location: 'San Francisco, CA',
        bio: 'Frontend enthusiast specializing in React and modern web technologies. Always eager to learn.',
        skills: ['React', 'Vue.js', 'Tailwind CSS', 'JavaScript'],
        lookingFor: 'Frontend Developer internship',
      },
      {
        id: 3,
        name: 'Carol White',
        education: 'PhD in AI - UC Berkeley',
        location: 'Berkeley, CA',
        bio: 'AI researcher with strong background in machine learning and data science.',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Data Science'],
        lookingFor: 'ML Engineer position',
        experience: '4 years',
      },
    ]
  })
  const [stats, setStats] = useState({
    viewed: 0,
    liked: 0,
    matches: 0,
  })

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      toast.success('Candidate liked!')
      setStats((prev) => ({ ...prev, liked: prev.liked + 1 }))
    }
    setStats((prev) => ({ ...prev, viewed: prev.viewed + 1 }))
    setCurrentIndex((prev) => prev + 1)
  }

  const currentCandidate = candidates[currentIndex]

  if (!currentCandidate) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
            <Heart className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">No More Candidates</h1>
          <p className="text-muted-foreground text-lg">
            You've reviewed all available candidates. Check back later for more!
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Session Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{stats.viewed}</div>
              <p className="text-sm text-muted-foreground">Viewed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.liked}</div>
              <p className="text-sm text-muted-foreground">Liked</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.matches}</div>
              <p className="text-sm text-muted-foreground">Matches</p>
            </div>
          </CardContent>
        </Card>
        <Button onClick={() => setCurrentIndex(0)}>
          Start Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Find Candidates</h1>
        <p className="text-muted-foreground">Swipe to connect with talented professionals</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold">{stats.viewed}</div>
            <p className="text-xs text-muted-foreground">Viewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.liked}</div>
            <p className="text-xs text-muted-foreground">Liked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.matches}</div>
            <p className="text-xs text-muted-foreground">Matches</p>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCandidate.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-purple-600 to-blue-600" />
            <CardContent className="relative pt-16 pb-6">
              <Avatar className="absolute -top-16 left-1/2 -translate-x-1/2 h-24 w-24 border-4 border-background">
                <AvatarImage src={undefined} />
                <AvatarFallback className="text-2xl">
                  {getInitials(currentCandidate.name)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{currentCandidate.name}</h2>
                <p className="text-muted-foreground">{currentCandidate.lookingFor}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Education</p>
                    <p className="text-sm text-muted-foreground">{currentCandidate.education}</p>
                  </div>
                </div>

                {currentCandidate.experience && (
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Experience</p>
                      <p className="text-sm text-muted-foreground">{currentCandidate.experience}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{currentCandidate.location}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">About</p>
                  <p className="text-sm text-muted-foreground">{currentCandidate.bio}</p>
                </div>

                <div>
                  <p className="font-medium mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {currentCandidate.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center gap-6">
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full"
          onClick={() => handleSwipe('left')}
        >
          <X className="h-8 w-8 text-destructive" />
        </Button>
        <Button
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="h-8 w-8" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full"
          onClick={() => toast.info('Message feature coming soon!')}
        >
          <Mail className="h-8 w-8 text-primary" />
        </Button>
      </div>
    </div>
  )
}

