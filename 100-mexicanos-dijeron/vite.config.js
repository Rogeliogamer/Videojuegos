import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // AQUÍ CONSTRUIMOS EL TÚNEL
    proxy: {
      '/dynamo-proxy': {
        target: 'http://localhost:8000', // El destino real (DynamoDB)
        changeOrigin: true,
        // Vite le quita la palabra "/dynamo-proxy" antes de entregarlo a la base de datos
        rewrite: (path) => path.replace(/^\/dynamo-proxy/, '') 
      }
    }
  }
})