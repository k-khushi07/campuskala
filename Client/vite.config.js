import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  plugins: [
    react(),
  ],
  css: {
    postcss: './postcss.config.js',
  },
=======
  plugins: [react()],
>>>>>>> Stashed changes
=======
  plugins: [react()],
>>>>>>> Stashed changes
})
