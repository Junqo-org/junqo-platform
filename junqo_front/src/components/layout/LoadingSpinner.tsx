import { RotateCcw } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <RotateCcw className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}
