import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from '@svgr/rollup'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,       // позволяет подключаться по локальному IP (например, 192.168.1.10)
    port: 5173,
    allowedHosts: [
      'remy-evangelistic-chery.ngrok-free.dev'
    ]
  }
})
