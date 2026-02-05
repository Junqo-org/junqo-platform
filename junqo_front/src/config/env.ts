// Validate validation for required environment variables
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key]
  if (!value && !defaultValue) {
    if (import.meta.env.PROD) {
      console.error(`Missing required environment variable: ${key}`)
    } else {
      console.warn(`Missing environment variable: ${key}, using fallback`)
    }
  }
  return value || defaultValue || ''
}

const rawApiUrl = getEnvVar('VITE_API_URL', 'http://localhost:4200/api/v1')

export const config = {
  // In development mode, always use proxy (relative URLs)
  // In production/build mode, use the full URL from env variable or default to localhost
  apiUrl: import.meta.env.DEV
    ? '/api/v1'  // Proxy will forward based on VITE_API_URL (or localhost:4200 by default)
    : rawApiUrl,
  wsUrl: new URL(rawApiUrl).origin,
} as const

