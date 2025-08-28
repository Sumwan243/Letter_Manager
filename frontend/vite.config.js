import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

  
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  resolve: {
    alias: {
      react: resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      'ziggy-js': resolve(__dirname, '../vendor/tightenco/ziggy'), // updated relative path after folder move
    },
  },
});
