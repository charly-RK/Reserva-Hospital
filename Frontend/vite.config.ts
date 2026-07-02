import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '::', // permite acceder desde cualquier IP local
    port: 8080, // puerto personalizado
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // alias para rutas absolutas
    },
  },
})
