import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import junqoLogo from '/assets/images/junqo_logo.png'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import { useAuthStore } from '@/store/authStore'
import { apiService } from '@/services/api'

// Schema for students (first name + last name)
const studentSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Schema for companies/schools (organization name)
const organizationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  organizationName: z.string().min(1, 'Organization name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type StudentFormData = z.infer<typeof studentSchema>
type OrganizationFormData = z.infer<typeof organizationSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)

  const userType = (location.state as any)?.userType || 'student'
  const isStudent = userType === 'student'
  const isCompany = userType === 'company'
  const isSchool = userType === 'school'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Use different schema based on user type
  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  })

  const organizationForm = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  })

  const onSubmitStudent = async (data: StudentFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userType,
      })
      console.log('Register response:', response)
      login(response.user, response.token)
      toast.success('Compte créé avec succès!')
      navigate('/home')
    } catch (error: any) {
      console.error('Register error:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitOrganization = async (data: OrganizationFormData) => {
    setIsLoading(true)
    try {
      const response = await apiService.register({
        email: data.email,
        password: data.password,
        firstName: data.organizationName, // Organization name goes to firstName
        lastName: '', // Empty lastName for organizations
        userType,
      })
      console.log('Register response:', response)
      login(response.user, response.token)
      toast.success('Compte créé avec succès!')
      navigate('/home')
    } catch (error: any) {
      console.error('Register error:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const getUserTypeLabel = () => {
    if (isStudent) return 'étudiant'
    if (isCompany) return 'entreprise'
    if (isSchool) return 'école'
    return userType
  }

  const getFieldLabel = () => {
    if (isCompany) return 'Nom de l\'entreprise'
    if (isSchool) return 'Nom de l\'école'
    return 'Organization Name'
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
            <img src={junqoLogo} alt="Junqo Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold text-foreground">
              Junqo
            </span>
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>
              Inscription en tant que {getUserTypeLabel()}
            </CardDescription>
          </CardHeader>

          {isStudent ? (
            <form onSubmit={studentForm.handleSubmit(onSubmitStudent)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      {...studentForm.register('firstName')}
                    />
                    {studentForm.formState.errors.firstName && (
                      <p className="text-sm text-destructive">{studentForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      {...studentForm.register('lastName')}
                    />
                    {studentForm.formState.errors.lastName && (
                      <p className="text-sm text-destructive">{studentForm.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    {...studentForm.register('email')}
                  />
                  {studentForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{studentForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...studentForm.register('password')}
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
                  {studentForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{studentForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...studentForm.register('confirmPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {studentForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{studentForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer mon compte'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Se connecter
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={organizationForm.handleSubmit(onSubmitOrganization)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">{getFieldLabel()}</Label>
                  <Input
                    id="organizationName"
                    placeholder={isCompany ? "Nom de votre entreprise" : "Nom de votre école"}
                    {...organizationForm.register('organizationName')}
                  />
                  {organizationForm.formState.errors.organizationName && (
                    <p className="text-sm text-destructive">{organizationForm.formState.errors.organizationName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@exemple.com"
                    {...organizationForm.register('email')}
                  />
                  {organizationForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{organizationForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...organizationForm.register('password')}
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
                  {organizationForm.formState.errors.password && (
                    <p className="text-sm text-destructive">{organizationForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...organizationForm.register('confirmPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {organizationForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{organizationForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer mon compte'}
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Vous avez déjà un compte ?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Se connecter
                  </Link>
                </p>
              </CardFooter>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
