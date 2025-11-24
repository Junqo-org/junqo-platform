import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determine backend target from environment variable or use localhost
  // Support both API_URL and VITE_API_URL for backwards compatibility
  const apiUrl = env.API_URL || env.VITE_API_URL
  const backendTarget = apiUrl 
    ? apiUrl.replace('/api/v1', '') // Remove /api/v1 if present
    : 'http://localhost:4200'

  console.log(`🔧 Vite proxy configured to: ${backendTarget}`)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      // Expose API_URL as VITE_API_URL for client-side code
      'import.meta.env.VITE_API_URL': apiUrl ? JSON.stringify(apiUrl) : undefined,
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
    },
  }
})

