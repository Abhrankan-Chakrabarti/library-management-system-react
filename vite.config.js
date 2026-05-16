import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- Fix this line
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
