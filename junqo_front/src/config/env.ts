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
let apiUrl: string
if (!import.meta.env.VITE_API_URL) {
  console.warn(
    `VITE_API_URL is not set, defaulting to ${rawApiUrl}. This may cause issues if the backend is not running on localhost:4200.`
  )
  if (import.meta.env.PROD) {
    console.error(
      `In production, VITE_API_URL must be set to the correct backend URL. Defaulting to ${rawApiUrl} may cause the app to break.`
    )
    throw new Error('VITE_API_URL is required in production')
  }
  apiUrl = rawApiUrl
} else {
  apiUrl = import.meta.env.VITE_API_URL
}

const wsUrl = new URL(
  apiUrl,
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
).origin

export const config = {
  apiUrl,
  wsUrl,
} as const
