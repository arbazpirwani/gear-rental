import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repo will be hosted at https://arbazpirwani.github.io/gear-rental/
// so the base path must match the repo name. Change here if you rename the repo
// or move it to a custom domain (set base: '/').
export default defineConfig({
  plugins: [react()],
  base: '/gear-rental/',
});
