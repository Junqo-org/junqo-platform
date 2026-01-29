import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Users,
  Sparkles,
  TrendingUp,
  Target,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center shadow-sm">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Bienvenue sur{' '}
            <span className="text-foreground">
              Junqo
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Votre passerelle vers des opportunités de carrière exceptionnelles. Connectez-vous avec les meilleures entreprises et décrochez l'emploi de vos rêves.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/user-type-selection">
              <Button
                size="lg"
                className="px-8 py-6 text-lg"
              >
                Commencer
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg"
              >
                Se connecter
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20"
        >
          {/* Feature 1 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Trouver des opportunités
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Découvrez des stages et emplois parfaitement adaptés à votre profil grâce à notre plateforme alimentée par l'IA
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center">
                  <Users className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Connectez-vous aux entreprises
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Créez des liens avec des recruteurs d'organisations de premier plan dans le monde entier
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                Outils alimentés par l'IA
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Améliorez votre CV et préparez vos entretiens avec l'intelligence artificielle
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Pourquoi choisir Junqo ?
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Matching intelligent
                </h3>
                <p className="text-muted-foreground text-sm">
                  Notre IA analyse votre profil et vous met en relation avec les opportunités les plus pertinentes
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Candidatures ciblées
                </h3>
                <p className="text-muted-foreground text-sm">
                  Postulez directement aux entreprises et suivez vos candidatures en temps réel
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Évolution de carrière
                </h3>
                <p className="text-muted-foreground text-sm">
                  Accédez à des ressources et outils pour accélérer votre développement professionnel
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Sécurisé et privé
                </h3>
                <p className="text-muted-foreground text-sm">
                  Vos données sont protégées par des normes de sécurité de niveau entreprise
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <Card className="bg-card">
            <CardContent className="p-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    10K+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Opportunités actives
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    5K+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Entreprises partenaires
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    98%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Taux de satisfaction
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-20"
        >
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Rejoignez des milliers de professionnels qui font confiance à Junqo pour leur évolution de carrière
          </p>
          <Link to="/user-type-selection">
            <Button
              size="lg"
              className="px-10 py-6 text-lg"
            >
              Créer votre compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-16 pt-8 border-t border-border"
        >
          <div className="flex justify-center gap-6 text-sm">
            <Link 
              to="/cgu" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Conditions Générales d'Utilisation
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/privacy-policy" 
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Politique de Confidentialité
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            © 2026 Junqo. Tous droits réservés.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
