import { useEffect } from 'react'
import { websocketService } from '@/services/websocket'
import { useAuthStore } from '@/store/authStore'

/**
 * Hook global pour gérer la connexion WebSocket
 * À utiliser une seule fois dans l'application (ex: App.tsx ou layout principal)
 * 
 * Ce hook:
 * - Connecte le WebSocket quand l'utilisateur est authentifié
 * - Déconnecte le WebSocket quand l'utilisateur se déconnecte
 * - Ne se déconnecte PAS entre les navigations de pages
 */
export function useWebSocketConnection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      // Connecter au WebSocket
      const socket = websocketService.connect()

      if (!socket) {
        console.error('[WebSocket] Failed to establish connection')
      } else {
        console.log('[WebSocket] Connection established')
      }
    } else {
      // Déconnecter uniquement si l'utilisateur se déconnecte
      console.log('[WebSocket] User logged out, disconnecting...')
      websocketService.disconnect()
    }
  }, [isAuthenticated])
}
