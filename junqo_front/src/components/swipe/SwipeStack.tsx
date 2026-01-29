import React, { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SwipeCard } from './SwipeCard'
import { Offer } from '@/types'
import { Button } from '@/components/ui/button'
import { X, Heart, RotateCcw, Loader2 } from 'lucide-react'

interface SwipeStackProps {
  offers: Offer[]
  onSwipeLeft: (offer: Offer) => void
  onSwipeRight: (offer: Offer) => void
  renderCard: (offer: Offer) => React.ReactNode
}

export function SwipeStack({ offers, onSwipeLeft, onSwipeRight, renderCard }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const currentOffer = offers[currentIndex]

  const handleSwipeLeft = useCallback(() => {
    if (currentOffer && !isProcessing) {
      setIsProcessing(true)
      onSwipeLeft(currentOffer)
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsProcessing(false)
      }, 300)
    }
  }, [currentOffer, onSwipeLeft, isProcessing])

  const handleSwipeRight = useCallback(async () => {
    if (currentOffer && !isProcessing) {
      setIsProcessing(true)
      
      // Call the async function and wait for it
      try {
        await onSwipeRight(currentOffer)
      } catch (error) {
        console.error('Swipe right error:', error)
      }
      
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setIsProcessing(false)
      }, 300)
    }
  }, [currentOffer, onSwipeRight, isProcessing])

  const handleUndo = useCallback(() => {
    if (currentIndex > 0 && !isProcessing) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [currentIndex, isProcessing])

  if (currentIndex >= offers.length) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12">
        <div className="mb-6">
          <div className="h-20 w-20 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
            <Heart className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">All offers reviewed!</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Check back later for new opportunities
          </p>
        </div>
        <Button onClick={() => setCurrentIndex(0)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          <RotateCcw className="mr-2 h-5 w-5" />
          Start Over
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Stack of cards */}
      <div className="relative h-[600px]">
        <AnimatePresence>
          {currentOffer && (
            <SwipeCard
              key={currentOffer.id}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              className="absolute inset-0"
            >
              {renderCard(currentOffer)}
            </SwipeCard>
          )}
        </AnimatePresence>

        {/* Preview next card */}
        {offers[currentIndex + 1] && (
          <div className="absolute inset-0 -z-10 scale-95 opacity-50 blur-sm">
            {renderCard(offers[currentIndex + 1])}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center items-center gap-6 mt-8">
        <button
          onClick={handleSwipeLeft}
          disabled={isProcessing}
          className="h-16 w-16 rounded-full border-2 border-red-500 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-600 transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-8 w-8 text-red-500" strokeWidth={2.5} />
        </button>

        <button
          onClick={handleUndo}
          disabled={currentIndex === 0 || isProcessing}
          className="h-14 w-14 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <RotateCcw className="h-6 w-6 text-slate-600 dark:text-slate-300" strokeWidth={2.5} />
        </button>

        <button
          onClick={handleSwipeRight}
          disabled={isProcessing}
          className="h-16 w-16 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-600 transition-all shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" strokeWidth={2.5} />
          ) : (
            <Heart className="h-8 w-8 text-emerald-500" strokeWidth={2.5} fill="none" />
          )}
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          {currentIndex + 1} / {offers.length}
        </p>
        <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / offers.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

