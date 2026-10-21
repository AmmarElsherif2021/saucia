import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer';
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: false, gzip: true, filename: 'dist/stats.html' })
  ],
  base: '/',
  build: {
    outDir: 'dist' 
  }
})