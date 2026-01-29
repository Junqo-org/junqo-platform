import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '')

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
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req) => {
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
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-progress', '@radix-ui/react-scroll-area', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-slot', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-tooltip', 'lucide-react', 'framer-motion', 'class-variance-authority', 'clsx', 'tailwind-merge'],
            pdf: ['pdfjs-dist'],
            utils: ['date-fns', 'zod', 'axios', 'socket.io-client', 'sonner', 'react-hook-form', '@hookform/resolvers'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
  }
})

