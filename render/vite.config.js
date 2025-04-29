/* eslint-disable no-undef */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import path from 'path'; // Import path module

export default defineConfig({
  base: process.env.VITE_PUBLIC_URL || "./",
  plugins: [react(), tailwindcss()],
  build: {
    assetsDir: "assets", 
    emptyOutDir: true,
    cssCodeSplit: true, 
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
});
