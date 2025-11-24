import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from './ThemeProvider'
import { 
  Home, 
  Briefcase, 
  MessageSquare, 
  User, 
  LogOut, 
  Moon, 
  Sun,
  FileText,
  BarChart3
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { motion } from 'framer-motion'
// import junqoLogo from '/assets/images/junqo_logo.png'

export function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  // const resolvedTheme = 'light' // TODO: implement theme

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // const toggleTheme = () => {
  //   // TODO: implement theme toggle
  // }

  const isStudent = user?.type === 'STUDENT'
  const isCompany = user?.type === 'COMPANY'

  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b backdrop-blur bg-background/80 border-border shadow-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/home" className="flex items-center space-x-2">
            {/* <img src={junqoLogo} alt="Junqo logo" className="h-7 w-auto" /> */}
            <span className="text-xl font-bold text-primary">Junqo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link to="/home">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Accueil
                </Button>
              </motion.div>
            </Link>
            
            {isStudent && (
              <>
                <Link to="/offers">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Offres
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/cv">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      CV
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/interview">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Entretien
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}

            {isCompany && (
              <>
                <Link to="/offers">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Mes Offres
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/recruiter/dashboard">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      Candidatures
                    </Button>
                  </motion.div>
                </Link>
              </>
            )}

            <Link to="/messaging">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </motion.div>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* TODO: Implement theme toggle */}
          {/* <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
            >
              <Moon className="h-5 w-5 text-foreground" />
            </Button>
          </motion.div> */}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-muted text-foreground font-bold">
                      {user ? getInitials(user.name || user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground">
              <DropdownMenuLabel className="font-semibold text-sm">Mon Compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  )
}

