export const config = {
  // In development mode, always use proxy (relative URLs)
  // In production/build mode, use the full URL from env variable or default to localhost
  apiUrl: import.meta.env.DEV 
    ? '/api/v1'  // Proxy will forward based on VITE_API_URL (or localhost:4200 by default)
    : (import.meta.env.VITE_API_URL || 'http://localhost:4200/api/v1'),
  wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:4200',
} as const

