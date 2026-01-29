import { ReactNode } from 'react'
import { Header } from './Header'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        {children}
      </main>
    </div>
  )
}

