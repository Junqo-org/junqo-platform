export const config = {
  // In development with proxy, use relative URLs. In production, use full URLs.
  apiUrl: import.meta.env.DEV 
    ? '/api/v1'  // Proxy will forward to dev.junqo.fr:4200
    : (import.meta.env.VITE_API_URL || 'http://dev.junqo.fr:4200/api/v1'),
  wsUrl: import.meta.env.VITE_WS_URL || 'http://dev.junqo.fr:4200',
} as const

