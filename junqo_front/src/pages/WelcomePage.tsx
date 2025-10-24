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
            Welcome to{' '}
            <span className="text-foreground">
              Junqo
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Your gateway to exceptional career opportunities. Connect with top companies and land your dream job.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/user-type-selection">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="lg" 
                variant="outline" 
                className="px-8 py-6 text-lg"
              >
                Sign In
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
                Find Opportunities
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Discover internships and jobs perfectly matched to your profile with our AI-powered platform
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
                Connect with Companies
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Network with recruiters from leading organizations worldwide
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
                AI-Powered Tools
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Enhance your CV and prepare for interviews with artificial intelligence
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
            Why Choose Junqo?
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
                  Smart Matching
                </h3>
                <p className="text-muted-foreground text-sm">
                  Our AI analyzes your profile and matches you with the most relevant opportunities
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
                  Targeted Applications
                </h3>
                <p className="text-muted-foreground text-sm">
                  Apply directly to companies and track your applications in real-time
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
                  Career Growth
                </h3>
                <p className="text-muted-foreground text-sm">
                  Access resources and tools to accelerate your professional development
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
                  Secure & Private
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your data is protected with enterprise-grade security standards
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
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    10K+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Active Opportunities
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    5K+
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Partner Companies
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    98%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Satisfaction Rate
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
            Ready to Start Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of professionals who trust Junqo for their career advancement
          </p>
          <Link to="/user-type-selection">
            <Button 
              size="lg" 
              className="px-10 py-6 text-lg"
            >
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
