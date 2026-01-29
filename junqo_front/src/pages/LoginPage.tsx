import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
// import junqoLogo from '/assets/images/junqo_logo.png'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { useAuthStore } from '@/store/authStore'
import { apiService } from '@/services/api'

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    
    try {
      const response = await apiService.login(data.email, data.password)
      
      if (!response || !response.token || !response.user) {
        throw new Error('Invalid response from server')
      }
      
      login(response.user, response.token)
      toast.success('Bon retour parmi nous !')
      navigate('/home')
    } catch (error: unknown) {
      let errorMessage = 'Email ou mot de passe incorrect'
      const axiosError = error as { message?: string; response?: { data?: { message?: string; error?: string }; status?: number } }
      
      if (axiosError.message === 'Network Error' || !axiosError.response) {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.'
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message
      } else if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error
      } else if (axiosError.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect'
      }
      
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {/* <img src={junqoLogo} alt="Junqo Logo" className="h-10 w-10" /> */}
            <span className="text-2xl font-bold text-primary">
              Junqo
            </span>
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Bon retour</CardTitle>
            <CardDescription>Connectez-vous à votre compte pour continuer</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Vous n'avez pas de compte ?{' '}
                <Link to="/user-type-selection" className="text-primary hover:underline">
                  S'inscrire
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}

