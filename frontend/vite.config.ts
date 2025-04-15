
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      '416cf27b-b0f0-4827-ba72-6c4f26038c96-00-2z1igbk4vduc7.pike.replit.dev'
    ]
  }
})
