import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building, GraduationCap } from 'lucide-react'

export default function UserTypeSelectionPage() {
  const navigate = useNavigate()

  const userTypes = [
    {
      type: 'student',
      title: 'Étudiant',
      description: 'À la recherche de stages et d\'opportunités d\'emploi',
      icon: GraduationCap,
      color: 'from-blue-600 to-cyan-600',
    },
    {
      type: 'company',
      title: 'Entreprise',
      description: 'Recrutement d\'étudiants et de professionnels talentueux',
      icon: Building,
      color: 'from-purple-600 to-pink-600',
    },
    {
      type: 'school',
      title: 'École',
      description: 'Gestion des placements étudiants et des partenariats',
      icon: Users,
      color: 'from-green-600 to-teal-600',
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-foreground">Choisissez votre type de profil</h1>
          <p className="text-muted-foreground text-lg">
            Sélectionnez l'option qui vous correspond le mieux
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {userTypes.map((userType, index) => {
            const Icon = userType.icon
            return (
              <motion.div
                key={userType.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                  onClick={() => navigate('/register', { state: { userType: userType.type } })}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${userType.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle>{userType.title}</CardTitle>
                    <CardDescription>{userType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour continuer en tant que {userType.title.toLowerCase()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-muted-foreground">
            Vous avez déjà un compte ?{' '}
            <a href="/login" className="text-primary hover:underline">
              Se connecter
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

