import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface SwipeCardProps {
  children: ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  className?: string
}

export function SwipeCard({ children, onSwipeLeft, onSwipeRight, className = '' }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x > 0 ? 200 : -200)
      if (info.offset.x > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }
  }

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
        cursor: 'grab',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      whileTap={{ cursor: 'grabbing' }}
      className={`relative ${className}`}
    >
      {/* Swipe indicators */}
      <motion.div
        className="absolute top-8 left-8 z-20 pointer-events-none"
        style={{
          opacity: useTransform(x, [0, 100], [0, 1]),
        }}
      >
        <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl flex items-center gap-3 shadow-xl rotate-12 border-2 border-white">
          <CheckCircle className="h-8 w-8" strokeWidth={3} />
          APPLY
        </div>
      </motion.div>

      <motion.div
        className="absolute top-8 right-8 z-20 pointer-events-none"
        style={{
          opacity: useTransform(x, [-100, 0], [1, 0]),
        }}
      >
        <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl flex items-center gap-3 shadow-xl -rotate-12 border-2 border-white">
          <X className="h-8 w-8" strokeWidth={3} />
          SKIP
        </div>
      </motion.div>

      {children}
    </motion.div>
  )
}

