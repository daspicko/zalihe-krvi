import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  baseToReplace: '',
  base: '/zalihe-krvi',
  plugins: [
    react()
  ],
  server: {
    allowedHosts: ['localhost', '10eabcf7bf40.ngrok-free.app']
  }
})
