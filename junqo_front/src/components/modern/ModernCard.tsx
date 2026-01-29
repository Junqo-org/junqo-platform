import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModernCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'gradient' | 'glass'
  hover?: boolean
}

export function ModernCard({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true 
}: ModernCardProps) {
  const variants = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    gradient: 'bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950 border border-purple-200 dark:border-purple-900',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50',
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        hover && 'hover:shadow-2xl hover:-translate-y-1',
        className
      )}
      whileHover={hover ? { scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

