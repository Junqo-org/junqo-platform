import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

export function GradientButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: GradientButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
    secondary: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
    accent: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <motion.button
      className={cn(
        'relative rounded-xl font-semibold text-white shadow-lg transition-all duration-300',
        'hover:shadow-2xl hover:scale-105',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        {children}
      </span>
      <div className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/10" />
    </motion.button>
  )
}

